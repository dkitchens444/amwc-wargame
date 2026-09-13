RUN THIS IN: Claude Code, in your existing local clone of `dkitchens444/amwc-wargame`, on the `scenario-generator` branch.

This branch already has real work on it from a first build pass, plus separate security-hardening work done directly (not by you) after that pass. Read Section 0 before touching anything — it tells you what to keep, what to remove, and what changed since the first build. This is a redesign of an existing in-progress feature, not a fresh start, and it's easy to waste time re-deriving things that are already decided or already built.

Copy the kickoff folder's files (this prompt plus 02–14) into the repo root or another path you can read from if they aren't already there — they aren't part of the deployed site.

---

# Mission: FORGE Scenario Generator — Redesign to a Standalone Tool

FORGE is AMWC's live, deployed wargaming platform. The Scenario Generator feature — AI-assisted generation of Blue/Red Situation Handouts for directors — went through a first build, then a design review that changed its shape significantly. Your job this session is to bring the branch in line with the corrected design, not to build the original design further.

## 0. Required reading, in this order

1. `03_Scenario_Generator_Spec.md` — original feature spec. Still correct on doctrine-grounding approach, the Firebase Cloud Function architecture, and most field definitions. Wrong on integration point (see next item).
2. **`14_Redesign_Decisions.md` — read this in full before writing or removing any code. This supersedes the Spec wherever they conflict**, and it tells you exactly what changed: the Scenario Generator is now a standalone, director-only tool that produces the Situation Handout DOCX and nothing else — it does not integrate with `doc-tool-teams.html` in any way, not even a small field prefill. It also tells you precisely what existing code to remove, what existing code to keep and build on (including security-hardening work already done directly on this branch), how the Task Organization data model changed (flat asset list, not a maneuver scheme — this is the single most consequential field-level change), and what's still an open decision (where the new tool lives, how many adversary profiles to support).
3. `04_Blue_South_Exemplar.md`, `05_Red_South_Exemplar.md`, `11_Central_Exemplar.md`, `12_East_Exemplar.md`, `13_West_Exemplar.md` — four paired scenarios now, not one. Read all four. The goal is a generator grounded in the pattern common across all of them, not one implicitly tuned to AO South. `12_East_Exemplar.md` has a data-provenance note at its top worth reading — the source docx's automated extraction failed twice; the exemplar text was transcribed from chat instead.
4. `06_POAM_Phase2_Excerpt.md` — roadmap/milestone context (2.SG1–2.SG5).
5. `02_Gap_Analysis_and_Code_Map.md`, `08_Code_Review.md`, `09_Gap_Analysis.md` — outputs from the first build pass. Still valuable for the code map and for the bug fixes that remain correct (see Redesign Decisions §2 for exactly which fixes to keep vs. which integration code to remove) — but their Scenario-Generator-specific content (the old integrated design) is superseded.
6. `10_Deployment_Checklist.md` — still broadly correct (Blaze upgrade, secret provisioning, deploy steps). Revisit once you know where the new standalone tool lives and what its deployed URL/entry point is.
7. `07_UX_Modernization_Recommendations.md` — still applies, now to the new standalone tool's UI instead of a tab inside `doc-tool-teams.html`.
8. Then read the current state of `doc-tool-teams.html`, `functions/`, `shared/firebase.js`, and `database.rules.json` on this branch directly — don't trust the documents alone to tell you what's actually there. The security-hardening work (`claimGameRole()`, the per-game database rules, the game-ID random suffix in `index.html`) is real, tested, working code — build on it, don't redo it.

## 1. Remove the obsolete integration

Per Redesign Decisions §2: strip the Scenario tab/panel and all its supporting code (`applyScenarioSide()`, `applyScenarioResponse()`, `collectScenario()`, `generateScenario()`, `getClientId()`, `SCEN_TARGET_IDS` and its skeleton-loading wiring) out of `doc-tool-teams.html`. That file should end up with zero references to scenario generation — it goes back to being exactly the four-document builder it was before this feature existed, still carrying the unrelated bug fixes from the first code review (session-restore threat persistence, `generateDocs()` error handling, auto-save actually being called, the duplicate-function cleanup) since those are correct regardless of this redesign.

