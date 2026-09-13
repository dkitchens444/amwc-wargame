# Scenario Generator — Redesign Decisions (supersedes parts of the original Spec)

*Captured July 2, 2026, after a design review following the first build. Read this AFTER `03_Scenario_Generator_Spec.md` for background, but treat this document as authoritative wherever the two disagree — particularly the Spec's Section 3 (User Flow), Section 5 (New Fields in doc-tool-teams.html), and Section 6 (Generation Logic). The Spec's field definitions, doctrine-grounding approach, and architecture (Firebase Cloud Function, paired generation) are all still correct and still apply — only the *integration point* changed.*

## 1. The core pivot: fully separate, not integrated

The first build (branch `scenario-generator`) implemented the Scenario Generator as a new tab inside `doc-tool-teams.html` that auto-populated the director's existing Commander's Intent, Order of Battle, and other planning fields. **That integration is being removed.** The Scenario Generator is now a standalone, director-facing tool with exactly one job: produce the Situation Handout (paired Blue + Red DOCX, matching the Blue_South/Red_South layout). It does not write into, read from, or otherwise touch `doc-tool-teams.html` in any way. Nothing carries over — not Higher HQ Mission, not the unit mission statement, nothing.

**Why:** Walking through the real course workflow surfaced that `doc-tool-teams.html` is where *players* build their own planning products (COA, DSM, Collections Sync Matrix, ORBAT with task and purpose, EFSTs) in response to the situation they're handed — and that process, done by the player from a printed/distributed handout, is itself the graded exercise. Auto-populating that same tool from the AI output would blur the line between "what you were given" and "what you built," which is exactly the thing a wargame is supposed to test. The Situation Handout sets the stage; the player's own documents, built in `doc-tool-teams.html` exactly as they work today, are what actually drives the game via the existing Publish setup flow (`publishToGame()` → `games/{gameId}/setup/{force}`, POA&M 1.14–1.15, already built, untouched by any of this).

**Confirmed explicitly by Daniel:** no linkage at all, not even a small convenience prefill of HHQ Mission. A player opens `doc-tool-teams.html` and it looks exactly as it does today — blank, waiting for their own input, informed by a handout they read separately.

## 2. What this means concretely for the existing branch

**Remove entirely:**
- The Scenario tab/panel in `doc-tool-teams.html` (the UI added in the first build) — no Scenario Generator UI belongs on this file anymore.
- `applyScenarioSide()`, `applyScenarioResponse()`, `collectScenario()`, `generateScenario()`, `getClientId()` and the `SCEN_TARGET_IDS` skeleton-loading wiring in `doc-tool-teams.html` — all of this existed to populate this file's own fields from AI output. None of it has a purpose anymore. (`getClientId()`'s *rate-limiting* purpose still matters — see §5 below on what to keep.)
- The `element` field/enum from `functions/schema.js`'s `taskOrg` schema, and the requirement that generated units match `doc-tool-teams.html`'s `#o-type` vocabulary. Neither serves a purpose anymore — see §3.

**Keep, unchanged — these are unrelated fixes, not part of the integration being removed:**
- The three HIGH-severity bugs the original code review found and fixed in `doc-tool-teams.html` (session restore dropping Threat-C units on refresh, `generateDocs()` having no error handling, auto-save never being called). These were pre-existing defects, not scenario-generator code, and fixing them was correct regardless of this redesign.
- The two LOW-severity cleanups (duplicate `collectOrbatGroups()`, duplicate placeholder attribute).
- Everything already implemented directly on this branch outside of Fable's original pass: `shared/firebase.js`'s `claimGameRole()`, the new `database.rules.json` (per-game access gate), the role-claiming calls added to `director.html` and `dashboard.html`, and the random-suffix game ID hardening in `index.html`. This is real, tested, working security-hardening work — don't touch it, don't re-derive it, build on top of it.
- `functions/index.js`'s CORS, secret management, and structured-output approach — the mechanics of calling the Claude API are still correct. The rate-limiting design (per-browser `clientId` instead of per-IP, since classroom Wi-Fi shares one public IP via NAT) is also correct and already implemented — a *new* client (see §4) needs to generate and send a `clientId` the same way `doc-tool-teams.html`'s `getClientId()` did, since that logic is being removed along with the rest of the Scenario tab.

## 3. Task Organization is now a flat asset list, not a maneuver scheme

