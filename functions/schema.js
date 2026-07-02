/* =============================================================
   AMWC Scenario Generator — response JSON schema (Spec §6
   "Output contract"). Enforced server-side via the Claude API's
   structured-outputs feature, so the client can parse the reply
   into form fields without freeform-prose failure modes.

   The `type` enums below MUST stay in lockstep with the values
   in doc-tool-teams.html's #o-type option list — that is what
   keeps every generated Order of Battle entry renderable as a
   MIL-STD-2525E symbol (Spec §6 "Grounding").
   ============================================================= */

// Blue Force unit vocabulary — mirrors the non-threat optgroups in #o-type
const BLUE_UNIT_TYPES = [
  'inf|16|', 'inf|15|', 'inf|14|', 'inf-amphib|15|', 'inf-mech|15|', 'inf-mech|14|',
  'inf-mech-acv|15|', 'inf|15|helo', 'inf|15|airborne', 'inf|15|motorized',
  'armor|15|', 'armor|14|', 'acv30|14|', 'armor-amphib|15|', 'armor-amphib|14|',
  'lar|15|', 'lar|14|', 'recon|14|', 'recon|11|',
  'arty|15|', 'arty|13|', 'aad|11|', 'himars|15|', 'mortar-med|14|', 'mortar-med|13|',
  'opf-l|11|', 'opf-m|11|', 'gsp|11|', 'javelin|11|', 'hk|11|',
  'rw|13|', 'fw|13|',
  'engr|14|', 'engr|12|', 'uas|11|', 'ew|11|', 'chd|11|', 'log|15|',
  'psy|11|', 'cag|11|', 'caat|14|', 'caat|13|', 'rrt|11|',
  'med|16|hq', 'med|17|hq', 'med|15|hq',
];

// Red Force / Threat unit vocabulary — mirrors the red-optgroup in #o-type
const RED_UNIT_TYPES = [
  'inf-mech|15|', 'inf-mech|16|', 'inf-mech-amphib|15|',
  'arm-recon|14|', 'arm-recon|11|',
  'sp-arty|15|', 'sp-arty|13|', 'sp-mortar|14|', 'sp-mortar|13|',
  'sp-assault|15|', 'sp-assault|14|',
  'armor|15|', 'armor|16|', 'aad|14|', 'engr|14|',
  'uas|11|', 'ew|11|', 'log|15|',
  'med|16|hq', 'med|15|hq',
];

// Element groupings — mirror BLUE_EL / RED_A_EL / RED_C_EL in the client
const BLUE_ELEMENTS  = ['ME', 'SE1', 'SE2', 'SE3', 'SE4', 'SE5', 'HQ', 'Reserve'];
const RED_A_ELEMENTS = ['Recon', 'CSO', 'AG', '1st Ech', '2nd Ech', 'Bonagrupa', 'HQ'];
const RED_C_ELEMENTS = ['AG', 'FRAG', 'DAG', 'TMG', 'Reserve', 'CG', 'FDG', 'DDG', 'FPG', 'HQ'];

function sideSchema({ unitTypes, elements }) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['dtg', 'aoPoints', 'gensit', 'hhqMission', 'mission',
               'purpose', 'method', 'endstate', 'taskOrg', 'assets'],
    properties: {
      dtg: { type: 'string', description: "This side's timeline reference, e.g. 'D+2, 1900L' or 'expecting to enter AO in 24 hours'. Must align with the other side's timeline." },
      aoPoints: {
        type: 'array',
        description: "Numbered AO boundary as 4-digit grid points with grid zone designator, e.g. '52T BK 99 46'. 4-6 points forming a closed box. The two sides' boxes must overlap the same terrain.",
        items: { type: 'string' },
      },
      gensit: {
        type: 'string',
        description: 'General Situation status update. One bullet per line (separate with \\n). Covers: who the player is and current time; last 24-48h of activity, casualties/resupply per the force status parameter; intelligence picture of the enemy. Do NOT repeat the weather or AO boundary here - they are rendered separately.',
      },
      hhqMission: { type: 'string', description: 'Higher HQ mission statement. Empty string for the Red side (the baseline Red handout carries none).' },
      mission: { type: 'string', description: "This unit's mission statement (task + purpose, doctrinal format)." },
      purpose: { type: 'string', description: "Commander's Intent - Purpose paragraph." },
      method: { type: 'string', description: "Commander's Intent - Method / key tasks." },
      endstate: { type: 'string', description: "Commander's Intent - End state." },
      taskOrg: {
        type: 'array',
        description: 'Grouped capability roster matching the baseline handout format.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['element', 'type', 'desig', 'qty', 'loadout'],
          properties: {
            element: { type: 'string', enum: elements },
            type: { type: 'string', enum: unitTypes, description: 'Unit type code from the tool vocabulary - determines the MIL-STD-2525E symbol.' },
            desig: { type: 'string', description: "Roster line designation, e.g. '81mm Mortar Section'." },
            qty: { type: 'string', description: "Quantity/composition detail, e.g. '4 x tubes, 10 x JLTVs'. Empty string if none." },
            loadout: { type: 'string', description: "Ordnance/capability loadout, e.g. '800 HE, 200 RP, 40 Illum'. Empty string if none." },
          },
        },
      },
      assets: {
        type: 'array',
        description: 'Additional attached assets (external enablers) - NOT organic task organization.',
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
        adversary: { type: 'string', enum: ['A', 'C'] },
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
    blue: sideSchema({ unitTypes: BLUE_UNIT_TYPES, elements: BLUE_ELEMENTS }),
    // Red element enum is the union of both threat structures; the prompt
    // module constrains generation to the correct set for the chosen threat.
    red: sideSchema({
      unitTypes: RED_UNIT_TYPES,
      elements: [...new Set([...RED_A_ELEMENTS, ...RED_C_ELEMENTS])],
    }),
  },
};

module.exports = {
  SCENARIO_SCHEMA,
  BLUE_UNIT_TYPES, RED_UNIT_TYPES,
  BLUE_ELEMENTS, RED_A_ELEMENTS, RED_C_ELEMENTS,
};
