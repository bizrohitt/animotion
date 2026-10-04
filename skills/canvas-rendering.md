# Skill: Canvas Rendering (Frame Drawing & Anchor Math)

## Purpose

Draw every clipping frame on Canvas 2D so the focal word stays pixel-pinned to the same anchor (cx,cy) while everything else varies. Keep rendering deterministic, fast, and free of external assets.

## Rules

1. Anchor is fixed: focal word bbox centre = (cx, cy) = (canvas.width/2, canvas.height/2) every frame, at a fixed pixel height (e.g. 64–96px depending on aspect). Never move or scale the focal word between frames except via the explicit zoom curve (last ~20%).
2. Compute origin via `ctx.measureText`: measure full phrase and focal word widths, derive x so that focal centre lands on cx. Measure ascent/descent for y if needed.
3. `await document.fonts.load()` + `document.fonts.ready` before any draw that uses OFL fonts.
4. Preview is downscaled; export renders at full resolution (1080×1920 / 1080×1080 / 1920×1080). Share the same `drawFrame` function — only the canvas size differs.
5. Procedural paper only: canvas noise + colour tint. No image fetches.
6. Use `OffscreenCanvas` where available for export; fall back to regular canvas.
7. One frame → one `VideoFrame` with explicit `timestamp` (µs). Do not use `captureStream` for MP4.

## Code Patterns (short)

```ts
// anchor offset
const focalW = ctx.measureText(focalWord).width;
const fullW = ctx.measureText(fullPhrase).width;
const focalCenterX = fullW / 2; // or measure prefix+ focal offset
const x0 = cx - focalCenterX + prefixOffset;
// draw, then verify: focal bbox centre ≈ (cx,cy)
```

```ts
// paper (noise + tint)
for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) ctx.fillRect(x, y, 1, 1); // with seeded random + alpha tint
```

```ts
// zoom around anchor (apply before drawing)
ctx.translate(cx, cy);
ctx.scale(zoom, zoom);
ctx.translate(-cx, -cy);
```

## Pitfalls

- `measureText` metrics differ per font — always measure with the frame's `font` set.
- `ctx.filter = 'blur()'` unsupported on some browsers/OffscreenCanvas — guard and skip.
- Forgetting `fonts.ready` causes fallback font on first frames.
- Drawing at `devicePixelRatio` vs export resolution — use export pixels, not CSS pixels.

## Definition of Done

- `drawFrame(ctx, spec, parsed, dims)` pins focal word centre within 1px of anchor across all presets/aspects.
- Procedural paper visibly varies per style; highlight has 3 distinct styles.
- Preview downscaled, export full-res, same code path.
- Zero network requests during render.
- No file over 600 lines; render modules <300 each.