This is the most consequential field-level change. In the first build, generated Task Organization entries were pre-assigned to a maneuver element (`ME`, `SE1`–`SE5`, `HQ`, `Reserve`, or the Red-side equivalents) so they could drop directly into the ORBAT builder. **That's gone, because organizing available assets into a maneuver scheme — deciding what's your main effort, what's in reserve, task and purpose for each element — is explicitly the skill players are evaluated on.** The AI's job is to decide what assets a unit has (organic table of organization plus plausible attachments for this mission), not how those assets get used.

All four reference scenarios (South, Central, East, West — see §6) already present Task Organization exactly this way: a flat list grouped by *organic* unit (H&S Company, Weapons Company, Rifle Companies, or the equivalent adversary company breakdown), never pre-assigned into a maneuver scheme. Match that presentation exactly — it's not a simplification for this feature, it's what the source material already does.

Practical schema consequence: drop `element` from the `taskOrg` item shape in `functions/schema.js`. Also drop the requirement that `type` match `doc-tool-teams.html`'s `#o-type` vocabulary/enum — since generated units no longer feed the ORBAT builder or MIL-STD-2525E symbol rendering, that constraint no longer serves its original purpose. Doctrinal plausibility should still come from the system prompt's grounding in the cited MCDP/MCWP/MCRP references and the exemplar documents, not from a vocabulary lock.

## 4. Typical attachments beyond standard T/O — confirmed as an explicit design goal

Daniel asked directly whether the model can reason about what a regiment would typically attach to a battalion beyond its organic structure (e.g., a reinforcing artillery battery, an engineer platoon, an ACV company) for a given mission — not just recite the baseline table of organization. Answer, confirmed and worth building the prompt around: yes, this is well-documented, unclassified doctrine (MCWP 3-10's organization-for-combat material) and exactly the pattern the reference documents themselves show (South's Blue handout, for instance, includes an attached ACV platoon company, a SIGINT support team, and a combat engineer platoon — none organic to a standard battalion). Build this into the system prompt explicitly: given the mission, echelon, and Force Status/Attachment State parameters, generate a plausible full asset list — organic T/O plus mission-appropriate attachments — not just the bare organic structure. The Primary Learning Objective field is a good lever here: a "combined-arms breach of a defended obstacle" objective should plausibly pull in different attachments (more engineer/breach assets) than a "battalion defense in sector" objective. This raises the importance of the SME review step (Spec §8, POA&M 2.SG5, still not built) — under this design the generated asset list *is* the graded exercise's input data, not just a convenience, so getting it doctrinally right matters more than it did in the integrated design.

## 5. Where does the new standalone tool live?

**Not yet decided — needs a decision before or during the build, not silently assumed.** Recommendation, offered for consideration rather than as a mandate: a new standalone HTML file (e.g. `scenario-tool.html`), director-gated the same way `dashboard.html` already is (a client-side passcode gate — not perfect, but consistent with the existing pattern and proportionate for an unclassified training tool where the real protection is the per-game database access gate, not the UI gate). This fits the existing architecture cleanly — the system is already five purpose-built HTML files, each with one job; this would be a sixth. Extending `index.html` or `dashboard.html` instead were both considered and don't fit as cleanly (`index.html` doesn't currently do any Firebase-backed form flow; `dashboard.html`'s multi-game overview is a different shape of tool than single-scenario authoring). Confirm this before building, or propose something better if it fits the existing five-file architecture more naturally.

Whatever file it lives in, it should reuse the existing `docx.js`-based generation pattern (matching how `generateDocs()` in `doc-tool-teams.html` works, including the `try/catch/finally` error handling the code review added) rather than inventing a new document-generation approach. If sharing that logic cleanly requires factoring it into a shared module, that's worth doing rather than duplicating it — worth deciding as part of the build rather than defaulting to copy-paste.

Keep the **"Load example (no API)"** pattern from the first build — offline demo of the full round trip (parameters → generated content → Situation Handout DOCX) without requiring the Cloud Function to be deployed. That was a good idea independent of where the tool lives.

## 6. Reference material — now four scenarios, not one

The original build was grounded only in Blue_South/Red_South. Three more paired scenarios now exist: `11_Central_Exemplar.md`, `12_East_Exemplar.md`, `13_West_Exemplar.md` (alongside the existing `04_Blue_South_Exemplar.md`/`05_Red_South_Exemplar.md`). Read all four before writing or revising the prompt modules or the docx template — the goal is a generator that works across the pattern common to all four, not one implicitly tuned to AO South. Structural notes:

