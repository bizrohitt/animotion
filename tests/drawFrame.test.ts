import { describe, it, expect } from 'vitest';
import { drawFrame } from '../src/render/drawFrame.ts';
import type { FrameSpec, ParsedInput, RenderDims } from '../src/types.ts';
import { PAPER_STYLES } from '../src/layout/layoutPresets.ts';

function mockCtx(
  charW = 10,
): CanvasRenderingContext2D & {
  calls: unknown[];
  lastFillText?: { text: string; x: number; y: number };
} {
  const calls: unknown[] = [];
  let currentFont = '';
  const ctx = {
    calls,
    font: '',
    fillStyle: '',
    textBaseline: 'middle' as CanvasTextBaseline,
    textAlign: 'left' as CanvasTextAlign,
    save() {
      calls.push('save');
    },
    restore() {
      calls.push('restore');
    },
    clearRect() {
      calls.push('clearRect');
    },
    fillRect() {
      calls.push('fillRect');
    },
    strokeRect() {
      calls.push('strokeRect');
    },
    rect() {
      calls.push('rect');
    },
    roundRect() {
      calls.push('roundRect');
    },
    beginPath() {
      calls.push('beginPath');
    },
    moveTo() {
      calls.push('moveTo');
    },
    quadraticCurveTo() {
      calls.push('qc');
    },
    stroke() {
      calls.push('stroke');
    },
    fill() {
      calls.push('fill');
    },
    translate() {
      calls.push('translate');
    },
    rotate() {
      calls.push('rotate');
    },
    scale() {
      calls.push('scale');
    },
    setTransform() {
      calls.push('setTransform');
    },
    fillText(text: string, x: number, y: number) {
      calls.push({ type: 'fillText', text, x, y });
      (ctx as unknown as { lastFillText: unknown }).lastFillText = { text, x, y };
    },
    measureText(text: string) {
      return { width: text.length * charW } as TextMetrics;
    },
    get filter() {
      return 'none';
    },
    set filter(v: string) {
      calls.push(`filter=${v}`);
    },
  } as unknown as CanvasRenderingContext2D & {
    calls: unknown[];
    lastFillText?: { text: string; x: number; y: number };
  };
  // proxy font getter/setter to track
  Object.defineProperty(ctx, 'font', {
    get() {
      return currentFont;
    },
    set(v: string) {
      currentFont = v;
      calls.push(`font=${v}`);
    },
  });
  return ctx;
}

describe('drawFrame anchor', () => {
  const dimsList: RenderDims[] = [
    { width: 1080, height: 1920, aspect: '9:16' },
    { width: 1080, height: 1080, aspect: '1:1' },
    { width: 1920, height: 1080, aspect: '16:9' },
  ];

  const presets = [
    {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      paperStyle: PAPER_STYLES.cream,
      rotation: 0,
      highlightStyle: 'marker' as const,
    },
    {
      fontFamily: '"Courier Prime", monospace',
      fontWeight: 400,
      paperStyle: PAPER_STYLES.newsprint,
      rotation: 1.2,
      highlightStyle: 'box' as const,
    },
    {
      fontFamily: '"Special Elite", cursive',
      fontWeight: 400,
      paperStyle: PAPER_STYLES.bright,
      rotation: -0.8,
      highlightStyle: 'underline' as const,
    },
  ];

  for (const dims of dimsList) {
    for (const preset of presets) {
      it(`pins focal at centre for ${dims.aspect} with ${preset.fontFamily.slice(0, 12)}`, () => {
        const ctx = mockCtx(10);
        const parsed: ParsedInput = {
          raw: 'hello ==world==',
          fullPhrase: 'hello world',
          focalWord: 'world',
          focalStart: 6,
          focalEnd: 11,
        };
        const spec: FrameSpec = {
          index: 0,
          timestampMs: 0,
          durationMs: 83,
          fontFamily: preset.fontFamily,
          fontWeight: preset.fontWeight,
          paperStyle: preset.paperStyle,
          rotation: preset.rotation,
          highlightStyle: preset.highlightStyle,
          fillerLines: [],
          zoom: 1,
          blur: 0,
        };
        drawFrame(ctx, spec, parsed, dims);
        // find main phrase fillText (should be last fillText with fullPhrase)
        const fillCalls = (ctx.calls as unknown[]).filter(
          (c) => typeof c === 'object' && c !== null && (c as { type: string }).type === 'fillText',
        ) as Array<{ text: string; x: number; y: number }>;
        const main = fillCalls.find((c) => c.text === parsed.fullPhrase);
        expect(main, 'main phrase fillText found').toBeDefined();
        if (!main) return;
        const charW = 10;
        const prefixW = 'hello '.length * charW;
        const focalW = 'world'.length * charW;
        const cx = dims.width / 2;
        const focalCenter = main.x + prefixW + focalW / 2;
        expect(Math.abs(focalCenter - cx)).toBeLessThan(1.0);
      });
    }
  }

  it('draws filler lines when provided', () => {
    const ctx = mockCtx(10);
    const dims: RenderDims = { width: 540, height: 960, aspect: '9:16' };
    const parsed: ParsedInput = {
      raw: 'A ==B== C',
      fullPhrase: 'A B C',
      focalWord: 'B',
      focalStart: 2,
      focalEnd: 3,
    };
    const spec: FrameSpec = {
      index: 1,
      timestampMs: 0,
      durationMs: 83,
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      paperStyle: PAPER_STYLES.cream,
      rotation: 0,
      highlightStyle: 'marker',
      fillerLines: ['F1', 'F2', 'F3', 'F4'],
      zoom: 1,
      blur: 0,
    };
    drawFrame(ctx, spec, parsed, dims);
    const fillCalls = (ctx.calls as unknown[]).filter(
      (c) => typeof c === 'object' && (c as { type: string }).type === 'fillText',
    ) as Array<{ text: string; x: number }>;
    // should have at least main + 4 filler (maybe)
    expect(fillCalls.length).toBeGreaterThanOrEqual(5);
  });
});
