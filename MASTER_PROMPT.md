# MASTER PROMPT — MatchCutter (Source of Truth)

> This file is the source of truth for the MatchCutter project. Do not edit it
> after P0 except to fix typos. All implementation decisions must trace back here.

# ROLE

You are a senior front-end engineer. Build "MatchCutter", a free, open-source,
browser-only web app that turns a short phrase plus one highlighted word into a
"text match cut" (newspaper-clipping effect) video. Work in small sessions and
follow every rule in this prompt strictly.

# PRODUCT SPEC

## Core behaviour

1. The user types a phrase (max 23 characters of focal text) and marks one word
   to highlight, using `==word==` syntax or by selecting a word in the input.
2. The app renders a rapid sequence of "clipping" frames. In every frame the
   highlighted word stays at the SAME screen position and scale (the focal
   anchor). Everything around it changes: font family, background paper
   texture/colour, text layout, rotation, surrounding filler text, highlight
   style (marker, underline, box).
3. Frames cut at N cuts per second (default 12). The final frames zoom into
   the focal word.
4. A sound effect plays on each cut, mixed into the video.
5. Output is downloaded as MP4 (H.264 + AAC), or WebM when MP4 is unsupported.

## Controls

- Word/phrase input (focus with the "/" key, character counter "x/23")
- Aspect ratio: 9:16 (1080x1920), 1:1 (1080x1080), 16:9 (1920x1080)
- Download format: MP4 / WebM
- Sound on/off + sound effect: paper shuffle, camera shutter, film advance,
  polaroid, flash pop, none
- Advanced: cuts per second (4-30), zoom level (1.0-3.0x), blur (0-3x)
- Buttons: Generate, Download, Regenerate
- Progress indicator while rendering
- Three clickable example prompts that load into the editor

## Pages (static)

Landing/editor, How it works, FAQ, About, Privacy, Terms. Keep the content
short and original.

## Hard constraints

- 100% client-side. No backend, no uploads, no accounts, no watermark.
- NO ad network, tracking, or analytics. Instead provide an optional,
  disabled-by-default `SupportGate` module with an interface only, so a
  maintainer could plug in a donation link later.

# LEGAL AND LICENSING RULES (non-negotiable)

Use ONLY free resources whose licenses allow commercial use AND modification:
MIT, Apache-2.0, BSD, ISC, SIL OFL (fonts), CC0, Unlicense, MPL-2.0 (unmodified
use is fine).

- Do NOT use GPL/AGPL/LGPL code (this excludes most ffmpeg.wasm builds).
- Do NOT use fonts, sounds, textures, or images with unclear licenses.
- Fonts: only OFL fonts, self-hosted as files (for example Playfair Display,
  Libre Baskerville, Old Standard TT, Special Elite, IM Fell, Courier Prime).
- Sounds: SYNTHESISE them with the Web Audio API (noise bursts, filters,
  envelopes). This avoids all licensing issues. CC0 samples are allowed only
  if the source and license are recorded in `docs/LICENSES.md`.
- Paper textures: generate procedurally on canvas (noise + colour tint). Do not
  download images.
- Every dependency must be listed in `docs/LICENSES.md` with name, version,
  license, and URL. Verify each license before installing.
- The project itself is MIT-licensed (`LICENSE` file).
- Do not copy the code, text, branding, or demo videos of textmatchcut.app.
  Build an original implementation of the same idea.

# TECH STACK (all free and open source)

- Vite + TypeScript (strict), vanilla TS with small ES modules (no framework)
- Plain CSS with CSS variables (styling is the last phase)
- Rendering: Canvas 2D (OffscreenCanvas where available)
- Encoding: WebCodecs `VideoEncoder`/`AudioEncoder` + `mp4-muxer` (MIT).
  Fallback: `MediaRecorder` to WebM. Verify the current license of
  `mp4-muxer` or its successor first, and document the choice.
- Audio: Web Audio API (`OfflineAudioContext`) rendered to a buffer, then encoded
- Tests: Vitest (MIT) for pure logic only
- Lint/format: ESLint + Prettier
- Hosting: any free static host (GitHub Pages or Cloudflare Pages free tier)

# NON-NEGOTIABLE ENGINEERING RULES

## 1. Modularization

One responsibility per module. Modules talk only through typed interfaces in
`src/types.ts`. No circular imports. No module reaches into another module's
internals.

```
matchcutter/
├─ MASTER_PROMPT.md        # this prompt (source of truth)
├─ CLAUDE.md               # short rules file loaded every session (<80 lines)
├─ PLAN.md                 # project flow + phases
├─ TASKS.md                # task list with status checkboxes
├─ SESSION_LOG.md          # 5-10 lines appended at end of each session
├─ skills/
│  ├─ canvas-rendering.md  # how to draw frames, anchor math, perf rules
│  ├─ webcodecs-muxing.md  # encoding pipeline, fallbacks, pitfalls
│  ├─ webaudio-synthesis.md# recipes for each synthesized sound effect
│  ├─ typography-layouts.md# how layouts/fonts/papers are defined
│  └─ code-quality.md      # 600-line rule, naming, testing, commit style
├─ docs/LICENSES.md
├─ scripts/check-lines.mjs # fails if any source file exceeds 600 lines
├─ public/fonts/           # OFL fonts, self-hosted
├─ src/
│  ├─ main.ts              # wiring only (<150 lines)
│  ├─ types.ts             # all shared interfaces
│  ├─ config.ts            # constants, presets, limits
│  ├─ parser/parseInput.ts # `==word==` parsing + validation
│  ├─ layout/              # layoutEngine.ts, layoutPresets.ts, fillerText.ts
│  ├─ render/              # drawFrame.ts, paper.ts, highlight.ts, zoomBlur.ts
│  ├─ timeline/buildTimeline.ts  # cuts per second -> list of frame specs
│  ├─ audio/               # synth.ts, effects.ts, mixdown.ts
│  ├─ encode/              # mp4Encoder.ts, webmEncoder.ts, pickEncoder.ts
│  ├─ ui/                  # form.ts, progress.ts, examples.ts, shortcuts.ts
│  └─ gate/SupportGate.ts  # optional no-op interface
├─ tests/                  # parser, timeline, layout math
└─ index.html, pages/*.html, styles/*.css
```

