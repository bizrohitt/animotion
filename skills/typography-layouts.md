# Skill: Typography & Layouts (Fonts, Papers, Highlight Styles)

## Purpose

Define layout presets that make each clipping frame look like a different newspaper clipping while the focal word stays anchored. Keep type and paper data separate from engine logic.

## Rules

1. Only OFL or system fallback fonts. Shortlist: Playfair Display, Libre Baskerville, Old Standard TT, Special Elite, IM Fell English, Courier Prime. Self-host under `public/fonts/` with `@font-face` and preload links. Always include a `serif`/`monospace` fallback.
2. Define presets as data, not code: `LayoutPreset { id, fontFamily, fontWeight, paperStyle:{tint, grain}, rotationDeg, highlightStyle, textAlign, fillerDensity }`. At least 6 presets, each perceptibly distinct.
3. Never repeat the same preset twice consecutively — the layout engine enforces this via seeded PRNG + `prevId` check.
4. Paper styles are procedural: solid tint + seeded canvas noise (grain). No image assets.
5. Highlight styles: `marker` (semi-transparent rectangle behind word), `underline` (thick wavy/straight line), `box` (bordered rectangle). Colours chosen per paper tint for contrast.
6. Filler text from a curated word/sentence bank (~20-40 neutral newsy sentences). Generator picks lines deterministically via PRNG; wraps via `measureText` at render time.
7. Font loading is blocking: `await document.fonts.load('16px "Playfair Display"')` for each family before first `drawFrame`.

## Code Patterns (short)

```ts
// preset data
export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'broadsheet',
    fontFamily: '"Playfair Display", serif',
    fontWeight: 700,
    paperStyle: { tint: '#f2e8d5', grain: 0.12 },
    rotationDeg: [-1.2, 1.2],
    highlightStyle: 'marker',
  },
  // ...
];
```

```ts
// filler generator
export function generateFillerLines(rng: RNG, count: number): string[] {
  return Array.from({ length: count }, () => pickSentence(rng));
}
```

```ts
// font preload (index.html)
<link rel="preload" href="/fonts/PlayfairDisplay-700.woff2" as="font" type="font/woff2" crossorigin>
<style>@font-face{font-family:"Playfair Display";src:url(/fonts/PlayfairDisplay-700.woff2) format("woff2");font-weight:700;font-display:swap}</style>
```

## Pitfalls

- OFL requires attribution in `docs/LICENSES.md` + keeping license text — do not strip.
- Forgetting preload causes FOIT/FOUT and first frames render with wrong metrics.
- Rotation applied around anchor, not canvas origin — otherwise focal word drifts.
- Highlight bbox must be computed from actual measured word width, not estimate.
- Long data arrays belong in separate data files to respect 600-line limit.

## Definition of Done

- ≥6 presets, each with distinct font/paper/highlight/rotation; documented in `layoutPresets.ts`.
- Procedural paper per style, no image fetches.
- Filler generator deterministic, wraps correctly, tested.
- Preset picker never repeats consecutively; anchor stays pinned.
- All fonts are OFL self-hosted and attributed.
