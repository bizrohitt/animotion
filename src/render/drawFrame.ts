// src/render/drawFrame.ts — anchor-pinned single frame rendering

import type { FrameSpec, ParsedInput, RenderDims } from '../types.ts';
import { drawPaper } from './paper.ts';
import { drawHighlight, getHighlightBBox } from './highlight.ts';
import { computeAnchorX } from '../layout/layoutEngine.ts';
import { applyBlur } from './zoomBlur.ts';
import { drawTemplateBackground } from './backgrounds.ts';

export function getFontSizeForDims(dims: RenderDims): number {
  // Focal word at ~6% of width, clamped — 96 for 1080p, up to 180 for 4K
  const base = Math.round(dims.width * 0.06);
  const raw = Math.max(28, Math.min(180, base));
  // letter-size multiplier (0.5-2.0) — via RenderDims.fontScale for real-time control
  const scale = dims.fontScale != null ? Math.max(0.5, Math.min(2.0, dims.fontScale)) : 1;
  return Math.max(12, Math.round(raw * scale));
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
  let fontSize = getFontSizeForDims(dims);
  const textAlign = dims.textAlign ?? 'center';
  const isBold = !!dims.bold;
  const isItalic = !!dims.italic;
  const isStrike = !!dims.strike;
  const isUnderline = !!dims.underline;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // blur (applied via filter)
  applyBlur(ctx, spec.blur);

  // paper background
  drawPaper(ctx, width, height, spec.paperStyle, spec.index * 1009);

  // zoom and rotation around center — both around cx,cy
  ctx.translate(cx, cy);
  ctx.rotate((spec.rotation * Math.PI) / 180);
  ctx.scale(spec.zoom, spec.zoom);
  ctx.translate(-cx, -cy);

  // Font with Bold/Italic overrides — keep original weight unless Bold forces 700
  const baseWeight = isBold ? 700 : spec.fontWeight;
  const stylePrefix = isItalic ? 'italic ' : '';
  let font = `${stylePrefix}${baseWeight} ${fontSize}px ${spec.fontFamily}`;
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  // ── ALWAYS FIT — no crop guarantee (zoom-aware) ─────────────────────
  // Default is center: phrase anchored so focal centre at cx stays pinned,
  // and auto-scaled to stay inside safe inset even at max zoom/rotation.
  // For left/right/justify we still guarantee total width fits with zoom.
  {
    const inset = 8;
    const padding = 14;
    const safeLeft = cx - inset - padding;
    const safeRight = width - cx - inset - padding;
    const safeTotal = width - 2 * inset - 2 * padding;
    // Measure with current Bold/Italic font so width is realistic
    ctx.font = font;
    const prefixProbe = parsed.fullPhrase.slice(0, parsed.focalStart);
    const prefixW0 = ctx.measureText(prefixProbe).width;
    const focalW0 = ctx.measureText(parsed.focalWord).width;
    const totalW0 = ctx.measureText(parsed.fullPhrase).width;

    // Rotation expands bounding box diagonally — add ~12% buffer at max 2.2deg plus zoom
    const rotAbs = Math.abs(spec.rotation);
    const rotPad = Math.sin((rotAbs * Math.PI) / 180) * fontSize * 0.6 + fontSize * 0.12;
    // zoom expands distance from center
    const z = spec.zoom || 1;
    let scale = 1;
    if (textAlign === 'center') {
      const needLeft = prefixW0 + focalW0 / 2;
      const needRight = totalW0 - needLeft;
      // effective need after zoom + rotation slop
      const effLeft = needLeft * z + rotPad;
      const effRight = needRight * z + rotPad;
      if (needLeft > 0 && effLeft > safeLeft) scale = Math.min(scale, safeLeft / effLeft);
      if (needRight > 0 && effRight > safeRight) scale = Math.min(scale, safeRight / effRight);
      // also catch total overflow (extreme zoom)
      const effTotal = totalW0 * z + 2 * rotPad;
      if (effTotal > safeTotal) scale = Math.min(scale, safeTotal / effTotal);
    } else {
      // left/right/justify: total width must fit
      const effTotal = totalW0 * z + 2 * rotPad;
      if (effTotal > safeTotal) scale = Math.min(scale, safeTotal / effTotal);
    }
    if (scale < 1) {
      // keep readable floor 12px, respect letterSize already applied
      fontSize = Math.max(12, Math.floor(fontSize * scale));
      font = `${stylePrefix}${baseWeight} ${fontSize}px ${spec.fontFamily}`;
      ctx.font = font;
    }
  }

  // ── Anchor / alignment ─────────────────────────────────────────────
  // Default 'center' = match-cut: focal centre pinned at cx (existing behavior)
  // left/right/justify honour the selector but still auto-fitted above
  let originX: number;
  const originY = cy;
  if (textAlign === 'center') {
    originX = computeAnchorX(
      parsed.fullPhrase,
      parsed.focalWord,
      parsed.focalStart,
      (s) => ctx.measureText(s).width,
      cx,
    );
    ctx.textAlign = 'left';
  } else if (textAlign === 'left') {
    const inset = 22; // 8+14
    originX = inset;
    ctx.textAlign = 'left';
  } else if (textAlign === 'right') {
    const inset = 22;
    const totalW = ctx.measureText(parsed.fullPhrase).width;
    originX = width - inset - totalW;
    // clamp to safe left if phrase longer than safe (should not happen after fit, but guard)
    if (originX < inset) originX = inset;
    ctx.textAlign = 'left';
  } else {
    // justify — single line treated as left but letter-spacing could be spread if we want
    const inset = 22;
    originX = inset;
    ctx.textAlign = 'left';
  }

  // ── Template printed background alongside highlight ──────────
  // Newspaper: masthead + columns with rules; Book: page + drop-cap;
  // Magazine: glossy image blocks; typewriter/notebook: ruled lines.
  // Rendered inside zoom+rotation so it sticks to paper, with a clear
  // center band so the focal highlight stays legible.
  drawTemplateBackground(ctx, width, height, cx, originY, fontSize, spec, dims);
  // background mutates font/align — restore for highlight/phrase
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // highlight behind focal word — recompute prefix/focal widths with current font
  // Ensure we use the same font for accurate bbox
  ctx.font = font;
  ctx.textAlign = 'left';
  // For non-center alignments, highlight still follows the phrase, not the anchor centre
  // So compute highlight offset from originX
  const prefix = parsed.fullPhrase.slice(0, parsed.focalStart);
  const prefixW = ctx.measureText(prefix).width;
  const focalW = ctx.measureText(parsed.focalWord).width;
  // getHighlightBBox expects origin at phrase start, with y as baseline top
  const bbox = getHighlightBBox(originX, originY, prefixW, focalW, fontSize);
  // getHighlightBBox assumes alphabetic baseline (y = baseline - fontSize). We use 'middle' baseline
  // where originY is center. So y = cy - fontSize*0.5 (+0.05 descender fudge for marker bleed).
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
  // justify: spread words to fill safe width — simple letter-spacing simulation
  if (textAlign === 'justify') {
    const words = parsed.fullPhrase.split(' ');
    if (words.length > 1) {
      const inset = 22;
      const safeTotal = width - 2 * inset;
      const wordsWidth = words.reduce((a, w) => a + ctx.measureText(w).width, 0);
      const gapCount = words.length - 1;
      // measure single space width with current font
      const spaceW = ctx.measureText(' ').width;
      const totalGapsW = spaceW * gapCount;
      const naturalW = wordsWidth + totalGapsW;
      const extra = safeTotal - naturalW;
      // Only stretch if phrase not already full width and extra positive
      if (extra > 0 && extra < safeTotal * 0.4) {
        const extraPerGap = extra / gapCount;
        let x = originX;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          ctx.fillText(w, x + 0.6, originY + 0.7);
          x += ctx.measureText(w).width + spaceW + extraPerGap;
        }
        // also need to draw with shadow second pass — do loop again with shadow then break to skip normal fill
        ctx.shadowColor = 'rgba(0,0,0,0.07)';
        ctx.shadowBlur = 1.5;
        x = originX;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          ctx.fillText(w, x, originY);
          x += ctx.measureText(w).width + spaceW + extraPerGap;
        }
        ctx.restore();
        // main phrase with justify already drawn via bleed passes, skip generic path — draw again crisp below with same spread
        ctx.save();
        ctx.fillStyle = '#0f0f0f';
        ctx.font = font;
        ctx.textBaseline = 'middle';
        x = originX;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          ctx.fillText(w, x, originY);
          x += ctx.measureText(w).width + spaceW + extraPerGap;
        }
        // decorations for justify path
        if (isStrike || isUnderline) {
          const totalW = safeTotal;
          const yStrike = originY;
          const yUnder = originY + fontSize * 0.42;
          ctx.save();
          ctx.strokeStyle = '#0f0f0f';
          ctx.lineWidth = Math.max(1, fontSize * 0.07);
          if (isStrike) {
            ctx.beginPath();
            ctx.moveTo(originX, yStrike);
            ctx.lineTo(originX + totalW, yStrike);
            ctx.stroke();
          }
          if (isUnderline) {
            ctx.beginPath();
            ctx.moveTo(originX, yUnder);
            ctx.lineTo(originX + totalW, yUnder);
            ctx.stroke();
          }
          ctx.restore();
        }
        ctx.restore();
        ctx.restore();
        applyBlur(ctx, 0);
        return;
      }
    }
  }
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
  ctx.textAlign = 'left';
  // For justify we handled spread above; otherwise normal
  ctx.fillText(parsed.fullPhrase, originX, originY);

  // decorations: underline / strike (bold/italic already in font)
  if (isStrike || isUnderline) {
    const totalW = ctx.measureText(parsed.fullPhrase).width;
    ctx.save();
    ctx.strokeStyle = '#0f0f0f';
    ctx.lineWidth = Math.max(1, fontSize * 0.07);
    ctx.lineCap = 'round';
    if (isStrike) {
      const y = originY;
      ctx.beginPath();
      ctx.moveTo(originX, y);
      ctx.lineTo(originX + totalW, y);
      ctx.stroke();
    }
    if (isUnderline) {
      const y = originY + fontSize * 0.42;
      ctx.beginPath();
      ctx.moveTo(originX, y);
      ctx.lineTo(originX + totalW, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
  // reset filter
  applyBlur(ctx, 0);
}
