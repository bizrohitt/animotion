// src/render/paper.ts — procedural paper texture (noise + tint + torn edge)
import type { PaperStyle } from '../types.ts';
import { createRNG } from '../layout/layoutEngine.ts';

/** Build ragged inset path for deckled edge — caller must save/restore & clip/stroke. */
function buildTornPath(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
): void {
  if (
    typeof (ctx as unknown as { beginPath?: unknown }).beginPath !== 'function' ||
    typeof (ctx as unknown as { closePath?: unknown }).closePath !== 'function' ||
    typeof (ctx as unknown as { quadraticCurveTo?: unknown }).quadraticCurveTo !== 'function'
  )
    return;
  const rng = createRNG(seed ^ 0x9e3779b9);
  const inset = 8;
  const seg = 22;
  const amp = 6;
  const points: [number, number][] = [];
  for (let x = inset; x <= w - inset; x += seg) {
    const jitter = (rng.next() - 0.5) * amp * 2;
    points.push([x, Math.max(2, inset + jitter)]);
  }
  for (let y = inset; y <= h - inset; y += seg) {
    const jitter = (rng.next() - 0.5) * amp * 2;
    points.push([Math.min(w - 2, w - inset + jitter), y]);
  }
  for (let x = w - inset; x >= inset; x -= seg) {
    const jitter = (rng.next() - 0.5) * amp * 2;
    points.push([x, Math.min(h - 2, h - inset + jitter)]);
  }
  for (let y = h - inset; y >= inset; y -= seg) {
    const jitter = (rng.next() - 0.5) * amp * 2;
    points.push([Math.max(2, inset + jitter), y]);
  }
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    const prev = points[i - 1];
    const cx = (prev[0] + x) / 2;
    const cy = (prev[1] + y) / 2;
    ctx.quadraticCurveTo(prev[0], prev[1], cx, cy);
  }
  ctx.closePath();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/**
 * Draw procedural paper: solid tint + seeded grain (tiled pattern for 4K perf) clipped to torn edge.
 * No image fetches. Deterministic per style+seed.
 */
export function drawPaper(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: PaperStyle,
  seed: number,
): void {
  const { r, g, b } = hexToRgb(style.tint);

  // Clip paper to ragged shape, then fill tint + grain inside
  ctx.save();
  buildTornPath(ctx, w, h, seed ^ hashString(style.id));
  // some mock ctx in tests lack clip
  try {
    (ctx as unknown as { clip: () => void }).clip?.();
  } catch {
    // ignore
  }
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, w, h);

  if (style.grain > 0) {
    // Tiled grain: generate 256×256 tile once (~16k dots) then pattern-fill full rect
    // — ~125× faster than per-pixel fillRect at 4K (2M dots)
    const tile = 256;
    const canOffscreen = typeof OffscreenCanvas !== 'undefined';
    const canDom = typeof document !== 'undefined' && typeof document.createElement === 'function';
    let tCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
    if (canOffscreen) {
      try {
        tCanvas = new OffscreenCanvas(tile, tile) as unknown as HTMLCanvasElement;
      } catch {
        tCanvas = null;
      }
    }
    if (!tCanvas && canDom) {
      const c = document.createElement('canvas');
      c.width = tile;
      c.height = tile;
      tCanvas = c as unknown as HTMLCanvasElement;
    }
    if (tCanvas) {
      const tCtx = (tCanvas as unknown as HTMLCanvasElement).getContext(
        '2d',
      ) as CanvasRenderingContext2D | null;
      if (tCtx) {
        const rng = createRNG(seed ^ hashString(style.id) ^ 0x517cc1b7);
        const density = style.grain;
        const step = 2;
        // clear tile (transparent, paper shows through where no dot)
        tCtx.clearRect(0, 0, tile, tile);
        for (let y = 0; y < tile; y += step) {
          for (let x = 0; x < tile; x += step) {
            if (rng.next() > density) continue;
            const v = rng.next() > 0.5 ? -1 : 1;
            const alpha = 0.06 + rng.next() * 0.08;
            const dr = Math.max(0, Math.min(255, r + v * 18));
            const dg = Math.max(0, Math.min(255, g + v * 18));
            const db = Math.max(0, Math.min(255, b + v * 18));
            tCtx.fillStyle = `rgba(${dr},${dg},${db},${alpha.toFixed(3)})`;
            const jx = rng.next() * 0.8;
            const jy = rng.next() * 0.8;
            tCtx.fillRect(x + jx, y + jy, 1, 1);
          }
        }
        try {
          const pat = ctx.createPattern(
            tCanvas as unknown as CanvasImageSource,
            'repeat',
          );
          if (pat) {
            ctx.fillStyle = pat;
            ctx.fillRect(0, 0, w, h);
          }
        } catch {
          // pattern unsupported — fallback grain remains tint only (acceptable)
        }
      }
    }
  }
  ctx.restore();

  // deckle outline (subtle inner shadow + fray) — always on, even when grain 0
  ctx.save();
  buildTornPath(ctx, w, h, seed ^ hashString(style.id) ^ 0x517cc1b7);
  try {
    ctx.strokeStyle = 'rgba(0,0,0,0.09)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.015)';
    ctx.fill();
  } catch {
    // mock ctx ignore
  }
  ctx.restore();
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getPaperTints(): string[] {
  return ['#f2e8d5', '#e8e0d0', '#fffef8', '#fdf6e3', '#e9e6dd', '#ede3c8'];
}
