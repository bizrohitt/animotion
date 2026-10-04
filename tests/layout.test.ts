import { describe, it, expect } from 'vitest';
import {
  createRNG,
  pickLayout,
  computeAnchorX,
  focalCenterAtOrigin,
  randomRotation,
} from '../src/layout/layoutEngine.ts';
import { LAYOUT_PRESETS } from '../src/layout/layoutPresets.ts';

function mockMeasure(charW = 10): (s: string) => number {
  return (s: string) => s.length * charW;
}

describe('createRNG', () => {
  it('deterministic sequence', () => {
    const a = createRNG(123);
    const b = createRNG(123);
    for (let i = 0; i < 10; i++) expect(a.next()).toBe(b.next());
  });

  it('different seeds differ', () => {
    const a = createRNG(1);
    const b = createRNG(2);
    expect(a.next()).not.toBe(b.next());
  });

  it('nextInt in range', () => {
    const rng = createRNG(42);
    for (let i = 0; i < 100; i++) {
      const v = rng.nextInt(6);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(6);
    }
  });
});

describe('pickLayout', () => {
  it('never repeats consecutively (100 iterations)', () => {
    const rng = createRNG(999);
    let prev: string | null = null;
    for (let i = 0; i < 100; i++) {
      const p = pickLayout(rng, prev);
      expect(p.id).not.toBe(prev);
      prev = p.id;
    }
  });

  it('returns valid preset', () => {
    const rng = createRNG(0);
    const p = pickLayout(rng, null);
    expect(LAYOUT_PRESETS.map((x) => x.id)).toContain(p.id);
  });

  it('deterministic with same seed', () => {
    let prev: string | null = null;
    const rngA = createRNG(777);
    const rngB = createRNG(777);
    for (let i = 0; i < 10; i++) {
      const a = pickLayout(rngA, prev);
      const b = pickLayout(rngB, prev);
      expect(a.id).toBe(b.id);
      prev = a.id;
    }
  });
});

describe('randomRotation', () => {
  it('within preset range', () => {
    const rng = createRNG(123);
    for (const preset of LAYOUT_PRESETS) {
      for (let i = 0; i < 20; i++) {
        const r = randomRotation(rng, preset);
        expect(r).toBeGreaterThanOrEqual(preset.rotationDeg[0]);
        expect(r).toBeLessThanOrEqual(preset.rotationDeg[1]);
      }
    }
  });
});

describe('anchor math', () => {
  it('pins focal centre to cx within 0.5px', () => {
    const measure = mockMeasure(10);
    const cx = 540;
    const cy = 960;
    const cases: Array<[string, string, number]> = [
      ['hello world', 'world', 6],
      ['TACO is tasty', 'TACO', 0],
      ['Markets jittery. TACO again.', 'TACO again', 17],
      ['A B C', 'B', 2],
    ];
    for (const [full, focal, start] of cases) {
      const x = computeAnchorX(full, focal, start, measure, cx);
      const center = focalCenterAtOrigin(full, focal, start, measure, x);
      expect(Math.abs(center - cx)).toBeLessThan(0.5);
      // also check via computeAnchor
      expect(center).toBeCloseTo(cx, 5);
      void cy;
    }
  });

  it('handles empty prefix (focal at start)', () => {
    const measure = mockMeasure(12);
    const cx = 500;
    const x = computeAnchorX('TACO is here', 'TACO', 0, measure, cx);
    const center = focalCenterAtOrigin('TACO is here', 'TACO', 0, measure, x);
    expect(center).toBeCloseTo(cx, 5);
  });

  it('handles focal at end', () => {
    const measure = mockMeasure(8);
    const cx = 400;
    const full = 'hello world';
    const focal = 'world';
    const start = 6;
    const x = computeAnchorX(full, focal, start, measure, cx);
    const center = focalCenterAtOrigin(full, focal, start, measure, x);
    expect(center).toBeCloseTo(cx, 5);
  });

  it('different char widths still pinned (variable measure)', () => {
    // simulate proportional: W wider than i
    const widths: Record<string, number> = { W: 16, i: 4, l: 4, o: 8 };
    const measure = (s: string) => [...s].reduce((sum, ch) => sum + (widths[ch] ?? 10), 0);
    const cx = 300;
    const full = 'Willo world';
    const focal = 'world';
    const start = 6;
    const x = computeAnchorX(full, focal, start, measure, cx);
    const center = focalCenterAtOrigin(full, focal, start, measure, x);
    expect(Math.abs(center - cx)).toBeLessThan(0.5);
  });
});
