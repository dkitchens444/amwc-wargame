# FORGE — UX Modernization Recommendations

Goal: make FORGE feel like a polished, current product instead of a hand-built internal tool, without changing its cost profile. It's a flat, no-build, no-framework, static site served free from GitHub Pages — that's a real asset (runs on any device, any browser, zero install, zero server cost) and nothing here should put that at risk. Every recommendation below is CSS/markup-level polish on top of the existing hand-rolled system, not a framework adoption.

## What's already right — don't lose this

- **CSS custom properties are already the architecture.** `shared/theme.css` defines a canonical palette and every page overrides `:root` for its own theme. This is exactly the right foundation for a design-system pass — it means modernizing is a matter of extending tokens, not introducing new tooling.
- **Role-coded color (green/blue/red) is functional, not decorative.** Director/Blue/Red theming in `director.html` tells a player which role they're in at a glance. This is a safety feature for game clarity and should be preserved as a hard constraint through any visual refresh, not softened away in the name of a unified palette.
- **Dark theme fits the use case.** Classrooms, ops-center-style rooms, projectors — dark is the right default, not a trend to reconsider.
- **Zero external dependencies beyond `docx.js`/`jszip.js`.** No React, no Tailwind, no icon font, no webfont network request. This is the single biggest reason the tool is currently lightweight, and the recommendations below are written to keep it that way.

## Where it currently reads as dated rather than deliberate

**Monospace everywhere.** `Courier New` at 13px is applied to every element via the global reset in `theme.css` — body text, labels, buttons, and long-form narrative fields all render in the same typewriter face. That's a strong, intentional look for HUD-style data (grid coordinates, timestamps, unit designations) but it fights readability on the content the new feature adds most of: multi-paragraph situation narratives and AI-generated prose meant for a director to actually read and edit closely.

**One accent color carrying every kind of meaning.** `--gold` is used for primary call-to-action buttons (`.gen-btn`), for the inject/note styling in `director.html`, and implicitly for anything that needs to stand out. There's no separate token for "success," "warning," and "primary action" — they're all the same color doing different jobs, which is what makes an interface feel ad hoc rather than designed.

**Depth communicated only by borders.** Nearly every panel, card, and modal uses a 1px border and a flat background (`.doc-card`, `.row-card`, `.el-group`, `.section`) with almost no shadow use outside the mobile sidebar. It's not wrong, but it's the visual signature of an early-stage internal tool — modern flat-dark UIs (the reference class here is developer tools like Linear, Vercel's dashboard, GitHub's dark mode) use very subtle elevation shadows and softer borders to create hierarchy instead of relying on outlines alone.

**Styling is duplicated per page, not shared.** Each of the five HTML files carries its own inline `<style>` block re-declaring `.btn`, `.field`, card patterns, and spacing values, with small unintentional variances between them (e.g., border-radius and padding values drift slightly file to file). This isn't just a visual inconsistency — it's the reason a "modernize the look" pass is expensive today: there's no single place to change a button and have it update everywhere.

**No loading/motion language for async work.** The current document-generation flow uses a simple percentage bar (`.pbo`/`.pbi`) and that's the extent of motion in the system. The scenario generator introduces the first real network-latency wait in the tool (a Cloud Function round trip to the Claude API) — right now there's nothing designed for that state beyond generic "GENERATING…" text, and a sluggish, unstyled wait is exactly what makes an AI feature feel unfinished even when the underlying model response is fine.

## Recommendations

**Typography — split data from prose, don't drop monospace.** Keep `Courier New` for anything that reads as data: grid coordinates, unit designations, timestamps, badges, form labels, nav items. Add one system-font stack for anything that reads as prose: general situation narratives, commander's intent, AAR text, the new AI-generated content. Use the OS-native stack (`-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`) rather than a webfont — zero network cost, zero FOUT, and it already looks contemporary on every platform without a single byte downloaded. This single change will do more for "modern" than any color or spacing tweak, because it's the difference between a form that looks like a terminal and a form that looks like a document a director is meant to actually read.

**Split the accent token into semantic roles.** Add `--accent` (primary actions), `--success`, `--warning`, `--danger` as distinct tokens instead of overloading `--gold` for all of them. Keep gold as the literal accent color if that's the desired brand feel — just stop asking one variable to mean four different things. This is a pure CSS-variable change, no new dependency, and it's what makes future styling decisions ("what color is a destructive action?") obvious instead of improvised each time.

