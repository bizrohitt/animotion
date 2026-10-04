import { describe, it, expect } from 'vitest';
import { applyZoom, applyBlur, resetTransform } from '../src/render/zoomBlur.ts';

function mockCtx(): {
  translate: (x: number, y: number) => void;
  scale: (x: number, y: number) => void;
  setTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  calls: string[];
  filter: string;
} {
  const calls: string[] = [];
  return {
    calls,
    filter: 'none',
    translate(x: number, y: number) {
      calls.push(`translate ${x},${y}`);
    },
    scale(x: number, y: number) {
      calls.push(`scale ${x},${y}`);
    },
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
      calls.push(`setTransform ${a},${b},${c},${d},${e},${f}`);
    },
  } as unknown as ReturnType<typeof mockCtx>;
}

describe('zoomBlur', () => {
  it('applyZoom 1.0 is no-op', () => {
    const ctx = mockCtx();
    applyZoom(ctx as unknown as CanvasRenderingContext2D, 1, 100, 100);
    expect(ctx.calls.length).toBe(0);
  });

  it('applyZoom 2.0 scales around anchor', () => {
    const ctx = mockCtx();
    applyZoom(ctx as unknown as CanvasRenderingContext2D, 2, 50, 60);
    expect(ctx.calls).toEqual(['translate 50,60', 'scale 2,2', 'translate -50,-60']);
  });

  it('applyBlur 0 resets to none', () => {
    const ctx = mockCtx();
    ctx.filter = 'blur(2px)';
    applyBlur(ctx as unknown as CanvasRenderingContext2D, 0);
    expect(ctx.filter).toBe('none');
  });

  it('applyBlur >0 sets filter', () => {
    const ctx = mockCtx();
    applyBlur(ctx as unknown as CanvasRenderingContext2D, 2.5);
    expect(ctx.filter).toBe('blur(2.5px)');
  });

  it('applyBlur unsupported does not throw', () => {
    const ctx = { filter: 'none' } as unknown as CanvasRenderingContext2D;
    // simulate object without filter setter throwing
    Object.defineProperty(ctx, 'filter', {
      set() {
        throw new Error('unsupported');
      },
      get() {
        return 'none';
      },
    });
    expect(() => applyBlur(ctx, 3)).not.toThrow();
  });

  it('resetTransform resets and clears blur', () => {
    const ctx = mockCtx();
    ctx.filter = 'blur(2px)';
    resetTransform(ctx as unknown as CanvasRenderingContext2D);
    expect(ctx.calls[0]).toContain('setTransform');
    expect(ctx.filter).toBe('none');
  });
});
