// src/render/backgrounds.ts — template-specific printed backgrounds that sit alongside the highlight
// Drawn after paper tint/grain, before highlight/phrase, inside the zoom+rotation transform.
// All procedurally generated, no images, permissive. Keeps center band clear so focal stays legible.

import type { FrameSpec, RenderDims, TemplateBackground } from '../types.ts';

const NEWSPAPER_HEADLINES = [
  'MARKETS RALLY AS STOCKS SURGE',
  'COUNCIL DEBATES NEW ORDINANCE',
  'WEATHER FRONT MOVES EASTWARD',
  'LOCAL TEAM CLAIMS VICTORY',
  'EDITORS NOTE: PRESS RUNS LATE',
];

const BOOK_SENTENCES = [
  'It was a quiet evening and the lamps burned low over the worn pages.',
  'She turned the leaf and found a marginal note in faded ink.',
  'The chronicle spoke of harbours, trade winds, and distant bells.',
  'Ink smudged at the edge where a hand had rested too long.',
  'A folded letter slipped from between the sheets and fell to the floor.',
];

const MAGAZINE_BLURBS = [
  'Cover story on the season selection inside.',
  'Interview with the editors on the new issue.',
  'Photo essay spans four pages of vivid detail.',
  'Culture review notes a surprising revival.',
];

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
  const w = width;
  const x = w / 2;
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
}