## 2. Skill, .md and master prompt files (create FIRST)

Before any code, create `MASTER_PROMPT.md`, `CLAUDE.md`, `PLAN.md`, `TASKS.md`,
`SESSION_LOG.md`, and every file in `skills/`. Each skill file has: Purpose,
Rules, Code patterns (short), Pitfalls, Definition of Done. `CLAUDE.md` must
tell the assistant: "At session start read CLAUDE.md, TASKS.md, and only the
skill file(s) needed for the current task."

## 3. Keep code under 600 lines

- Hard limit: no file over 600 lines. Target: 150-300.
- `scripts/check-lines.mjs` enforces it; run it before every commit.
- If a file approaches 450 lines, split it before adding more.
- Long data (filler text, font lists) goes in separate data files.

## 4. Task splitting

Break the work into tasks small enough to finish in ONE session (about 1-3
files, one testable outcome). Each task in `TASKS.md` has: ID, goal, files
touched, inputs/outputs, acceptance test. Never start a task whose
dependencies are unchecked. Do one task per session unless tasks are trivial.

## 5. Plan the project flow

Write `PLAN.md` first, with a data-flow diagram in text:
`input -> parser -> timeline -> (layout + render per frame) -> frames

- audio mixdown -> encoder -> Blob -> download`
  Phases (do them in order):

* P0 Setup: repo, Vite, TS strict, lint, line-check script, all .md files, licenses
* P1 Parser and types (with unit tests)
* P2 Layout engine and filler text (unit-test the anchor math)
* P3 Frame renderer (static single frame, unstyled UI, a canvas preview)
* P4 Timeline + preview playback (animated preview without export)
* P5 Audio synthesis + mixdown
* P6 Encoding: WebM first (simplest), then MP4 via WebCodecs
* P7 Full controls (aspect ratio, cuts/s, zoom, blur, sound, format)
* P8 FUNCTIONAL FREEZE: all features work, tests pass, then and only then:
* P9 Styling and responsive design (editorial/newspaper aesthetic, dark/light)
* P10 Static pages, SEO meta tags, accessibility, deploy

## 6. Manage your session size

- Never paste or re-read the whole codebase. Read `CLAUDE.md`, `TASKS.md`, the
  one relevant skill file, and only the files the task touches.
- Reference modules by their interfaces in `types.ts`, not by their bodies.
- Keep answers short: output only changed files or diffs, no re-explaining.
- At about 60% of the context window, stop, write a 5-10 line entry in
  `SESSION_LOG.md` (done, decisions, next task, known bugs), and tell me to
  start a fresh session.
- Start each new session with: "Read CLAUDE.md and TASKS.md, then do the next
  unchecked task."
- Commit after each task with the message `T-<id>: <summary>`.

## 7. Functionality first, styling last

Phases P0-P8 use browser-default styling only (plain HTML controls). No CSS
work, animations, icons, or theming before the P8 functional freeze. Canvas
output (the video) is the exception: its look is part of the functionality.

## 8. Free and open source only

See "Legal and licensing rules". When unsure about a license, do not use the
resource; pick an alternative or build it in-house.

## 9. Legally modifiable

All code, fonts, and assets must permit modification and redistribution.
Keep license headers and attribution where required (OFL, MIT). Ship a
`NOTICE` or `docs/LICENSES.md` listing everything.

# RENDERING DESIGN (guidance)

- Define the anchor: focal word centred at (cx, cy) and drawn at a fixed
  pixel height. Per frame, pick a layout preset, then compute the text origin so
  the highlighted word's bounding box centre lands on the anchor. Use
  `ctx.measureText` for widths.
- Each frame spec: `{ fontFamily, paperStyle, rotation, fillerLines, highlightStyle,
zoom, blur }`. Use a seeded PRNG so "Regenerate" gives new results and tests are
  deterministic.
- Never repeat the same layout twice in a row.
- Render frames directly to canvas at the exported resolution and feed each
  one to `VideoEncoder` as a `VideoFrame` with an explicit timestamp. Do not use
  real-time capture for MP4 so the output is deterministic and fast.
- Show downscaled frames in the preview. Render at full size only on export.
- Feature-detect `VideoEncoder`, `AudioEncoder`, and `MediaRecorder`. Show a
  clear message if neither works.
- Await `document.fonts.load()` for all fonts before drawing.

# DEFINITION OF DONE (whole project)

- Typing `Markets jittery. ==TACO again==.` (focal text up to 23 chars)
  produces a downloadable video in under about 15 seconds on a mid-range laptop.
- The highlighted word is pixel-aligned across all frames.
- All controls work. MP4 plays in common players. WebM fallback works.
- Zero network requests during generation (verify in dev tools).
- `npm run lint`, `npm test`, and `node scripts/check-lines.mjs` all pass.
- `docs/LICENSES.md` is complete and every entry is permissive.

# FIRST ACTION

Do NOT write app code yet. In this first session only:

1. Create the folder structure and all .md/skill files described above.
2. Fill `PLAN.md` and `TASKS.md` with detailed, ordered, session-sized tasks
   (aim for 25-40 tasks across P0-P10, each with acceptance tests).
3. Show me the task list for approval, then stop.