`getClientId()`'s rate-limiting purpose still matters — the new standalone tool needs its own equivalent, generating and sending a `clientId` the same way, so the Cloud Function's per-browser rate limiting (already implemented server-side, keyed off `clientId` with IP as a loose abuse backstop) keeps working for its new caller.

## 2. Decide where the new tool lives

Redesign Decisions §5 has a recommendation (a new standalone HTML file, director-gated the same way `dashboard.html` is) but this isn't locked in — confirm it makes sense, or propose something that fits the existing five-file architecture more naturally, before building. Whatever you land on, reuse the existing `docx.js`-based generation pattern from `doc-tool-teams.html`'s `generateDocs()` (including its `try/catch/finally` error handling) rather than inventing a new generation approach — factor it into a shared module if that keeps things from being duplicated.

## 3. Build the standalone Scenario Generator tool

- **Parameter form** (Spec §4): all the fields described there, on the new tool, entirely disconnected from `doc-tool-teams.html`.
- **Cloud Function** (`functions/`): the existing `index.js` mechanics (CORS, secrets, structured output, rate limiting) are still correct — update the caller to match wherever the new tool lives. Update `schema.js` per Redesign Decisions §3: drop `element` from `taskOrg` entries, drop the requirement that generated unit types match `doc-tool-teams.html`'s vocabulary (that constraint no longer serves a purpose since generated content never touches the ORBAT builder or symbol rendering). Update the prompt modules (`prompts/system.js`, `prompts/threat-a.js`, `prompts/threat-c.js`) per Redesign Decisions §4 to explicitly reason about typical attachments beyond organic T/O, grounded in the mission/objective parameters — and per §6/§7, generalize the grounding across all four exemplars rather than assuming AO South's specific pattern, while treating adversary-profile scope (Threat A/C only, vs. the Light/Amphibious variants found in West/East) as the open decision it is rather than silently expanding or silently ignoring it.
- **Situation Handout DOCX template**: matching the structure common to all four exemplars — general situation, AO boundary, weather, mission statements, Commander's Intent, flat organic-grouped Task Organization, Additional Assets. Keep the UNCLASSIFIED guardrail in both UI copy and the system prompt (Spec §9).
- **Keep "Load example (no API)"** — offline demo of the full round trip without requiring the Cloud Function deployed. Good idea from the first build, worth carrying forward regardless of where the tool lives.
- **Validation**: confirm the round trip — parameters in, structured JSON out (stub a response if the function isn't deployed yet, same as before), DOCX matches the exemplar structure.

## 3.5 UX

Same guardrails as before (no CSS/JS framework, no web fonts, no icon-font libraries, no new build step) — apply `07_UX_Modernization_Recommendations.md`'s shared component system, semantic tokens, and the AI-generation loading state to the new standalone tool's UI, extracted into `shared/theme.css` / `shared/components.css` the same way the first pass intended, just landing on a new page instead of a tab inside `doc-tool-teams.html`.

## 4. Working process

Same as before: don't start writing code immediately. Produce a short written plan first — confirm the tool's location, confirm the adversary-profile scope decision (or explicitly flag it as still open and build for two profiles in a way that doesn't foreclose adding more), then implement. Self-check each piece against the Redesign Decisions doc as you go rather than building everything and reviewing at the end.

## 5. Deliverables

- A diff showing the Scenario Generator UI and its supporting code fully removed from `doc-tool-teams.html`, leaving only the unrelated bug fixes from the first pass.
- The new standalone tool, wherever it lands, with the parameter form and generation flow.
- Updated `functions/schema.js` and prompt modules per §3 above.
- Situation Handout DOCX template, grounded across all four exemplars.
- Updated deployment checklist reflecting the new tool's location/URL.
- A short summary: what's done, what's still an open decision (tool location if you didn't get sign-off, adversary-profile scope), and anything from the exemplars worth Daniel's attention (e.g., West's reference to an external "Quad Chart" document for Threat Charlie that hasn't been supplied yet).
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        