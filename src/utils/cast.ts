// src/utils/cast.ts — typed helpers to reduce `as unknown` casts (Mi13 audit)
// Canvas/WebCodecs types are underspecified in lib.dom for OffscreenCanvas & VideoFrame sources.
// Centralize the few unsafe casts so the rest of the codebase stays `strict` and grep-able.

export function asCanvasSource(
  c: HTMLCanvasElement | OffscreenCanvas,
): CanvasImageSource {
  return c as unknown as CanvasImageSource;
}

export function asCanvasElement(c: OffscreenCanvas): HTMLCanvasElement {
  return c as unknown as HTMLCanvasElement;
}

export function get2DContext(
  c: HTMLCanvasElement | OffscreenCanvas,
): CanvasRenderingContext2D | null {
  return (c as unknown as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D | null;
}

export function setCtxFilter(ctx: CanvasRenderingContext2D, value: string): void {
  try {
    (ctx as unknown as { filter: string }).filter = value;
  } catch {
    // filter unsupported (e.g., mock ctx in tests)
  }
}

export function getCaptureStream(
  c: HTMLCanvasElement,
  fps: number,
): MediaStream {
  return (c as unknown as { captureStream: (fps: number) => MediaStream }).captureStream(fps);
}

export function asOffscreenCanvasSize(c: OffscreenCanvas | HTMLCanvasElement): { width: number; height: number } {
  return { width: (c as unknown as { width: number }).width, height: (c as unknown as { height: number }).height };
}
