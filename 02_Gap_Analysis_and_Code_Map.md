# FORGE — Gap Analysis & Code Map (pre-Fable briefing)

Prepared as groundwork before handing this project to Fable 5. Two purposes: flag discrepancies between the POA&M and the Scenario Generator Spec that Fable should know about going in, and give Fable a head start on the codebase so it spends its first turns building instead of re-discovering.

## 1. Discrepancies to flag (not corrected here — per decision, POA&M left as-is)

**Milestone status vs. spec's own admission.** The POA&M marks 2.SG1–2.SG4 as "In Progress" (Phase 2 Milestones table). The Scenario Generator Spec — dated the same day — states plainly that "no code is produced at this stage" and lists a full set of prerequisites in Section 11 (Blaze upgrade, Cloud Function provisioning, JSON schema definition, new UI panel, new docx template, adversary prompt modules, SME reviewer, rate-limit thresholds) as **not yet started**. Treat the Spec's Section 11 as the real state of play; the POA&M status column is stale for this milestone group.

**Architecture note conflict.** The POA&M's Technology Stack section (Section 8, API Key Security callout) recommends a Cloudflare Worker or GitHub Actions workflow as the proxy for the Claude API key. The Spec (Section 7) instead commits to a Firebase Cloud Function, reasoning that it keeps the proxy on the same platform as the Realtime Database. This is a legitimate, reasoned decision in the Spec, but the POA&M text wasn't updated to reflect it — someone reading only the POA&M would expect a different architecture. Worth a one-line note in Fable's output; not worth blocking on.

**Filename vs. internal version label.** The POA&M file is named `AMWC_Wargame_POAM_v4_2.docx`, but its own title page reads "Version 4.1 | Updated June 2026" and the revision history table's last entry is v4.1. Minor, but mention it so nobody assumes a v4.2 revision entry exists somewhere it doesn't.

## 2. Infrastructure prerequisites confirmed absent

Checked the working folder directly: no `firebase.json`, no `.firebaserc`, no `functions/` directory anywhere in the repo. `shared/firebase.js` only holds the client SDK config (`projectId: amwc-wargame`) for the Realtime Database — there is no Cloud Functions scaffolding at all yet. This matches the Spec's own "Not yet built" callout in Section 7 and confirms Daniel's answer that the Blaze upgrade and API key provisioning haven't happened. Fable can and should write the Cloud Function code and the `firebase.json`/`functions/package.json` scaffolding, but deployment (Blaze upgrade, `firebase deploy --only functions`, setting the API key as a function secret) is a manual step Daniel has to run from his own machine with his own Firebase login.

No local `.git` repository was found in this folder either. The site is served from GitHub Pages under `dkitchens444/amwc-wargame`, and the existing tools (`index.html`, `director.html`, `doc-tool-teams.html`) push/pull files directly through the GitHub REST API rather than through git. If Fable is going to run in Claude Code with real file access, it needs an actual local clone of that repo — see the recommendation in the main prompt.

## 3. Existing file inventory (repo root, per `shared/IMPLEMENTATION_GUIDE.md`)

| File | Lines | Role |
|---|---|---|
| `index.html` | 571 | Operations Portal — landing page, game link generator, reference doc list |
| `director.html` | 2460 | Director/Blue/Red game page — turn cards, adjudication, injects, AAR |
| `dashboard.html` | 484 | Master Director View — passcode-gated overview of active games |
| `doc-tool-teams.html` | 1928 | Document Automation Tool — **this is the file the Scenario Generator extends** |
| `feedback.html` | 596 | Feedback & changelog tool |
| `shared/theme.css`, `shared/firebase.js`, `shared/utils.js` | — | Extracted June 2026 refactor; every page links these instead of duplicating code |

`doc-tool-teams.html` currently automates four document types (Course of Action/DSM, Collections Sync Matrix, ORBAT w/ Task & Purpose, Essential Fire Support Tasks). The Situation Handout the Spec describes is a fifth type, not yet represented in the tool's data model.

## 4. `doc-tool-teams.html` — relevant existing structure (line numbers as of current version)

**Existing field IDs the Spec says to reuse/extend** (lines 316–331):
`i-hhqmission`, `i-mission`, `i-purpose`, `i-method`, `i-endstate` — all plain `<textarea>` elements, already wired into session save/restore (`applyPlaceholders`, line 1872; session capture around 1668–1789).

**Force/Threat model** (lines 338–351, 593, 969–998):
`S.force` (`'blue'`/`'red'`) and `S.threat` (`'A'`/`'C'`) are the existing toggle state. `setForce()` (977) and `setThreat()` (969) drive which element vocabulary (`BLUE_EL`, `RED_A_EL`, `RED_C_EL`) and UI theme apply. The Adversary Profile parameter in the Scenario form should drive these same two variables rather than introducing a parallel selector.

**Order of Battle data model** (lines 593–1064):
`collectOrbatGroups()` (1049) currently returns `{element, task, purpose, units}` per group — task/purpose per unit, no quantity or loadout fields. The Spec's Task Organization gap (Section 5) needs either a new roster mode or extended fields (quantity, loadout notes) added to these existing rows. `addUnit()` (1019), `updateElMeta()` (1036), and `renderOrbat()` (1064) are the functions to extend.

**Document generation pipeline** (lines 1345–1590):
`generateDocs()` (1345) is the existing async pipeline that builds the four DOCX files via `docx.js` and zips them with `jszip.js` (`showOutputModal`, 1590). The new Situation Handout template is a fifth document built the same way — follow the existing pattern (e.g. the ORBAT section around 1458–1523) rather than inventing a new generation approach.

**Publish-to-Game** (lines 1230–1266):
`publishToGame()` sends ORBAT/EFST/Collections data to `games/{gameId}/setup/{force}` in the Realtime Database for turn-card pre-population (per POA&M milestones 1.14–1.15). The new Situation fields (AO boundary, weather, general situation narrative, additional assets) probably belong in this same payload if the director role should see them on the turn card — worth deciding explicitly rather than assuming.

**Session persistence** (lines 1666–1798):
`captureSession()`/`restoreSession()`/`saveSession()`/`loadSession()` auto-save form state to `localStorage` per force (`sessionKey()`, 1666). New Scenario/Situation fields need to be added to this capture/restore list or they'll silently fail to persist across reloads — this is the kind of gap that's easy to miss and only shows up when a director's browser refreshes mid-session.

**No existing Cloud Function client call exists anywhere in the file** — the AI generation call (Section 3, steps 3–4 of the Spec) is entirely new client code: a fetch to the not-yet-built Cloud Function endpoint, response parsing into the field IDs above, and error/loading states for the new Scenario tab.

## 5. Firebase security rules status — unclear, worth Fable checking

`security-update-baseline.txt` in the repo root contains a fully auth-gated ruleset (`auth != null` plus per-game-role read/write checks) — but `shared/IMPLEMENTATION_GUIDE.md`'s "Next Steps" section still lists "Add Firebase Anonymous Authentication... tighten database rules" as **not yet done**. It's ambiguous whether `security-update-baseline.txt` is a rules file that has already been pushed to the Firebase console, or a drafted-but-unapplied proposal. This matters for the new Cloud Function: if the Realtime Database is still open read/write, the Cloud Function's endpoint is the more urgent thing to lock down (rate limiting, per Spec Section 7); if auth is already enforced, the client-side scenario generation call needs to carry an auth token like everything else does. Fable should confirm actual rule state (or ask Daniel) before assuming either way.
