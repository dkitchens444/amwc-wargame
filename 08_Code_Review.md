# FORGE — Code Review (pre-Scenario-Generator build)

*Fable 5 · July 1, 2026 · Reviewed: `doc-tool-teams.html` (full), `shared/*` (full), `index.html`, `director.html`, `dashboard.html`, `feedback.html` (skim, weighted per tasking). No fixes applied silently — items marked **[fixed in this build]** are changes I made because the new feature touches that code directly; everything else is a recommendation for Daniel to decide on.*

Severity scale: **HIGH** = can lose user work or is a real security exposure · **MED** = correctness/robustness defect with a plausible trigger · **LOW** = hygiene, dead code, polish.

---

## 1. HIGH — `doc-tool-teams.html`: session restore silently drops Red units when Threat doesn't match

**Where:** `captureSession()` (~line 1668) / `restoreSession()` (~1709) / `renderOrbat()` (~1064).

**What's wrong:** The session snapshot saves units and element metadata but **not `S.threat`**. Element vocabularies differ per threat (`RED_A_EL` vs `RED_C_EL`, lines 590–592). If a director builds a Red Threat-C ORBAT (elements like `TMG`, `FDG`), saves, reloads (page defaults to Threat A), and restores — every unit whose element isn't in the Threat-A list is dropped from `renderOrbat()` **and** from `collectOrbatGroups()`, i.e. missing from the generated documents, with no error. The data is still in the saved JSON, so it looks like the tool "ate" the units.

**Why it matters:** This is exactly the "only surfaces on refresh" class of gap the new field-heavy Scenario panel would make worse. **[fixed in this build]** — `captureSession()` now saves `threat`, `restoreSession()` re-applies it via `setThreat()` before rendering, and the new Scenario/Situation fields are wired into the same cycle.

## 2. HIGH — `doc-tool-teams.html`: `generateDocs()` has no error handling; failure strands the UI

**Where:** `generateDocs()` (~1345–1588).

**What's wrong:** The whole async pipeline (four `Document` builds, canvas symbol render, `Packer.toBlob`, zip) runs with no `try/catch`. Any exception — a docx.js edge case, canvas `toBlob` returning against a tainted context, an out-of-memory on a big symbol page — leaves the full-screen progress overlay stuck at "GENERATING DOCUMENTS" with no dismiss control and no console-free way to recover except reloading (which, per finding 1, can also lose unsaved work).

**Why it matters:** This is the pattern the new fifth document and the Cloud Function call inherit. **[fixed in this build]** — pipeline wrapped in `try/catch/finally`; the overlay always closes, the error surfaces via `notify()`, and doc statuses reset. The new AI-generation flow follows the same contract (button disabled while in flight, re-enabled in `finally` — the `publishToGame()` pattern, which is the one well-behaved async flow in the file).

## 3. HIGH — Firebase Realtime Database rules are unverifiable from the repo — and `security-update-baseline.txt` no longer exists

**Where:** `shared/firebase.js`; repo root.

**What's wrong:** The Gap Analysis (§5) asked whether `security-update-baseline.txt` matched the live rules or was a drafted proposal. **That file is not in the repo at all anymore** (checked root and all subfolders) — it was evidently removed in one of the recent cleanup commits. What the code does show: `shared/firebase.js` now performs `signInAnonymously()` on load and its comments state this "satisfies the Firebase rule `auth != null`" — so the client side of the hardening described in `shared/IMPLEMENTATION_GUIDE.md` §Next-Steps was done, and the rules were *presumably* tightened to `auth != null` in the console.

**Why it matters, in two parts:**
1. **`auth != null` via anonymous sign-in is nearly no protection.** The Firebase web config is public by design; anyone can mint an anonymous token and read/write `games/*` — including `publishToGame()`'s `games/{gameId}/setup/{force}` path. The drafted per-game-role checks (per the Gap Analysis description of the deleted baseline file) are what would actually help. As it stands, assume the DB is effectively open to anyone who reads the source — which means the new Cloud Function is **not** uniquely exposed; it's one of two open surfaces, and rate-limiting it (done, see `functions/`) protects the API budget but not game-state integrity.
2. **Rules now live only in the Firebase console** with no copy in version control. One console mis-edit is unrecoverable and undiagnosable from the repo.

