// src/encode/zipFallback.ts — Safari / no-encoder fallback: ZIP of PNG frames (MIT JSZip, dynamic import to keep main bundle small)
import { drawFrame } from '../render/drawFrame.ts';
import type { Timeline, ParsedInput, RenderDims } from '../types.ts';

export async function exportFramesAsZip(
  timeline: Timeline,
  parsed: ParsedInput,
  dims: RenderDims,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const useOffscreen = typeof OffscreenCanvas !== 'undefined';
  const canDom = typeof document !== 'undefined' && typeof document.createElement === 'function';
  if (!canDom && !useOffscreen) throw new Error('Canvas not available for ZIP fallback');

  for (let i = 0; i < timeline.length; i++) {
    const spec = timeline[i];
    const canvas: HTMLCanvasElement = canDom
      ? (() => {
          const c = document.createElement('canvas');
          c.width = dims.width;
          c.height = dims.height;
          return c;
        })()
      : (new OffscreenCanvas(dims.width, dims.height) as unknown as HTMLCanvasElement);
    // OffscreenCanvas already sized, but ensure for DOM
    if (useOffscreen && !(canvas instanceof HTMLCanvasElement)) {
      // OffscreenCanvas path — already sized via other branch? keep as is
    }
    const ctx = (canvas as unknown as HTMLCanvasElement).getContext(
      '2d',
    ) as CanvasRenderingContext2D | null;
    if (!ctx) continue;
    drawFrame(ctx, spec, parsed, dims);
    const blob: Blob | null = await new Promise((resolve) => {
      if (typeof (canvas as unknown as HTMLCanvasElement).toBlob === 'function') {
        (canvas as unknown as HTMLCanvasElement).toBlob((b) => resolve(b), 'image/png');
      } else if (typeof (canvas as unknown as OffscreenCanvas).convertToBlob === 'function') {
        (canvas as unknown as OffscreenCanvas).convertToBlob({ type: 'image/png' }).then(resolve);
      } else {
        resolve(null);
      }
    });
    if (blob) {
      const name = `frame-${String(i).padStart(3, '0')}.png`;
      zip.file(name, blob);
    }
    if (onProgress) onProgress((i + 1) / timeline.length);
  }
  // README inside zip
  zip.file(
    'README.txt',
    `MatchCutter frame export\nPhrase: ${parsed.fullPhrase}\nFrames: ${timeline.length}\nAspect: ${dims.aspect} ${dims.width}x${dims.height}\nOpen frames in sequence or import to video editor.`,
  );
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
