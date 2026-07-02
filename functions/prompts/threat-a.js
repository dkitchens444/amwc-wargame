/* =============================================================
   Adversary doctrine module — THREAT A: Russian Battalion
   Tactical Group (BTG). POA&M milestone 2.SG4.

   Selected by the director's Adversary Profile input. Grounded in
   the doctrine references held in the project folder (MCRP 2-10B.1
   Opposing Force framework; MCDP 1 / 1-0 / 1-3 and MCWP 3-10 / 5-10
   for friendly-force framing and terminology). Composition kept at
   UNCLASSIFIED, open-source fidelity — this is a training vehicle,
   not an intelligence product.
   ============================================================= */

const RED_A_ELEMENTS = ['Recon', 'CSO', 'AG', '1st Ech', '2nd Ech', 'Bonagrupa', 'HQ'];

const THREAT_A_MODULE = `
## ADVERSARY DOCTRINE MODULE — THREAT A: RUSSIAN BATTALION TACTICAL GROUP (BTG)

The Red Force is a Russian-pattern Battalion Tactical Group. Build its content
from this doctrinal template:

**Structure (typical BTG):**
- 2-3 x Mechanized Infantry Companies (BMP-2/BMP-3 or BTR-82A; ~10 vehicles per company)
- 1 x Tank Company (10-13 x T-72B3 or T-90M)
- 2 x Self-Propelled Artillery Batteries (2S19 Msta-S 152mm or 2S1 122mm) and often
  1 x MLRS Battery (BM-21 Grad) held at group level
- 1 x Air Defense Platoon/Battery (SA-XX family: 9K35 Strela-10 / Pantsir-S1 / MANPADS)
- 1 x Reconnaissance Platoon (BRM-1K / BTR-82A scout vehicles, augmented by UAS)
- 1 x Engineer-Sapper Platoon, EW section (R-330Zh Zhitel-class), logistics elements
- Organic UAS: Orlan-10-class for reconnaissance and artillery spotting; FPV strike teams

**Employment doctrine:**
- The BTG fights as a reconnaissance-fires complex: UAS and recon elements find targets,
  massed indirect fire destroys them; maneuver elements exploit.
- Echeloned attack: a first echelon fixes, a second echelon exploits; artillery groups
  displace frequently. Company/platoon actions are tightly scripted from battalion level.
- Expect deliberate use of EW against C2 and UAS links before contact.
- Defense is built on engineer-prepared strongpoints, minefields, and pre-registered fires.

**Element grouping — you MUST use only these Red element labels:**
${RED_A_ELEMENTS.map(e => `- ${e}`).join('\n')}
(Recon = reconnaissance elements; CSO = combined security outpost; AG = artillery group;
1st Ech / 2nd Ech = attack echelons; Bonagrupa = armored group; HQ = command element.)

**Unit vocabulary mapping (Red taskOrg "type" values):**
- Mechanized infantry companies/battalions -> inf-mech|15| / inf-mech|16|
- Tank company/battalion -> armor|15| / armor|16|
- SP artillery battery/section -> sp-arty|15| / sp-arty|13|
- SP mortar platoon/section -> sp-mortar|14| / sp-mortar|13|
- Armored recon platoon/team -> arm-recon|14| / arm-recon|11|
- Air defense platoon -> aad|14|
- Engineer-sapper platoon -> engr|14|
- UAS/FPV team -> uas|11| ; EW team -> ew|11| ; logistics -> log|15| ; HQ -> med|16|hq

Name equipment in qty/loadout fields with specific Russian systems (BMP-3, T-90M,
2S19, BM-21, Orlan-10, Strela-10) so the handout reads authentically.
`;

module.exports = { THREAT_A_MODULE, RED_A_ELEMENTS };
