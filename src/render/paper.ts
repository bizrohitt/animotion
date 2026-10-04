// src/render/paper.ts — procedural paper texture (noise + tint)

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

  if (style.grain <= 0) return;

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
