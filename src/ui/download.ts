// src/ui/download.ts — trigger download from Blob (robust for async + iframe)
export function triggerDownload(blob: Blob, filename: string): void {
  if (!blob || blob.size === 0) throw new Error('Nothing to download — encoder produced empty file (try 720p or WebM).');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  a.rel = 'noopener';
  // Needed for Firefox/iframe: anchor must be in DOM
  document.body.appendChild(a);
  // Primary: anchor click (works after async in most browsers for downloads)
  let clicked = false;
  try {
    a.click();
    clicked = true;
  } catch (e) {
    console.warn('a.click failed', e);
  }
  // Secondary: dispatch MouseEvent for browsers that require it (Safari, older Chrome)
  if (!clicked) {
    try {
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      clicked = true;
    } catch {}
  }
  // Tertiary fallback: if download attribute is ignored (cross-origin iframe, popup blocker after long async),
  // try to open blob in new tab — user can then Save As. Also handles iOS where download is limited.
  // We keep this as best-effort; if popup blocked, window.open returns null and anchor already tried.
  let win: Window | null = null;
  if (!clicked) {
    try {
      win = window.open(url, '_blank');
    } catch {}
  }
  // Keep URL alive 60s for large 4K (16 Mbps ~ 4 MB) — revoke earlier aborted downloads
  setTimeout(() => {
    try { URL.revokeObjectURL(url); } catch {}
    try { a.remove(); } catch {}
    if (win) try { win.close(); } catch {}
  }, 60000);
  // Debug: log to console for QA
  console.log(`[MatchCutter] download triggered ${filename} ${Math.round(blob.size/1024)}KB type=${blob.type} clicked=${clicked} win=${!!win}`);
}

export function filenameFor(ext: string): string {
  // Mi15: UTC via toISOString for deterministic filename across timezones (Asia/Calcutta etc).
  // Keeps file sort stable even if user changes local clock; alternative would be toLocaleString with offset.
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `matchcutter-${ts}.${ext}`;
}
