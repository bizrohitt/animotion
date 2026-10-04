// src/ui/encodeBadge.ts — shows MP4/WebM readiness
import { isMP4Supported } from '../encode/mp4Encoder.ts';

function isWebMSupported(): boolean {
  return typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined';
}

export function updateEncodeBadge(el: HTMLElement | null): void {
  if (!el) return;
  const mp4 = isMP4Supported();
  const webm = isWebMSupported();
  const parts: string[] = [];
  if (mp4) parts.push('MP4 ✓');
  else parts.push('MP4 ✗');
  if (webm) parts.push('WebM ✓');
  else parts.push('WebM ✗');
  const ready = mp4 || webm;
  el.textContent = ready
    ? parts.join(' · ') + (mp4 ? ' — MP4 preferred' : ' — WebM fallback')
    : 'No encoder available — will offer ZIP';
  el.setAttribute('aria-label', `Encoders: ${parts.join(', ')}`);
  el.style.opacity = ready ? '0.8' : '1';
  el.style.color = ready ? 'var(--muted)' : 'var(--accent)';
}
