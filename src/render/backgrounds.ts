// src/render/backgrounds.ts — template-specific printed backgrounds that sit alongside the highlight
// Drawn after paper tint/grain, before highlight/phrase, inside the zoom+rotation transform.
// Fixed per template (exact same every cut) + real scanned textures (public/backgrounds/*.jpg) with procedural fallback.
// Keeps center band clear so focal stays legible.

import type { FrameSpec, RenderDims, TemplateBackground } from '../types.ts';

// Fixed headlines/body — not per-frame random, so each template always looks identical
const NEWSPAPER_HEADLINES = [
  'MARKETS RALLY AS STOCKS SURGE',
  'COUNCIL DEBATES NEW ORDINANCE',
  'WEATHER FRONT MOVES EASTWARD',
  'LOCAL TEAM CLAIMS VICTORY',
  'EDITORS NOTE: PRESS RUNS LATE',
] as const;

const NEWSPAPER_BODY_FIXED =
  'City desk reports steady trade at the exchange as printers set the morning run. Extra edition follows the late dispatch. Correspondents filed updates from the scene as the press run finished ahead of schedule. Circulation rose for the third week in a row while the front page carried the breaking story. Analysts warned of volatility ahead and officials met to discuss the proposal.';

const BOOK_BODY_FIXED =
  'It was a quiet evening and the lamps burned low over the worn pages. She turned the leaf and found a marginal note in faded ink. The chronicle spoke of harbours, trade winds, and distant bells. Ink smudged at the edge where a hand had rested too long. A folded letter slipped from between the sheets and fell to the floor. Researchers noted a pattern in the data as the edition went to press before midnight.';

const MAGAZINE_BODY_FIXED =
  'Cover story on the season selection inside. Interview with the editors on the new issue. Photo essay spans four pages of vivid detail. Culture review notes a surprising revival. The article quoted several independent sources and continued on page four. Late wires added a final correction as readers queued for the morning edition.';

// Image cache for real scanned textures (public/backgrounds/*.jpg)
// Fixed per template, loaded once, reused every frame — exact same background every cut
const _imgCache = new Map<string, HTMLImageElement>();

function getScannedImage(name: TemplateBackground): HTMLImageElement | null {
  if (name === 'auto') return null;
  if (typeof document === 'undefined' || typeof Image === 'undefined') return null;
  if (_imgCache.has(name)) return _imgCache.get(name) ?? null;
  const img = new Image();
  // public/backgrounds/*.jpg served at /backgrounds/*.jpg (Vite public dir)
  img.src = `/backgrounds/${name}.jpg`;
  img.crossOrigin = 'anonymous';
  _imgCache.set(name, img);
  return img;
}

function isImageReady(img: HTMLImageElement | null): boolean {
  return !!img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
}

function wrapWords(
  ctx: CanvasRenderingContext2D,
  words: string[],
  maxW: number,
): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const cand = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(cand).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cand;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawCenteredHeader(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  width: number,
  size: number,
  family: string,
  weight: number | string = 700,
): void {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, y);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
}

// ── Helpers for scanned image: draw image covering paper area with center band preserved ──
function drawScannedWithCenterMask(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  cy: number,
  bandTop: number,
  bandBottom: number,
): boolean {
  if (!isImageReady(img)) return false;
  const inset = 14;
  const pw = width - 2 * inset;
  const ph = height - 2 * inset;
  // Draw image to cover paper area — keep aspect, centered
  ctx.save();
  ctx.globalAlpha = 0.92;
  // Clip to paper area so zoom/rotation doesn't bleed
  // We are inside the paper's zoom/rotation already, so just draw to inset
  try {
    // Draw image stretched to paper area (slight stretch is okay for scan)
    ctx.drawImage(img, inset, inset, pw, ph);
  } catch {
    ctx.restore();
    return false;
  }
  // Re-paint center band with paper tint to guarantee highlight legibility
  // Use a soft paper-colored rectangle plus subtle paper grain already underneath
  // We use the paper tint (cream) with 0.96 opacity to blank center
  ctx.globalAlpha = 1;
  // Create a blank strip where highlight lives — mimic the blank center the prompt requested
  // Add a tiny feather by drawing with composite
  ctx.fillStyle = 'rgba(255, 253, 248, 0.96)';
  // Slightly larger than band to ensure no text under highlight
  const pad = 6;
  ctx.fillRect(inset, bandTop - pad, pw, bandBottom - bandTop + pad * 2);
  // Add back faint horizontal rules in center band to keep texture but no text
  ctx.strokeStyle = 'rgba(80,80,90,0.06)';
  ctx.lineWidth = 0.5;
  for (let y = bandTop + 8; y < bandBottom; y += 12) {
    ctx.beginPath();
    ctx.moveTo(inset + 8, y);
    ctx.lineTo(inset + pw - 8, y);
    ctx.stroke();
  }
  ctx.restore();
  return true;
}

