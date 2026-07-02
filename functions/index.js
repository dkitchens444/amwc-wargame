/* =============================================================
   AMWC Wargame System — Scenario Generator Cloud Function
   POA&M 2.SG2–2.SG4 · Spec §7 (Architecture)

   POST /generateScenario
     body: the Scenario Parameter Form as JSON (see doc-tool-teams.html
           generateScenario() for the exact payload)
     returns: { shared, blue, red } matching schema.js — structured
              JSON, never freeform prose (Spec §6 output contract)

   Security model:
   - The Anthropic API key lives ONLY in Secret Manager (function
     secret ANTHROPIC_API_KEY). It never reaches the browser.
   - CORS restricted to the GitHub Pages origin + localhost dev.
   - Rate limiting: per-client hourly cap and a global daily cap,
     tracked in the Realtime Database under /scenarioGen (which the
     database rules close to clients; the Admin SDK bypasses rules).
     API usage is shared across all directors — these caps protect
     the budget, and the thresholds are deliberately conservative
     first guesses (Spec §11 left them "to be decided").

   NOT deployed automatically — see 10_Deployment_Checklist.md
   (Blaze upgrade → set secret → firebase deploy --only functions).
   ============================================================= */

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

const { SCENARIO_SCHEMA } = require('./schema');
const { buildSystemPrompt, buildUserPrompt } = require('./prompts/system');

admin.initializeApp();

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

// ── Tunables ────────────────────────────────────────────────
// Model: the POA&M tech stack pinned claude-sonnet-4-20250514, which is
// deprecated (retires June 2026). claude-sonnet-5 is the current model in
// the same tier — right cost/quality point for structured generation.
const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 16000; // paired package runs ~6-10K tokens + thinking headroom

// Rate caps — revisit once real usage exists (gap analysis §4).
// Sized for Daniel's stated real-world case: up to ~6 games running
// concurrently, often on one classroom Wi-Fi network (July 2026).
const LIMITS = {
  perClientPerHour: 10, // one director/browser iterating on a scenario
  perIpPerHour: 60,     // abuse backstop ONLY — classroom Wi-Fi puts many
                         // directors' devices behind one shared public IP via
                         // NAT, so this must stay well above perClientPerHour
                         // times the number of directors expected on one network
  globalPerDay: 150,    // all directors/games combined — ~6 concurrent games
                         // x ~10 generations/day each, with headroom. Was 40;
                         // that would have become the real bottleneck the
                         // moment the per-client fix below stopped
                         // under-counting concurrent classroom directors.
};

const ALLOWED_ORIGINS = [
  'https://dkitchens444.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
];

