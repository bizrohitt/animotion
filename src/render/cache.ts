// src/render/cache.ts — pre-render preview frames to canvases (OffscreenCanvas if available)
import type { FrameSpec, ParsedInput, RenderDims } from '../types.ts';
import { drawFrame } from './drawFrame.ts';

export type FrameCache = HTMLCanvasElement[]; // each entry sized to dims

export function createFrameCache(
  timeline: FrameSpec[],
  parsed: ParsedInput,
  dims: RenderDims,
): FrameCache {
  const cache: HTMLCanvasElement[] = [];
  const canOffscreen = typeof OffscreenCanvas !== 'undefined';
  const canDom = typeof document !== 'undefined' && typeof document.createElement === 'function';
  if (!canOffscreen && !canDom) return cache;
  for (const spec of timeline) {
    const canvas: HTMLCanvasElement = canOffscreen
      ? (new OffscreenCanvas(dims.width, dims.height) as unknown as HTMLCanvasElement)
      : (() => {
          const c = document.createElement('canvas');
          c.width = dims.width;
          c.height = dims.height;
          return c;
        })();
    const ctx = (canvas as unknown as HTMLCanvasElement).getContext(
      '2d',
    ) as CanvasRenderingContext2D | null;
    if (!ctx) continue;
    drawFrame(ctx, spec, parsed, dims);
    cache.push(canvas as unknown as HTMLCanvasElement);
  }
  return cache;
}

export function drawCachedFrame(
  ctx: CanvasRenderingContext2D,
  cache: FrameCache,
  index: number,
  targetW: number,
  targetH: number,
): void {
  const src = cache[index % cache.length];
  if (!src) return;
  ctx.clearRect(0, 0, targetW, targetH);
  ctx.drawImage(src as unknown as CanvasImageSource, 0, 0, targetW, targetH);
}