**Add a small elevation scale.** Three levels is enough: flat panel (current style, unchanged), raised card (existing border plus a soft `box-shadow: 0 1px 3px rgba(0,0,0,.4)` — a few bytes of CSS, no runtime cost), and overlay/modal (existing style plus a stronger shadow, e.g. `0 8px 24px rgba(0,0,0,.5)`, which the sidebar already does at `director.html`'s `.sidebar.open`). Apply consistently instead of the current one-off usage.

**Consolidate a spacing scale.** Replace the scattered hardcoded pixel values in inline styles (`padding:28px 32px`, `margin-top:20px`, `width:460px`, etc.) with a small set of CSS custom properties (`--space-1: 4px` through `--space-6: 32px`, or similar) defined once in `shared/theme.css`. This is refactor work more than visual work, but it's what makes the next redesign pass cheap instead of another full audit.

**Extract shared components instead of per-page CSS.** Move `.btn`, `.field`, `.row-card`, `.doc-card`, `.panel`/`.section`, and form input styling out of each page's inline `<style>` block and into `shared/theme.css` (or a new `shared/components.css` if the file is getting large) as the single canonical version. Pages keep their `:root` palette overrides — the shape and behavior of components stops being duplicated five times with drift. This alone reduces total CSS shipped and makes every future look-and-feel change a one-file edit.

**Design an explicit loading state for AI generation.** Since the scenario generator introduces real network wait time for the first time, give it a purpose-built state rather than reusing the generic progress bar: a skeleton/shimmer placeholder over the fields about to populate (pure CSS `@keyframes` animation on a gradient background — no JS, no images, negligible cost) communicates "this is thinking" far better than a percentage number, and it's the single detail most likely to make the new feature feel like a finished product rather than a bolted-on API call.

**Small interaction polish, all CSS-only.** Consistent hover/focus states using color plus a subtle shadow instead of the current border-color-only transition; a `:focus-visible` outline for keyboard accessibility (currently `outline:none` is set globally on inputs with no replacement focus indicator — worth fixing on accessibility grounds alone); a slight scale/opacity change on button press. All of this is transitions and `@keyframes`, adds no weight, and is what separates "styled" from "polished."

**Iconography, if wanted: inline SVG sprite, not an icon font.** The system currently uses unicode glyphs (`◼`, `⬆`) in a few places. If more iconography is wanted for the modernized look, hand-pick a small set (a dozen or so) and inline them as an SVG `<symbol>` sprite defined once in the page — a few KB total, zero network requests, no icon-font FOUT. Skip Font Awesome or Material Symbols entirely; they add real weight and a runtime dependency for something a dozen inline SVGs solve for free.

**Reduced-motion support.** One `@media (prefers-reduced-motion: reduce)` block disabling the new shimmer/transition animations. Costs nothing, and this is a training tool used by a wide range of people — worth doing on principle, not just compliance.

## Explicit guardrails for whoever builds this

- No CSS framework (Tailwind, Bootstrap, etc.) and no JS UI framework (React, Vue, etc.). Extend the existing hand-rolled CSS-variable system.
- No web fonts. System font stack only for the new prose typography.
- No icon font libraries. Inline SVG only, if icons are added at all.
- No new build step. The site is flat HTML/CSS/JS served directly from GitHub Pages with no compilation — keep it that way. If a build step is ever wanted (bundling, minification), that's a separate decision with its own tradeoffs, not a side effect of a visual refresh.
- Budget-conscious: the entire visual refresh should add on the order of a few KB of CSS, not tens of KB, and zero additional HTTP requests for fonts/icons/frameworks.

## Suggested rollout (matches the "new panel + shared components only" scope decision)

**This pass:** extract shared button/card/field/panel styles into `shared/theme.css` (or a new `shared/components.css`), add the semantic color tokens and spacing scale, and apply all of it — including the prose typography split and the AI-generation loading state — to the new Scenario tab in `doc-tool-teams.html`, since that's new UI being built from scratch anyway and the natural place to introduce the refreshed system.

**Follow-on pass (separate from this build):** roll the same shared components out visually across `index.html`, `director.html`, `dashboard.html`, and `feedback.html` — swapping in the shared classes without changing their functional behavior. Because the component styles will already exist after this pass, that rollout becomes a lower-risk, mostly-mechanical pass rather than a from-scratch redesign of four live pages an active course depends on.
