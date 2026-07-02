# FORGE Scenario Generator — Deployment Checklist

*The code in this repo is deploy-ready but NOT deployed. These are the manual steps only Daniel can run (Firebase login + billing + API key). Estimated time: 20–30 minutes.*

## 0. Prerequisites (one-time, local machine)

- [ ] Node.js 20+ installed (`node --version`)
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] `firebase login` (opens a browser; use the Google account that owns the `amwc-wargame` project)
- [ ] An Anthropic API key from https://platform.claude.com (Console → API Keys). Create a **new key named for this function** (e.g. `amwc-scenario-fn`) so it can be revoked independently later.

## 1. Upgrade the Firebase project to Blaze — and set a budget alert FIRST

- [ ] Firebase console → `amwc-wargame` → gear icon → *Usage and billing* → *Modify plan* → **Blaze (pay as you go)**. (Cloud Functions can't make outbound calls to the Anthropic API on Spark — this is the hard prerequisite from Spec §7/§11.)
- [ ] Google Cloud console → *Billing* → *Budgets & alerts* → create a budget for this project (suggest **$25/month** with alerts at 50/90/100%) **before** anything can spend. Blaze retains Spark's free quotas; expected function volume should stay inside them, but the alert is the backstop.

## 2. Export the LIVE database rules into the repo (5 minutes — closes the review's biggest unknown)

- [ ] Firebase console → *Realtime Database* → *Rules* tab → copy the current live ruleset.
- [ ] Compare with `database.rules.json` in the repo (a conservative auth-gated placeholder). If the live rules are broader/different, **replace the repo file's contents with the live rules** so version control finally has them — see `08_Code_Review.md` finding 3.
- [ ] ⚠️ Never run bare `firebase deploy` until this file matches what you want live — bare deploy pushes ALL targets including database rules. All commands below use `--only functions` for exactly this reason.

## 3. Install function dependencies

```
cd functions
npm install
cd ..
```

## 4. Store the API key as a function secret (never in source, never client-side)

```
firebase functions:secrets:set ANTHROPIC_API_KEY
```
Paste the key when prompted. Verify with `firebase functions:secrets:access ANTHROPIC_API_KEY` (prints the value — do this in a private terminal).

## 5. Deploy the function

```
firebase deploy --only functions
```
First deploy takes a few minutes (creates the Cloud Run service, grants the secret). Note the printed URL — it should be:
`https://us-central1-amwc-wargame.cloudfunctions.net/generateScenario`

If the region or URL differ, update the `SCENARIO_FN_URL` constant near the top of the scenario-generator section in `doc-tool-teams.html`.

## 6. Verify with a test call

From a terminal (PowerShell shown; the Origin header matters — CORS allows only the GitHub Pages origin and localhost):

```powershell
curl.exe -X POST "https://us-central1-amwc-wargame.cloudfunctions.net/generateScenario" `
  -H "Content-Type: application/json" -H "Origin: https://dkitchens444.github.io" `
  -d '{\"adversary\":\"C\",\"month\":\"June\",\"aoName\":\"AO Test\",\"objective\":\"battalion defense in sector\"}'
```

- [ ] Expect a JSON body with `shared`, `blue`, `red` keys (30–90 s).
- [ ] Then the real test: open `doc-tool-teams.html?force=blue` on the live site, Scenario tab, fill AO name + objective, **Generate Scenario (AI)** — fields should shimmer, then populate. Check `firebase functions:log` if anything fails.
- [ ] Confirm rate limiting: the 11th call from one machine within an hour should return HTTP 429. Counters are visible in the Realtime Database under `scenarioGen/usage/` (console view; clients can't read them).

## 7. Post-deploy configuration knobs (all in `functions/index.js`)

| Knob | Where | Current value |
|---|---|---|
| Model | `MODEL` | `claude-sonnet-5` (POA&M's pinned `claude-sonnet-4-20250514` is deprecated, retires June 15 2026) |
| Rate caps | `LIMITS` | 10/hour/client, 40/day global — deliberate first guesses, revisit with real usage |
| Allowed origins | `ALLOWED_ORIGINS` | GitHub Pages + localhost |
| Timeout / instances | `onRequest` options | 300 s, max 2 instances |

Any change: edit → `firebase deploy --only functions`.

## 8. What does NOT need deploying

- The client (`doc-tool-teams.html`, `shared/components.css`) ships through the normal GitHub Pages push — no build step, unchanged workflow.
- The **"Load example (no API)"** button on the Scenario tab works with zero infrastructure — use it to demo the full round trip (fields → review → Situation Handout docx) before or without deploying the function.

## Rollback

- Disable the feature without a deploy: delete the function (`firebase functions:delete generateScenario`) — the client shows a clean "generation failed / not deployed" message and everything else in the tool keeps working.
- Revoke the API key from the Anthropic console at any time; the function then returns a server-side error without affecting the rest of FORGE.
