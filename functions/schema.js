/* =============================================================
   AMWC Scenario Generator — response JSON schema (Spec §6
   "Output contract"). Enforced server-side via the Claude API's
   structured-outputs feature, so the client (scenario-tool.html)
   can parse the reply into review fields without freeform-prose
   failure modes.

   Redesign (July 2026): Task Organization is a FLAT asset list
   grouped by organic unit — never a maneuver scheme. Deciding
   main effort / supporting efforts / reserve, with task and
   purpose per element, is explicitly the skill players are
   evaluated on, so the generator must not do it for them.
   Accordingly there is no `element` field and no unit-type
   vocabulary lock (generated content no longer feeds the ORBAT
   builder or MIL-STD-2525E symbol rendering). Doctrinal
   plausibility comes from the prompt modules' grounding, not
   from an enum.
   ============================================================= */

// Adversary profile codes — must stay in lockstep with the profile
// registry in prompts/system.js and the Adversary Profile <select>
// in scenario-tool.html.
const ADVERSARY_CODES = ['A', 'C', 'CL', 'CA'];

function sideSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'dtg', 'aoPoints', 'gensit', 'hhqMission', 'mission',
               'purpose', 'method', 'endstate', 'taskOrg', 'assets'],
    properties: {
      title: { type: 'string', description: "Handout title line after the force label, e.g. 'V28 (AO South)' for Blue or '4th MCA Bn (AO South)' for Red — unit designation plus AO name in parentheses." },
      dtg: { type: 'string', description: "This side's timeline reference, e.g. 'D+2, 1900L' or 'expecting to enter AO in 24 hours'. Must align with the other side's timeline." },
      aoPoints: {
        type: 'array',
        description: "Numbered AO boundary as 4-digit grid points with grid zone designator, e.g. '52T BK 99 46'. 4-7 points forming a closed box. The two sides' boxes must overlap the same terrain. For Red, this is the AO box (the start box, if any, belongs in gensit).",
        items: { type: 'string' },
      },
      gensit: {
        type: 'string',
        description: 'General Situation status update. One bullet per line (separate with \\n). Covers: who the player is and current time; last 24-48h of activity, casualties/resupply per the force status parameter; intelligence picture of the enemy; for Red, the approach direction and start box. Do NOT repeat the weather or the AO boundary list here — the document template renders those separately.',
      },
      hhqMission: { type: 'string', description: "Higher HQ mission statement (e.g. the RLT mission). Empty string for the Red side — the baseline Red handouts carry none." },
      mission: { type: 'string', description: "This unit's mission statement (task + purpose, doctrinal format). May include a BPT clause or, for Red, an NLT time and key-terrain list (one item per line after the statement)." },
      purpose: { type: 'string', description: "Commander's Intent — Purpose. For Red this becomes the opening intent paragraph." },
      method: { type: 'string', description: "Commander's Intent — Method / key tasks. For Red this becomes the intent assessment bullets (one per line)." },
      endstate: { type: 'string', description: "Commander's Intent — End state. For Red this continues the assessment bullets." },
      taskOrg: {
        type: 'array',
        description: "FLAT Task Organization roster grouped by ORGANIC unit, matching the baseline handouts. Never assign maneuver roles (no main effort, no supporting efforts, no reserve, no attack-group labels) — organizing these assets into a scheme of maneuver is the player's graded task. Order: organic companies first (H&S, rifle/mech companies, weapons/firepower company, ops support), then battalion-level and attached ground assets.",
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['group', 'desig', 'qty', 'loadout'],
          properties: {
            group: { type: 'string', description: "Organic parent this line sits under, e.g. 'H&S Company', 'Weapons Company', '3 x Rifle Companies'. Empty string for a battalion-level standalone line (e.g. 'Scout Platoon', an attached LAR platoon). Repeat the same group string verbatim for every line under that parent." },
            desig: { type: 'string', description: "Roster line, e.g. '81mm Mortar Section' or '1 x Combat Engineer Platoon'." },
            qty: { type: 'string', description: "Quantity/composition detail, e.g. '4 x tubes, 10 x JLTVs'. Empty string if none." },
            loadout: { type: 'string', description: "Ordnance/capability loadout, e.g. '800 HE, 200 RP, 40 Illum' or 'can construct 2 x turn or disrupt obstacles'. Empty string if none." },
          },
        },
      },
      assets: {
        type: 'array',
        description: 'Additional assets — external enablers not on the ground task organization (air sorties, UAS, strikes, insert capability), with time-on-station and loadout constraints, matching the baseline handouts.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'details'],
          properties: {
            name: { type: 'string', description: "e.g. '1 x MQ-9 (unarmed)'" },
            details: { type: 'string', description: "Time-on-station / loadout / constraints, e.g. '24 hours TOS'. Empty string if none." },
          },
        },
      },
    },
  };
}

const SCENARIO_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['shared', 'blue', 'red'],
  properties: {
    shared: {
      type: 'object',
      additionalProperties: false,
      required: ['aoName', 'dtg', 'month', 'adversary', 'weather'],
      properties: {
        aoName: { type: 'string' },
        dtg: { type: 'string', description: 'Primary turn-state marker for the scenario.' },
        month: {
          type: 'string',
          enum: ['January','February','March','April','May','June','July','August',
                 'September','October','November','December'],
        },
        adversary: { type: 'string', enum: ADVERSARY_CODES },
        weather: {
          type: 'object',
          additionalProperties: false,
          required: ['temp', 'sky', 'wind', 'ground'],
          description: 'Identical for both sides. Values are clauses that complete a template sentence.',
          properties: {
            temp:   { type: 'string', description: "Completes 'Temperatures ...', e.g. 'are mild, ranging from 60 - 78 degrees F'" },
            sky:    { type: 'string', description: "Completes 'Skies ...', e.g. 'are clear with no rain forecast for the next six days'" },
            wind:   { type: 'string', description: "Completes 'Winds ...', e.g. 'are not forecast to exceed 5 mph'" },
            ground: { type: 'string', description: "Full sentence, e.g. 'Unimproved roads are dry and dusty from lack of rainfall'" },
          },
        },
      },
    },
    blue: sideSchema(),
    red: sideSchema(),
  },
};

module.exports = { SCENARIO_SCHEMA, ADVERSARY_CODES };
