/* =============================================================
   Adversary doctrine module — THREAT C: PLA Medium Combined
   Arms Battalion (MCA Bn). POA&M milestone 2.SG3.

   Matches the ZBL-08/ZTL-11-class systems in the Red_South
   baseline document. Grounded in the doctrine references in the
   project folder (MCRP 2-10B.1 Opposing Force framework).
   UNCLASSIFIED, open-source fidelity only.
   ============================================================= */

const RED_C_ELEMENTS = ['AG', 'FRAG', 'DAG', 'TMG', 'Reserve', 'CG', 'FDG', 'DDG', 'FPG', 'HQ'];

const THREAT_C_MODULE = `
## ADVERSARY DOCTRINE MODULE — THREAT C: PLA MEDIUM COMBINED ARMS BATTALION (MCA Bn)

The Red Force is a PLA Medium Combined Arms Battalion on wheeled 8x8 platforms.
Build its content from this doctrinal template (this matches the Red_South baseline):

**Structure (typical MCA Bn):**
- 3 x Mechanized Infantry Companies, ~10 x IFVs per company (ZBL-08/ZBD-09 family)
- 1 x Assault Gun Company, ~14 x SP Assault Guns (ZTL-11 105mm)
- 1 x Firepower Company (6-9 x PLL-05 120mm SP mortar-howitzers; MANPADS teams;
  HJ-73/HJ-8 ATGM teams; automatic grenade launchers; anti-materiel rifles)
- 1 x Operations Support Company (1 x Comm Plt, 1 x EW Plt, 1 x Engineer Plt, 1 x CBRN Plt)
- Common reinforcements: 1 x Tank Platoon (4 x ZTQ-15 light tank), CH-802/CH-901 UAS,
  Golden Ray-class EW truck (HF/VHF/UHF jamming and direction finding), J-10 CAS sections

**Employment doctrine:**
- System warfare: locate and attack the opponent's key nodes (C2, fires, sustainment)
  rather than attriting line units.
- Reconnaissance-strike: UAS cue the firepower company and higher-echelon fires;
  expect persistent CH-802 coverage ahead of the advance.
- Attacks are organized into functional groups rather than fixed companies; high tempo
  along high-speed avenues of approach, seeking gaps and gluing to defenders to complicate
  US fires.
- EW preparation precedes contact (jamming C2 and UAS links); air defense is layered and
  moves with the formation.

**Element grouping — you MUST use only these Red element labels:**
${RED_C_ELEMENTS.map(e => `- ${e}`).join('\n')}
(AG = advance guard; FRAG = frontline attack group; DAG = depth attack group;
TMG = thrust maneuver group; CG = command group; FDG = firepower distribution group;
DDG = depth destruction group; FPG = firepower protection group.)

**Unit vocabulary mapping (Red taskOrg "type" values):**
- Mechanized infantry companies/battalions -> inf-mech|15| / inf-mech|16|
- Amphibious mech infantry company -> inf-mech-amphib|15|
- Assault gun company/platoon (ZTL-11) -> sp-assault|15| / sp-assault|14|
- Firepower company mortars (PLL-05) -> sp-mortar|14| / sp-mortar|13|
- SP artillery battery/section -> sp-arty|15| / sp-arty|13|
- Tank company/platoon (ZTQ-15) -> armor|15| (company) — a reinforcing platoon may be
  listed under assets instead of taskOrg, matching the baseline document
- Armored recon platoon/team -> arm-recon|14| / arm-recon|11|
- Air defense platoon -> aad|14|
- Engineer platoon -> engr|14|
- UAS team -> uas|11| ; EW team -> ew|11| ; support company -> log|15| ; HQ -> med|16|hq

Name equipment in qty/loadout fields with specific PLA systems (ZBL-08, ZTL-11,
PLL-05, ZTQ-15, CH-802, Golden Ray, J-10) so the handout reads authentically.
`;

module.exports = { THREAT_C_MODULE, RED_C_ELEMENTS };
