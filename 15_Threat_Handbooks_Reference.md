# Threat A / Threat C Handbooks — Reference Note

Daniel added two large reference files to the `amwc-wargame` repo root: `Threat A Handbook V3 (20250311).pptx` and `Threat C Handbook V3.2 (20250327) Final.pdf`. Both are legitimate, directly useful grounding material for `functions/prompts/threat-a.js` and `functions/prompts/threat-c.js` — read this note before touching either prompt module.

## What they are

Both are UNCLASSIFIED order-of-battle/equipment/tactics handbooks produced by MCTOG (Marine Corps Tactics & Operations Group), in association with Marine Corps Intelligence Activity for the Threat A file.

- **Threat A Handbook** (Russia, V3/Sep 2024, 236 slides): geopolitical context, strike capabilities, ground forces order of battle, unit structure diagrams (brigade down to squad level), equipment fact sheets (armor, artillery, air defense, EW, UAS, aviation), evolution of Russian tactics, and doctrinal templates for offense/defense.
- **Threat C Handbook** (China/PLA, V3.2/27 Mar 2025, 362 pages): PRC/PLA introduction, PLA ground forces order of battle by theater command, Combined Arms Brigade (Light/Medium/Heavy) and PLANMC Amphibious CAB structures, PLA tactics (task organization, battlespace framework, doctrinal templates), and equipment catalogs (vehicles, artillery, air defense, engineer, UAS, aviation) by class.

## Why they matter for this feature specifically

Redesign Decisions §4 asks the system prompt to reason about *typical attachments beyond organic T/O*, not just recite baseline structure. Both handbooks directly support that:

- **Threat A, slide 27** — Battalion Tactical Group (BTG) structure, the force type Threat A represents.
- **Threat A, slide 221** — "Russian Doctrinal Template - Offense: BTG with tank company and Artillery Battalion Attached." This is a concrete, doctrine-sourced example of exactly the organic-plus-attachment pattern the prompt needs to produce.
- **Threat A, slides 215/223** — Russian Task Organization for offense/defense (recon patrol, combat security outpost, etc.), useful for grounding attachment logic against mission type.
- **Threat A, slides 29–37** — SP Artillery, MLRS, Anti-Tank Artillery, Tank, Recon, and Engineer battalion/company structures — the actual units a BTG would draw attachments from.
- **Threat C, PDF page ~37** — "PLAA Medium CA Bn. Structure": company-level breakdown with personnel and equipment counts (e.g., 200 pers/rifle co. with 10x ZBD-08/09 IFV, 100 pers assault gun co. with 14x ZTL-11, 150 pers ops support co. with SP mortars/MANPADS/ATGMs/AGLs, 50 pers modular C2/EW/Engineer/Chem Defense/Security element). This lines up closely with — and is almost certainly the doctrinal source for — the South/Central exemplars' Threat C task organization.
- **Threat C, PDF page ~72** — "PLA Task Organization - Offense": Advance Group, Frontline Attack Group (FRAG), Depth Attack Group (DAG), Thrust Maneuvering Group (TMG), Combat Reserve Group (CRG). This is the source doctrine for the original Spec's `RED_C_ELEMENTS` vocabulary (AG/FRAG/DAG/TMG) — confirms this handbook is the right grounding reference.
- **Threat C, PDF page ~58 onward** — PLANMC Amphibious Combined Arms Battalion structure, directly relevant to East's "3rd ACA Bn" adversary variant if the amphibious profile is ever brought into scope.

In short: these aren't generic background reading, they're the primary-source doctrine the exemplar documents' Task Organization sections were almost certainly built from. Use them to sanity-check and enrich the prompt's attachment logic — equipment nomenclature, per-echelon personnel/equipment counts, and named doctrinal task-organization groupings should all trace back to material in these two files rather than the model's general knowledge.

## How to use them (don't bulk-extract)

Both files are large (Threat A pptx ~85MB, Threat C pdf ~26MB) and mostly consist of individual equipment fact sheets (aircraft, EW systems, radars, etc.) that aren't relevant to a battalion-echelon task-organization generator. Don't dump either file wholesale into a prompt or a markdown reference doc. Instead, when writing or revising `threat-a.js` and `threat-c.js`:

1. Pull text from the specific page/slide ranges above (`pdftotext -f <n> -l <n> "Threat C Handbook V3.2 (20250327) Final.pdf" -` for the PDF; `python-pptx` or an equivalent slide-text extractor for the PPTX) rather than converting the entire file.
2. Treat the extracted structure/quantity data as authoritative detail to fold into the prompt's grounding instructions (e.g., "a Medium CAB's rifle company carries ~200 personnel and 10 ZBD-08/09 IFVs" is a much stronger prompt instruction than "PLA units use IFVs").
3. If genuinely unsure whether a slide/page is relevant, it's fine to do a quick full-text scan (`pdftotext` with no page range, or a full slide-text dump) to search for keywords — just don't carry the full output into any committed file.

## Repo hygiene — do not commit these files

These two files currently sit untracked at the repo root. **Do not `git add` them.** At ~110MB combined, committing them would permanently bloat this repo's git history (removing them later doesn't shrink history without a rebase/filter), and GitHub has hard per-file limits that the pptx is close to regardless. Recommended handling, to raise with Daniel if it hasn't been settled before this session starts:

- Add both filenames (or a pattern like `*.pptx` / `Threat *Handbook*` at the root) to a root-level `.gitignore` so they stay on Daniel's machine as local reference material without being pushed.
- If the handbooks need to travel with the repo for other collaborators, a better long-term home is outside git entirely (a shared drive link noted in a README) rather than in-repo.

This is a one-line ask, not a blocker — flag it, don't silently work around it.