// ── Rate limiting via RTDB transactions ─────────────────────
// RTDB path segments can't contain . # $ / [ ] — base64 + strip, and cap
// length so a client can't blow up the key size.
function sanitizeKey(raw) {
  return Buffer.from(String(raw)).toString('base64').replace(/[.#$/\[\]=+]/g, '_').slice(0, 120);
}

function ipKey(req) {
  const fwd = String(req.headers['x-forwarded-for'] || req.ip || 'unknown');
  const ip = fwd.split(',')[0].trim();
  return sanitizeKey(ip);
}

// Per-browser identity, NOT per-IP. doc-tool-teams.html's getClientId()
// generates a random ID once and persists it in localStorage, the same way
// the tool already persists session state — so it identifies one director's
// browser regardless of network. This matters because classroom Wi-Fi puts
// many directors' devices behind one shared public IP via NAT (a router
// translates every device's private address to one public address for
// anything leaving the building); an IP-only key would rate-limit the whole
// classroom together instead of one director at a time. If a client doesn't
// send one (e.g. a stale cached page from before this change), fall back to
// the IP — degraded, but no worse than the original behavior.
function clientKey(req) {
  const supplied = req.body && typeof req.body.clientId === 'string' ? req.body.clientId.trim() : '';
  if (supplied && supplied.length <= 100) return 'c_' + sanitizeKey(supplied);
  return 'ip_' + ipKey(req);
}

async function checkRateLimit(req) {
  const now = new Date();
  const hourKey = now.toISOString().slice(0, 13).replace(/[-T:]/g, '');  // YYYYMMDDHH
  const dayKey = now.toISOString().slice(0, 10).replace(/-/g, '');       // YYYYMMDD
  const db = admin.database();

  const bump = async (path, limit) => {
    const ref = db.ref(path);
    const { snapshot } = await ref.transaction(n => (n || 0) + 1);
    return snapshot.val() <= limit;
  };

  try {
    // Abuse backstop: a loose cap on the raw IP regardless of clientId, so a
    // script can't dodge limits by rotating a fake clientId. Deliberately
    // much higher than perClientPerHour — see LIMITS.perIpPerHour comment.
    const ipOk = await bump(`scenarioGen/usage/hourly/${hourKey}/${ipKey(req)}`, LIMITS.perIpPerHour);
    if (!ipOk) return { ok: false, why: `too many requests from this network in the last hour — try again shortly` };

    const clientOk = await bump(
      `scenarioGen/usage/hourly/${hourKey}/${clientKey(req)}`, LIMITS.perClientPerHour);
    if (!clientOk) return { ok: false, why: `client hourly cap (${LIMITS.perClientPerHour}/hr) reached — try again next hour` };

    const globalOk = await bump(
      `scenarioGen/usage/daily/${dayKey}/all`, LIMITS.globalPerDay);
    if (!globalOk) return { ok: false, why: `shared daily cap (${LIMITS.globalPerDay}/day) reached — try again tomorrow` };
    return { ok: true };
  } catch (e) {
    // Counter infrastructure failing shouldn't take the feature down;
    // log loudly so it gets noticed.
    logger.error('Rate-limit counter error (allowing request)', e);
    return { ok: true };
  }
}

// ── Request validation ──────────────────────────────────────
function validateParams(body) {
  if (!body || typeof body !== 'object') return 'missing JSON body';
  if (body.adversary && !['A', 'C'].includes(body.adversary)) return 'adversary must be "A" or "C"';
  // Everything else is optional free text — but bound the total size so a
  // hostile client can't stuff the prompt.
  if (JSON.stringify(body).length > 20000) return 'request too large';
  const strFields = ['exercise','classification','unit','hhq','aoName','dtg','month',
                     'status','statusDetail','attachments','objective','clientId'];
  for (const f of strFields) {
    if (body[f] != null && typeof body[f] !== 'string') return `${f} must be a string`;
  }
  if (body.aoPoints != null &&
      (!Array.isArray(body.aoPoints) || body.aoPoints.some(p => typeof p !== 'string')))
    return 'aoPoints must be an array of strings';
  return null;
}

// ── The function ────────────────────────────────────────────
exports.generateScenario = onRequest(
  {
    secrets: [ANTHROPIC_API_KEY],
    timeoutSeconds: 300,   // paired generation can take a couple of minutes
    memory: '512MiB',
    maxInstances: 2,       // backstop against runaway spend
    region: 'us-central1',
  },
  async (req, res) => {
    // CORS
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Vary', 'Origin');
    }
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

    const invalid = validateParams(req.body);
    if (invalid) { res.status(400).json({ error: invalid }); return; }

    const limit = await checkRateLimit(req);
    if (!limit.ok) { res.status(429).json({ error: limit.why }); return; }

    const params = req.body;
    const adversary = params.adversary === 'A' ? 'A' : 'C';

    try {
      const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

      // Structured outputs lock the response to the field schema —
      // reliable parsing into the form is a hard requirement (Spec §6).
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(adversary),
        messages: [{ role: 'user', content: buildUserPrompt({ ...params, adversary }) }],
        output_config: {
          format: { type: 'json_schema', schema: SCENARIO_SCHEMA },
        },
      });

      if (response.stop_reason === 'refusal') {
        res.status(422).json({ error: 'The model declined this request. Check that the parameters contain only fictional training content.' });
        return;
      }
      if (response.stop_reason === 'max_tokens') {
        logger.error('Generation truncated at max_tokens', { usage: response.usage });
        res.status(502).json({ error: 'Generation ran too long and was truncated — try again.' });
        return;
      }

      const textBlock = response.content.find(b => b.type === 'text');
      if (!textBlock) throw new Error('no text block in model response');
      const data = JSON.parse(textBlock.text);
      data.shared.adversary = adversary; // authoritative — director's selection wins

      logger.info('Scenario generated', {
        adversary,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      });
      res.status(200).json(data);
    } catch (err) {
      logger.error('Scenario generation failed', err);
      const status = err.status === 429 ? 429 : 502;
      res.status(status).json({
        error: err.status === 429
          ? 'Anthropic API rate limit hit — wait a minute and retry.'
          : 'Scenario generation failed server-side: ' + (err.message || 'unknown error'),
      });
    }
  });
