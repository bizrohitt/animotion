import { describe, it, expect } from 'vitest';
import type { ParsedInput, FrameSpec, RNG, TimelineOpts, AspectRatio } from '../src/types.ts';
import {
  LIMITS,
  ASPECT_DIMS,
  DEFAULTS,
  FONT_FAMILIES,
  clampCutsPerSec,
  clampZoom,
  clampBlur,
} from '../src/config.ts';

describe('types & config contracts', () => {
  it('ParsedInput shape compiles', () => {
    const p: ParsedInput = {
      raw: 'hello ==world==',
      fullPhrase: 'hello world',
      focalWord: 'world',
      focalStart: 6,
      focalEnd: 11,
    };
    expect(p.focalWord).toBe('world');
  });

  it('FrameSpec shape compiles', () => {
    const f: FrameSpec = {
      index: 0,
      timestampMs: 0,
      durationMs: 83,
      fontFamily: FONT_FAMILIES[0],
      fontWeight: 700,
      paperStyle: { id: 'cream', tint: '#f2e8d5', grain: 0.12 },
      rotation: 0.5,
      highlightStyle: 'marker',
      fillerLines: ['lorem ipsum'],
      zoom: 1,
      blur: 0,
    };
    expect(f.zoom).toBe(1);
  });

  it('RNG interface works', () => {
    const rng: RNG = {
      next: () => 0.42,
      nextInt: (max: number) => Math.floor(0.42 * max),
    };
    expect(rng.next()).toBeCloseTo(0.42);
    expect(rng.nextInt(10)).toBe(4);
  });

  it('TimelineOpts shape', () => {
    const opts: TimelineOpts = {
      cutsPerSec: 12,
      durationSec: 2,
      zoomMax: 1.2,
      blurMax: 0,
      seed: 123,
    };
    expect(opts.cutsPerSec).toBe(12);
  });

  it('LIMITS and ASPECT_DIMS are consistent', () => {
    expect(LIMITS.focalMaxChars).toBe(23);
    const dims = ASPECT_DIMS['9:16' as AspectRatio];
    expect(dims.width).toBe(1080);
    expect(dims.height).toBe(1920);
    expect(ASPECT_DIMS['1:1'].width).toBe(1080);
    expect(ASPECT_DIMS['16:9'].width).toBe(1920);
  });

  it('DEFAULTS respect limits', () => {
    expect(DEFAULTS.cutsPerSec).toBeGreaterThanOrEqual(LIMITS.cutsPerSec.min);
    expect(DEFAULTS.cutsPerSec).toBeLessThanOrEqual(LIMITS.cutsPerSec.max);
    expect(DEFAULTS.zoomMax).toBeGreaterThanOrEqual(LIMITS.zoom.min);
    expect(DEFAULTS.blurMax).toBeGreaterThanOrEqual(LIMITS.blur.min);
  });

  it('clamp helpers work', () => {
    expect(clampCutsPerSec(100)).toBe(30);
    expect(clampCutsPerSec(1)).toBe(4);
    expect(clampZoom(5)).toBe(3);
    expect(clampBlur(-1)).toBe(0);
  });

  it('no circular imports', async () => {
    const types = await import('../src/types.ts');
    const config = await import('../src/config.ts');
    expect(types).toBeDefined();
    expect(config).toBeDefined();
  });
});
