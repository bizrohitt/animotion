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
| @fontsource/playfair-display   | 5.3.0 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files/tree/main/fonts/google/playfair-display | Self-host woff2 400/700 |
| @fontsource/libre-baskerville  | 5.3.0 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400/700 |
| @fontsource/old-standard-tt    | 5.3.0 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400/700 |
| @fontsource/special-elite      | 5.3.0 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400 |
| @fontsource/im-fell-english    | 5.3.0 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400 |
| @fontsource/courier-prime      | 5.3.0 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400/700 |
| @fontsource/jetbrains-mono     | 5.3.0 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400/700 — **background filler JetBrains Mono** |
| @fontsource/anton              | 5.2.5 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400 — Anton display |
| @fontsource/bebas-neue         | 5.2.5 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400 — Bebas Neue banner |
| @fontsource/montserrat         | 5.2.5 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400/700 — Montserrat geometric |
| @fontsource/oswald             | 5.2.5 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400/700 — Oswald stark |
| @fontsource/merriweather       | 5.2.5 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400/700 — Merriweather editorial |
| @fontsource/lora               | 5.2.5 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400/700 — Lora literary |
| @fontsource/raleway            | 5.2.5 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400/700 — Raleway elegant |
| @fontsource/inter              | 5.2.5 | MIT (font OFL 1.1) | https://github.com/fontsource/font-files | Self-host woff2 400/700 — Inter swiss |

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
| JetBrains Mono    | SIL OFL 1.1 | https://fonts.google.com/specimen/JetBrains+Mono    | `public/fonts/JetBrainsMono-400.woff2`, `-700.woff2` (21/22 KB) | **Shipped 2026-10-06** via `@fontsource/jetbrains-mono` 5.3.0 — filler background |
| Anton           | SIL OFL 1.1 | https://fonts.google.com/specimen/Anton             | `public/fonts/Anton-400.woff2` (19 KB) | **Shipped 2026-10-06** via `@fontsource/anton` 5.2.5 |
| Bebas Neue      | SIL OFL 1.1 | https://fonts.google.com/specimen/Bebas+Neue        | `public/fonts/BebasNeue-400.woff2` (14 KB) | **Shipped 2026-10-06** via `@fontsource/bebas-neue` 5.2.5 |
| Montserrat      | SIL OFL 1.1 | https://fonts.google.com/specimen/Montserrat        | `public/fonts/Montserrat-400.woff2`, `-700.woff2` (19 KB each) | **Shipped 2026-10-06** via `@fontsource/montserrat` 5.2.5 |
| Oswald          | SIL OFL 1.1 | https://fonts.google.com/specimen/Oswald            | `public/fonts/Oswald-400.woff2`, `-700.woff2` (12/13 KB) | **Shipped 2026-10-06** via `@fontsource/oswald` 5.2.5 |
| Merriweather    | SIL OFL 1.1 | https://fonts.google.com/specimen/Merriweather      | `public/fonts/Merriweather-400.woff2` (49 KB), `-700.woff2` (48 KB) | **Shipped 2026-10-06** via `@fontsource/merriweather` 5.2.5 |
| Lora            | SIL OFL 1.1 | https://fonts.google.com/specimen/Lora              | `public/fonts/Lora-400.woff2`, `-700.woff2` (21 KB each) | **Shipped 2026-10-06** via `@fontsource/lora` 5.2.5 |
| Raleway         | SIL OFL 1.1 | https://fonts.google.com/specimen/Raleway           | `public/fonts/Raleway-400.woff2`, `-700.woff2` (22/23 KB) | **Shipped 2026-10-06** via `@fontsource/raleway` 5.2.5 |
| Inter           | SIL OFL 1.1 | https://fonts.google.com/specimen/Inter             | `public/fonts/Inter-400.woff2`, `-700.woff2` (24 KB each) | **Shipped 2026-10-06** via `@fontsource/inter` 5.2.5 |

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
- [x] Font OFL texts copied to `public/fonts/OFL.txt` and attributed — 15 families woff2 shipped 2026-10-06, `@font-face` in `styles/variables.css`, preload in `index.html` (no Google Fonts network) — **JetBrains Mono for filler** + 8 new (Anton, Bebas Neue, Montserrat, Oswald, Merriweather, Lora, Raleway, Inter)
- [x] Fonts self-hosted verified 2026-10-06 — `ls public/fonts/*.woff2` 26 files ~696 KB, `curl -I /fonts/` no googleapis, `document.fonts.check` passes offline
- [x] No GPL/AGPL/LGPL dependency present (`npm ls` verified 2026-10-04 — jszip dual used as MIT)
- [x] All versions pinned and table updated (Vite 8.3.2, TS 5.9.2, ESLint 10.12.0, Prettier 3.9.9, Vitest 5.0.3, mp4-muxer 5.2.2, vite-plugin-pwa 2.0.0, jszip 3.10.2)

## How to Verify

```sh
npm view <pkg> license   # or check node_modules/<pkg>/package.json
npm ls --depth=0
node scripts/check-lines.mjs
npm run lint && npm run typecheck && npm test
```
