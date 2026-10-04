import { describe, it, expect } from 'vitest';
import { generateFillerLines, FILLER_SENTENCES } from '../src/layout/fillerText.ts';
import { createRNG } from '../src/layout/layoutEngine.ts';

describe('generateFillerLines', () => {
  it('returns count lines, non-empty', () => {
    const rng = createRNG(1);
    const lines = generateFillerLines(rng, 5);
    expect(lines.length).toBe(5);
    for (const l of lines) expect(l.length).toBeGreaterThan(0);
  });

  it('deterministic with same seed', () => {
    const a = createRNG(42);
    const b = createRNG(42);
    expect(generateFillerLines(a, 5)).toEqual(generateFillerLines(b, 5));
    // with avgWords
    const c = createRNG(99);
    const d = createRNG(99);
    expect(generateFillerLines(c, 4, 8)).toEqual(generateFillerLines(d, 4, 8));
  });

  it('no repeated line twice in a frame (consecutive)', () => {
    const rng = createRNG(123);
    const lines = generateFillerLines(rng, 20);
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i]).not.toBe(lines[i - 1]);
    }
    // also for avgWords mode
    const rng2 = createRNG(456);
    const lines2 = generateFillerLines(rng2, 30, 6);
    for (let i = 1; i < lines2.length; i++) expect(lines2[i]).not.toBe(lines2[i - 1]);
  });

  it('word count within ±2 of avgWords', () => {
    const rng = createRNG(777);
    const avg = 8;
    const lines = generateFillerLines(rng, 10, avg);
    for (const line of lines) {
      const wc = line.split(/\s+/).filter(Boolean).length;
      expect(Math.abs(wc - avg)).toBeLessThanOrEqual(2);
    }
  });

  it('zero or negative count returns empty', () => {
    const rng = createRNG(0);
    expect(generateFillerLines(rng, 0)).toEqual([]);
    expect(generateFillerLines(rng, -1)).toEqual([]);
  });

  it('sentences come from known bank when avgWords omitted', () => {
    const rng = createRNG(2024);
    const lines = generateFillerLines(rng, 10);
    for (const l of lines) expect(FILLER_SENTENCES).toContain(l);
  });

  it('different seeds produce different sequences', () => {
    const a = createRNG(1);
    const b = createRNG(2);
    const linesA = generateFillerLines(a, 5);
    const linesB = generateFillerLines(b, 5);
    // Not necessarily all different, but at least one differs
    expect(linesA).not.toEqual(linesB);
  });
});
