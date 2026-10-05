# Licenses — MatchCutter

> Every dependency, font, and asset must be listed here with name, version, license, and URL.
> Only permissive licenses are allowed: MIT, Apache-2.0, BSD, ISC, SIL OFL, CC0, Unlicense, MPL-2.0 (unmodified).
> No GPL/AGPL/LGPL. Verify each license before `npm install`.

## Project License

| Name                       | Version | License | URL       |
| -------------------------- | ------- | ------- | --------- |
| MatchCutter (this project) | —       | MIT     | ./LICENSE |

## Build & Language

| Name       | Version | License    | URL                                     | Notes         |
| ---------- | ------- | ---------- | --------------------------------------- | ------------- |
| Vite       | 8.3.2   | MIT        | https://github.com/vitejs/vite          | Build tool    |
| TypeScript | 5.9.2   | Apache-2.0 | https://github.com/microsoft/TypeScript | `strict:true` |

## Dev Dependencies (lint / format / test)

| Name                             | Version | License | URL                                                    |
| -------------------------------- | ------- | ------- | ------------------------------------------------------ |
| Vitest                           | 5.0.3   | MIT     | https://github.com/vitest-dev/vitest                   |
| ESLint                           | 10.12.0 | MIT     | https://github.com/eslint/eslint                       |
| @eslint/js                       | 10.0.1  | MIT     | https://github.com/eslint/eslint                       |
| typescript-eslint                | 8.71.0  | MIT     | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/parser        | 8.71.0  | MIT     | https://github.com/typescript-eslint/typescript-eslint |
| @typescript-eslint/eslint-plugin | 8.71.0  | MIT     | https://github.com/typescript-eslint/typescript-eslint |
| eslint-config-prettier           | 10.1.8  | MIT     | https://github.com/prettier/eslint-config-prettier     |
| Prettier                         | 3.9.9   | MIT     | https://github.com/prettier/prettier                   |
| globals                          | 17.13.0 | MIT     | https://github.com/sindresorhus/globals                |

## Runtime Encoding & Export

| Name              | Version | License                                | URL                                         | Notes                                                                                                                                                                                      |
| ----------------- | ------- | -------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mp4-muxer`       | 5.2.2   | MIT                                    | https://github.com/Vanilagy/mp4-muxer       | Verified MIT 2026-10-04 (`npm view mp4-muxer license` → MIT). Deprecated, superseded by `mediabunny` (MPL-2.0, allowed). Chose mp4-muxer for MIT simplicity. Do NOT use ffmpeg.wasm (GPL). |
| `jszip`           | 3.10.2  | (MIT OR GPL-3.0-or-later) — MIT chosen | https://github.com/Stuk/jszip               | ZIP fallback for Safari/no-encoder — dynamic import, only loaded when both MP4/WebM fail. Dual license, we use MIT.                                                                        |
| `vite-plugin-pwa` | 2.0.0   | MIT                                    | https://github.com/vite-pwa/vite-plugin-pwa | PWA offline (Workbox) — precache 12 entries, `autoUpdate`, no analytics.                                                                                                                   |

## Fonts (self-hosted, OFL only)

| Font              | License     | Source                                              | File                                    | Status  |
| ----------------- | ----------- | --------------------------------------------------- | --------------------------------------- | ------- |
| Playfair Display  | SIL OFL 1.1 | https://fonts.google.com/specimen/Playfair+Display  | `public/fonts/PlayfairDisplay-400.woff2`, `-700.woff2` (22/23 KB) | **Shipped 2026-10-05** via `@fontsource/playfair-display` 5.3.0 (OFL) |
| Libre Baskerville | SIL OFL 1.1 | https://fonts.google.com/specimen/Libre+Baskerville | `public/fonts/LibreBaskerville-400.woff2`, `-700.woff2` (20 KB each) | **Shipped 2026-10-05** via `@fontsource/libre-baskerville` 5.3.0 |
| Old Standard TT   | SIL OFL 1.1 | https://fonts.google.com/specimen/Old+Standard+TT   | `public/fonts/OldStandardTT-400.woff2`, `-700.woff2` (24 KB each) | **Shipped 2026-10-05** via `@fontsource/old-standard-tt` 5.3.0 |
| Special Elite     | SIL OFL 1.1 | https://fonts.google.com/specimen/Special+Elite     | `public/fonts/SpecialElite-400.woff2` (53 KB) | **Shipped 2026-10-05** via `@fontsource/special-elite` 5.3.0 |
| IM Fell English   | SIL OFL 1.1 | https://fonts.google.com/specimen/IM+Fell+English   | `public/fonts/IMFellEnglish-400.woff2` (59 KB) | **Shipped 2026-10-05** via `@fontsource/im-fell-english` 5.3.0 |
| Courier Prime     | SIL OFL 1.1 | https://fonts.google.com/specimen/Courier+Prime     | `public/fonts/CourierPrime-400.woff2`, `-700.woff2` (19 KB each) | **Shipped 2026-10-05** via `@fontsource/courier-prime` 5.3.0 |

> Keep OFL license text in `public/fonts/OFL.txt` and retain attribution per font.

## Audio & Textures

| Asset                                     | License       | Notes                             |
| ----------------------------------------- | ------------- | --------------------------------- |
| Synthesized sound effects (Web Audio API) | MIT (project) | Generated at runtime, no samples  |
| Paper textures (canvas noise + tint)      | MIT (project) | Procedurally generated, no images |

## Verification Checklist

- [x] Installed deps verified — all MIT or Apache-2.0 (no GPL/LGPL/AGPL)
- [x] `mp4-muxer` 5.2.2 MIT verified 2026-10-04 (`npm view mp4-muxer license` → MIT, deprecated → mediabunny MPL-2.0 is successor, also allowed)
- [x] `jszip` 3.10.2 (MIT OR GPL-3.0) MIT chosen verified 2026-10-04 (`npm view jszip license` → MIT/GPL)
- [x] `vite-plugin-pwa` 2.0.0 MIT verified 2026-10-04 (`npm view vite-plugin-pwa license` → MIT)
- [x] Font OFL texts copied to `public/fonts/OFL.txt` and attributed — 6 families woff2 shipped 2026-10-05, `@font-face` in `styles/variables.css`, preload in `index.html` (no Google Fonts network)
- [x] Fonts self-hosted verified 2026-10-05 — `ls public/fonts/*.woff2` 10 files 300 KB, `curl -I /fonts/` no googleapis, `document.fonts.check` passes offline
- [x] No GPL/AGPL/LGPL dependency present (`npm ls` verified 2026-10-04 — jszip dual used as MIT)
- [x] All versions pinned and table updated (Vite 8.3.2, TS 5.9.2, ESLint 10.12.0, Prettier 3.9.9, Vitest 5.0.3, mp4-muxer 5.2.2, vite-plugin-pwa 2.0.0, jszip 3.10.2)

## How to Verify

```sh
npm view <pkg> license   # or check node_modules/<pkg>/package.json
npm ls --depth=0
node scripts/check-lines.mjs
npm run lint && npm run typecheck && npm test
```