**Suggested fix:** Daniel should export the live rules (Firebase console → Realtime Database → Rules) into the repo as `database.rules.json`, reference them from the new `firebase.json` (I've included the wiring, with a placeholder that fails safe), and confirm whether the per-role ruleset was ever applied. This is a 10-minute action and closes the review's biggest unknown.

## 4. MED — hardcoded developer passcode `amwc-dev` in public source, twice, plus documentation

**Where:** `dashboard.html` ~464 (`const PASSCODE = 'amwc-dev'`), `feedback.html` ~408 (`const GATE='amwc-dev'; // ← change this`), and printed in plaintext in `shared/IMPLEMENTATION_GUIDE.md` (committed to the same public repo).

**What's wrong:** The dashboard/feedback-admin gates are client-side string comparisons against a constant that ships in the page source of a public GitHub repo. Combined with finding 3, the gate is cosmetic — the underlying data is reachable directly via the database anyway.

**Why it matters:** Unclassified training data, so exposure is bounded — but the master-director view and feedback admin can be opened by anyone who views source, and the `// ← change this` comment suggests it was meant to be changed and never was. **Suggested fix:** accept it explicitly as a "keep honest people honest" latch (fine for this system, but say so in a comment), or move real gating into database rules (e.g., admin paths writable only by a designated auth mechanism). At minimum, remove the passcode from `IMPLEMENTATION_GUIDE.md`.

## 5. MED — `githubUpload()` can strand its button and leaks failures poorly

**Where:** `doc-tool-teams.html` ~1606–1650.

**What's wrong:** The upload loop has no `try/catch`; a thrown `fetch` (network drop mid-upload) skips the button-reset line, leaving "Uploading…" disabled permanently. Also `await res.json()` on an error response throws if GitHub returns non-JSON (proxy error pages), masking the real failure.

**Suggested fix:** wrap the loop body in `try/catch`, reset the button in `finally`, and guard the error-body parse. (Not fixed in this build — untouched by the new feature; flagging only.)

## 6. MED — auto-save is dead code: `startAutoSave()` is never called

**Where:** `doc-tool-teams.html` ~1798; `init()` ~1889.

**What's wrong:** `startAutoSave()` defines a 60-second localStorage auto-save, but nothing invokes it — `init()` never calls it, so the only persistence is the manual Save Session button. The "AUTO-SAVED hh:mm" status label it would set can never appear.

**Why it matters:** A director who never clicks Save loses everything on an accidental refresh — and the Scenario panel adds a dozen more fields plus AI-generated content (which costs real API money to regenerate). **[fixed in this build]** — `init()` now calls `startAutoSave()`, and the auto-save trigger condition includes the new scenario fields, not just `g-exercise`.

## 7. LOW — duplicate definition of `collectOrbatGroups()`

**Where:** `doc-tool-teams.html` lines ~1049 and ~1209 — two identical function declarations; the second silently shadows the first.

**Suggested fix:** delete one. **[fixed in this build]** — removed the first copy (kept the one adjacent to the other `collect*` functions), since the ORBAT extension had to touch this function anyway and editing two copies is how they'd drift.

## 8. LOW — duplicate `placeholder` attribute on the unit-designation input

**Where:** `doc-tool-teams.html` ~455–457: `#o-desig` declares `placeholder` twice ("Unit designation (e.g. V17 Baker Co)" and "Unit designation"); the first wins, the second is invalid-HTML noise. **Suggested fix:** delete the second. **[fixed in this build]** (adjacent to edited markup).

## 9. LOW — JSZip loaded from CDN while a vendored copy sits unused in the repo

**Where:** `doc-tool-teams.html` line 11 loads `jszip` from `cdn.jsdelivr.net`; `jszip.js` (97 KB) is vendored in the repo root and referenced by nothing.

**Why it matters:** The UX doc sells "zero external dependencies" as a core asset, and classrooms/ops rooms may have constrained networks. If the CDN is unreachable, the MiniZip fallback quietly produces *uncompressed* zips — functional but a silent behavior change. **Suggested fix:** `<script src="jszip.js"></script>` like `docx.js`, keep MiniZip as the fallback, delete the CDN line. (Left alone this round — it's a live-page load-order change; bundle it with the follow-on UX pass.)

## 10. LOW — library-readiness poll never times out or reports failure

**Where:** `doc-tool-teams.html` ~584: `(function w(){ (window.docx&&window.JSZip) ? (docxReady=true) : setTimeout(w,100); })();` polls forever. If `docx.js` 404s, the only symptom is "Libraries still loading — try again in a moment" on every generate click, indefinitely. **Suggested fix:** after ~10 s of polling, surface a real error ("docx.js failed to load — check connection / repo files").

## 11. LOW — stale header comment in `shared/firebase.js`

**Where:** `shared/firebase.js` lines 9–10 say "Not used by: … doc-tool-teams.html (no Firebase)" — but `publishToGame()` dynamically imports this module. Comment predates the publish feature; worth updating so nobody reasons from it (the way this review almost did).

## 12. LOW — `esc()` doesn't escape single quotes

**Where:** `shared/utils.js`.

**What's wrong:** `esc()` handles `& < > "` but not `'`. Every current interpolation into single-quoted inline-handler contexts uses fixed vocabulary (element names from constant arrays), so there's no exploitable path today — but the pattern `oninput="updateElMeta('${el}',…)"` is one refactor away from interpolating user text. **Suggested fix:** add `.replace(/'/g,'&#39;')`; it's strictly safer and can't break existing output.

## 13. LOW — `notify()` toasts overlap; `restoreSession()` can regress the unit-ID counter

Two small ones: (a) simultaneous `notify()` calls stack at the same fixed position, unreadable — offset by existing-toast count or queue; (b) `restoreSession()` sets `S.uid = data.uid || S.uid`, which can *lower* the counter below IDs already live in the other force's list — harmless today because `removeUnit` filters per-force, but `Math.max(S.uid, data.uid||0)` is the correct write. **[Math.max fix applied in this build]** (that line changed anyway for threat restore).

---

## Error-handling / loading-state idiom (what the new flow matches)

For the record, the pattern the four existing flows establish, which the new Situation Handout + AI generation flow follows:

- **Long local work** (`generateDocs`): full-screen `.progress-overlay` + percentage bar + per-doc status chips → now with `try/catch/finally` per finding 2.
- **Network calls** (`publishToGame` — the best-behaved flow in the file): disable the button, stash its label, `try { … } catch(e){ status + notify(…,'warn') } finally { re-enable }`.
- **User feedback:** `notify(msg, 'ok'|'warn')` toasts, 3.8 s.
- **New for AI generation** (per `07_UX_Modernization_Recommendations.md`): CSS shimmer/skeleton on the fields about to populate instead of a fake percentage bar, with the `publishToGame` button/error contract underneath.
