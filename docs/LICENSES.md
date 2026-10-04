# Licenses — MatchCutter

> Every dependency, font, and asset must be listed here with name, version, license, and URL.
> Only permissive licenses are allowed: MIT, Apache-2.0, BSD, ISC, SIL OFL, CC0, Unlicense, MPL-2.0 (unmodified).
> No GPL/AGPL/LGPL. Verify each license before `npm install`.

## Project License
| Name | Version | License | URL |
|------|---------|---------|-----|
| MatchCutter (this project) | — | MIT | ./LICENSE |

## Runtime Dependencies (to be verified before install)
| Name | Version | License | URL | Notes |
|------|---------|---------|-----|-------|
| `mp4-muxer` (or successor `mediabunny`) | TBD (pin exact) | MIT (verify) | https://github.com/Vanilagy/mp4-muxer | Verify license is MIT at install time; fallback is `mediabunny` (MIT) if needed |
| Vite | TBD | MIT | https://github.com/vitejs/vite | Build tool |
| TypeScript | TBD | Apache-2.0 | https://github.com/microsoft/TypeScript | Strict mode |

## Dev Dependencies (to be verified)
| Name | Version | License | URL |
|------|---------|---------|-----|
| Vitest | TBD | MIT | https://github.com/vitest-dev/vitest |
| ESLint | TBD | MIT | https://github.com/eslint/eslint |
| Prettier | TBD | MIT | https://github.com/prettier/prettier |
| @typescript-eslint/* | TBD | MIT | https://github.com/typescript-eslint/typescript-eslint |

## Fonts (self-hosted, OFL only)
| Font | License | Source | File |
|------|---------|--------|------|
| Playfair Display | SIL OFL 1.1 | https://fonts.google.com/specimen/Playfair+Display | `public/fonts/PlayfairDisplay-*.woff2` |
| Libre Baskerville | SIL OFL 1.1 | https://fonts.google.com/specimen/Libre+Baskerville | `public/fonts/LibreBaskerville-*.woff2` |
| Old Standard TT | SIL OFL 1.1 | https://fonts.google.com/specimen/Old+Standard+TT | `public/fonts/OldStandardTT-*.woff2` |
| Special Elite | SIL OFL 1.1 | https://fonts.google.com/specimen/Special+Elite | `public/fonts/SpecialElite-*.woff2` |
| IM Fell English | SIL OFL 1.1 | https://fonts.google.com/specimen/IM+Fell+English | `public/fonts/IMFellEnglish-*.woff2` |
| Courier Prime | SIL OFL 1.1 | https://fonts.google.com/specimen/Courier+Prime | `public/fonts/CourierPrime-*.woff2` |

> Keep OFL license text in `public/fonts/OFL.txt` and retain attribution.

## Audio & Textures
| Asset | License | Notes |
|-------|---------|-------|
| Synthesized sound effects (Web Audio API) | MIT (project) | Generated at runtime, no samples |
| Paper textures (canvas noise + tint) | MIT (project) | Procedurally generated, no images |

## Verification Checklist
- [ ] `mp4-muxer` license checked at T-061 (must be MIT)
- [ ] Font OFL texts copied to `public/fonts/`
- [ ] No GPL/AGPL/LGPL dependency present (`npm ls` + manual check)
- [ ] All versions pinned and table updated after each `npm install`