// ── Newspaper: masthead + 2-3 columns with justified-ish filler, skip center band ──
function drawNewspaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  fontSize: number,
  spec: FrameSpec,
  _dims: RenderDims,
): void {
  const inset = 22;
  const safeW = width - 2 * inset;
  const topY = inset + 18;
  const bottomY = height - inset - 10;
  const centerBand = fontSize * 1.6; // clear around highlight
  const bandTop = cy - centerBand;
  const bandBottom = cy + centerBand;

  // Masthead
  ctx.save();
  ctx.fillStyle = 'rgba(20,20,20,0.85)';
  const mastSize = Math.round(Math.max(11, Math.min(18, width * 0.022)));
  drawCenteredHeader(ctx, 'THE  DAILY  HERALD  •  EST.  1892', topY, width, mastSize, '"Old Standard TT", serif', 700);
  // thin rule under masthead
  ctx.strokeStyle = 'rgba(20,20,20,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(inset, topY + mastSize * 0.7);
  ctx.lineTo(width - inset, topY + mastSize * 0.7);
  ctx.stroke();
  // subhead
  ctx.fillStyle = 'rgba(20,20,20,0.65)';
  drawCenteredHeader(ctx, 'VOL. CXXIV  —  PRICE ONE PENNY  —  LATE CITY EDITION', topY + mastSize * 0.7 + 10, width, Math.round(mastSize * 0.55), '"Inter", sans-serif', 400);
  ctx.restore();

  // Columns
  const cols = width > 1400 ? 3 : 2;
  const gutter = 14;
  const colW = (safeW - gutter * (cols - 1)) / cols;
  const headSize = Math.round(fontSize * 0.32);
  const bodySize = Math.round(fontSize * 0.28);
  const lineH = bodySize * 1.45;

  // Build a word pool from filler + newspaper headlines + lorem
  const poolWords = [
    ...spec.fillerLines.join(' ').split(/\s+/),
    ...NEWSPAPER_HEADLINES.join(' ').split(/\s+/),
    ...'City desk reports steady trade at the exchange as printers set the morning run. Extra edition follows the late dispatch.'.split(/\s+/),
  ].filter(Boolean);

  for (let c = 0; c < cols; c++) {
    const colX = inset + c * (colW + gutter);
    let y = topY + mastSize * 0.7 + 22;
    // small headline per column
    ctx.font = `700 ${headSize}px "Playfair Display", serif`;
    ctx.fillStyle = 'rgba(20,20,20,0.78)';
    const headline = NEWSPAPER_HEADLINES[(spec.index + c) % NEWSPAPER_HEADLINES.length] ?? '';
    const hlLines = wrapWords(ctx, headline.split(/\s+/), colW);
    for (const ln of hlLines.slice(0, 2)) {
      if (y >= bandTop && y <= bandBottom) { y += lineH; continue; }
      if (y > bottomY) break;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      // draw headline centered in col? left
      ctx.fillText(ln, colX, y);
      y += headSize * 1.2;
    }
    // rule under headline
    if (y < bottomY && !(y >= bandTop && y <= bandBottom)) {
      ctx.strokeStyle = 'rgba(20,20,20,0.18)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(colX, y);
      ctx.lineTo(colX + colW, y);
      ctx.stroke();
      y += 6;
    }
    // body columns — wrap poolWords
    ctx.font = `400 ${bodySize}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(30,30,30,0.42)';
    const bodyLines = wrapWords(ctx, poolWords, colW);
    // offset start per spec to vary per frame
    const offset = (spec.index * 7 + c * 13) % Math.max(1, bodyLines.length);
    let bi = offset;
    while (y < bottomY - lineH) {
      if (y >= bandTop && y <= bandBottom) {
        y += lineH;
        // skip band height
        if (y < bandBottom) y = bandBottom + lineH * 0.6;
        continue;
      }
      const line = bodyLines[bi % bodyLines.length] ?? '';
      ctx.fillText(line, colX, y);
      y += lineH;
      bi++;
      // prevent infinite if bodyLines empty
      if (bi - offset > 80) break;
    }
    // vertical gutter line
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

// ── Book: centered page with margins, drop cap, justified block, skip center ──
function drawBook(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  fontSize: number,
  spec: FrameSpec,
  _dims: RenderDims,
): void {
  const inset = 48; // book margins wider
  const safeW = width - 2 * inset;
  const topY = inset + 10;
  const bottomY = height - inset - 14;
  const centerBand = fontSize * 1.7;
  const bandTop = cy - centerBand;
  const bandBottom = cy + centerBand;

  ctx.save();
  // page number top
  ctx.fillStyle = 'rgba(60,50,40,0.45)';
  const smallSize = Math.round(fontSize * 0.26);
  drawCenteredHeader(ctx, `—  ${String((spec.index % 284) + 12)}  —`, topY, width, Math.round(smallSize * 0.9), '"Inter", sans-serif', 400);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const bodySize = Math.round(fontSize * 0.32);
  const lineH = bodySize * 1.7;
  let y = topY + 18;

  // Build book text pool
  const bookPool = [...BOOK_SENTENCES, ...spec.fillerLines].join(' ').split(/\s+/).filter(Boolean);
  const lines = wrapWords(ctx, bookPool, safeW);
  let idx = (spec.index * 5) % lines.length;

  // First paragraph drop cap
  let first = true;
  while (y < bottomY - lineH) {
    if (y >= bandTop && y <= bandBottom) {
      y = bandBottom + lineH * 0.8;
      continue;
    }
    const line = lines[idx % lines.length] ?? '';
    if (!line) { idx++; continue; }

    if (first) {
      // drop cap: first letter larger, with margin
      const firstChar = line[0] ?? '';
      const rest = line.slice(1);
      ctx.font = `700 ${Math.round(bodySize * 2.2)}px "Old Standard TT", serif`;
      ctx.fillStyle = 'rgba(40,30,20,0.72)';
      ctx.fillText(firstChar, inset, y);
      const capW = ctx.measureText(firstChar).width;
      ctx.font = `400 ${bodySize}px "Lora", serif`;
      ctx.fillStyle = 'rgba(40,30,20,0.58)';
      // rest of line after cap
      ctx.fillText(rest, inset + capW + 2, y);
      first = false;
    } else {
      // indent every new paragraph (every 4 lines)
      const isParaStart = idx % 7 === 0;
      const indent = isParaStart ? bodySize * 1.2 : 0;
      ctx.font = `400 ${bodySize}px "Lora", serif`;
      ctx.fillStyle = 'rgba(40,30,20,0.58)';
      // for justified look, we already have left align; could add slight stretch but keep simple
      ctx.fillText(line, inset + indent, y);
    }
    y += lineH;
    idx++;
    if (idx - ((spec.index * 5) % lines.length) > 60) break;
  }
  ctx.restore();
}

// ── Magazine: glossy — large image block, headline, 2 columns, pull quote, skip center ──
function drawMagazine(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  fontSize: number,
  spec: FrameSpec,
  _dims: RenderDims,
): void {
  const inset = 22;
  const safeW = width - 2 * inset;
  const topY = inset + 6;
  const bottomY = height - inset - 8;
  const centerBand = fontSize * 1.6;
  const bandTop = cy - centerBand;
  const bandBottom = cy + centerBand;

  // Top kicker
  ctx.fillStyle = 'rgba(180,28,28,0.85)';
  ctx.font = `700 ${Math.round(fontSize * 0.28)}px "Montserrat", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const kicker = 'FEATURE • CULTURE • ISSUE 42';
  let y = topY + 8;
  if (!(y >= bandTop && y <= bandBottom)) ctx.fillText(kicker, inset, y);
  y += fontSize * 0.45;

  // Big headline
  ctx.fillStyle = 'rgba(15,15,15,0.85)';
  const headSize = Math.round(fontSize * 0.48);
  ctx.font = `800 ${headSize}px "Bebas Neue", sans-serif`;
  // headline text — short, maybe from filler first line
  const hl = (spec.fillerLines[0] ?? MAGAZINE_BLURBS[0] ?? 'THE NEW ISSUE').toUpperCase().slice(0, 28);
  const hlLines = wrapWords(ctx, hl.split(/\s+/), safeW);
  for (const ln of hlLines.slice(0, 2)) {
    if (y >= bandTop && y <= bandBottom) { y += headSize * 1.1; continue; }
    if (y > bottomY) break;
    ctx.fillText(ln, inset, y);
    y += headSize * 1.05;
  }
  y += 4;
  // rule
  ctx.strokeStyle = 'rgba(15,15,15,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(inset, y);
  ctx.lineTo(inset + safeW, y);
  ctx.stroke();
  y += 8;

  // Image placeholder (gray box with diagonal) — left side, skip if overlaps center
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
    // diagonal cross
    ctx.beginPath();
    ctx.moveTo(imgX, imgY);
    ctx.lineTo(imgX + imgW, imgY + imgH);
    ctx.moveTo(imgX + imgW, imgY);
    ctx.lineTo(imgX, imgY + imgH);
    ctx.stroke();
    // caption
    ctx.fillStyle = 'rgba(80,80,85,0.7)';
    ctx.font = `400 ${Math.round(fontSize * 0.22)}px "Inter", sans-serif`;
    ctx.fillText('FIG. 01 — PRINTED MATTER', imgX, imgY + imgH + 8);
    y = imgBottom + 18;
  } else {
    // if image would overlap center, push y below center
    if (imgOverlaps) y = bandBottom + 14;
  }

  // Two columns of body to the right/below image
  const cols = 2;
  const gutter = 12;
  const colW = (safeW - gutter) / cols;
  // For simplicity after image, we fill both columns from y onward
  const bodySize = Math.round(fontSize * 0.27);
  const lineH = bodySize * 1.45;
  const pool = [...spec.fillerLines.join(' ').split(/\s+/), ...MAGAZINE_BLURBS.join(' ').split(/\s+/)].filter(Boolean);
  const bodyLines = wrapWords(ctx, pool, colW - 4);
  let bi = (spec.index * 11) % bodyLines.length;

  // If image existed, left col starts below image, right col continues from y
  // We'll just fill columns top-down
  for (let c = 0; c < cols; c++) {
    const colX = inset + c * (colW + gutter);
    let cy2 = y;
    // left col under image already has y after image; right col same y
    let count = 0;
    while (cy2 < bottomY - lineH && count < 14) {
      if (cy2 >= bandTop && cy2 <= bandBottom) { cy2 = bandBottom + 8; continue; }
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

  // Pull quote at bottom if space
  const pqY = bottomY - lineH * 1.2;
  if (pqY > bandBottom + 12 && pqY < bottomY) {
    ctx.fillStyle = 'rgba(180,28,28,0.12)';
    ctx.fillRect(inset, pqY - 10, safeW, 28);
    ctx.fillStyle = 'rgba(20,20,20,0.68)';
    ctx.font = `italic 700 ${Math.round(bodySize * 1.15)}px "Playfair Display", serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`“ ${(spec.fillerLines[1] ?? 'Print endures.').slice(0, 42)} ”`, width / 2, pqY);
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
  spec: FrameSpec,
  _dims: RenderDims,
): void {
  const inset = 26;
  const safeW = width - 2 * inset;
  const topY = inset + 6;
  const bottomY = height - inset - 6;
  const bandTop = cy - fontSize * 1.6;
  const bandBottom = cy + fontSize * 1.6;

  // faint ruled lines (like notebook/typewriter)
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
  // left margin line (red)
  ctx.strokeStyle = 'rgba(180,40,40,0.28)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(inset + 18, topY);
  ctx.lineTo(inset + 18, bottomY);
  ctx.stroke();

  // typed text
  ctx.fillStyle = 'rgba(20,20,22,0.62)';
  ctx.font = `400 ${Math.round(fontSize * 0.30)}px "Courier Prime", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const words = [...spec.fillerLines.join(' ').split(/\s+/), ...'CASE FILE REF. 42-B DRAFT CONFIDENTIAL SUBJECT UNDER REVIEW'.split(/\s+/)].filter(Boolean);
  const lines = wrapWords(ctx, words, safeW - 22);
  let y = topY + 6;
  let idx = (spec.index * 6) % lines.length;
  while (y < bottomY - 10) {
    if (y >= bandTop && y <= bandBottom) { y = bandBottom + 8; continue; }
    const ln = lines[idx % lines.length] ?? '';
    // random slight x jitter to simulate typewriter
    const jitter = ((spec.index + idx) % 3) * 0.6 - 0.6;
    ctx.fillText(ln, inset + 22 + jitter, y);
    y += lineStep;
    idx++;
    if (idx - ((spec.index * 6) % lines.length) > 40) break;
  }
}

function drawNotebook(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _cx: number,
  cy: number,
  fontSize: number,
  spec: FrameSpec,
  _dims: RenderDims,
): void {
  const inset = 22;
  const safeW = width - 2 * inset;
  const topY = inset + 12;
  const bottomY = height - inset - 10;
  const bandTop = cy - fontSize * 1.6;
  const bandBottom = cy + fontSize * 1.6;
  // ruled lines (blue) + margin
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

  // handwritten-like filler (Special Elite, slight slant simulated via italic)
  ctx.fillStyle = 'rgba(45,55,70,0.55)';
  ctx.font = `400 ${Math.round(fontSize * 0.31)}px "Special Elite", cursive`;
  ctx.textAlign = 'left';
  const words = [...spec.fillerLines.join(' ').split(/\s+/), ...'idea sketch note to self remember this follow up tomorrow morning'.split(/\s+/)].filter(Boolean);
  const lines = wrapWords(ctx, words, safeW - 32);
  let y = topY + 2;
  let idx = (spec.index * 9) % lines.length;
  while (y < bottomY - 8) {
    if (y >= bandTop && y <= bandBottom) { y = bandBottom + 10; continue; }
    const ln = lines[idx % lines.length] ?? '';
    ctx.fillText(ln, inset + 32, y);
    y += step;
    idx++;
    if (idx - ((spec.index * 9) % lines.length) > 36) break;
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
  // fallback: simple centered filler (2 above, 2 below) like before but with more lines if requested
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
    // need to set textAlign left? but centered above, so keep centered
    ctx.textAlign = 'center';
    const x = cx;
    // to avoid using textAlign center with w calc, just use center
    ctx.fillText(txt, x, by);
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
  // If auto, use generic light filler (previous behavior)
  // For template-specific, dispatch
  if (bg === 'newspaper') drawNewspaper(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'book') drawBook(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'magazine') drawMagazine(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'typewriter') drawTypewriter(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'notebook') drawNotebook(ctx, width, height, cx, cy, fontSize, spec, dims);
  else if (bg === 'vintage') {
    // vintage = newspaper + book hybrid with extra grain
    drawNewspaper(ctx, width, height, cx, cy, fontSize, spec, dims);
  } else if (bg === 'tabloid') {
    drawNewspaper(ctx, width, height, cx, cy, fontSize, spec, dims);
  } else if (bg === 'modern') {
    // modern minimal — faint grid + generic
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
    // letterbox bars + subtle scanlines
    const inset = 22;
    ctx.fillStyle = 'rgba(10,10,12,0.92)';
    ctx.fillRect(inset, inset, width - 2 * inset, 32);
    ctx.fillRect(inset, height - inset - 32, width - 2 * inset, 32);
    // scanlines
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
