// src/render/highlight.ts — highlight styles (marker, underline, box)

import type { HighlightStyle } from '../types.ts';

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getHighlightBBox(
  originX: number,
  baselineY: number,
  prefixWidth: number,
  focalWidth: number,
  fontSize: number,
): BBox {
  const padX = fontSize * 0.12;
  const padY = fontSize * 0.18;
  return {
    x: originX + prefixWidth - padX,
    y: baselineY - fontSize + padY * 0.5,
    width: focalWidth + padX * 2,
    height: fontSize * 0.95,
  };
}

export function drawHighlight(
  ctx: CanvasRenderingContext2D,
  bbox: BBox,
  style: HighlightStyle,
): void {
  ctx.save();
  if (style === 'marker') {
    ctx.fillStyle = 'rgba(255,235,59,0.55)';
    // slight rotation for hand-marker feel? keep axis-aligned for simplicity
    const r = 3;
    const { x, y, width, height } = bbox;
    // rounded rect
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, r);
    } else {
      ctx.rect(x, y, width, height);
    }
    ctx.fill();
  } else if (style === 'underline') {
    ctx.strokeStyle = 'rgba(220,20,60,0.92)';
    ctx.lineWidth = Math.max(2, bbox.height * 0.08);
    ctx.lineCap = 'round';
    const y = bbox.y + bbox.height - ctx.lineWidth * 0.6;
    ctx.beginPath();
    // slight wavy via quadratic
    const waves = 2;
    const seg = bbox.width / waves;
    ctx.moveTo(bbox.x, y);
    for (let i = 0; i < waves; i++) {
      const cx = bbox.x + seg * (i + 0.5);
      const cy = y + (i % 2 === 0 ? -1.5 : 1.5);
      const ex = bbox.x + seg * (i + 1);
      ctx.quadraticCurveTo(cx, cy, ex, y);
    }
    ctx.stroke();
  } else if (style === 'box') {
    ctx.strokeStyle = 'rgba(30,30,30,0.92)';
    ctx.lineWidth = Math.max(1.5, bbox.height * 0.04);
    ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
    // inner light fill for paper contrast
    ctx.fillStyle = 'rgba(255,255,255,0.0)';
    ctx.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);
  }
  ctx.restore();
}

export function getHighlightStyleColor(style: HighlightStyle): string {
  if (style === 'marker') return 'rgba(255,235,59,0.55)';
  if (style === 'underline') return 'rgba(220,20,60,0.92)';
  return 'rgba(30,30,30,0.92)';
}
