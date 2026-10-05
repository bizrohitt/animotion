// src/ui/poster.ts — generate OG 1200x630 poster from phrase (client-only)
import type { ParsedInput } from '../types.ts';

export function generatePosterDataURL(parsed: ParsedInput): string {
  const W = 1200, H = 630;
  const canvas = typeof document !== 'undefined'
    ? document.createElement('canvas')
    : (new (globalThis as unknown as { OffscreenCanvas: new (w:number,h:number)=> HTMLCanvasElement }).OffscreenCanvas(W, H) as unknown as HTMLCanvasElement);
  canvas.width = W;
  canvas.height = H;
  const ctx = (canvas as unknown as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) return '';
  // paper
  ctx.fillStyle = '#fdfbf7';
  ctx.fillRect(0, 0, W, H);
  // subtle grain (light)
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    ctx.fillRect(x, y, 1, 1);
  }
  // border
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  // torn inner
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.setLineDash([]);
  // title
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 56px "Playfair Display", serif';
  // split fullPhrase into two lines if long
  const words = parsed.fullPhrase.split(' ');
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ');
  const focal = parsed.focalWord;
  // draw line1
  ctx.font = '600 42px "Inter", sans-serif';
  ctx.fillStyle = '#6b6b6b';
  ctx.fillText(line1, W / 2, H / 2 - 70);
  // focal big
  ctx.font = '800 96px "Playfair Display", serif';
  ctx.fillStyle = '#b91c1c';
  // highlight behind focal
  const focalW = ctx.measureText(focal).width;
  ctx.fillStyle = 'rgba(185,28,28,0.12)';
  ctx.fillRect(W / 2 - focalW / 2 - 16, H / 2 - 36, focalW + 32, 72);
  ctx.fillStyle = '#b91c1c';
  ctx.fillText(focal, W / 2, H / 2 + 6);
  // line2
  ctx.font = '600 42px "Inter", sans-serif';
  ctx.fillStyle = '#6b6b6b';
  if (line2) ctx.fillText(line2, W / 2, H / 2 + 98);
  // footer
  ctx.font = '500 18px sans-serif';
  ctx.fillStyle = '#9a9a9a';
  ctx.fillText('MatchCutter — browser-only • no uploads', W / 2, H - 46);
  try {
    return (canvas as unknown as HTMLCanvasElement).toDataURL('image/png');
  } catch {
    return '';
  }
}

export function updatePosterMeta(parsed: ParsedInput): void {
  try {
    const dataUrl = generatePosterDataURL(parsed);
    if (!dataUrl) return;
    let meta = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      document.head.appendChild(meta);
    }
    meta.content = dataUrl;
    // also twitter
    let tw = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement | null;
    if (!tw) {
      tw = document.createElement('meta');
      tw.setAttribute('name', 'twitter:image');
      document.head.appendChild(tw);
    }
    tw.content = dataUrl;
    // update dimensions
    let w = document.querySelector('meta[property="og:image:width"]') as HTMLMetaElement | null;
    if (!w) { w = document.createElement('meta'); w.setAttribute('property', 'og:image:width'); document.head.appendChild(w); }
    w.content = '1200';
    let h = document.querySelector('meta[property="og:image:height"]') as HTMLMetaElement | null;
    if (!h) { h = document.createElement('meta'); h.setAttribute('property', 'og:image:height'); document.head.appendChild(h); }
    h.content = '630';
  } catch {
    // ignore
  }
}
