import { describe, it, expect } from 'vitest';
import { buildTimeline, getTimelineDuration } from '../src/timeline/buildTimeline.ts';
import type { ParsedInput } from '../src/types.ts';

const dummyParsed: ParsedInput = {
  raw: 'hello ==world==',
  fullPhrase: 'hello world',
  focalWord: 'world',
  focalStart: 6,
  focalEnd: 11,
};

describe('buildTimeline', () => {
  it('12 cuts/s × 2s → 24 specs', () => {
    const tl = buildTimeline(dummyParsed, {
      cutsPerSec: 12,
      durationSec: 2,
      zoomMax: 1.2,
      blurMax: 0,
      seed: 123,
    });
    expect(tl.length).toBe(24);
    expect(tl[0].timestampMs).toBe(0);
    expect(tl[0].durationMs).toBeCloseTo(83, 0);
  });

  it('4-30 cuts/s range valid and clamped', () => {
    const low = buildTimeline(dummyParsed, {
      cutsPerSec: 1,
      durationSec: 1,
      zoomMax: 1,
      blurMax: 0,
      seed: 1,
    });
    expect(low.length).toBe(4); // clamped to min 4
    const high = buildTimeline(dummyParsed, {
      cutsPerSec: 100,
      durationSec: 1,
      zoomMax: 1,
      blurMax: 0,
      seed: 1,
    });
    expect(high.length).toBe(30); // clamped to max 30
  });

  it('zoom monotonic increase in tail (last 20%)', () => {
    const tl = buildTimeline(dummyParsed, {
      cutsPerSec: 10,
      durationSec: 2,
      zoomMax: 2.5,
      blurMax: 0,
      seed: 777,
    });
    const tailStart = Math.floor(tl.length * 0.8);
    for (let i = tailStart + 1; i < tl.length; i++) {
      expect(tl[i].zoom).toBeGreaterThanOrEqual(tl[i - 1].zoom);
    }
    expect(tl[tl.length - 1].zoom).toBeCloseTo(2.5, 5);
    expect(tl[tailStart].zoom).toBeCloseTo(1, 5);
    // first 80% should be 1
    for (let i = 0; i < tailStart; i++) expect(tl[i].zoom).toBe(1);
  });

  it('deterministic with same seed', () => {
    const a = buildTimeline(dummyParsed, {
      cutsPerSec: 12,
      durationSec: 1,
      zoomMax: 1.5,
      blurMax: 1,
      seed: 42,
    });
    const b = buildTimeline(dummyParsed, {
      cutsPerSec: 12,
      durationSec: 1,
      zoomMax: 1.5,
      blurMax: 1,
      seed: 42,
    });
    expect(a).toEqual(b);
  });

  it('different seeds differ', () => {
    const a = buildTimeline(dummyParsed, {
      cutsPerSec: 12,
      durationSec: 1,
      zoomMax: 1.5,
      blurMax: 0,
      seed: 1,
    });
    const b = buildTimeline(dummyParsed, {
      cutsPerSec: 12,
      durationSec: 1,
      zoomMax: 1.5,
      blurMax: 0,
      seed: 2,
    });
    expect(a).not.toEqual(b);
  });

  it('no consecutive duplicate preset', () => {
    const tl = buildTimeline(dummyParsed, {
      cutsPerSec: 12,
      durationSec: 3,
      zoomMax: 1,
      blurMax: 0,
      seed: 999,
    });
    for (let i = 1; i < tl.length; i++) {
      const prev = `${tl[i - 1].fontFamily}|${tl[i - 1].paperStyle.id}|${tl[i - 1].highlightStyle}`;
      const cur = `${tl[i].fontFamily}|${tl[i].paperStyle.id}|${tl[i].highlightStyle}`;
      expect(cur).not.toBe(prev);
    }
  });

  it('duration approximates cuts*duration', () => {
    const tl = buildTimeline(dummyParsed, {
      cutsPerSec: 12,
      durationSec: 2,
      zoomMax: 1,
      blurMax: 0,
      seed: 123,
    });
    expect(getTimelineDuration(tl)).toBeCloseTo(2, 0.05);
  });

  it('blur within 0..blurMax', () => {
    const tl = buildTimeline(dummyParsed, {
      cutsPerSec: 5,
      durationSec: 1,
      zoomMax: 1,
      blurMax: 2,
      seed: 555,
    });
    for (const f of tl) {
      expect(f.blur).toBeGreaterThanOrEqual(0);
      expect(f.blur).toBeLessThanOrEqual(2);
    }
    const tl0 = buildTimeline(dummyParsed, {
      cutsPerSec: 5,
      durationSec: 1,
      zoomMax: 1,
      blurMax: 0,
      seed: 555,
    });
    for (const f of tl0) expect(f.blur).toBe(0);
  });
});