// ── Newspaper: FIXED masthead + 2-3 columns, exact same every frame ──
function drawNewspaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _cx: number,
  cy: number,
  fontSize: number,
  _spec: FrameSpec,
  _dims: RenderDims,
): void {
  const inset = 22;
  const safeW = width - 2 * inset;
  const topY = inset + 18;
  const bottomY = height - inset - 10;
  const centerBand = fontSize * 1.6;
  const bandTop = cy - centerBand;
  const bandBottom = cy + centerBand;

  // Try real scanned texture first — exact same image every cut (fixed)
  // Use real scanned texture for this background — newspaper/vintage/tabloid each have own scan
  const scannedName = (_dims.templateBackground ?? 'newspaper') as TemplateBackground;
  const scanned = getScannedImage(scannedName === 'vintage' || scannedName === 'tabloid' ? scannedName : 'newspaper');
  if (isImageReady(scanned)) {
    drawScannedWithCenterMask(ctx, scanned!, width, height, cy, bandTop, bandBottom);
  }

  // Masthead — FIXED (not per spec.index)
  ctx.save();
  ctx.fillStyle = 'rgba(20,20,20,0.85)';
  const mastSize = Math.round(Math.max(11, Math.min(18, width * 0.022)));
  drawCenteredHeader(ctx, 'THE  DAILY  HERALD  •  EST.  1892', topY, width, mastSize, '"Old Standard TT", serif', 700);
  ctx.strokeStyle = 'rgba(20,20,20,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(inset, topY + mastSize * 0.7);
  ctx.lineTo(width - inset, topY + mastSize * 0.7);
  ctx.stroke();
  ctx.fillStyle = 'rgba(20,20,20,0.65)';
  drawCenteredHeader(
    ctx,
    'VOL. CXXIV  —  PRICE ONE PENNY  —  LATE CITY EDITION',
    topY + mastSize * 0.7 + 10,
    width,
    Math.round(mastSize * 0.55),
    '"Inter", sans-serif',
    400,
  );
  ctx.restore();

  const cols = width > 1400 ? 3 : 2;
  const gutter = 14;
  const colW = (safeW - gutter * (cols - 1)) / cols;
  const headSize = Math.round(fontSize * 0.32);
  const bodySize = Math.round(fontSize * 0.28);
  const lineH = bodySize * 1.45;

  // FIXED pool — same every frame, no spec.fillerLines or spec.index
  const poolWords = NEWSPAPER_BODY_FIXED.split(/\s+/).filter(Boolean);

  for (let c = 0; c < cols; c++) {
    const colX = inset + c * (colW + gutter);
    let y = topY + mastSize * 0.7 + 22;
    ctx.font = `700 ${headSize}px "Playfair Display", serif`;
    ctx.fillStyle = 'rgba(20,20,20,0.78)';
    // Fixed headline per column (c % headlines), not (spec.index + c)
    const headline = NEWSPAPER_HEADLINES[c % NEWSPAPER_HEADLINES.length] ?? '';
    const hlLines = wrapWords(ctx, headline.split(/\s+/), colW);
    for (const ln of hlLines.slice(0, 2)) {
      if (y >= bandTop && y <= bandBottom) {
        y += lineH;
        continue;
      }
      if (y > bottomY) break;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(ln, colX, y);
      y += headSize * 1.2;
    }
    if (y < bottomY && !(y >= bandTop && y <= bandBottom)) {
      ctx.strokeStyle = 'rgba(20,20,20,0.18)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(colX, y);
      ctx.lineTo(colX + colW, y);
      ctx.stroke();
      y += 6;
    }
    ctx.font = `400 ${bodySize}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(30,30,30,0.42)';
    const bodyLines = wrapWords(ctx, poolWords, colW);
    // FIXED offset per column only, not per spec.index
    const offset = (c * 7) % Math.max(1, bodyLines.length);
    let bi = offset;
    while (y < bottomY - lineH) {
      if (y >= bandTop && y <= bandBottom) {
        y += lineH;
        if (y < bandBottom) y = bandBottom + lineH * 0.6;
        continue;
      }
      const line = bodyLines[bi % bodyLines.length] ?? '';
      ctx.fillText(line, colX, y);
      y += lineH;
      bi++;
      if (bi - offset > 80) break;
    }
    if (c < cols - 1) {
      ctx.strokeStyle = 'rgba(20,20,20,0.12)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(colX + colW + gutter / 2, topY + mastSize * 0.7 + 22);
      ctx.lineTo(colX + colW + gutter / 2, bottomY);
      ctx.stroke();
    }
  }
}

// ── Book: FIXED page with margins, drop cap, same every frame ──
function drawBook(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _cx: number,
  cy: number,
  fontSize: number,
  _spec: FrameSpec,
  _dims: RenderDims,
): void {
  const inset = 48;
  const safeW = width - 2 * inset;
  const topY = inset + 10;
  const bottomY = height - inset - 14;
  const centerBand = fontSize * 1.7;
  const bandTop = cy - centerBand;
  const bandBottom = cy + centerBand;

  const scanned = getScannedImage('book');
  if (isImageReady(scanned)) {
    drawScannedWithCenterMask(ctx, scanned!, width, height, cy, bandTop, bandBottom);
  }

  ctx.save();
  ctx.fillStyle = 'rgba(60,50,40,0.45)';
  const smallSize = Math.round(fontSize * 0.26);
  // FIXED page number 42, not spec.index % 284
  drawCenteredHeader(ctx, '—  42  —', topY, width, Math.round(smallSize * 0.9), '"Inter", sans-serif', 400);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const bodySize = Math.round(fontSize * 0.32);
  const lineH = bodySize * 1.7;
  let y = topY + 18;

  const bookPool = BOOK_BODY_FIXED.split(/\s+/).filter(Boolean);
  const lines = wrapWords(ctx, bookPool, safeW);
  let idx = 0;
  let first = true;
  while (y < bottomY - lineH) {
    if (y >= bandTop && y <= bandBottom) {
      y = bandBottom + lineH * 0.8;
      continue;
    }
    const line = lines[idx % lines.length] ?? '';
    if (!line) {
      idx++;
      continue;
    }
    if (first) {
      const firstChar = line[0] ?? '';
      const rest = line.slice(1);
      ctx.font = `700 ${Math.round(bodySize * 2.2)}px "Old Standard TT", serif`;
      ctx.fillStyle = 'rgba(40,30,20,0.72)';
      ctx.fillText(firstChar, inset, y);
      const capW = ctx.measureText(firstChar).width;
      ctx.font = `400 ${bodySize}px "Lora", serif`;
      ctx.fillStyle = 'rgba(40,30,20,0.58)';
      ctx.fillText(rest, inset + capW + 2, y);
      first = false;
    } else {
      const isParaStart = idx % 7 === 0;
      const indent = isParaStart ? bodySize * 1.2 : 0;
      ctx.font = `400 ${bodySize}px "Lora", serif`;
      ctx.fillStyle = 'rgba(40,30,20,0.58)';
      ctx.fillText(line, inset + indent, y);
    }
    y += lineH;
    idx++;
    if (idx > 60) break;
  }
  ctx.restore();
}

// ── Magazine: FIXED glossy — same headline/blocks every frame ──
function drawMagazine(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _cx: number,
  cy: number,
  fontSize: number,
  _spec: FrameSpec,
  _dims: RenderDims,
): void {
  const inset = 22;
  const safeW = width - 2 * inset;
  const topY = inset + 6;
  const bottomY = height - inset - 8;
  const centerBand = fontSize * 1.6;
  const bandTop = cy - centerBand;
  const bandBottom = cy + centerBand;

  const scanned = getScannedImage('magazine');
  if (isImageReady(scanned)) {
    drawScannedWithCenterMask(ctx, scanned!, width, height, cy, bandTop, bandBottom);
  }

  ctx.fillStyle = 'rgba(180,28,28,0.85)';
  ctx.font = `700 ${Math.round(fontSize * 0.28)}px "Montserrat", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const kicker = 'FEATURE • CULTURE • ISSUE 42';
  let y = topY + 8;
  if (!(y >= bandTop && y <= bandBottom)) ctx.fillText(kicker, inset, y);
  y += fontSize * 0.45;

  ctx.fillStyle = 'rgba(15,15,15,0.85)';
  const headSize = Math.round(fontSize * 0.48);
  ctx.font = `800 ${headSize}px "Bebas Neue", sans-serif`;
  // FIXED headline, not fillerLines[0]
  const hl = 'STYLE OF THE SEASON';
  const hlLines = wrapWords(ctx, hl.split(/\s+/), safeW);
  for (const ln of hlLines.slice(0, 2)) {
    if (y >= bandTop && y <= bandBottom) {
      y += headSize * 1.1;
      continue;
    }
    if (y > bottomY) break;
    ctx.fillText(ln, inset, y);
    y += headSize * 1.05;
  }
  y += 4;
  ctx.strokeStyle = 'rgba(15,15,15,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(inset, y);
  ctx.lineTo(inset + safeW, y);
  ctx.stroke();
  y += 8;

  const imgW = Math.round(safeW * 0.46);
  const imgH = Math.round(fontSize * 4.2);
  const imgX = inset;
  const imgY = y;
  const imgBottom = imgY + imgH;
  const imgOverlaps = !(imgBottom < bandTop || imgY > bandBottom);
  if (!imgOverlaps && imgBottom < bottomY) {
    ctx.fillStyle = 'rgba(210,210,215,0.9)';
    ctx.fillRect(imgX, imgY, imgW, imgH);
    ctx.strokeStyle = 'rgba(150,150,155,0.9)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(imgX, imgY, imgW, imgH);
    ctx.beginPath();
    ctx.moveTo(imgX, imgY);
    ctx.lineTo(imgX + imgW, imgY + imgH);
    ctx.moveTo(imgX + imgW, imgY);
    ctx.lineTo(imgX, imgY + imgH);
    ctx.stroke();
    ctx.fillStyle = 'rgba(80,80,85,0.7)';
    ctx.font = `400 ${Math.round(fontSize * 0.22)}px "Inter", sans-serif`;
    ctx.fillText('FIG. 01 — PRINTED MATTER', imgX, imgY + imgH + 8);
    y = imgBottom + 18;
  } else if (imgOverlaps) y = bandBottom + 14;

  const cols = 2;
  const gutter = 12;
  const colW = (safeW - gutter) / cols;
  const bodySize = Math.round(fontSize * 0.27);
  const lineH = bodySize * 1.45;
  const pool = MAGAZINE_BODY_FIXED.split(/\s+/).filter(Boolean);
  const bodyLines = wrapWords(ctx, pool, colW - 4);
  let bi = 0;
  for (let c = 0; c < cols; c++) {
    const colX = inset + c * (colW + gutter);
    let cy2 = y;
    let count = 0;
    while (cy2 < bottomY - lineH && count < 14) {
      if (cy2 >= bandTop && cy2 <= bandBottom) {
        cy2 = bandBottom + 8;
        continue;
      }
      const line = bodyLines[(bi + count) % bodyLines.length] ?? '';
      ctx.font = `400 ${bodySize}px "Inter", sans-serif`;
      ctx.fillStyle = c === 0 ? 'rgba(30,30,35,0.62)' : 'rgba(30,30,35,0.48)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(line, colX, cy2);
      cy2 += lineH;
      count++;
    }
    bi += 7;
  }

  const pqY = bottomY - lineH * 1.2;
  if (pqY > bandBottom + 12 && pqY < bottomY) {
    ctx.fillStyle = 'rgba(180,28,28,0.12)';
    ctx.fillRect(inset, pqY - 10, safeW, 28);
    ctx.fillStyle = 'rgba(20,20,20,0.68)';
    ctx.font = `italic 700 ${Math.round(bodySize * 1.15)}px "Playfair Display", serif`;
    ctx.textAlign = 'center';
    ctx.fillText('“ Print endures. ”', width / 2, pqY);
    ctx.textAlign = 'left';
  }
}

function drawTypewriter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _cx: number,
  cy: number,
  fontSize: number,
  _spec: FrameSpec,
  _dims: RenderDims,
): void {
  const inset = 26;
  const safeW = width - 2 * inset;
  const topY = inset + 6;
  const bottomY = height - inset - 6;
  const bandTop = cy - fontSize * 1.6;
  const bandBottom = cy + fontSize * 1.6;
  const scanned = getScannedImage('typewriter');
  if (isImageReady(scanned)) drawScannedWithCenterMask(ctx, scanned!, width, height, cy, bandTop, bandBottom);

  ctx.strokeStyle = 'rgba(80,80,90,0.14)';
  ctx.lineWidth = 0.7;
  const lineStep = Math.round(fontSize * 0.62);
  for (let y = topY; y < bottomY; y += lineStep) {
    if (y >= bandTop && y <= bandBottom) continue;
    ctx.beginPath();
    ctx.moveTo(inset, y);
    ctx.lineTo(width - inset, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(180,40,40,0.28)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(inset + 18, topY);
  ctx.lineTo(inset + 18, bottomY);
  ctx.stroke();

  ctx.fillStyle = 'rgba(20,20,22,0.62)';
  ctx.font = `400 ${Math.round(fontSize * 0.3)}px "Courier Prime", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  // FIXED typewriter text
  const words =
    'CASE FILE REF. 42-B DRAFT CONFIDENTIAL SUBJECT UNDER REVIEW City desk reports steady trade at the exchange as printers set the morning run.'.split(
      /\s+/,
    );
  const lines = wrapWords(ctx, words, safeW - 22);
  let y = topY + 6;
  let idx = 0;
  while (y < bottomY - 10) {
    if (y >= bandTop && y <= bandBottom) {
      y = bandBottom + 8;
      continue;
    }
    const ln = lines[idx % lines.length] ?? '';
    // FIXED jitter pattern, not spec.index
    const jitter = (idx % 3) * 0.6 - 0.6;
    ctx.fillText(ln, inset + 22 + jitter, y);
    y += lineStep;
    idx++;
    if (idx > 40) break;
  }
}

function drawNotebook(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _cx: number,
  cy: number,
  fontSize: number,
  _spec: FrameSpec,
  _dims: RenderDims,
): void {
  const inset = 22;
  const safeW = width - 2 * inset;
  const topY = inset + 12;
  const bottomY = height - inset - 10;
  const bandTop = cy - fontSize * 1.6;
  const bandBottom = cy + fontSize * 1.6;
  const scanned = getScannedImage('notebook');
  if (isImageReady(scanned)) drawScannedWithCenterMask(ctx, scanned!, width, height, cy, bandTop, bandBottom);
  ctx.strokeStyle = 'rgba(100,140,200,0.22)';
  ctx.lineWidth = 0.8;
  const step = Math.round(fontSize * 0.72);
  for (let y = topY; y < bottomY; y += step) {
    if (y >= bandTop && y <= bandBottom) continue;
    ctx.beginPath();
    ctx.moveTo(inset, y);
    ctx.lineTo(width - inset, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(200,80,80,0.22)';
  ctx.beginPath();
  ctx.moveTo(inset + 28, topY - 6);
  ctx.lineTo(inset + 28, bottomY);
  ctx.stroke();

  ctx.fillStyle = 'rgba(45,55,70,0.55)';
  ctx.font = `400 ${Math.round(fontSize * 0.31)}px "Special Elite", cursive`;
  ctx.textAlign = 'left';
  // FIXED notebook text
  const words = 'idea sketch note to self remember this follow up tomorrow morning City desk reports steady trade at the exchange.'.split(/\s+/);
  const lines = wrapWords(ctx, words, safeW - 32);
  let y = topY + 2;
  let idx = 0;
  while (y < bottomY - 8) {
    if (y >= bandTop && y <= bandBottom) {
      y = bandBottom + 10;
      continue;
    }
    const ln = lines[idx % lines.length] ?? '';
    ctx.fillText(ln, inset + 32, y);
    y += step;
    idx++;
    if (idx > 36) break;
  }
}

function drawGeneric(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  fontSize: number,
  spec: FrameSpec,
  _dims: RenderDims,
): void {
  const fillerSize = Math.round(fontSize * 0.34);
  ctx.font = `400 ${fillerSize}px "JetBrains Mono", monospace`;
  ctx.fillStyle = 'rgba(30,30,30,0.38)';
  const lineH = fillerSize * 1.5;
  let fy = cy - fontSize - lineH;
  const above = spec.fillerLines.slice(0, 2);
  for (let i = above.length - 1; i >= 0; i--) {
    const txt = above[i];
    ctx.textAlign = 'center';
    ctx.fillText(txt, cx, fy);
    fy -= lineH;
  }
  let by = cy + fontSize + lineH * 0.8;
  const below = spec.fillerLines.slice(2, 4);
  for (const txt of below) {
    ctx.textAlign = 'center';
    ctx.fillText(txt, cx, by);
    by += lineH;
  }
  ctx.textAlign = 'left';
}

export function drawTemplateBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  fontSize: number,
  spec: FrameSpec,
  dims: RenderDims,
): void {
  const bg = (dims.templateBackground ?? 'auto') as TemplateBackground;
  if (bg === 'newspaper') drawNewspaper(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'book') drawBook(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'magazine') drawMagazine(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'typewriter') drawTypewriter(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'notebook') drawNotebook(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'vintage') drawNewspaper(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'tabloid') drawNewspaper(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'modern') {
    const inset = 22;
    ctx.strokeStyle = 'rgba(180,180,185,0.12)';
    ctx.lineWidth = 0.6;
    const step = Math.round(fontSize * 1.1);
    for (let x = inset; x < width - inset; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, inset);
      ctx.lineTo(x, height - inset);
      ctx.stroke();
    }
    for (let y = inset; y < height - inset; y += step) {
      ctx.beginPath();
      ctx.moveTo(inset, y);
      ctx.lineTo(width - inset, y);
      ctx.stroke();
    }
    drawGeneric(ctx, width, height, cx, cy, fontSize, spec, dims);
  } else if (bg === 'cinematic') {
    const scannedC = getScannedImage('cinematic');
    if (isImageReady(scannedC)) drawScannedWithCenterMask(ctx, scannedC!, width, height, cy, cy - fontSize * 1.6, cy + fontSize * 1.6);
    const inset = 22;
    ctx.fillStyle = 'rgba(10,10,12,0.92)';
    ctx.fillRect(inset, inset, width - 2 * inset, 32);
    ctx.fillRect(inset, height - inset - 32, width - 2 * inset, 32);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let y = inset + 32 + 8; y < height - inset - 32; y += 6) {
      if (y >= cy - fontSize * 1.6 && y <= cy + fontSize * 1.6) continue;
      ctx.beginPath();
      ctx.moveTo(inset, y);
      ctx.lineTo(width - inset, y);
      ctx.stroke();
    }
    drawGeneric(ctx, width, height, cx, cy, fontSize, spec, dims);
  } else {
    drawGeneric(ctx, width, height, cx, cy, fontSize, spec, dims);
  }
}

// Preload scanned textures eagerly (browser only) so first Generate doesn't flash
if (typeof document !== 'undefined') {
  try {
    getScannedImage('newspaper');
    getScannedImage('book');
    getScannedImage('magazine');
    getScannedImage('typewriter');
    getScannedImage('vintage');
    getScannedImage('tabloid');
    getScannedImage('notebook');
    getScannedImage('modern');
    getScannedImage('cinematic');
  } catch {
    // ignore
  }
}
