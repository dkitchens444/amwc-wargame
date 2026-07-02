# FORGE — Scenario Generator Gap Analysis (post-code-read)

*Fable 5 · July 1, 2026 · Reconciles the POA&M (Phase 2 excerpt), the Scenario Generator Spec, and the actual code in this repo. Per Daniel's decision the POA&M document itself is left unedited — this is the standalone write-up.*

## 1. The two pre-flagged discrepancies — confirmed, with one correction

**Milestone status (2.SG1–2.SG4 "In Progress") — confirmed stale, as flagged.** I read `doc-tool-teams.html` end to end: before this build there was no Scenario panel, no AI call of any kind, no Cloud Function client code, no `firebase.json`/`functions/` scaffolding, and no Situation Handout in the document model. The Spec's Section 11 list was the accurate state of play. *As of this build*, the honest statuses would be: 2.SG1 code-complete (form built, pending live test), 2.SG2–2.SG4 code-complete but **not deployable** until the Blaze upgrade and API-key provisioning happen (see `10_Deployment_Checklist.md`), 2.SG5 still Planned (SME reviewer not identified — that's a people decision, not code).

**Cloud Function vs. Cloudflare Worker — confirmed, and it's in three places, not two.** Beyond the POA&M Tech-Stack callout and Spec §7, `shared/IMPLEMENTATION_GUIDE.md` ("Next Steps" §3) *also* says "use Cloudflare Worker proxy to protect the API key." The Spec's Firebase Cloud Function decision is the most recent and the one I built to. Whoever next edits the POA&M or the implementation guide should update both so the Worker language stops propagating. One nuance worth preserving from the POA&M's reasoning: the Worker option had no paid-plan prerequisite, whereas Cloud Functions require the Blaze upgrade — that's the actual cost of the "same platform" decision, and it's the one prerequisite still blocking deployment.

**Filename/version-label mismatch — confirmed as described** (`AMWC_Wargame_POAM_v4_2.docx` in `references/`, body reads v4.1). Nothing further; noting per the briefing so nobody hunts for a v4.2 revision entry.

## 2. Correction to the Gap Analysis pre-read itself

**`security-update-baseline.txt` no longer exists.** The pre-read (§5) asked whether that file matched the live Firebase rules or was an unapplied proposal. The file is absent from the current clone entirely — root and all subfolders — presumably removed in the recent reference-file cleanup commits (`git log` shows several deletions in that window). What the code shows instead: `shared/firebase.js` now performs anonymous auth and comments that it satisfies an `auth != null` rule, so *some* tightening happened after the guide was written. Whether the fuller per-game-role ruleset was ever applied is **unknowable from the repo**. Consequence for the Spec §7 question ("is the Cloud Function the most exposed surface?"): treat the RTDB as effectively open (anonymous auth is free to anyone with the public config), so the Cloud Function is one of two exposed surfaces, not the single one. Action for Daniel in the deployment checklist: export live rules into the repo as `database.rules.json`. Full detail in `08_Code_Review.md` finding 3.

**Everything else in the pre-read's code map verified accurate.** Line numbers were within a line or two throughout (`setThreat` 969, `setForce` 977, `addUnit` 1019, `generateDocs` 1345, `captureSession` 1668, `applyPlaceholders` 1872). One addition: `collectOrbatGroups()` existed **twice** (lines ~1049 and ~1209, identical bodies) — the map cited the first, the engine used the second. Removed in this build.

## 3. Spec §5 table — verified row by row against the code

