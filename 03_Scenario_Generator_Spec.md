**AMWC Wargame System**

**Scenario Generator --- Feature Specification**

*Design Stage Draft · July 1, 2026 · Corresponds to POAM Phase 2.2
(Milestones 2.SG1--2.SG5)*

1\. Purpose & Scope

This document defines the outline, features, inputs, and limitations of
the scenario generator feature described in POAM Phase 2.2. It is a
design-stage artifact, not a build-ready technical spec --- no code is
produced at this stage. The goal is to reach agreement on what the
feature does, what it needs from the director, and where its boundaries
are before implementation begins.

End state: a director describes a scenario in plain-language parameters,
and the system generates Blue Force and Red Force situation handouts
matching the layout, tone, and level of detail of Blue\_South.docx and
Red\_South.docx --- the two baseline documents provided for this
feature.

2\. Relationship to the Existing System

doc-tool-teams.html is the existing force-locked document builder. It is
functionally deployed and currently automates four document types:
Course of Action, Decision Support Matrix, Collections Synchronization
Matrix, and Order of Battle with Task and Purpose, plus Essential Fire
Support Tasks. The scenario generator is a new capability that feeds
this tool --- it does not replace it.

A gap exists between what doc-tool-teams.html currently produces and the
target output. Blue\_South.docx and Red\_South.docx are a fifth document
type --- a Situation Handout --- that is not yet represented anywhere in
the tool\'s document model. Building this feature therefore requires
three things, not one: an AI generation layer, new input fields and a
new panel in the existing tool, and a new docx template matching the
Blue\_South/Red\_South layout exactly. Section 5 details the specific
field gaps.

3\. User Flow

The flow below reflects the review-step decision made for this feature:
generated content populates existing and new form fields for the
director to review and edit, rather than producing a finished document
directly.

1.  Director opens the Scenario tab (new panel) within
    doc-tool-teams.html.

2.  Director completes the Scenario Parameter Form (Section 4).

3.  Client sends the parameters to a Firebase Cloud Function endpoint,
    which calls the Claude API.

4.  The Cloud Function returns a single structured response containing
    both the Blue Force and Red Force content, generated together for
    internal consistency (see Section 6).

5.  The response auto-populates the existing Commander\'s Intent, Order
    of Battle fields, and the new Situation fields (AO, weather, general
    situation narrative, additional assets).

6.  Director reviews and edits any field, exactly as they would with
    manually entered data today.

7.  Director uses the existing \"Generate Documents\" flow to produce
    the Blue and Red DOCX handouts, now including the new Situation
    Handout template.

4\. Inputs --- Scenario Parameter Form (POAM 2.SG1)

