/* =============================================================
   Adversary doctrine module — THREAT A: Russian Battalion
   Tactical Group (BTG). POA&M milestone 2.SG4.

   Grounded in the MCTOG Threat A Handbook V3 (Sep 2024),
   UNCLASSIFIED — BTG structure (slide 27), attachment source
   pool (slides 29-37: SP artillery, MLRS, anti-tank artillery,
   tank, recon, engineer battalions), Russian task organization
   for offense/defense (slides 215/223), and the doctrinal
   offense template "BTG with tank company and Artillery
   Battalion Attached" (slide 221). Composition kept at
   UNCLASSIFIED, open-source fidelity — this is a training
   vehicle, not an intelligence product.
   ============================================================= */

const THREAT_A_MODULE = `
## ADVERSARY DOCTRINE MODULE — THREAT A: RUSSIAN BATTALION TACTICAL GROUP (BTG)

The Red Force is a Russian-pattern Battalion Tactical Group — a temporary reinforced
battalion built from a motorized rifle battalion plus brigade assets tailored to its
mission (~750-800 personnel total).

**Organic structure (baseline BTG — use these numbers):**
- Bn HQ (~30-80 pers)
- 3 x Motorized Rifle Companies (~100 pers each, 11 x BTR-82A or BMP-2M/BMP-3 per
  company, 8 x 2B24 82mm mortars per company)
- 1 x Tank Company (~30 pers, 10 x T-72B3 / T-90M / T-80BVM)
- 1 x Self-Propelled Artillery Battery (~50 pers, 6 x 2S19 Msta-S 152mm or 2S1 122mm)
- 1 x Mortar Battery (~60 pers, 3 x 2S12 120mm tubes)
- 1 x Air Defense Company (~55 pers, 6 x SA-13 / SA-15 / SA-19, plus MANPADS)
- 1 x Anti-Tank Artillery Battery (~50 pers, 2 x MT-12; 3-4 x 9P162 Kornet-T)
- Enablers: Recon Platoon (3 x BRDM-2 / Tigr), Engineer Platoon, Communications
  Platoon (R-330Zh Zhitel-class EW), Logistics Platoon, Medical Platoon
- Organic UAS: Orlan-10-class for reconnaissance and artillery spotting; FPV strike
  teams increasingly standard

**Typical attachments beyond the baseline (brigade pool — pick to fit the mission):**
- A second tank company, or a full Artillery Battalion in support (3 x batteries,
  6 guns each — the doctrinal offense template is "BTG with tank company and
  artillery battalion attached")
- MLRS Battery (BM-21 Grad / Uragan; 122mm+ rockets) for offensive preparation fires
- Additional Anti-Tank Missile Battery (9-12 x Kornet-T) when expecting armor
- Engineer assets from the brigade engineer battalion (UR-77 line charges, GMZ-3
  minelayers, MTU bridging) for breach or obstacle work
- Additional EW (Borisoglebsk-2 / LEER-3) and Orlan-10 sorties
- Rotary/fixed-wing CAS windows (Ka-52 / Su-25 class) as external assets

**Employment doctrine:**
- The BTG fights as a reconnaissance-fires complex: UAS and recon elements find
  targets, massed indirect fire destroys them; maneuver elements exploit.
- Offense: a Reconnaissance Patrol screens up to 10 km ahead; an Advance Guard moves
  on the route of advance and fights through contact; a First Echelon with one-half
  to two-thirds of combat power conducts the main attack; a Second Echelon exploits
  or counterattacks. Artillery groups displace frequently.
- Defense: Combat Security Outposts (reinforced platoons) forward to conceal the main
  position; two echelons; a Bronegrupa (armored group of BMPs/BTRs less dismounts) as
  a mobile reserve; engineer-prepared strongpoints, minefields, pre-registered fires.
- Company/platoon actions are tightly scripted from battalion level. Expect deliberate
  EW against C2 and UAS links before contact.
- USE the echelon/advance-guard concepts only for the Commander's Intent and mission
  narrative — the taskOrg list stays organized by organic company/battery, never by
  echelon or attack role. Assigning forces to echelons is the Red player's task.

**taskOrg presentation for this profile:** group lines under the organic units
('3 x Motorized Rifle Companies', 'Tank Company', 'SP Artillery Battery', 'Mortar
Battery', 'Air Defense Company', 'Anti-Tank Artillery Battery'), with battalion-level
enablers and attachments as standalone lines. Name equipment with specific Russian
systems (BMP-3, T-90M, 2S19, BM-21, Orlan-10, Strela-10, Kornet-T) so the handout
reads authentically, and put concrete counts in qty/loadout.
`;

module.exports = { THREAT_A_MODULE };
