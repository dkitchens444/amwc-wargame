/* =============================================================
   AMWC WARGAME SYSTEM — Shared Utilities
   shared/utils.js

   Loaded as a regular <script> (NOT type="module") so all
   functions are available as globals on window — accessible
   from both regular scripts and ES module scripts alike.

   Used by: all five pages (index, director, dashboard,
            doc-tool-teams, feedback)

   Load BEFORE the page's main script or module block:
     <script src="./shared/utils.js"></script>
   ============================================================= */

/**
 * esc(s) — HTML-safe string escaping.
 *
 * Escapes &, <, >, and " so user-entered text cannot be
 * interpreted as HTML when injected into the DOM via
 * template literals or innerHTML.
 *
 * Canonical version — all four replacements present.
 * Previous versions in director, dashboard, and index were
 * correct. feedback.html was missing the " escape — now fixed.
 */
function esc(s) {
  return String(s || '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}
