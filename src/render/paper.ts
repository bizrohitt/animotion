// src/render/paper.ts — procedural paper texture (noise + tint + torn edge)

/** Torn edge: ragged inset border to mimic deckled paper. */
function drawTornEdge(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number): void {
  // gracefully skip on minimal mock ctx (tests)
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
  // top edge left→right
  for (let x = inset; x <= w - inset; x += seg) {
    const jitter = (rng.next() - 0.5) * amp * 2;
    const y = inset + jitter;
    points.push([x, Math.max(2, y)]);
  }
  // right edge top→bottom
  for (let y = inset; y <= h - inset; y += seg) {
    const jitter = (rng.next() - 0.5) * amp * 2;
    const x = w - inset + jitter;
    points.push([Math.min(w - 2, x), y]);
  }
  // bottom edge right→left
  for (let x = w - inset; x >= inset; x -= seg) {
    const jitter = (rng.next() - 0.5) * amp * 2;
    const y = h - inset + jitter;
    points.push([x, Math.min(h - 2, y)]);
  }
  // left edge bottom→top
  for (let y = h - inset; y >= inset; y -= seg) {
    const jitter = (rng.next() - 0.5) * amp * 2;
    const x = inset + jitter;
    points.push([Math.max(2, x), y]);
  }
  if (points.length < 3) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    // soft curve via quadratic
    const prev = points[i - 1];
    const cx = (prev[0] + x) / 2;
    const cy = (prev[1] + y) / 2;
    ctx.quadraticCurveTo(prev[0], prev[1], cx, cy);
  }
  ctx.closePath();
  // subtle inner shadow for depth
  ctx.strokeStyle = 'rgba(0,0,0,0.09)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // very light deckle fill to hint fray
  ctx.fillStyle = 'rgba(0,0,0,0.015)';
  ctx.fill();
  ctx.restore();
}

import type { PaperStyle } from '../types.ts';
import { createRNG } from '../layout/layoutEngine.ts';

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
 * Draw procedural paper: solid tint + seeded noise grain.
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
  // Base tint
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, w, h);

  if (style.grain <= 0) {
    // still draw torn edge on solid paper
    drawTornEdge(ctx, w, h, seed ^ hashString(style.id));
    return;
  }

  const rng = createRNG(seed ^ hashString(style.id));
  const density = style.grain; // 0-1, maps to coverage
  // Step 2px grid for perf; density controls how many dots
  const step = 2;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (rng.next() > density) continue;
      // noise: slight darken/lighten variation
      const v = rng.next() > 0.5 ? -1 : 1;
      const alpha = 0.06 + rng.next() * 0.08;
      const dr = Math.max(0, Math.min(255, r + v * 18));
      const dg = Math.max(0, Math.min(255, g + v * 18));
      const db = Math.max(0, Math.min(255, b + v * 18));
      ctx.fillStyle = `rgba(${dr},${dg},${db},${alpha.toFixed(3)})`;
      // 1x1 dot jittered
      const jx = rng.next() * 0.8;
      const jy = rng.next() * 0.8;
      ctx.fillRect(x + jx, y + jy, 1, 1);
    }
  }
  // deckled torn edge outward
  drawTornEdge(ctx, w, h, seed ^ hashString(style.id) ^ 0x517cc1b7);
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