- All four use the same Blue higher HQ (RLT-2) and the same Commander's Intent framing (Purpose/Method/Endstate), with different battalion designations (V22 Central, V32 East, V28 South, V12 West).
- All four confirm the flat, organic-grouped Task Organization presentation described in §3.
- **`12_East_Exemplar.md` has a data-provenance note at the top — read it.** The uploaded `East.docx`'s automated text extraction failed twice (produced Blue's content duplicated instead of a genuine Red section) before Daniel pasted the correct text directly into chat. That pasted text is what's in the exemplar file; the docx itself may have a structural quirk worth checking if it's ever reprocessed programmatically.
- `13_West_Exemplar.md`'s Red Task Organization includes the note "*1st LCA Bn: Refer to Threat Charlie – Quad Chart for TO*" — implying a further reference document (a "Quad Chart") exists with more detail on this adversary's table of organization that hasn't been shared yet. Worth asking Daniel whether that document exists and should be incorporated, rather than treating West's Task Organization list as complete on its own.

## 7. Adversary profiles — now a known open scope question, deliberately not resolved here

The four scenarios reveal **four distinct adversary force structures**, not two:

| Scenario | Adversary | Structure |
|---|---|---|
| South | 4th PLA **Medium** Combined Arms Bn | Element-style breakdown (AG/FRAG/DAG/TMG/etc. per the original Spec's `RED_C_ELEMENTS`) |
| Central | 2nd PLA Medium Combined Arms Bn | Same family as South |
| West | 1st PLA **Light** Combined Arms Bn | Different vehicle family (CSK 141/181), simpler company breakdown, references an external "Quad Chart" for full T/O |
| East | 3rd PLA (Army) **Amphibious** Combined Arms Bn | Distinct amphibious vehicle family (ZBD-05/ZTD-05, Type 63A amphibious light tank), four-company organic structure (Amphibious Mechanized/SP Assault Gun/Firepower/Operational Support) |

The Spec (§10) scopes this feature to two adversary profiles at launch (Threat A: Russian BTG, Threat C: PLA — implicitly the Medium variant) and explicitly puts "adversary profiles beyond Threat A and Threat C" out of scope. Daniel has been explicit that deciding whether to launch with more than two profiles, or treat Light/Amphibious as a follow-on expansion, is **not being resolved right now** — flag it as an open decision rather than picking a default. If a build has to proceed before this is decided, building cleanly for Threat A and Threat C (Medium) only, in a way that doesn't make adding Light/Amphibious variants later structurally painful, is the safe default — but confirm rather than assume.

## 8. Two things this redesign resolves for free

Worth knowing, since they were flagged as real risks in the integrated design and don't need separate fixing:

- **The fog-of-war leak is gone.** The first build's paired-generation mechanism stored the non-active side's full package in the calling browser's session storage (so Blue's browser held Red's complete situation handout, inspectable via dev tools). Since the new design never populates any player-facing tool at all — the director generates both DOCX files directly and distributes them separately — there's no browser session where the other side's content ever lands.
- **The missing role gate is moot.** The first build had no mechanism stopping a student on their force-locked `doc-tool-teams.html` session from opening the Scenario tab themselves. Since the Scenario Generator is now a separate, director-gated tool entirely, this concern goes away structurally rather than needing an explicit fix.

## 9. Doctrine grounding — Threat A/C handbooks now available

Two large MCTOG-produced reference handbooks were added to the repo root: `Threat A Handbook V3 (20250311).pptx` (Russia, 236 slides) and `Threat C Handbook V3.2 (20250327) Final.pdf` (China/PLA, 362 pages). See `15_Threat_Handbooks_Reference.md` for what they contain and exactly which slides/pages to pull from when writing `threat-a.js`/`threat-c.js` — including the Threat C "PLA Task Organization - Offense" section (AG/FRAG/DAG/TMG/CRG), which is almost certainly the doctrinal source for the Spec's `RED_C_ELEMENTS` vocabulary, and Threat A slide 221's "BTG with tank company and Artillery Battalion Attached," a concrete doctrine-sourced example of the organic-plus-attachment pattern §4 above asks the prompt to reason about.

That note also flags that both files should **not** be committed to git (~110MB combined, no benefit to being in history) — add them to a root `.gitignore` rather than tracking them.
