// src/render/zoomBlur.ts — zoom and blur utilities
import { setCtxFilter } from '../utils/cast.ts';

export function applyZoom(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  cx: number,
  cy: number,
): void {
  if (zoom === 1) return;
  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.translate(-cx, -cy);
}

export function applyBlur(ctx: CanvasRenderingContext2D, blur: number): void {
  if (blur <= 0) {
    // Reset filter if supported
    setCtxFilter(ctx, 'none');
    return;
  }
  setCtxFilter(ctx, `blur(${blur}px)`);
}

export function resetTransform(ctx: CanvasRenderingContext2D): void {
  try {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  } catch {
    // ignore
  }
  applyBlur(ctx, 0);
}
