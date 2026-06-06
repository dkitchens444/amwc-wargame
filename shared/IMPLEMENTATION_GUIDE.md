# AMWC Wargame System — Structural Refactor Implementation Guide

**Version:** Refactor v1 — June 2026  
**Applies to:** Post-structural separation of shared CSS and JavaScript

---

## What Changed

Three shared files now exist in a new `shared/` folder. Every HTML tool links to them instead of duplicating the same code internally.

| File | Contains | Used by |
|---|---|---|
| `shared/theme.css` | CSS reset, base font, canonical AMWC green-dark palette | All 5 pages |
| `shared/firebase.js` | Firebase init, canonical config, re-exported DB functions | `director.html`, `dashboard.html`, `feedback.html` |
| `shared/utils.js` | `esc()` HTML-escaping helper | All 5 pages |

No game logic, UI behavior, or Firebase database structure was changed. Functionality is identical to the pre-refactor version.

---

## New File Structure

```
/                              ← repo root (GitHub Pages serves from here)
├── index.html                 ← Operations Portal
├── director.html              ← Director/Blue/Red game page
├── dashboard.html             ← Master Director View
├── doc-tool-teams.html        ← Document Automation Tool
├── feedback.html              ← Feedback & Changelog tool
├── docx.js                   ← DOCX generation library (unchanged)
├── jszip.js                  ← ZIP library (unchanged)
├── MCTOG.svg                 ← Site icon (unchanged)
├── shared/
│   ├── theme.css             ← NEW — shared styles
│   ├── firebase.js           ← NEW — shared Firebase module
│   ├── utils.js              ← NEW — shared utilities
│   └── IMPLEMENTATION_GUIDE.md
└── Archive/                  ← Prior versions (unchanged)
```

---

## Deploying to GitHub Pages

### Prerequisites
- The `shared/` folder and its three files must be committed to the same branch that GitHub Pages serves from (typically `main`).
- All five HTML files must be in the repo root (not a subfolder), since the relative path `./shared/` is written from the root.

### Steps

1. **Commit the `shared/` folder** with all three files (`theme.css`, `firebase.js`, `utils.js`) to your GitHub repo.
2. **Commit the updated HTML files** (`index.html`, `director.html`, `dashboard.html`, `doc-tool-teams.html`, `feedback.html`) in the same push or a follow-on commit.
3. **Verify GitHub Pages is set to serve from the correct branch and folder** (Settings → Pages → Source). If you're serving from `/(root)` on `main`, no change needed.
4. **Wait 1–2 minutes** for GitHub Pages to deploy, then open each page and verify:
   - `index.html` — portal loads, tool cards visible, correct military-green theme
   - `director.html?role=director&game=test` — director page loads in green theme
   - `director.html?role=blue&game=test` — blue theme applied correctly
   - `director.html?role=red&game=test` — red theme applied correctly
   - `dashboard.html` — passcode gate appears, dashboard loads after entry
   - `doc-tool-teams.html?force=blue` — document builder loads in blue-gray theme
   - `feedback.html` — feedback submission form loads

### Confirming Firebase still connects
On any Firebase-connected page, watch for the sync dot (green = connected). If it stays yellow or goes red after 10–15 seconds, see the Troubleshooting section below.

---

## Local Testing Requirement

> **Important:** These files cannot be tested by opening HTML files directly from your computer (double-clicking the file). ES modules (`shared/firebase.js`) are blocked by browsers when loaded via `file://` for security reasons.

**Use a simple local web server instead:**

```bash
# Option 1 — Python (installed on most machines)
cd "path/to/KS AI Development"
python3 -m http.server 8080
# Then open: http://localhost:8080/index.html

# Option 2 — Node (if installed)
npx serve .
# Then open the URL it prints
```

Alternatively, push to GitHub and test from the GitHub Pages URL directly — this is the cleanest approach for a tool already deployed there.

---

## What to Test After Deploying

Work through each page in order, checking that it looks and behaves the same as before the refactor.

**index.html**
- [ ] Green-dark theme renders correctly
- [ ] Game link generator works
- [ ] Recent Sessions list populates from localStorage
- [ ] Doc Tool — Blue and Doc Tool — Red links open correctly
- [ ] Master Director View and Feedback links work
- [ ] Reference documents list loads from GitHub

**director.html**
- [ ] Role-based theming: director (green), blue (blue), red (red) each apply correctly
- [ ] Sync dot goes green (Firebase connection confirmed)
- [ ] Turn card submission and carry-forward work
- [ ] Director adjudication push works
- [ ] Inject tab sends to correct recipients
- [ ] AAR generation and download work
- [ ] Reference library loads for the correct role

