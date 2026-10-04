# TASKS.md — MatchCutter Task List

> One task per session (1-3 files, one testable outcome). Check `[x]` when done.
> Never start a task whose dependencies are unchecked. Commit as `T-<id>: <summary>`.

Legend: `ID` — `Phase` — `Status`

---

## P0 — Setup

- [x] **T-001 — Repo scaffolding: Vite + TS strict + base files**
  - Files: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` (minimal), `src/types.ts` (stub), `src/config.ts` (stub), `LICENSE` (MIT), `.gitignore`
  - Inputs: empty repo
  - Outputs: `npm install` succeeds, `npm run dev` serves empty page, `npm run build` succeeds
  - Acceptance: `npx tsc --noEmit` passes with `strict:true`; Vite builds to `dist/`

- [x] **T-002 — Lint, format, line-check, test harness**
  - Files: `.eslintrc.*` / `eslint.config.*`, `.prettierrc`, `scripts/check-lines.mjs`, `vitest.config.ts`, `tests/smoke.test.ts`
  - Inputs: T-001
  - Outputs: lint/format/test scripts work; line-check fails on >600-line file
  - Acceptance: `npm run lint`, `npm run format:check`, `npm test`, `node scripts/check-lines.mjs` all pass on clean tree; a 601-line fixture makes check-lines exit 1

- [x] **T-003 — Docs skeleton + LICENSES verification**
  - Files: `docs/LICENSES.md`, `LICENSE`, `NOTICE` (if needed), `public/fonts/README.md` (OFL attribution placeholder)
  - Inputs: T-001, T-002
  - Outputs: LICENSES table with Vite/TS/Vitest/ESLint/Prettier/mp4-muxer (to be verified) entries
  - Acceptance: `docs/LICENSES.md` lists every installed dep with name, version, license, URL; all are permissive (MIT/Apache-2.0/BSD/ISC/OFL/CC0/Unlicense/MPL-2.0 unmodified); no GPL

- [x] **T-004 — Shared types & config contracts**
  - Files: `src/types.ts` (full interfaces), `src/config.ts` (constants, limits, presets)
  - Inputs: T-001
  - Outputs: typed contracts for `ParsedInput`, `FrameSpec`, `LayoutPreset`, `PaperStyle`, `HighlightStyle`, `AspectRatio`, `SoundEffect`, `Timeline`, `EncodeResult`, `RNG`, `SupportGate`
  - Acceptance: `npm run lint` + `npx tsc --noEmit` pass; `tests/types.test.ts` (type-level) or simple import test passes; no circular imports

## P1 — Parser and Types

- [x] **T-010 — `==word==` parser + validation**
  - Files: `src/parser/parseInput.ts`, `tests/parser.test.ts`
  - Inputs: `src/types.ts`, `src/config.ts`
  - Outputs: `parseInput(raw: string) -> { ok, parsed?, error? }` handling single `==word==`, trimming, 23-char focal limit, plain phrase fallback
  - Acceptance: 15+ unit tests pass: valid `==word==`, no marker (error), two markers (error), empty focal, >23 chars, whitespace, unicode; 100% branch coverage for parser

- [x] **T-011 — Parser edge cases & helper exports**
  - Files: `src/parser/parseInput.ts` (helpers), `tests/parser.test.ts` (additional)
  - Inputs: T-010
  - Outputs: helpers `extractFocal()`, `validateLength()`, `sanitizeInput()` if needed; word-select helper for `==` wrapping
  - Acceptance: selecting a word in input wraps it with `==`; re-select unwraps; helpers unit-tested

## P2 — Layout Engine and Filler Text

- [x] **T-020 — Layout presets & data**
  - Files: `src/layout/layoutPresets.ts`, `src/layout/fillerText.ts` (data)
  - Inputs: `src/types.ts`, `src/config.ts`
  - Outputs: `LAYOUT_PRESETS[]` (fontFamily, paperStyle, rotation range, highlightStyle pool), `FILLER_SENTENCES[]` / word bank, font list (OFL: Playfair Display, Libre Baskerville, Old Standard TT, Special Elite, IM Fell, Courier Prime + fallbacks)
  - Acceptance: ≥6 distinct layout presets, ≥20 filler sentences; each references only OFL/system fonts; no preset duplicates consecutively (enforced in engine, not here); lint pass

- [x] **T-021 — Seeded PRNG + layout engine (no-repeat, anchor math)**
  - Files: `src/layout/layoutEngine.ts`, `tests/layout.test.ts`
  - Inputs: T-020, `src/types.ts`
  - Outputs: `mulberry32`/`xoshiro`-style PRNG, `pickLayout(rng, prevId)`, `computeAnchorOffset(focalWord, frameWidth, ...)` using `measureText` mock in tests
  - Acceptance: seeded sequence deterministic; never returns same preset twice in a row (100 iterations); anchor offset keeps focal word centre at (cx,cy) within 0.5px in tests

- [x] **T-022 — Filler text generator**
  - Files: `src/layout/fillerText.ts` (generator), `tests/filler.test.ts`
  - Inputs: T-020
  - Outputs: `generateFillerLines(rng, count, avgWords)` → string[]; wraps at canvas width via measure
  - Acceptance: output lines non-empty, word count within ±2 of target, deterministic with seed, no repeated line twice in a frame

## P3 — Frame Renderer

- [ ] **T-030 — Procedural paper + highlight styles**
  - Files: `src/render/paper.ts`, `src/render/highlight.ts`, `tests/render-paper.test.ts` (logic only)
  - Inputs: `src/types.ts`, `src/config.ts`
  - Outputs: `drawPaper(ctx, w, h, style, seed)` (noise + tint, no image fetch), `drawHighlight(ctx, bbox, style)` (marker/underline/box)
  - Acceptance: `drawPaper` produces visibly different output per style (pixel diff test or snapshot); `drawHighlight` renders 3 styles without throwing; unit tests for bbox math

- [ ] **T-031 — Zoom & blur utilities**
  - Files: `src/render/zoomBlur.ts`, `tests/zoomBlur.test.ts`
  - Inputs: `src/types.ts`
  - Outputs: `applyZoom(ctx, zoom, cx, cy)`, `applyBlur(ctx, blur)` (`ctx.filter = blur(Npx)` with fallback)
  - Acceptance: zoom 1.0 is identity; 2.0 scales 2× around anchor; blur 0 is no-op; perf: no throw when `filter` unsupported

- [ ] **T-032 — drawFrame (anchor-pinned single frame) + minimal preview**
  - Files: `src/render/drawFrame.ts`, `src/main.ts` (<150 lines), `index.html` (unstyled controls: input + canvas), `tests/drawFrame.test.ts` (anchor math)
  - Inputs: T-030, T-031, `src/layout/layoutEngine.ts`
  - Outputs: `drawFrame(ctx, spec, parsed, dims)` pins focal word centre to (cx,cy) at fixed size; preview canvas shows one frame on input change
  - Acceptance: await `document.fonts.ready`; focal word bbox centre within 1px of (cx,cy) for 3 aspect ratios × 3 presets; no network fetch during draw

## P4 — Timeline + Preview Playback

- [ ] **T-040 — Timeline builder (cuts/s → FrameSpec[])**
  - Files: `src/timeline/buildTimeline.ts`, `tests/timeline.test.ts`
  - Inputs: `src/types.ts`, `src/config.ts`, `src/layout/layoutEngine.ts`
  - Outputs: `buildTimeline(parsed, opts: { cutsPerSec, durationSec, zoomMax, seed }) -> FrameSpec[]` with zoom ramp in last 20% frames
  - Acceptance: 12 cuts/s × 2s → 24 specs; 4-30 cuts/s range valid; zoom monotonic increase in tail; deterministic with seed; no consecutive duplicate preset

- [ ] **T-041 — Animated preview (no export) + progress + examples**
  - Files: `src/ui/progress.ts`, `src/ui/examples.ts`, `src/main.ts` (wire preview loop), `index.html` (add Generate/Regenerate + progress + 3 examples)
  - Inputs: T-040, `src/render/drawFrame.ts`
  - Outputs: `requestAnimationFrame` loop cycling FrameSpecs at cutsPerSec; progress bar; 3 example prompts load into editor on click
  - Acceptance: clicking example loads phrase with `==`; Generate rebuilds timeline & animates; Regenerate re-seeds; progress reflects frame index

## P5 — Audio Synthesis + Mixdown

- [ ] **T-050 — Web Audio primitives**
  - Files: `src/audio/synth.ts`, `tests/synth.test.ts`
  - Inputs: `src/types.ts`
  - Outputs: `makeNoiseBuffer(ctx, type)`, `envelope(gain, attack, decay)`, `filteredNoise(ctx, freq, Q)`
  - Acceptance: OfflineAudioContext renders non-silent buffer; envelope shapes verified via sample inspection; no external samples

- [ ] **T-051 — Six sound effects (synthesized)**
  - Files: `src/audio/effects.ts`, `tests/effects.test.ts`
  - Inputs: T-050
  - Outputs: `getEffectFn(name: SoundEffect) -> (ctx, time) => void` for paper shuffle, camera shutter, film advance, polaroid, flash pop, none
  - Acceptance: each effect (except none) renders audible samples in OfflineAudioContext; `none` is silent; all <300ms; no CC0 samples unless documented

- [ ] **T-052 — Mixdown (schedule bursts at cut timestamps)**
  - Files: `src/audio/mixdown.ts`, `tests/mixdown.test.ts`
  - Inputs: T-051, `src/timeline/buildTimeline.ts`
  - Outputs: `mixdown(timeline, effect, opts) -> Promise<AudioBuffer>` via OfflineAudioContext at 48kHz
  - Acceptance: buffer duration ≈ timeline duration; one burst per cut (except none); buffer is not silent when effect != none; timing within ±10ms

## P6 — Encoding

- [ ] **T-060 — WebM encoder (MediaRecorder)**
  - Files: `src/encode/webmEncoder.ts`, `src/encode/pickEncoder.ts` (stub)
  - Inputs: `src/types.ts`, `src/render/drawFrame.ts`
  - Outputs: `encodeWebM(frames, audioBuffer, dims, onProgress) -> Blob` via canvas.captureStream + MediaRecorder; feature-detect
  - Acceptance: on browsers with MediaRecorder, produces `video/webm` Blob >0 bytes; on unsupported, returns clear error; no ffmpeg

- [ ] **T-061 — MP4 encoder (WebCodecs + mp4-muxer)**
  - Files: `src/encode/mp4Encoder.ts`, `src/encode/pickEncoder.ts` (complete)
  - Inputs: T-060, `src/types.ts`
  - Outputs: `encodeMP4(frames, audioBuffer, dims, onProgress) -> Blob` feeding VideoFrame + AudioData to VideoEncoder/AudioEncoder then mp4-muxer; verify mp4-muxer license is MIT
  - Acceptance: on WebCodecs-capable browser, produces `video/mp4` playable in Chrome/VLC; fallback to WebM if VideoEncoder absent; `docs/LICENSES.md` updated with mp4-muxer entry

- [ ] **T-062 — Encoder integration + download**
  - Files: `src/main.ts`, `src/ui/progress.ts`, `index.html` (Download button)
  - Inputs: T-061
  - Outputs: Generate → timeline → render frames → mixdown → pickEncoder → Blob → `URL.createObjectURL` → Download button
  - Acceptance: end-to-end flow produces downloadable file in <15s for 2s×12fps; Download triggers with correct extension; progress 0→100%; revokeObjectURL after

## P7 — Full Controls

- [ ] **T-070 — Phrase input polish (== syntax, word-select, "/" focus, counter)**
  - Files: `src/ui/form.ts`, `src/ui/shortcuts.ts`, `index.html`
  - Inputs: `src/parser/parseInput.ts`
  - Outputs: input highlights `==word==` region, select-word wraps with `==`, "/" focuses input, "x/23" counter turns red when over, validation message
  - Acceptance: typing `==word==` shows highlighted token; selecting a word and pressing button wraps it; "/" focuses from anywhere except when typing; counter accurate

- [ ] **T-071 — Controls wiring (aspect, format, sound, advanced)**
  - Files: `src/ui/form.ts`, `src/config.ts`, `src/main.ts`, `index.html`
  - Inputs: T-062
  - Outputs: aspect 9:16/1:1/16:9 (1080×1920/1080×1080/1920×1080), format MP4/WebM, sound on/off + effect select, cuts/s 4-30, zoom 1.0-3.0, blur 0-3
  - Acceptance: changing aspect resizes preview & export dims; format pick respects fallback (WebM if MP4 unsupported); sliders clamp to ranges; values persist in timeline/encode

- [ ] **T-072 — SupportGate (no-op, disabled by default)**
  - Files: `src/gate/SupportGate.ts`, `tests/gate.test.ts`
  - Inputs: `src/types.ts`
  - Outputs: interface `SupportGate { enabled: boolean; render(container): void; on(event): void }` with `NoopGate` default; never shows without opt-in
  - Acceptance: disabled gate renders nothing, emits no network requests, no tracking; enabling via config shows placeholder without breaking layout; test verifies no-ops

## P8 — Functional Freeze (quality gate)

- [ ] **T-080 — QA pass + perf + offline check**
  - Files: (no new files; fix bugs), `SESSION_LOG.md`
  - Inputs: all P0-P7
  - Outputs: bug fixes, perf tweaks (OffscreenCanvas, downscaled preview)
  - Acceptance: `Markets jittery. ==TACO again==.` (≤23 focal chars) → video in <15s on mid-range laptop; focal word pixel-aligned; zero network requests during generation (devtools); `npm run lint` + `npm test` + `node scripts/check-lines.mjs` pass

## P9 — Styling & Responsive Design

- [ ] **T-090 — Design system (CSS variables, editorial aesthetic)**
  - Files: `styles/main.css`, `styles/variables.css`, `index.html` (link)
  - Inputs: P8 freeze
  - Outputs: CSS vars for colours, type scale, spacing; newspaper/editorial look; dark/light via `prefers-color-scheme`
  - Acceptance: visually distinct editorial style; no inline styles; vars documented; contrast ≥4.5:1

- [ ] **T-091 — Responsive layout & polished controls**
  - Files: `styles/layout.css`, `styles/components.css`, `index.html`
  - Inputs: T-090
  - Outputs: responsive grid (mobile single column, desktop side-by-side), aspect-aware preview sizing, styled buttons/sliders/progress
  - Acceptance: works at 360px, 768px, 1280px; no horizontal scroll; preview maintains aspect; accessible focus states

## P10 — Static Pages, SEO, Accessibility, Deploy

- [ ] **T-100 — Static pages (original copy)**
  - Files: `pages/how.html`, `pages/faq.html`, `pages/about.html`, `pages/privacy.html`, `pages/terms.html`
  - Inputs: T-091
  - Outputs: 5 short original pages sharing header/footer; zero tracking, no analytics, privacy states 100% client-side
  - Acceptance: all pages reachable from nav/footer; copy is original (no clone of textmatchcut.app); valid HTML

- [ ] **T-101 — SEO + a11y**
  - Files: `index.html` (meta), `pages/*.html` (meta), `styles/*.css` (a11y tweaks)
  - Inputs: T-100
  - Outputs: `<title>`, meta description, OG tags, favicon, `lang`, alt on images, ARIA on controls, keyboard nav, skip link
  - Acceptance: Lighthouse SEO ≥90, A11y ≥90; keyboard-only flow works; screen-reader labels present

- [ ] **T-102 — Deploy + final LICENSES audit**
  - Files: `vite.config.ts` (base), `docs/LICENSES.md` (final), `README.md`
  - Inputs: all prior
  - Outputs: `npm run build` → `dist/` deployable to GitHub Pages/Cloudflare Pages; README with usage + license + deploy URL
  - Acceptance: `dist/` serves from static host; deep links work; `docs/LICENSES.md` complete; `LICENSE` is MIT; no missing attributions

---

## Task Count: 27 tasks across 11 groups (P0-P10)

## Dependency Rule: never start a task if its Inputs row has any `[ ]` unchecked upstream.