| Baseline element | Spec's claimed current state | Verified? | Note |
|---|---|---|---|
| General Situation narrative | None | ✅ Correct | Built new: `s-gensit`. |
| AO boundary grid points | None | ✅ Correct | Built new: repeatable grid-point list. |
| Weather block | None | ✅ Correct | Built new: month/temp/sky/wind/ground structured fields. |
| Higher HQ Mission | `i-hhqmission` | ✅ Exists as claimed | Plain textarea, in save/restore. Reused. |
| Commander's Intent | `i-purpose`/`i-method`/`i-endstate` | ✅ Exist as claimed | Reused. Note: Red_South's baseline intent is a single paragraph + bullets, not P/M/E — see §5 below. |
| Unit Mission Statement | `i-mission` | ✅ Exists as claimed | Reused. |
| Task Organization w/ qty+loadout | ORBAT builder, task/purpose only | ✅ Correct — partial | Unit rows carried `{el, entity, ech, mob, desig}` only. Extended with `qty`/`loadout` per row (Spec's "extended fields" option — chosen over a parallel roster mode so one data model feeds both the ORBAT doc and the handout). |
| Additional Assets | None | ✅ Correct | Built new list type, separate from ORBAT as specified. |

Two things the Spec **assumes exist and does exist**, verified: the Threat A/C toggle (`S.threat`, reused as the Adversary Profile input rather than a parallel selector, per the pre-read's advice) and the Classification/Exercise-name fields in Game Conditions (`g-class`, `g-exercise`).

One thing the Spec assumes that **wasn't quite true**: "wire new fields into the existing session save/restore cycle" implies that cycle was solid. It wasn't — it never persisted `S.threat`, which silently drops restored Threat-C units (code review finding 1, fixed). The Spec's Adversary Profile field would have inherited that bug.

## 4. Spec §9 / §11 items this implementation does NOT close

- **Blaze upgrade, API key provisioning, deploy** (§11 items 1–2) — cannot be done from code. Deploy-ready scaffolding delivered; manual steps in `10_Deployment_Checklist.md`.
- **AI hallucination risk** (§9) — narrowed, not closed: the prompt modules constrain Red ORBAT output to the tool's coded unit vocabulary and the schema is enforced server-side, but doctrinal *plausibility* still requires the human review step and the 2.SG5 SME pass. No code can close this.
- **SME reviewer identification + correction-log workflow** (§11, 2.SG5) — organizational, untouched. Recommendation: the correction log can be a plain markdown file in this repo per recurring issue; the fix lands in `functions/prompts/threat-*.js` where the doctrine text lives, which was the point of separating those modules.
- **Rate-limit thresholds** (§11 last item) — I had to pick *something* to implement against: defaults are **10 generations/hour/client, 40/day global**, enforced in the function via an RTDB counter. These are deliberately conservative guesses; Daniel should revisit once real usage exists. Changing them is a one-line edit in `functions/index.js` (`LIMITS`).
- **Cost monitoring** (§7 "monitored rather than assumed") — Blaze budget alert is a console action in the checklist; code can't set it.
- **API model choice**: the POA&M Tech Stack names `claude-sonnet-4-20250514`, which is now two generations old. The function defaults to `claude-sonnet-5` (current, and the right cost/quality point for structured generation); it's a `MODEL` constant if Daniel wants otherwise. The POA&M tech-stack row is stale here too.

## 5. Gaps neither document mentions (found during the build)

1. **The two exemplars disagree with the tool's Commander's-Intent structure asymmetrically.** Blue_South uses labeled Purpose/Method/Endstate (matches `i-purpose`/`i-method`/`i-endstate`); Red_South's intent is one paragraph plus assessment bullets, and it has **no HHQ mission section at all**. The generator therefore fills P/M/E for both sides (the fields exist and the director can edit), but the Red handout template renders intent as a single flowing block (concatenating the three fields) to match Red_South's layout, and omits the HHQ-mission section on the Red side. This is an interpretation — flagging it because "match the exemplar exactly" and "reuse the existing three intent fields" are in mild tension for Red.
2. **The exemplars' "Do not write on handout" banner and force title line** (`Blue Forces – V28 (AO South)`) aren't derivable from any Spec §4 field. The AO name feeds the parenthetical; the force title uses the existing `g-unit` field. The banner is hardcoded in the template.
3. **`publishToGame()` doesn't carry the new Situation data.** The pre-read raised this as "decide explicitly": decided **not** to include it this round — the publish payload feeds turn-card pre-population in `director.html`, which has no UI for situation/weather/AO today, so publishing it would be dead weight until director.html grows a consumer. Left a one-line comment at the payload site so the decision is visible where the next person will look.
4. **Paired generation and the force-locked page are in tension.** The tool is force-locked per team (`?force=blue`), but scenario generation produces *both* sides' content by design (Spec §6). Resolution: the Scenario tab is director-facing — generation returns both sides, populates the currently-active force's fields immediately, and stores the other side's package in the session store (per-force keys), so switching force (or opening the other force's locked page on the same browser) can load it. The UI copy on the panel says exactly this. A cleaner long-term answer (generate from the unlocked `doc-tool.html` director variant mentioned in POA&M 2.2) is noted for the follow-on, since that file isn't in this repo.
5. **POA&M 2.3–2.6 are also stale** ("In Progress") — all four document templates are implemented and deployed in `doc-tool-teams.html`. Same status-column staleness as the 2.SG rows; worth fixing in the same future POA&M edit.
