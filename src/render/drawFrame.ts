// src/render/drawFrame.ts — anchor-pinned single frame rendering

import type { FrameSpec, ParsedInput, RenderDims } from '../types.ts';
import { drawPaper } from './paper.ts';
import { drawHighlight, getHighlightBBox } from './highlight.ts';
import { computeAnchorX } from '../layout/layoutEngine.ts';
import { applyBlur } from './zoomBlur.ts';

export function getFontSizeForDims(dims: RenderDims): number {
  // Focal word at ~6% of width, clamped — 96 for 1080p, up to 180 for 4K
  const base = Math.round(dims.width * 0.06);
  // 1080p → 64, 4K 3840 → 180 (uncapped would be 230, but 180 keeps ink bleed crisp)
  return Math.max(28, Math.min(180, base));
}

export async function ensureFontsLoaded(fontFamilies: string[]): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.all(fontFamilies.map((f) => document.fonts.load(`16px ${f}`)));
    await document.fonts.ready;
  } catch {
    // ignore
  }
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  spec: FrameSpec,
  parsed: ParsedInput,
  dims: RenderDims,
): void {
  const { width, height } = dims;
  const cx = width / 2;
  const cy = height / 2;
  const fontSize = getFontSizeForDims(dims);

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // blur (applied via filter)
  applyBlur(ctx, spec.blur);

  // paper background
  drawPaper(ctx, width, height, spec.paperStyle, spec.index * 1009);

  // zoom and rotation around center
  // order: zoom -> rotation (both around cx,cy)
  ctx.translate(cx, cy);
  ctx.rotate((spec.rotation * Math.PI) / 180);
  ctx.scale(spec.zoom, spec.zoom);
  ctx.translate(-cx, -cy);
  // Note: applyZoom already does translate/scale, but we combined with rotate above.
  // To avoid double-translate, we manually did scale. If spec.zoom !==1, already handled.
  // If we want to use helper, we would do:
  // applyZoom(ctx, spec.zoom, cx, cy) before rotate.
  // But since we did manual, we should not call applyZoom again.
  // Ensure we reset filter after draw if needed in caller via restore.

  const font = `${spec.fontWeight} ${fontSize}px ${spec.fontFamily}`;
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  // Anchor: originX so focal centre at cx
  const originX = computeAnchorX(
    parsed.fullPhrase,
    parsed.focalWord,
    parsed.focalStart,
    (s) => ctx.measureText(s).width,
    cx,
  );
  const originY = cy;

  // filler lines (draw faintly above/below)
  if (spec.fillerLines.length > 0) {
    const fillerSize = Math.round(fontSize * 0.34);
    ctx.font = `${400} ${fillerSize}px ${spec.fontFamily}`;
    ctx.fillStyle = 'rgba(30,30,30,0.38)';
    const lineH = fillerSize * 1.5;
    let fy = originY - fontSize - lineH;
    // draw up to 2 lines above
    const above = spec.fillerLines.slice(0, 2);
    for (let i = above.length - 1; i >= 0; i--) {
      const txt = above[i];
      const w = ctx.measureText(txt).width;
      ctx.fillText(txt, cx - w / 2, fy);
      fy -= lineH;
    }
    let by = originY + fontSize + lineH * 0.8;
    const below = spec.fillerLines.slice(2, 4);
    for (const txt of below) {
      const w = ctx.measureText(txt).width;
      ctx.fillText(txt, cx - w / 2, by);
      by += lineH;
    }
    // restore main font
    ctx.font = font;
  }

  // highlight behind focal word
  const prefix = parsed.fullPhrase.slice(0, parsed.focalStart);
  const prefixW = ctx.measureText(prefix).width;
  const focalW = ctx.measureText(parsed.focalWord).width;
  const bbox = getHighlightBBox(originX, originY, prefixW, focalW, fontSize);
  // Mi4: getHighlightBBox assumes alphabetic baseline (y = baseline - fontSize). We use 'middle' baseline
  // where originY is center. So y = cy - fontSize*0.5 (+0.05 descender fudge for marker bleed).
  // 0.5 = half height to top, 0.05 = 5% descender pad so highlight sits slightly below center.
  const correctedBBox = {
    ...bbox,
    y: originY - fontSize * 0.5 + fontSize * 0.05,
  };
  drawHighlight(ctx, correctedBBox, spec.highlightStyle);

  // ink bleed: faint offset copy for press impression
  ctx.save();
  ctx.fillStyle = 'rgba(17,17,17,0.10)';
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillText(parsed.fullPhrase, originX + 0.6, originY + 0.7);
  // extra feather via tiny shadow
  ctx.shadowColor = 'rgba(0,0,0,0.07)';
  ctx.shadowBlur = 1.5;
  ctx.fillText(parsed.fullPhrase, originX, originY);
  ctx.restore();

  // main phrase (crisp)
  ctx.fillStyle = '#0f0f0f';
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillText(parsed.fullPhrase, originX, originY);

  ctx.restore();
  // reset filter
  applyBlur(ctx, 0);
}
