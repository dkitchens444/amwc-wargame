/* =============================================================
   Adversary doctrine module — THREAT C: PLA Medium Combined
   Arms Battalion (MCA Bn). POA&M milestone 2.SG3.

   Matches the ZBL-08/ZTL-11-class systems in the South and
   Central baseline documents. Grounded in the MCTOG Threat C
   Handbook V3.2 (27 Mar 2025), UNCLASSIFIED — "PLAA Medium CA
   Bn. Structure" (p.37) for the organic table of organization
   with personnel/equipment counts. UNCLASSIFIED, open-source
   fidelity only.
   ============================================================= */

const { PLA_COMMON } = require('./pla-common');

const THREAT_C_MODULE = `
## ADVERSARY DOCTRINE MODULE — THREAT C: PLA MEDIUM COMBINED ARMS BATTALION (MCA Bn)

The Red Force is a PLA Army Medium Combined Arms Battalion on wheeled 8x8 platforms
(the profile in the South and Central baseline documents).

**Organic structure (use these numbers):**
- 3 x Mechanized Infantry Companies (~200 pers each, 10 x ZBL-08/ZBD-09 IFVs per
  company)
- 1 x Assault Gun Company (~100 pers, 14 x ZTL-11 105mm SP assault guns)
- 1 x Firepower Company (~150 pers, 6-9 x PLL-05 120mm SP mortar-howitzers;
  MANPADS teams; ATGM teams; automatic grenade launchers; anti-materiel rifles)
- 1 x Operations Support Company (modular, ~50 pers: 1 x Comm Plt, 1 x EW Plt,
  1 x Engineer Plt, 1 x CBRN Plt)

**Typical attachments beyond the baseline (brigade pool — pick to fit the mission):**
- 1 x Tank Platoon or Company (ZTQ-15 light tank; 4 per platoon) for penetration or
  counter-armor missions
- Air Defense Company or Platoon (FN-6 MANPADS; 18 per company, 6 per platoon)
- Golden Ray-class EW truck (high-powered HF/VHF/UHF jamming, direction finding)
- CH-802 small UAS (typically 4) and CH-901 FPV loitering-munition system (Mengshi
  CSK-181 C2 vehicle + launcher with 8 drones, ASV reload in ~12 hours)
- Wing Loong I armed UAV sorties and J-10 CAS sections as external assets
- Brigade artillery reinforcement (PLZ-07-class 122mm SP battery) for deliberate
  offense or when the learning objective emphasizes fires
${PLA_COMMON}
**taskOrg presentation for this profile:** group lines under the organic companies
('3 x Mechanized Infantry Companies', 'Assault Gun Company', 'Firepower Company',
'Operations Support Company'), with attachments as standalone lines or under assets
when they are external enablers (aircraft, UAS sorties). Name equipment with specific
PLA systems (ZBL-08, ZTL-11, PLL-05, ZTQ-15, CH-802, Golden Ray, J-10) and put
concrete counts in qty/loadout.
`;

module.exports = { THREAT_C_MODULE };
