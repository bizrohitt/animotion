# PLAN.md — MatchCutter Project Flow

## Data-Flow Diagram (text)

```
input (raw string with ==word==)
  │
  ▼
parser/parseInput.ts ──► ParsedInput { focalWord, fullPhrase, focalTextLen }
  │
  ▼
timeline/buildTimeline.ts ──► FrameSpec[]  (cutsPerSec → frameCount, timing, zoom curve)
  │                              ▲ seeded PRNG, no consecutive layout repeat
  │                              │
  │         ┌────────────────────┘
  │         ▼
  │   layout/layoutEngine.ts + layoutPresets.ts + fillerText.ts
  │         │  picks font, paper, rotation, fillerLines, highlightStyle per frame
  │         ▼
  │   render/drawFrame.ts + paper.ts + highlight.ts + zoomBlur.ts
  │         │  computes anchor (cx,cy), draws to Canvas2D at export resolution
  │         ▼
  │   frames (Canvas / VideoFrame[])  ─┐
  │                                    │
  ├── audio/synth.ts + effects.ts ──► audio/mixdown.ts ──► AudioBuffer
  │         (OfflineAudioContext, one burst per cut)        │
  │                                                         ▼
  └────────────────────────────────────────────► encode/pickEncoder.ts
                                                     ├─► mp4Encoder.ts (WebCodecs + mp4-muxer)
                                                     └─► webmEncoder.ts (MediaRecorder fallback)
                                                            │
                                                            ▼
                                                     Blob (video/mp4 or video/webm) → download
                                                            │
                                                            ▼
                                                     ui/* (form, progress, preview, examples, shortcuts)
                                                     gate/SupportGate.ts (no-op, disabled by default)
```

Anchor math: focal word bbox centre pinned to (cx, cy) every frame. `ctx.measureText` gives widths; origin offset = anchor − focalWord centre.

---

## Phases (strict order)

### P0 — Setup (repo, tooling, docs)
Goal: reproducible empty project that lints, tests, and enforces line limits.
Deliverables: Vite + TS strict, ESLint+Prettier, Vitest, `scripts/check-lines.mjs`, `docs/LICENSES.md` skeleton, `LICENSE` (MIT), `public/fonts/` placeholders, all .md/skill files, `src/types.ts` + `src/config.ts` stubs.

### P1 — Parser and Types
Goal: `==word==` parsing with validation and unit tests.
Deliverables: `src/types.ts` complete, `src/parser/parseInput.ts`, `tests/parser.test.ts`. Validates: single `==word==`, trims, counts focal text ≤23 chars, rejects empty/malformed.

### P2 — Layout Engine and Filler Text
Goal: deterministic layout presets + filler generator + anchor math.
Deliverables: `src/layout/layoutPresets.ts` (fonts, paper styles, highlight styles, rotations), `src/layout/fillerText.ts` (procedural filler lines), `src/layout/layoutEngine.ts` (seeded PRNG, pick without repeat, anchor offset calc). Unit tests for anchor math & no-repeat.

### P3 — Frame Renderer (single frame + canvas preview)
Goal: draw one clipping frame correctly on Canvas2D, unstyled UI with a canvas preview.
Deliverables: `src/render/paper.ts` (procedural paper), `src/render/highlight.ts` (marker/underline/box), `src/render/zoomBlur.ts` (zoom + blur via ctx.filter/transform), `src/render/drawFrame.ts`, minimal `index.html` + `src/main.ts` wiring, preview canvas. Await `document.fonts.load()`.

### P4 — Timeline + Preview Playback
Goal: cuts-per-second → timeline of FrameSpecs, animated preview without export.
Deliverables: `src/timeline/buildTimeline.ts`, `src/ui/progress.ts`, `src/ui/examples.ts`, preview loop via `requestAnimationFrame`. Seeded PRNG; zoom ramps in last ~20% frames.

### P5 — Audio Synthesis + Mixdown
Goal: synthesize per-cut sounds and mix to an AudioBuffer.
Deliverables: `src/audio/synth.ts` (noise/filter/envelope primitives), `src/audio/effects.ts` (six presets: paper shuffle, camera shutter, film advance, polaroid, flash pop, none), `src/audio/mixdown.ts` (OfflineAudioContext, schedule bursts at cut timestamps). Tests for timing math.

### P6 — Encoding (WebM first, then MP4)
Goal: export downloadable video.
Deliverables: `src/encode/webmEncoder.ts` (MediaRecorder), `src/encode/mp4Encoder.ts` (VideoEncoder+AudioEncoder+mp4-muxer), `src/encode/pickEncoder.ts` (feature-detect, choose best). Verify `mp4-muxer` license (MIT) before adding. Fallback UI message if neither available.

### P7 — Full Controls
Goal: wire every control from the spec.
Deliverables: `src/ui/form.ts` (phrase input + `==` highlight + `/` focus + 23-char counter + word-select), `src/ui/shortcuts.ts`, aspect ratio, format, sound on/off+effect, cuts/s, zoom, blur, Generate/Download/Regenerate, `src/gate/SupportGate.ts` (disabled no-op interface), `src/config.ts` complete.

### P8 — FUNCTIONAL FREEZE
Goal: all features work, no styling yet beyond browser defaults; quality gate.
Deliverables: manual QA checklist, `npm run lint` + `npm test` + `node scripts/check-lines.mjs` pass, zero network requests during generation (devtools check), MP4 plays in VLC/Chrome, anchor pixel-aligned, render <15s.

### P9 — Styling & Responsive Design
Goal: editorial/newspaper aesthetic, dark/light, responsive.
Deliverables: `styles/*.css` with CSS variables, editorial typography, responsive 9:16/1:1/16:9 previews, polished controls, accessible colour contrast, no layout shift.

### P10 — Static Pages, SEO, Accessibility, Deploy
Goal: ship.
Deliverables: `pages/how.html`, `pages/faq.html`, `pages/about.html`, `pages/privacy.html`, `pages/terms.html` (short original copy), SEO meta/OG tags, a11y audit (keyboard, ARIA, contrast), `docs/LICENSES.md` complete, GitHub Pages / Cloudflare Pages deploy, `NOTICE` if needed.

---

## Cross-Cutting Concerns
- **Performance:** OffscreenCanvas where available; preview downscaled, export at full resolution; no real-time capture for MP4.
- **Determinism:** seeded PRNG (`src/types.ts` `RNG`); same seed → same frames; Regenerate re-seeds.
- **Fonts:** OFL self-hosted; `document.fonts.load()` + `document.fonts.ready` before any draw.
- **Licensing gate:** every dep verified before `npm install`; entry in `docs/LICENSES.md`.
- **Error handling:** feature-detect WebCodecs/MediaRecorder; clear user message on unsupported browsers.

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| `mp4-muxer` license change | Verify before install; fallback to WebM; document alternative (`mediabunny`) |
| WebCodecs not available (Safari/Firefox) | MediaRecorder→WebM fallback; feature-detect banner |
| OFL font loading delay | Preload via `<link>`, await `fonts.ready`, fallback to system serif |
| Canvas blur perf | Limit blur 0-3, use `ctx.filter`, skip on low-end via heuristic |
| Large file if 30 cuts/s × long duration | Cap duration, cap fps to cutsPerSec, validate in config |
