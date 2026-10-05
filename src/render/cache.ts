// src/render/cache.ts — pre-render preview frames to canvases (OffscreenCanvas if available)
import type { FrameSpec, ParsedInput, RenderDims } from '../types.ts';
import { drawFrame } from './drawFrame.ts';
import { get2DContext, asCanvasSource } from '../utils/cast.ts';

export type FrameCache = HTMLCanvasElement[]; // each entry sized to dims

const MAX_CACHE_FRAMES = 80; // cap preview cache — M2 OOM guard (5s×30=150 would be ~300 MB)
export const MAX_CACHE_FRAMES_EXPORT = MAX_CACHE_FRAMES;

export function createFrameCache(
  timeline: FrameSpec[],
  parsed: ParsedInput,
  dims: RenderDims,
): FrameCache {
  const cache: HTMLCanvasElement[] = [];
  // Use prefix for very long timelines to avoid OOM; loop will fallback to drawFrame when cache.length !== timeline.length
  const frames =
    timeline.length > MAX_CACHE_FRAMES ? timeline.slice(0, MAX_CACHE_FRAMES) : timeline;
  const canOffscreen = typeof OffscreenCanvas !== 'undefined';
  const canDom = typeof document !== 'undefined' && typeof document.createElement === 'function';
  if (!canOffscreen && !canDom) return cache;
  for (const spec of frames) {
    const canvas: HTMLCanvasElement = canOffscreen
      ? (new OffscreenCanvas(dims.width, dims.height) as unknown as HTMLCanvasElement)
      : (() => {
          const c = document.createElement('canvas');
          c.width = dims.width;
          c.height = dims.height;
          return c;
        })();
    const ctx = get2DContext(canvas);
    if (!ctx) continue;
    drawFrame(ctx, spec, parsed, dims);
    cache.push(canvas as unknown as HTMLCanvasElement); // keep HTMLCanvasElement[] type for drawImage
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
  ctx.drawImage(asCanvasSource(src), 0, 0, targetW, targetH);
}
