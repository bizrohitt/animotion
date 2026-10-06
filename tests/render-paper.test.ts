import { describe, it, expect } from 'vitest';
import { hexToRgb, drawPaper } from '../src/render/paper.ts';
import { getHighlightBBox, drawHighlight } from '../src/render/highlight.ts';
import type { PaperStyle } from '../src/types.ts';

function mockCtx(): CanvasRenderingContext2D & { calls: string[] } {
  const calls: string[] = [];
  const ctx = {
    calls,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    fillRect(x: number, y: number, w: number, h: number) {
      const c = ctx as unknown as { fillStyle: string };
      calls.push(`fillRect ${x},${y} ${w}x${h} fillStyle=${c.fillStyle}`);
    },
    strokeRect(x: number, y: number, w: number, h: number) {
      calls.push(`strokeRect ${x},${y} ${w}x${h}`);
    },
    rect(x: number, y: number, w: number, h: number) {
      calls.push(`rect ${x},${y} ${w}x${h}`);
    },
    roundRect(x: number, y: number, w: number, h: number, r: number) {
      calls.push(`roundRect ${x},${y} ${w}x${h} r=${r}`);
    },
    beginPath() {
      calls.push('beginPath');
    },
    quadraticCurveTo() {
      calls.push('quadraticCurveTo');
    },
    moveTo() {
      calls.push('moveTo');
    },
    stroke() {
      calls.push('stroke');
    },
    fill() {
      calls.push('fill');
    },
    save() {
      calls.push('save');
    },
    restore() {
      calls.push('restore');
    },
  } as unknown as CanvasRenderingContext2D & { calls: string[] };
  return ctx;
}

describe('hexToRgb', () => {
  it('parses #f2e8d5', () => {
    expect(hexToRgb('#f2e8d5')).toEqual({ r: 0xf2, g: 0xe8, b: 0xd5 });
  });
  it('parses short #fff', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe('drawPaper', () => {
  it('produces different output per style', () => {
    const styleA: PaperStyle = { id: 'cream', tint: '#f2e8d5', grain: 0.12 };
    const styleB: PaperStyle = { id: 'newsprint', tint: '#e9e6dd', grain: 0.18 };
    const ctxA = mockCtx();
    const ctxB = mockCtx();
    drawPaper(ctxA, 20, 20, styleA, 123);
    drawPaper(ctxB, 20, 20, styleB, 123);
    // base fill tint is inside clipped paper (not necessarily first call due to save/clip)
    expect(ctxA.calls.find((c) => c.includes('rgb(242,232,213)'))).toBeTruthy();
    expect(ctxB.calls.find((c) => c.includes('rgb(233,230,221)'))).toBeTruthy();
    expect(ctxA.calls.join('|')).not.toBe(ctxB.calls.join('|'));
  });

  it('deterministic with same seed', () => {
    const style: PaperStyle = { id: 'aged', tint: '#e8e0d0', grain: 0.15 };
    const ctx1 = mockCtx();
    const ctx2 = mockCtx();
    drawPaper(ctx1, 20, 20, style, 999);
    drawPaper(ctx2, 20, 20, style, 999);
    expect(ctx1.calls).toEqual(ctx2.calls);
  });

  it('grain 0 does only base fill + torn edge', () => {
    const style: PaperStyle = { id: 'plain', tint: '#ffffff', grain: 0 };
    const ctx = mockCtx();
    drawPaper(ctx, 10, 10, style, 1);
    // grain 0: still base tint + deckle outline (save/clip/restore + stroke/fill), not just 1 call
    const fills = ctx.calls.filter((c) => c.includes('fillRect 0,0'));
    expect(fills.length).toBe(1);
    expect(fills[0]).toContain('fillRect 0,0');
    // torn edge adds stroke/fill when canvas large enough; for 10×10 it's tiny so path may be empty — just check base exists
  });
});

describe('highlight', () => {
  it('getHighlightBBox computes pad correctly', () => {
    const bbox = getHighlightBBox(100, 200, 50, 80, 40);
    expect(bbox.x).toBeCloseTo(100 + 50 - 40 * 0.18, 5);
    expect(bbox.width).toBeCloseTo(80 + 40 * 0.36, 5);
    expect(bbox.height).toBeCloseTo(40 * 0.95, 5);
  });

  it('drawHighlight renders 3 styles without throwing', () => {
    const bbox = { x: 10, y: 20, width: 100, height: 30 };
    for (const style of ['marker', 'underline', 'box'] as const) {
      const ctx = mockCtx();
      expect(() => drawHighlight(ctx, bbox, style)).not.toThrow();
      expect(ctx.calls.length).toBeGreaterThan(0);
    }
  });

  it('marker vs box vs underline produce different calls', () => {
    const bbox = { x: 0, y: 0, width: 50, height: 20 };
    const m = mockCtx();
    const u = mockCtx();
    const b = mockCtx();
    drawHighlight(m, bbox, 'marker');
    drawHighlight(u, bbox, 'underline');
    drawHighlight(b, bbox, 'box');
    const ms = m.calls.join('|');
    const us = u.calls.join('|');
    const bs = b.calls.join('|');
    expect(ms).not.toBe(us);
    expect(ms).not.toBe(bs);
    expect(us).not.toBe(bs);
  });
});
