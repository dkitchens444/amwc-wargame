/* =============================================================
   Shared PLA doctrine — common to all Threat C variants
   (Medium / Light / Amphibious Combined Arms Battalions).

   Grounded in the MCTOG Threat C Handbook V3.2 (27 Mar 2025),
   UNCLASSIFIED: "PLA Task Organization - Offense" (p.73) and
   "PLA Battlespace Framework - Offense" (p.72). Used for
   NARRATIVE grounding (intent, mission framing, employment) —
   these group labels must never appear as taskOrg structure,
   because organizing assets into groups is the player's task.
   ============================================================= */

const PLA_COMMON = `
**PLA employment doctrine (all CA battalion variants):**
- System warfare: locate and attack the opponent's key nodes (C2, fires, sustainment)
  rather than attriting line units.
- Reconnaissance-strike: UAS cue the firepower company and higher-echelon fires;
  expect persistent CH-802-class coverage ahead of the advance.
- High tempo along high-speed avenues of approach, seeking gaps and "gluing" to
  defenders to complicate US fires; EW preparation (jamming C2 and UAS links)
  precedes contact; air defense is layered and moves with the formation.
- For offense, PLA doctrine task-organizes into functional groups — Advance Group
  (security/counter-recon ahead of the main body), Frontline Attack Group (breach/
  penetrate), Depth Attack Group (exploit into depth with best-available forces),
  Thrust Maneuvering Group (highly mobile exploitation of C2/logistics/key terrain),
  Combat Reserve Group (reinforce, defeat counterattacks), plus Firepower and IW/EW
  Groups. USE THIS ONLY to write a plausible Commander's Intent and mission — the
  Red player builds their own groupings, so the taskOrg list must stay organized by
  organic company, never by these groups.

**Red handout conventions (match all four baseline documents):**
- The Red force is approaching from outside the map: give an approach direction,
  an expected time to enter the AO (24-48 hours, consistent with Blue's intel
  picture), and a start box it must enter the AO from (start box goes in gensit).
- Red's intelligence picture of Blue mirrors what Blue actually is ("a battalion
  reinforced with tanks, an artillery battery, and multiple specialized
  attachments" — adjusted to the actual Blue package generated).
- Red mission statements carry an NLT time and a terrain- or LOC-focused task
  (seize key GLOCs / key terrain / clear toward an objective) IOT deny US
  sustainment, reinforcement, or operational reach.
`;

module.exports = { PLA_COMMON };
