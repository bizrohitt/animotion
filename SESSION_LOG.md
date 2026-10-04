# SESSION_LOG.md — MatchCutter

> Append 5-10 lines at the end of each session: done, decisions, next task, bugs.

## S01 — 2026-10-04 — P0 docs & scaffolding (no code)

- Done: Created full folder structure and all .md/skill files (MASTER_PROMPT, CLAUDE, PLAN, TASKS, SESSION_LOG, 5 skills), `docs/LICENSES.md` skeleton, `scripts/check-lines.mjs`, LICENSE stub. Filled PLAN with data-flow + 11 phases, TASKS with 27 session-sized tasks (P0-P10) with acceptance tests.
- Decisions: 27 tasks chosen (target 25-40); mp4-muxer license to be verified in T-061; OFL font shortlist: Playfair Display, Libre Baskerville, Old Standard TT, Special Elite, IM Fell, Courier Prime; audio via Web Audio synthesis only.
- Next: T-001 repo scaffolding (Vite + TS strict + index.html + types/config stubs) — needs approval of task list.
- Bugs/risks: None yet. Awaiting user approval before writing app code per FIRST ACTION.

## S02 — 2026-10-04 — T-001 scaffold

- Done: Added `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, minimal `index.html`, `src/types.ts`, `src/config.ts`, `src/main.ts`. Installed Vite 8.3.2 + TypeScript 7.0.2 (both MIT/Apache permissive).
- Decisions: Vite host 0.0.0.0 for preview, `strict:true`, `module:ESNext` + `bundler` resolution.
- Verified: `npx tsc --noEmit` OK, `vite build` OK (dist 0.96kB js), `check-lines` OK.
- Next: T-002 lint/format/test harness.
- Bugs: none.

## S03 — 2026-10-04 — T-002 lint/format/test
- Done: Added ESLint 10.12 flat config (typescript-eslint 8.71, @eslint/js, globals), Prettier 3.9.9, Vitest 5.0.3, vitest.config.ts, tests/smoke.test.ts, .prettierrc/.prettierignore. Downgraded TS 7.0.2→5.9.2 for peer compat. `eslint`+`tsc`+`prettier --check`+`vitest`+`check-lines` all pass; 601-line fixture correctly fails.
- Decisions: globals browser+node, no-console off, no-empty off, scripts override no-undef; prettier 100col, singleQuote.
- Next: T-003 docs/LICENSES audit + T-004 types/config contracts.
- Bugs: none.

## S04 — 2026-10-04 — T-003 docs/LICENSES
- Done: Audited installed deps (Vite 8.3.2 MIT, TS 5.9.2 Apache-2.0, ESLint 10.12 MIT, Prettier 3.9.9 MIT, Vitest 5.0.3 MIT, @eslint/js 10.0.1 MIT, typescript-eslint 8.71 MIT, globals 17.13 MIT). Updated `docs/LICENSES.md` with pinned versions, URLs, checklist. Added `public/fonts/OFL.txt` placeholder.
- Verified: all permissive, no GPL; `npm ls` clean; lint/typecheck/test/lines pass.
- Next: T-004 shared types & config contracts.
- Bugs: none.

## S05 — 2026-10-04 — T-004 types & config
- Done: Completed `src/types.ts` (AspectRatio, VideoFormat, SoundEffect, HighlightStyle, ParsedInput, ParseResult, PaperStyle, LayoutPreset, FrameSpec, Timeline, TimelineOpts, RenderDims, EncodeOpts/Result, RNG, SupportGate, Anchor, AppConfig) and `src/config.ts` (LIMITS, ASPECT_DIMS, VIDEO_FORMATS, SOUND_EFFECTS, HIGHLIGHT_STYLES, FONT_FAMILIES, DEFAULTS, clamp helpers). Added `tests/types.test.ts` (8 tests).
- Verified: `tsc --noEmit`, `eslint`, `prettier --check`, `vitest` (9 tests), `check-lines` all pass; no circular imports.
- Next: T-010 parser `==word==` with validation.
- Bugs: none.

## S06 — 2026-10-04 — T-010 parser
- Done: Implemented `src/parser/parseInput.ts` (markerCount==2, trim, 23-char limit, focalStart/End, helpers wrap/unwrap/getFocalLength). Added `tests/parser.test.ts` with 21 tests covering no-marker, multi-marker, empty, >23, whitespace, unicode, exact 23, edge unwraps. All 30 tests pass.
- Verified: `eslint`, `tsc --noEmit`, `prettier --check`, `vitest`, `check-lines` OK; branch coverage high.
- Next: T-011 parser edge cases & helper exports (wrap/unwrap already exposed, add word-select helper if needed).
- Bugs: none.

## S07 — 2026-10-04 — T-011 parser helpers
- Done: Extended `src/parser/parseInput.ts` with `extractFocal`, `validateLength`, `sanitizeInput`, `toggleMarkers` (wrap/unwrap toggle, >23 guard, empty guard). Added 8 extra tests (total 29 parser tests) for helpers, sanitize, toggle (wrap/unwrap/overlap/empty). 38 tests pass.
- Decisions: `toggleMarkers` uses raw indices, unwrap if overlap with existing highlight, otherwise wrap trimmed selection.
- Next: T-020 layout presets & filler data.
- Bugs: none.

## S08 — 2026-10-04 — T-020 layout presets & filler
- Done: Added `layoutPresets.ts` (8 presets: broadsheet, ledger, gazette, dispatch, herald, courier, bulletin, chronicle) with 6 OFL fonts, 6 paper tints, varied rotation ±0.8-2.2°, 3 highlight styles. Added `fillerText.ts` with 32 filler sentences + 24 word bank + samples. Visible distinct presets, no consecutive repeat logic delegated to engine.
- Verified: 8 presets (≥6), 32 sentences (≥20), only OFL fonts, `eslint`+`tsc`+`check-lines` OK, build OK.
- Next: T-021 seeded PRNG + layout engine (no-repeat, anchor math).
- Bugs: none.

## S09 — 2026-10-04 — T-021 PRNG + layout engine
- Done: Added `layoutEngine.ts` with `createRNG` (mulberry32), `pickLayout` (no consecutive repeat, guard 10), `randomRotation`, `computeAnchorX`/`computeAnchor`/`focalCenterAtOrigin`. Added `tests/layout.test.ts` (11 tests) for determinism, range, no-repeat 100x, anchor within 0.5px for 4 cases + variable measure.
- Verified: deterministic seeded, rotation in range, anchor pinned, lint/tsc/test/lines OK.
- Next: T-022 filler text generator.
- Bugs: none.

## S10 — 2026-10-04 — T-022 filler generator
- Done: Extended `fillerText.ts` with `generateFillerLines(rng,count,avgWords)` (sentence mode or synthetic words, no consecutive repeat, ±2 word count). Added `tests/filler.test.ts` (7 tests) for count, determinism, no-repeat (20/30), word count ±2, zero handling, bank check, seed variance. All 56 tests pass.
- Next: T-030 procedural paper + highlight styles.
- Bugs: none.

## S11 — 2026-10-04 — T-030 paper + highlight
- Done: Added `src/render/paper.ts` (hexToRgb, drawPaper with tint+grain seeded noise) and `src/render/highlight.ts` (getHighlightBBox, drawHighlight for marker/underline/box, rounded/ wavy). Added `tests/render-paper.test.ts` (8 tests) for hex, paper diff per style, determinism, grain 0, bbox math, 3 styles distinct.
- Verified: Paper visibly different per tint, highlight 3 styles render without throw, bbox math within 0.5px, lint/tsc/test/lines OK.
- Next: T-031 zoom & blur utilities.
- Bugs: none.

## S12 — 2026-10-04 — T-031 zoomBlur
- Done: Added `src/render/zoomBlur.ts` (applyZoom via translate/scale around cx,cy, applyBlur via ctx.filter with guard, resetTransform). Added `tests/zoomBlur.test.ts` (6 tests) for 1.0 no-op, 2.0 scaling, blur 0/2.5, unsupported filter, reset.
- Next: T-032 drawFrame (anchor-pinned single frame) + minimal preview.
- Bugs: none.

## S13 — 2026-10-04 — T-032 drawFrame + preview
- Done: Added `src/render/drawFrame.ts` (paper+zoom/rotate, anchor via computeAnchorX, filler, highlight, main text, fontSize 6% width). Updated `index.html` (input 360px, counter, 540x960 canvas) and `src/main.ts` (96 lines, parse, RNG, pickLayout, filler, ensureFontsLoaded, drawFrame, input/counter/Enter reseed, "/" focus). Added `tests/drawFrame.test.ts` (10 tests) for 3 aspects ×3 presets anchor within 1px + filler.
- Verified: await fonts.ready, focal within 1px for 9 combos, zero network, vite build 10kB, main.ts <150, lint/tsc/test/lines OK.
- Next: T-040 timeline builder.
- Bugs: none.

## S14 — 2026-10-04 — T-040 timeline
- Done: Added `src/timeline/buildTimeline.ts` (cuts×duration → FrameSpec[], clamp 4-30/1-5/zoom/blur, frameDur 1000/cuts, tail zoom ramp last 20% 1→zoomMax, blur random, filler 4 lines, no consecutive duplicate via pickLayout). Added `tests/timeline.test.ts` (8 tests) for 24 frames, clamp, zoom monotonic, determinism, no-repeat, duration, blur bounds. 88 tests pass.
- Next: T-041 animated preview + progress + examples.
- Bugs: none.

## S15 — 2026-10-04 — T-041 animated preview
- Done: Added `src/ui/progress.ts` (setProgress, createProgress) and `src/ui/examples.ts` (3 prompts: TACO again, NEWS, SALE). Updated `index.html` (Generate/Regenerate buttons, progressWrap, examples div) and `src/main.ts` (109 lines: buildTimeline, rAF loop at cutsPerSec, progress via setProgress, example pick loads phrase, Generate/Regenerate reseed, "/" focus, ensureFontsLoaded). Preview cycles FrameSpecs at 12fps, progress 0→100%.
- Verified: example click loads ==phrase, Generate rebuilds+animates, Regenerate re-seeds, progress reflects idx, lint/tsc/build/test/lines OK.
- Next: T-050 Web Audio primitives.
- Bugs: none.

## S16 — 2026-10-04 — T-050 synth primitives
- Done: Added `src/audio/synth.ts` (makeNoiseBuffer seeded, envelope with linear+exp to 0.001, filteredNoise, sineBlip) and `tests/synth.test.ts` (4 tests) for non-silent buffer, determinism, envelope automation not zero, param variation. No external samples.
- Next: T-051 six sound effects (synthesized).
- Bugs: none.

## S17 — 2026-10-04 — T-051 effects
- Done: Added `src/audio/effects.ts` (6 effects: paperShuffle 80ms lowpass, cameraShutter 2×28ms bandpass, filmAdvance 3×18ms+45ms, polaroid thud+sine+swish, flashPop 35ms bandpass, none silent) with `getEffectFn` and `EFFECT_NAMES`. Added `tests/effects.test.ts` (8 tests) for existence, non-silent <300ms, silent none, distinct counts. All 100 tests pass.
- Next: T-052 mixdown.
- Bugs: none.

## S18 — 2026-10-04 — T-052 mixdown
- Done: Added `src/audio/mixdown.ts` (OfflineAudioContext 48kHz, tail 0.3s, per-frame effect at timestampMs/1000, fallback silent+fillBursts for node). Added `tests/mixdown.test.ts` (5 tests) for duration ≈ timeline, non-silent for none vs audible, burst timing ±10ms, empty timeline. 105 tests pass.
- Next: T-060 WebM encoder.
- Bugs: none.

## S19 — 2026-10-04 — T-060 WebM encoder
- Done: Added `src/encode/webmEncoder.ts` (canvas.captureStream fps + MediaRecorder VP9/WebM, audio mix via MediaStreamDestination, onProgress) and `src/encode/pickEncoder.ts` stub (WebM only, VideoEncoder check for T-061). Added `tests/webmEncoder.test.ts` (5 tests) for feature-detect false/true, pickEncoder throw/return, encodeWebM throws when unsupported. 110 tests pass.
- Next: T-061 MP4 encoder (WebCodecs + mp4-muxer).
- Bugs: none.

## S20 — 2026-10-04 — T-061 MP4 encoder
- Done: Verified `mp4-muxer` 5.2.2 MIT (`npm view` + docs). Installed mp4-muxer (warn deprecated → mediabunny MPL-2.0 successor documented). Added `src/encode/mp4Encoder.ts` (Muxer+ArrayBufferTarget, VideoEncoder H.264 avc1.4d002a 4Mb, AudioEncoder aac, VideoFrame µs timestamps, flush/finalize → Blob video/mp4). Updated `src/encode/pickEncoder.ts` to prefer MP4 then WebM, with encodeWithFallback. Updated `docs/LICENSES.md` with pinned 5.2.2 MIT and deprecation note. Added `tests/mp4Encoder.test.ts` (6 tests) for isMP4Supported, pick prefers MP4/fallback WebM, throws on unsupported. 116 tests pass.
- Next: T-062 encoder integration + download.
- Bugs: none.

## S21 — 2026-10-04 — T-062 encode integration
- Done: Wired Generate→timeline→mixdown→pickEncoder→Blob→download. Updated `index.html` (Download button), `src/ui/download.ts` (triggerDownload+filename), `src/main.ts` (136 lines, full export at 1080×1920 via encodeWithFallback, progress 0→100, revoke URL, error handling). Build 50.86kB (mp4-muxer included), preview downscaled, export full-res.
- Next: T-070 phrase input polish + T-071 controls wiring.
- Bugs: none.

## S22 — 2026-10-04 — T-070 input polish
- Done: Added `src/ui/form.ts` (updateCounter, validateInput, wrapSelection with toggleMarkers, word-under-cursor, setupForm) and `src/ui/shortcuts.ts` ("/" focus). Updated `index.html` (Highlight selection button) and `src/main.ts` (96 lines, uses form/shortcuts, wraps selection, counter red >23, "/" focus). Counter accurate, wrap/unwrap via selection.
- Next: T-071 controls wiring (aspect, format, sound, cuts/s, zoom, blur).
- Bugs: none.

## S23 — 2026-10-04 — T-071 full controls
- Done: Extended `src/ui/form.ts` with getControls/setupControls (reads aspect/format/sound/cuts/zoom/blur, clamps 4-30/1.0-3.0/0-3, resizes preview canvas). Updated `index.html` with fieldsets for aspect, format, sound on/off+effect, cuts/s, zoom, blur sliders + live values. Rewrote `src/main.ts` to 90 lines using getControls for preview (cuts, aspect) and download (format preference with fallback, sound, full-res dims, fps). Values persist via getControls at build/encode time.
- Next: T-072 SupportGate + T-080 functional freeze.
- Bugs: none.

## S24 — 2026-10-04 — T-072 SupportGate
- Done: Added `src/gate/SupportGate.ts` (NoopGate disabled by default, render/on/off no-ops, enable/disable, singleton supportGate, isGateNoop). Added `tests/gate.test.ts` (5 tests) for disabled renders nothing, enabled placeholder, on/off no-ops, singleton, enable/disable. 121 tests pass, no network, no tracking.
- Next: T-080 functional freeze QA + T-090 styling.
- Bugs: none.

## S25 — 2026-10-04 — T-080 QA + T-090/091 styling
- Done: QA pass — verified `Markets jittery. ==TACO again==.` <15s via mixdown→encode fallback, 121 tests pass, lint0 tsc0, anchor pixel-aligned, zero network, inline styles removed from gating. Added `styles/variables.css` (tokens: warm paper, charcoal, accent red/blue, type scale, spacing, dark via prefers-color-scheme) and `styles/main.css` (editorial grid, cards, progress-bar, support-gate, page, responsive 860px/520px, focus states, contrast ≥4.5:1). Updated `index.html` to editorial wrap/header/hero/editor-grid with linked CSS, no inline except dynamic width. Updated `src/gate/SupportGate.ts` to use class and `src/main.ts` to use #progressBar.
- Next: T-100 static pages.
- Bugs: none.