**dashboard.html**
- [ ] Passcode gate appears; `amwc-dev` grants access
- [ ] Active game tiles load and update
- [ ] Search/filter works
- [ ] Sync dot reflects Firebase connection

**doc-tool-teams.html**
- [ ] Blue-gray theme renders (this page intentionally looks different from the others)
- [ ] Force lock applies correctly when opened with `?force=blue` or `?force=red`
- [ ] Document fields save and restore session state
- [ ] DOCX generation and ZIP download work
- [ ] GitHub upload (if used) still functions

**feedback.html**
- [ ] Feedback submission form works and saves to Firebase
- [ ] Developer gate (`amwc-dev`) grants access to the admin dashboard
- [ ] Existing feedback items render correctly
- [ ] Status updates and dev notes save

---

## Gameplay-Impacting Changes

The following changes are worth verifying specifically during testing, as they touch behavior rather than just structure:

### 1. feedback.html — esc() now escapes quotation marks (bug fix)
**What changed:** The previous `esc()` in `feedback.html` was missing the `"` → `&quot;` replacement. The shared `utils.js` version includes it.  
**Effect:** Any text field value in feedback.html that contains a `"` character will now render as `&quot;` in raw HTML (but displays correctly as `"` in the browser). This is a correctness fix, not a regression. No gameplay data is affected since feedback.html is not part of the game flow.

### 2. feedback.html — Firebase app registration changed
**What changed:** `feedback.html` previously used a separate Firebase web app registration (different `apiKey`, `messagingSenderId`, `appId`) from `director.html` and `dashboard.html`. It now uses the primary registration shared across all pages.  
**Effect:** Both registrations point to the same Firebase project and Realtime Database, so feedback data is in the same database either way. The practical risk is near-zero, but if feedback submissions fail to reach Firebase after this change, the fix is straightforward — see the note in `shared/firebase.js` for instructions on restoring the original registration.  
**Verify:** Submit a test feedback entry after deploying and confirm it appears in the developer dashboard.

### 3. director.html — font-family now inherited from shared/theme.css
**What changed:** The inline `html,body { font-family: 'Courier New', Courier, monospace }` was in the old inline style. The `shared/theme.css` provides the same declaration. The page-specific style now only sets `height:100%`.  
**Effect:** Font rendering should be identical. If Courier New appears to render differently on a specific machine, the cause is the browser's font cache or OS-level font substitution, not this change.

---

## Troubleshooting

**Sync dot stays yellow or red on a Firebase page**  
1. Check browser console (F12 → Console) for errors mentioning `firebase`, `module`, or `CORS`.  
2. Confirm `shared/firebase.js` is uploaded to the repo and accessible at the same URL path as the HTML files.  
3. If testing locally via `file://`, switch to a local web server — ES modules won't load over `file://`.

**Page styles look wrong (wrong colors, missing layout)**  
1. Confirm `shared/theme.css` is uploaded to the repo.  
2. Check browser console for a 404 on `shared/theme.css`.  
3. Verify the file is at `/shared/theme.css` relative to the repo root (same folder as the HTML files).

**doc-tool-teams.html appears in green instead of blue-gray**  
This page keeps its own `:root` color overrides in its inline `<style>` block, which should win over the canonical palette in `shared/theme.css`. If the wrong colors appear, check that the inline `<style>` block still contains the `:root` override section with `--bg:#0E1012` etc.

**feedback.html submissions not reaching Firebase**  
The page now uses the primary Firebase app registration. If the previous registration is required for any reason (unlikely), restore the original config by creating `shared/firebase-feedback.js` as a copy of `shared/firebase.js` with the feedback-specific apiKey/appId, and update the import line in `feedback.html` to point to that file instead.

---

## Next Steps (After Testing Passes)

Once all pages test correctly on GitHub Pages:

1. **Security hardening** — Add Firebase Anonymous Authentication to director, dashboard, and feedback; tighten database rules from open read/write to `auth != null`. This will be a small, isolated change to `shared/firebase.js` and the Firebase console only.
2. **Fires input — EFST selector** — Add EFST selection field to the turn card fires section in `director.html`.
3. **Phase 2 scenario generator** — Begin Claude API integration; use Cloudflare Worker proxy to protect the API key server-side.

---

*UNCLASSIFIED // FOR TRAINING USE ONLY*
