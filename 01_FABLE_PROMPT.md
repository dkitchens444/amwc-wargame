RUN THIS IN: Claude Code, with a local clone of `dkitchens444/amwc-wargame` open as the working directory.

Recommended because this project needs you to actually read and edit five large HTML files with full context, add new files (a Cloud Function), and produce diffs Daniel can review and push — not just return code blocks. If you're on Claude Code, `cd` into the repo before starting. If the repo isn't cloned locally yet, run:
`git clone https://github.com/dkitchens444/amwc-wargame.git && cd amwc-wargame`

Before starting, copy the files from the `Scenario Generator - Fable Kickoff` folder (this prompt plus 02–07) into the repo root or another path you can read from — they aren't part of the deployed site and won't be in the clone.

---

# Mission: FORGE Scenario Generator — Review, Reconcile, Build

You're picking up FORGE, the AMWC Wargame System — a live, deployed, unclassified browser-based wargaming platform for the Advanced Maneuver Warfare Course. Phases 1 and 2 (digitization, document automation) are functionally complete and in use. You have four jobs this session, in this order:

1. **Code review** — audit the existing codebase for errors, security issues, and improvement opportunities, with particular attention to whatever you touch while building the new feature.
2. **Gap analysis** — reconcile the POA&M against the Scenario Generator Spec and the actual code, and call out what's missing, inconsistent, or under-specified.
3. **Implementation** — build the Scenario Generator feature end to end, per the Spec, as far as code can take it without live infrastructure access.
4. **UX modernization, scoped** — extract a shared, polished component system and apply it to the new Scenario panel (see `07_UX_Modernization_Recommendations.md`). This is deliberately scoped to new work only this round, not a rewrite of the other four live pages — see §3.5 below.

Read everything in Section 0 before touching code. This is a real system used by an active course — preserve everything that currently works.

## 0. Required reading, in order

1. `03_Scenario_Generator_Spec.md` — the feature spec. This is your primary build target. Read it in full before writing anything.
2. `04_Blue_South_Exemplar.md` and `05_Red_South_Exemplar.md` — the two baseline handout documents the generated output must match in structure, tone, and level of detail. These are the ground truth for "what good output looks like."
3. `06_POAM_Phase2_Excerpt.md` — the roadmap context and milestone numbering (2.SG1–2.SG5) this feature maps to.
4. `02_Gap_Analysis_and_Code_Map.md` — a pre-read someone did on this codebase before handing it to you: known discrepancies between the POA&M and the Spec, confirmed-absent infrastructure, and a line-numbered map of the exact functions and field IDs in `doc-tool-teams.html` you'll be extending. Use it to skip re-discovery, but verify the line numbers yourself since the file may have moved since that map was made.
5. `07_UX_Modernization_Recommendations.md` — Daniel wants FORGE to look like a polished, modern product without becoming heavier to run. This document audits the current `shared/theme.css` system, names what's dated about it, and gives concrete, scoped recommendations (typography split, semantic color tokens, elevation scale, shared components, an AI-generation loading state, etc.) along with hard guardrails: no CSS/JS framework, no web fonts, no icon-font libraries, no new build step. Read it before styling any new UI.
6. Then read `doc-tool-teams.html` in full, and skim `index.html`, `director.html`, `dashboard.html`, `feedback.html`, and the three `shared/` files to understand what a change here could break elsewhere.

## 1. Code review

Scope: the whole repo, but weight your effort toward `doc-tool-teams.html` and anything shared (`shared/firebase.js`, `shared/utils.js`, `shared/theme.css`) since that's where new code is landing. For each issue you find, note file, approximate location, what's wrong, why it matters, and a suggested fix — don't just fix silently, since Daniel needs to see what changed and why in code this hasn't been reviewed before.

Specifically check:
- Whether `shared/firebase.js`'s current Realtime Database rules match `security-update-baseline.txt`, or whether that file is a drafted-but-unapplied proposal (see Gap Analysis §5). This affects whether the new Cloud Function is the most exposed surface or one of several.
- Error handling and loading states across the existing four document-generation flows — the new fifth (Situation Handout) needs to match whatever pattern is idiomatic here, good or bad.
- Whether `localStorage`-based session persistence (`captureSession`/`restoreSession`, ~line 1668) has any existing gaps that a new field-heavy panel would make worse.
- Anything else that stands out — this codebase has never had a security or architecture review, so don't limit yourself to only what's adjacent to the new feature if you spot something serious.

