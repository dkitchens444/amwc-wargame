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

/**
 * TIME_SLOTS — the collections timeline vocabulary, in 2-hour steps
 * from D-1 0000 through D+2 0000 (37 slots).
 *
 * Lives here because BOTH the planning tool (doc-tool-teams.html, where a
 * player states when an asset is intended to be on station) and the
 * director's turn card (director.html, where that window is confirmed or
 * changed in game) have to speak the same vocabulary. Two private copies
 * would silently diverge the first time the timeline changed, and the AAR
 * reads from both.
 *
 * Exposed as a window property rather than a top-level `const` so it is
 * reachable from a classic <script> and an ES module block alike, and so a
 * page that declares its own local alias does not collide with it.
 *
 * An empty selection means CONTINUOUS — an asset that is simply on for the
 * duration (a ground sensor, a persistent emitter). Do not coerce a blank
 * window into the first and last slot; blank carries meaning.
 */
window.TIME_SLOTS = (function buildTimeSlots() {
  const sl = [];
  for (let h = 0; h < 24; h += 2) sl.push({ label: `D-1  ${String(h).padStart(2,'0')}00`, val: sl.length });
  for (let h = 0; h < 24; h += 2) sl.push({ label: `D    ${String(h).padStart(2,'0')}00`, val: sl.length });
  for (let h = 0; h < 24; h += 2) sl.push({ label: `D+1  ${String(h).padStart(2,'0')}00`, val: sl.length });
  sl.push({ label: `D+2  0000`, val: sl.length });
  return sl;
})();

/**
 * fmtCollWindow(on, off) — one human-readable string for a collection
 * task's on-station window, for display in the AAR and anywhere else a
 * row is rendered as prose. Blank on BOTH ends means continuous.
 */
function fmtCollWindow(on, off) {
  const a = String(on || '').trim(), b = String(off || '').trim();
  if (!a && !b) return 'continuous';
  if (a && b)   return `${a} to ${b}`;
  return a ? `from ${a}` : `until ${b}`;
}
