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

## Runtime Encoding

| Name        | Version | License | URL                                   | Notes                                                                                                                                                                                      |
| ----------- | ------- | ------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mp4-muxer` | 5.2.2   | MIT     | https://github.com/Vanilagy/mp4-muxer | Verified MIT 2026-10-04 (`npm view mp4-muxer license` → MIT). Deprecated, superseded by `mediabunny` (MPL-2.0, allowed). Chose mp4-muxer for MIT simplicity. Do NOT use ffmpeg.wasm (GPL). |

## Fonts (self-hosted, OFL only)

| Font              | License     | Source                                              | File                                    | Status  |
| ----------------- | ----------- | --------------------------------------------------- | --------------------------------------- | ------- |
| Playfair Display  | SIL OFL 1.1 | https://fonts.google.com/specimen/Playfair+Display  | `public/fonts/PlayfairDisplay-*.woff2`  | Planned |
| Libre Baskerville | SIL OFL 1.1 | https://fonts.google.com/specimen/Libre+Baskerville | `public/fonts/LibreBaskerville-*.woff2` | Planned |
| Old Standard TT   | SIL OFL 1.1 | https://fonts.google.com/specimen/Old+Standard+TT   | `public/fonts/OldStandardTT-*.woff2`    | Planned |
| Special Elite     | SIL OFL 1.1 | https://fonts.google.com/specimen/Special+Elite     | `public/fonts/SpecialElite-*.woff2`     | Planned |
| IM Fell English   | SIL OFL 1.1 | https://fonts.google.com/specimen/IM+Fell+English   | `public/fonts/IMFellEnglish-*.woff2`    | Planned |
| Courier Prime     | SIL OFL 1.1 | https://fonts.google.com/specimen/Courier+Prime     | `public/fonts/CourierPrime-*.woff2`     | Planned |

> Keep OFL license text in `public/fonts/OFL.txt` and retain attribution per font.

## Audio & Textures

| Asset                                     | License       | Notes                             |
| ----------------------------------------- | ------------- | --------------------------------- |
| Synthesized sound effects (Web Audio API) | MIT (project) | Generated at runtime, no samples  |
| Paper textures (canvas noise + tint)      | MIT (project) | Procedurally generated, no images |

## Verification Checklist

- [x] Installed deps verified — all MIT or Apache-2.0 (no GPL/LGPL/AGPL)
- [x] `mp4-muxer` 5.2.2 MIT verified 2026-10-04 (`npm view mp4-muxer license` → MIT, deprecated → mediabunny MPL-2.0 is successor, also allowed)
- [ ] Font OFL texts copied to `public/fonts/OFL.txt` and attributed (at font install)
- [x] No GPL/AGPL/LGPL dependency present (`npm ls` verified 2026-10-04)
- [x] All versions pinned and table updated (Vite 8.3.2, TS 5.9.2, ESLint 10.12.0, Prettier 3.9.9, Vitest 5.0.3, mp4-muxer 5.2.2)

## How to Verify

```sh
npm view <pkg> license   # or check node_modules/<pkg>/package.json
npm ls --depth=0
node scripts/check-lines.mjs
npm run lint && npm run typecheck && npm test
```