## 2. Gap analysis

Read `02_Gap_Analysis_and_Code_Map.md` §1 first — it already flags the milestone-status mismatch (2.SG1–2.SG4 marked "In Progress" despite the Spec's Section 11 saying none of the prerequisites are done) and the Cloud Function vs. Cloudflare Worker architecture note conflict. Daniel has decided **not** to have the POA&M document edited this round — just produce a short, standalone gap-analysis write-up (a new markdown file is fine) that:
- Confirms or corrects those two flagged items after you've read the code yourself.
- Identifies any other gaps between what the Spec assumes exists in `doc-tool-teams.html` and what you actually find there (the Spec's own Section 5 table is a good starting checklist — verify each row against the real code).
- Calls out anything in Section 9 (Limitations & Risks) or Section 11 (Open Items) of the Spec that your implementation doesn't fully close, and why.

## 3. Implementation

Build per the Spec. In priority order:

**a. Scenario Parameter Form (Spec §4, POA&M 2.SG1).** New "Scenario" tab/panel in `doc-tool-teams.html` with the fields listed in Spec §4 — reuse existing fields/state where marked "Existing," add new ones where marked "New." Wire new fields into the existing session save/restore cycle (don't let this be the gap that only surfaces on refresh).

**b. New Situation fields and Task Organization extension (Spec §5).** Add the new field types (AO boundary grid-point list, weather block, general situation narrative, additional assets list) and extend the Order of Battle roster to carry quantity/loadout detail per the Spec's gap table. Match the Blue_South/Red_South structure exactly — that's the acceptance bar, not an approximation of it.

**c. Cloud Function (Spec §7, POA&M 2.SG2–2.SG4).** Write the Firebase Cloud Function that accepts the parameter form as JSON, calls the Claude API server-side (API key as a function secret, never client-side), and returns structured JSON matching the field schema — not freeform prose (Spec §6, "Output contract" is a hard requirement). Include:
- `firebase.json` / `.firebaserc` / `functions/` scaffolding (currently absent from the repo — confirmed in the Gap Analysis).
- Paired generation: Blue and Red content from a single request, per Spec §6, so AO/timeline/weather stay consistent across both sides.
- Separate prompt modules for Threat A (Russian BTG) and Threat C (PLA MCA Bn) per POA&M 2.SG3/2.SG4, grounded in the doctrine references already in the repo (MCDP 1, 1-0, 1-3, MCWP 3-10, 5-10, MCRP 2-10B.1) and constrained to the unit/equipment vocabulary already coded into `doc-tool-teams.html`'s Red Force option group, so generated units stay renderable as MIL-STD-2525E symbols.
- Basic rate limiting / request caps (Spec §7) — API usage is shared across all directors using the tool.
- An explicit guardrail, in both UI copy and the system prompt, that this tool is UNCLASSIFIED // FOR TRAINING USE ONLY and must never be prompted with real operational or classified content (Spec §9).

You cannot provision the actual infrastructure (Firebase Blaze upgrade, live API key, `firebase deploy`) from here — Daniel's confirmed neither has happened yet. Write the code to be deploy-ready and produce a short deployment checklist (Blaze upgrade → set the API key as a function secret → `firebase deploy --only functions` → verify with a test call) as a separate deliverable, rather than assuming deployment or silently skipping this part.

**d. Situation Handout docx template (Spec §5, §3 step 7).** New template section in the existing document-generation pipeline (follow the pattern at `generateDocs()`, matching how the existing ORBAT/DSM/Collections/Fires templates are built), producing DOCX output matching Blue_South/Red_South layout exactly.

**e. Validation.** The review-step decision (Spec §3) means generated content populates form fields for director review — it does not go straight to a document. Test that the round trip works: a synthetic Cloud Function response (you can stub one, since the live function won't be deployed yet) correctly populates every field named in Spec §5, survives a session save/restore, and produces a docx that matches the exemplar structure when the director clicks Generate.

## 3.5 UX modernization — scoped to this build only

Daniel's decision: don't restyle the four existing live pages (`index.html`, `director.html`, `dashboard.html`, `feedback.html`) in this pass — that's a separate follow-on with its own review, since it touches pages an active course depends on every day. What you should do now:

- Read `07_UX_Modernization_Recommendations.md` in full.
- Extract the shared button/card/field/panel styles it describes out of `doc-tool-teams.html`'s inline `<style>` block and into `shared/theme.css` (or a new `shared/components.css` if that file is getting unwieldy) — add the semant