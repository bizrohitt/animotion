# MatchCutter — Text Match Cut Video Generator

Browser-only newspaper-clipping match cut videos. Pin one focal word, jitter the rest. No server, no watermark, no tracking.

- Wrap one word with `==word==` (max 23 chars, phrase ≤120) — e.g. `Markets jittery. ==TACO again==.`
- Pick aspect (9:16 / 1:1 / 16:9), quality **720p HD 2.5 Mbps / 1080p FHD 6 Mbps / 4K UHD 16 Mbps**, format (MP4/WebM), sound (6 synthesized effects), cuts/s (4–30), zoom (1–3×), blur (0–3)
- Preview at half-res; export at full **720p/1080p/4K** (720×1280 / 1080×1920 / 2160×3840 & squares). MP4 via WebCodecs + `mp4-muxer` (MIT), WebM via MediaRecorder. Prefers MP4, falls back to WebM → PNG ZIP.
- 100% client-side: fonts OFL self-hosted (see `public/fonts/OFL.txt`), paper procedural (tiled grain, torn edge clipped), sound synthesized via Web Audio.

## Quick start

```sh
npm install
npm run dev     # http://localhost:5173
npm run build   # dist/
npm run preview # preview build
```

## Scripts

- `npm test` — Vitest (130 tests / 17 suites)
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` / `format:fix` — Prettier
- `npm run typecheck` — `tsc --noEmit`
- `node scripts/check-lines.mjs` — 600-line hard limit (58 files ≤600)

## How it works

See `pages/how.html` in the built site, or `docs/PLAN.md` for the data-flow. In short: parse → timeline (seeded PRNG, no consecutive repeat, zoom ramp last 20%) → drawFrame (anchor at cx,cy within 1px) → mixdown (OfflineAudioContext 48kHz) → encode (VideoFrame→VideoEncoder or captureStream→MediaRecorder) → download Blob.

## Pages

- `/` — creator
- `/pages/how.html` — how it works
- `/pages/faq.html` — FAQ
- `/pages/about.html` — about
- `/pages/privacy.html` — privacy (zero tracking)
- `/pages/terms.html` — terms

All share header/footer, valid HTML, original copy, no analytics.

## Deploy

`dist/` is static. Deploy to GitHub Pages, Cloudflare Pages, Netlify, or any static host:

```sh
npm run build
# then upload dist/ — or:
# GitHub Pages: Settings → Pages → Source: GitHub Actions (vite auto)
# Cloudflare Pages: Connect repo, build command `npm run build`, output `dist`
```

`vite.config.ts` uses `appType: 'mpa'` with inputs for `index.html` and `pages/*.html`. Deep links work as static files. For GitHub Pages project site set `BASE=/animotion/` or `VITE_BASE=/animotion/` at build time (default `/` for local/e2b preview; `base: process.env.BASE || process.env.VITE_BASE || '/'`). PWA `navigateFallbackDenylist: [/^\/pages\//]` keeps `/pages/*` offline via precache.

## Licenses

- Project: MIT (`LICENSE`)
- Build: Vite 8.3.2 MIT, TypeScript 5.9.2 Apache-2.0
- Lint/format/test: ESLint 10.12 MIT, Prettier 3.9.9 MIT, Vitest 5.0.3 MIT, typescript-eslint 8.71 MIT, globals 17.13 MIT
- Runtime: `mp4-muxer` 5.2.2 MIT (deprecated → `mediabunny` MPL-2.0 successor, also allowed)
- Fonts: Playfair Display, Libre Baskerville, Old Standard TT, Special Elite, IM Fell English, Courier Prime — SIL OFL 1.1 (see `public/fonts/OFL.txt`)
- No GPL, no external samples. See `docs/LICENSES.md` for the full table with URLs and verification steps.

## Accessibility & Performance

- Editorial design tokens in `styles/variables.css`, dark via `prefers-color-scheme`, contrast ≥4.5:1, reduced-motion respected.
- Responsive grid (360 / 768 / 1280), focus states, skip link, keyboard (`/` to focus input).
- Preview half-res; export full-res. `Markets jittery. ==TACO again==.` → video in <15s on mid-range laptop. Zero network requests during generate.

## SupportGate

Disabled by default (`src/gate/SupportGate.ts` NoopGate). Renders nothing, emits no requests. Enable via config to show a local placeholder.

---

Built with Vite + TS strict, Canvas2D, OffscreenCanvas, WebCodecs, OfflineAudioContext.
