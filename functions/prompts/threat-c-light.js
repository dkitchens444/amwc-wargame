/* =============================================================
   Adversary doctrine module — THREAT C (LIGHT): PLA Light
   Combined Arms Battalion (LCA Bn).

   Matches the CSK-141/181-class systems in the West baseline
   document. Grounded in the MCTOG Threat C Handbook V3.2
   (27 Mar 2025), UNCLASSIFIED — "PLAA Light CA Bn. Structure"
   (p.33) and "PLAA Light CAB Structure" (p.32) for the brigade
   attachment pool. UNCLASSIFIED, open-source fidelity only.

   NOTE: the West baseline's Red Task Organization defers to an
   external "Threat Charlie – Quad Chart" reference that has not
   been supplied to this project. This module is grounded in the
   handbook and the West exemplar as they stand; if the Quad
   Chart surfaces, reconcile this module against it.
   ============================================================= */

const { PLA_COMMON } = require('./pla-common');

const THREAT_C_LIGHT_MODULE = `
## ADVERSARY DOCTRINE MODULE — THREAT C (LIGHT): PLA LIGHT COMBINED ARMS BATTALION (LCA Bn)

The Red Force is a PLA Army Light Combined Arms Battalion on light tactical vehicles
(the profile in the West baseline document) — mobility-focused, designed to
outmaneuver rather than outweigh.

**Organic structure (use these numbers):**
- 3 x Motorized Infantry Companies (~200 pers each, 10 x CSK-141/181 light tactical
  vehicles per company)
- 1 x Firepower Company (~150 pers, 6-9 x PCP-001 82mm SP mortars; MANPADS teams;
  ATGM teams; automatic grenade launchers; anti-materiel rifles)
- 1 x Operations Support Company (modular, ~50 pers: 1 x Comm Plt, 1 x EW Plt,
  1 x Engineer Plt, 1 x CBRN Plt)
- NOTE: no organic assault gun company and no IFVs — this battalion trades armor and
  firepower for speed. Reflect that in the intent (infiltration, speed, deception,
  seizing terrain before the defender can react) and in what it needs attached.

**Typical attachments beyond the baseline (light brigade pool — pick to fit the mission):**
- Fires from the brigade artillery battalion: PCL-171/161 122mm truck-mounted SP
  howitzers (HE; note ammunition type in assets/loadout), PHL-181 rocket artillery
- ATGM vehicles (CSK-141/181 ATGM variant) when expecting armor
- Air Defense Platoon (6 x FN-6 MANPADS) or brigade SHORAD (HQ-17A) coverage
- Golden Ray-class EW truck (high-powered jamming, direction finding)
- CH-802 small UAS (typically 4) and CH-901 FPV loitering-munition system (Mengshi
  CSK-181 C2 vehicle + launcher with 8 drones, ASV reload in ~12 hours)
- Wing Loong I armed UAV sorties as external assets
- A ZTQ-15 light tank platoon is possible but doctrinally unusual for this profile —
  attach armor only if the learning objective clearly calls for it
${PLA_COMMON}
**taskOrg presentation for this profile:** group lines under the organic companies
('3 x Motorized Infantry Companies', 'Firepower Company', 'Operational Support
Company'), with attachments as standalone lines or under assets when they are
external enablers. Name equipment with specific PLA systems (CSK-141/181, PCP-001,
PCL-161, FN-6, CH-802, Golden Ray) and put concrete counts in qty/loadout.
`;

module.exports = { THREAT_C_LIGHT_MODULE };
