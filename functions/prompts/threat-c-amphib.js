/* =============================================================
   Adversary doctrine module — THREAT C (AMPHIBIOUS): PLA
   Amphibious Combined Arms Battalion (ACA Bn).

   Matches the ZBD-05/ZTD-05-class systems in the East baseline
   document. Grounded in the MCTOG Threat C Handbook V3.2
   (27 Mar 2025), UNCLASSIFIED — "PLAA Amphibious CA Bn.
   Structure" (p.41) and the Amphibious CAB beach-assault
   sequence (pp.86+). UNCLASSIFIED, open-source fidelity only.

   Equipment note: the East exemplar arms the Firepower Company
   with PLZ-07 122mm SP artillery (with RAP rounds as an
   additional asset); the handbook's generic structure lists
   PLZ-10 SP mortars. Follow the exemplar (PLZ-07) — it is the
   course's established presentation of this unit.
   ============================================================= */

const { PLA_COMMON } = require('./pla-common');

const THREAT_C_AMPHIB_MODULE = `
## ADVERSARY DOCTRINE MODULE — THREAT C (AMPHIBIOUS): PLA AMPHIBIOUS COMBINED ARMS BATTALION (ACA Bn)

The Red Force is a PLA Army Amphibious Combined Arms Battalion (the profile in the
East baseline document) — the PLAA's basic unit for joint/landing operations, more
tactically agile than most battalions and capable of independent combat operations.

**Organic structure (use these numbers):**
- 2 x Amphibious Mechanized Infantry Companies (~200 pers each, 14 x ZBD-05
  amphibious IFVs per company)
- 2 x SP Assault Gun Companies (~100 pers each, 14 x ZTD-05 105mm amphibious SP
  assault guns per company)
- 1 x Firepower Company (~150 pers, 6 x PLZ-07 122mm SP artillery; MANPADS teams;
  ATGM teams; automatic grenade launchers; anti-materiel rifles)
- 1 x Operational Support Company (modular, ~50 pers: 1 x Comm Plt, 1 x EW Plt,
  1 x Engineer Plt, 1 x CBRN Plt)

**Typical attachments beyond the baseline (pick to fit the mission):**
- 1-2 x Tank Platoons (4 x Type 63A amphibious light tank per platoon)
- RAP rounds for the PLZ-07s (extends range — list as an additional asset)
- Golden Ray-class EW truck (high-powered HF/VHF/UHF jamming, direction finding)
- CH-802 small UAS (typically 4) and CH-901 FPV loitering-munition system (Mengshi
  CSK-181 C2 vehicle + launcher with 8 drones, ASV reload in ~12 hours)
- Wing Loong I armed UAV sorties and J-10 CAS sections as external assets
- An amphibious reconnaissance element (Type 05 recon variants) when the mission
  needs it

**Employment (amphibious-specific):**
- Doctrine builds around assaulting, seizing, and protecting landing sites, then
  clearing inland to enable follow-on forces — in this wargame the battalion is
  typically already ashore or approaching overland from a beachhead, so frame its
  mission as clearing GLOCs / seizing infrastructure ahead of follow-on forces.
- Amphibious recon leads (organic sensors + UAS locate obstacles and defenders);
  assault waves land in echelon; medium attack elements push 2-4 km behind enemy
  forces to unhinge the defense.
${PLA_COMMON}
**taskOrg presentation for this profile:** group lines under the organic companies
('2 x Amphibious Mechanized Companies', '2 x SP Assault Gun Companies', 'Firepower
Company', 'Operational Support Company'), with attachments as standalone lines or
under assets when they are external enablers. Name equipment with specific PLA
systems (ZBD-05, ZTD-05, PLZ-07, Type 63A, CH-802, Golden Ray, J-10) and put
concrete counts in qty/loadout.
`;

module.exports = { THREAT_C_AMPHIB_MODULE };
