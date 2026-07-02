# POA&M Excerpt — Phase 2 (Document Automation) & Scenario Generator

_Extracted from AMWC_Wargame_POAM_v4_2.docx (document header reads "Version 4.1 | Updated June 2026" — note the version-label mismatch between filename and document body). Full document available in the KS AI Development folder._

Phase 2 --- Document Automation
===============================

Phase 2 introduces structured digital forms that enable players to
rapidly enter required game information and receive formatted planning
documents. The doc-tool.html and doc-tool-teams.html files represent the
foundation of this capability and are functionally deployed. Remaining
work focuses on expanding document types and integrating with the
scenario generator.

Objective: A player can complete a structured input form covering their
plan and receive a formatted, print-ready planning document within 5
minutes --- with no formatting work required.

2.1 Documents to be Automated
-----------------------------

-   Course of Action graphic and narrative --- scheme of maneuver text,
    task and purpose for each element, and COA overlay description

-   Decision Support Matrix --- key decision points mapped to triggers,
    criteria, and recommended actions

-   Collections Synchronization Matrix --- ISR assets tied to NAIs,
    PIRs, collection windows, and reporting timelines

-   Order of Battle with Task and Purpose --- complete ORBAT document
    with consistent structure

-   Essential Fire Support Tasks --- fire support plan formatted into a
    standard fire support annex

2.2 Scenario Generator
----------------------

The scenario generator uses the Claude API to create scenario content
--- the situation, ORBAT, mission, and commander\'s intent --- from
director-provided parameters. This accelerates scenario production so
directors can develop a wider range of games without the time cost of
manual scenario writing.

Phase 2 Milestones
------------------

  **\#**   **Milestone**                               **Description / Success Criteria**                                                                                             **Est. Effort**   **Status**
  -------- ------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------ ----------------- -----------------
  2.1      **Document builder interface (Blue/Red)**   Structured input forms deployed as doc-tool-teams.html. Force-locked, generates DOCX. Integrated into team pages and portal.   Complete          **Complete**
  2.2      **Document builder interface (Director)**   Full unlocked doc-tool.html deployed. Accessible from director page and portal.                                                Complete          **Complete**
  2.3      **COA and DSM templates**                   Players input scheme of maneuver and decision points. Tool populates formatted templates. Output as DOCX.                      \~8 hrs           **In Progress**
  2.4      **Collections sync matrix template**        Players input ISR assets, NAIs, PIRs, and collection windows. Tool assembles a formatted sync matrix.                          \~6 hrs           **In Progress**
  2.5      **ORBAT with task and purpose template**    Players input each element with task and purpose. Tool assembles a formatted ORBAT document.                                   \~4 hrs           **In Progress**
  2.6      **Essential fire support tasks template**   Players input EFSTs, priority targets, no-fire areas, and FSCMs. Tool formats them into a standard fire support annex.         \~4 hrs           **In Progress**
  2.SG1    **Scenario parameter input form**           Director input form: AO, date/time, friendly force type, adversary type, weather, and primary learning objective.              \~6 hrs           **In Progress**
  2.SG2    **Blue Force document generator**           AI generates Blue Force situation brief matching the established course format. Output as DOCX.                                \~10 hrs          **In Progress**
  2.SG3    **PLA adversary force generator**           AI generates Red Force situation brief using PLA order of battle, equipment, and operational doctrine.                         \~10 hrs          **In Progress**
  2.SG4    **Russian adversary force generator**       AI generates Red Force situation brief using Russian BTG structure, equipment, and operational doctrine.                       \~8 hrs           **In Progress**
  2.SG5    **Scenario package validation**             Generated scenarios reviewed by SME against doctrinal accuracy. Correction workflow established.                               \~8 hrs           **Planned**
  2.10     **Phase 2 live game validation**            Complete game run using AI-generated documents. Cadre assess document quality against manually produced equivalents.           \~4 hrs           **Planned**

## Technology Stack (Section 8)

8. Technology Stack
===================

  **Layer**                         **Technology**                                 **Notes**
  --------------------------------- ---------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------
  **Frontend**                      HTML / CSS / JavaScript                        Hosted on GitHub Pages. No server required. Portal, Game (index.html), Director, and Dashboard pages.
  **Real-time database**            Firebase Realtime Database (free Spark tier)   Handles all game state synchronization across all simultaneous games.
  **AI**                            Claude API (claude-sonnet-4-20250514)          Used for document generation (Phase 2), Green Cell responses (Phase 3), and adjudication (Phase 4).
  **Document generation**           docx-js library                                DOCX output. Run client-side. Deployed in doc-tool.html and doc-tool-teams.html.
  **Overlay digitization**          Photo-to-digital against known map products    Planning phase moved outside secured space. Photos of acetate overlays converted to digital inputs matched against 6--8 standard map products.
  **Version control and hosting**   GitHub                                         All code, documents, and reference files in a single public repository.

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **API KEY SECURITY --- The Claude API key must not be embedded directly in the client-side HTML once AI features are added in Phase 2. A lightweight proxy --- either a Cloudflare Worker or GitHub Actions workflow --- should handle API calls server-side to protect the key. Both Cloudflare Workers and GitHub Actions are free at the usage levels expected.**

## Success Metrics — Phase 2 (Section 9)

  **Phase**      **Success Criteria**
  -------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Phase 1**    Zero technical failures in two complete live game runs. All six simultaneous games operate without cross-contamination. All cadre can operate the tool after a 30-minute orientation.
  **Phase 2**    A complete game planning document package generated in under 15 minutes from a blank form. Cadre assess AI-generated documents as acceptable for game use after review in at least 80% of cases.
  **Phase 2B**   Turn input structure does not extend game tempo beyond 3--4 minutes per phase per turn. Facilitated game assistant runs a complete game with AI Green/Neutral cell. AAR generated without additional cadre data entry.