Fields marked \"Existing\" already exist in doc-tool-teams.html and are
reused as-is or extended. Fields marked \"New\" do not currently exist
and must be added.

  -------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------- -------------------
  **Field**                        **Description**                                                                                                                                               **Status**
  Exercise / Game Name             Reused from Game Conditions panel.                                                                                                                            Existing
  Area of Operations               Named location plus AO boundary as numbered grid points, e.g. the four/six-point boxes in Blue\_South and Red\_South.                                         New
  Scenario Date/Time Reference     Turn-state marker (e.g. \"D+2, 1900L\") and calendar month, driving both the narrative timestamp and the weather block.                                       New
  Friendly Force Designation       Unit and echelon (e.g. \"2d Battalion, 8th Marines\"), higher HQ, and reinforcement/attachment state.                                                         Existing (extend)
  Adversary Profile                Threat A (Russian BTG) or Threat C (PLA MCA Bn) --- reuses the existing Threat A/C toggle already present in the Order of Battle panel.                       Existing (reuse)
  Weather / Environment            Derived from month and region by default; director can override. Matches the temperature/sky/wind/ground-condition block common to both baseline documents.   New
  Force Status / Attrition State   Fresh, attrited (with %), or reinforced (with asset). Drives the casualty/resupply language in the General Situation narrative.                               New
  Primary Learning Objective       Free text, e.g. \"battalion defense in sector\" or \"combined-arms breach of a defended obstacle.\" Shapes mission framing and emphasis.                      New
  Classification Marking           Reused from Game Conditions panel.                                                                                                                            Existing
  Higher HQ Mission                AI-drafted from parameters; director-editable. Reuses the existing HHQ Mission field.                                                                         Existing (reuse)
  -------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------- -------------------

5\. New Fields Required in doc-tool-teams.html

This table maps each element of the Blue\_South/Red\_South baseline to
its current status in the tool\'s data model.

  ------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Baseline Document Element**                                                                                                                     **Current Field**                                    **Gap**
  General Situation narrative (status update paragraph)                                                                                             None                                                 New freeform field, AI-drafted, director-editable.
  AO boundary (numbered grid points)                                                                                                                None                                                 New repeatable grid-point list.
  Weather block                                                                                                                                     None                                                 New structured field: month, temp range, sky/precipitation, wind, ground condition.
  Higher HQ Mission                                                                                                                                 i-hhqmission                                         Reused.
  Commander\'s Intent (Purpose / Method / End State)                                                                                                i-purpose / i-method / i-endstate                    Reused.
  Unit Mission Statement                                                                                                                            i-mission                                            Reused.
  Task Organization (grouped capability roster with quantities and loadouts, e.g. \"81mm Mortar Section (4 tubes, 10 JLTVs) --- 800 HE, 200 RP\")   Order of Battle builder (task/purpose per element)   Partial. The existing model tracks task and purpose per unit; the baseline format is a grouped roster with quantity and loadout detail. Needs either a new roster mode or extended fields (quantity, loadout notes) on existing rows.
  Additional Assets (attached enablers, time-on-station, ordnance loadout)                                                                          None                                                 New list type, distinct from Order of Battle since these are external/attached assets, not organic task organization.
  ------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

6\. Generation Logic

Paired generation

Blue Force and Red Force content is generated together, in a single
request/response, rather than independently. Both baseline documents
share an AO boundary, a timeline reference (Blue is D+2; Red is
expecting to enter its AO in 24 hours --- the two are meant to align),
and near-identical weather language. Independent generation risks
producing two handouts that contradict each other.

Grounding

-   Blue\_South.docx and Red\_South.docx are supplied as format
    exemplars so structure, section order, and level of detail stay
    consistent across generations.

-   Doctrine references already stored in the project folder (MCDP 1,
    MCDP 1-0, MCDP 1-3, MCWP 3-10, MCWP 5-10, MCRP 2-10B.1) are supplied
    for terminology and plausibility grounding.

-   Adversary composition is constrained to the unit and equipment
    vocabulary already coded into doc-tool-teams.html\'s Red
    Force/Threat option group, so generated Order of Battle entries stay
    inside what the tool can actually render as MIL-STD-2525E symbols.

Adversary doctrine modules

Threat A (Russian BTG structure and equipment) and Threat C (PLA Medium
Combined Arms Battalion structure and equipment, matching the
ZBL-08/ZTL-11-class systems in Red\_South.docx) are separate prompt
modules per POAM 2.SG3 and 2.SG4, selected by the director\'s Adversary
Profile input.

Output contract

The generation response must be structured JSON matching the
doc-tool-teams.html field schema (existing IDs plus the new Situation
fields from Section 5) --- not freeform prose. Reliable parsing into the
form is a hard requirement; the model\'s output format needs to be
locked down and tested before this is treated as done.

7\. Architecture

Per the API-approach decision made for this feature: the client sends
the completed parameter form as JSON to a Firebase Cloud Function
endpoint. The function holds the Anthropic API key as an environment
secret and calls the Claude API server-side --- the key never reaches
the browser. The function returns structured JSON to the client, which
auto-populates form fields. Nothing is written to the Realtime Database
or rendered as a docx until the director reviews the populated fields
and clicks Generate Documents.

This keeps the proxy on the same platform already used for the Realtime
Database, rather than introducing a second service. It requires
upgrading the Firebase project from the free Spark plan to the
pay-as-you-go Blaze plan --- Cloud Functions cannot make outbound calls
to external APIs (including Anthropic\'s) on Spark. Blaze retains all of
Spark\'s free quotas and only bills for usage beyond them; the relevant
free quotas for this function are invocations and outbound networking,
not database storage. At the call volumes expected for scenario
generation, usage should stay within the free quota, but this should be
monitored rather than assumed.

The function should enforce basic rate limiting or request caps, since
API usage is shared across all directors using the tool.

**Not yet built:** the Cloud Function does not exist yet, and the
project has not been upgraded to Blaze. This is a build prerequisite,
not a design detail --- see Section 11.

8\. Validation / SME Review Workflow (POAM 2.SG5)

-   Primary control: the director reviews and edits every auto-populated
    field before generating the final docx (decided for this feature ---
    see Section 3).

-   Recommended secondary control: a periodic SME doctrinal review pass,
    separate from per-game director review, spot-checking generated
    scenarios against the cited MCDP/MCWP/MCRP references. Per-game
    review catches individual mistakes; it won\'t catch a systematic
    error the model repeats across many generations.

-   Correction workflow: doctrinal errors an SME flags should be logged,
    so recurring issues get fixed in the prompt rather than corrected by
    hand every time they recur.

9\. Limitations & Risks

  ---------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------------
  **Limitation**                                       **Why It Matters**                                                                                                                 **Mitigation Status**
  AI hallucination of unit capabilities or equipment   Could produce implausible or doctrinally wrong scenarios.                                                                          Partially addressed: SME review (2.SG5) plus constraining Order of Battle to the tool\'s existing unit vocabulary. Not eliminated.
  Blue/Red inconsistency                               Independently generated sides could contradict each other on AO, timeline, or force status.                                        Addressed by design: single paired generation request (Section 6).
  New infrastructure dependency                        Feature cannot function until the Firebase project is upgraded to Blaze and the Cloud Function and API key are provisioned.        Open --- not yet built (Section 11).
  API cost exposure                                    Multiple directors iterating on scenarios could generate meaningful API spend, and Blaze is pay-as-you-go beyond free quotas.      Recommended: Cloud Function-side rate limiting / usage caps, plus Blaze budget alerts. Not yet implemented.
  Document type gap                                    The Situation Handout format isn\'t yet a supported output in doc-tool-teams.html.                                                 Requires new panel, new fields, and new docx template alongside the AI layer (Section 5).
  Classification / content boundary                    The tool is for UNCLASSIFIED // FOR TRAINING ONLY content; it must never be prompted with real operational or classified detail.   Should be an explicit guardrail in UI copy and prompt instructions, not left as an assumption.
  Scope boundary with Phase 2B                         Facilitated/autonomous gameplay (dynamic adjudication, AI Green/Neutral cell) is a separate, larger phase.                         Out of scope for this feature by design (Section 10).
  ---------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------------

10\. Out of Scope

-   Dynamic, turn-based AI adjudication (Phase 2B, Facilitated Game
    Assistant).

-   Green/Neutral cell AI actor (Phase 2B).

-   Adversary profiles beyond Threat A (Russian BTG) and Threat C (PLA)
    at launch.

-   Automated doctrinal correctness verification --- human SME review
    remains required; there is no plan to replace it.

11\. Open Items Before Build Begins

-   Upgrade the Firebase project from Spark to Blaze; set a budget alert
    before enabling outbound calls.

-   Provision the Cloud Function; obtain and store the Anthropic API key
    as a function secret (not an environment variable checked into
    source).

-   Define the exact JSON schema for the generation response, field by
    field, matching doc-tool-teams.html IDs plus the new Situation
    fields.

-   Add the new Situation panel and fields to doc-tool-teams.html.

-   Build the new docx template section for the Situation Handout,
    matching Blue\_South/Red\_South layout exactly.

-   Write and test the Threat A and Threat C adversary doctrine prompt
    modules.

-   Identify SME reviewer(s) and define the correction-log workflow from
    Section 8.

-   Decide rate-limiting and usage-cap thresholds for the Cloud
    Function.
