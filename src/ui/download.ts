// src/ui/download.ts — trigger download from Blob (robust for async + iframe)
export function triggerDownload(blob: Blob, filename: string): void {
  if (!blob || blob.size === 0) throw new Error('Nothing to download — encoder produced empty file (try 720p or WebM).');
  const url = URL.createObjectURL(blob);
  // 1) hidden anchor for programmatic download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  a.rel = 'noopener';
  // target _blank helps in sandboxed iframe (allow-popups)
  (a as HTMLAnchorElement).target = '_blank';
  document.body.appendChild(a);
  let clicked = false;
  try {
    a.click();
    clicked = true;
  } catch (e) {
    console.warn('a.click failed', e);
  }
  try {
    a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    clicked = true;
  } catch {}
  // 2) Always try window.open as additional fallback — may be blocked after long async, but harmless if anchor worked
  let win: Window | null = null;
  try {
    win = window.open(url, '_blank');
    if (win) clicked = true;
  } catch {}
  // 3) Visible manual fallback — guaranteed clickable for 60s even if auto blocked (iframe sandbox without allow-downloads)
  // Remove any previous fallback
  document.querySelectorAll('[data-mc-fallback]').forEach((el) => el.remove());
  const fallback = document.createElement('div');
  fallback.setAttribute('data-mc-fallback', '');
  fallback.style.cssText = 'margin-top:8px;padding:10px;border:1px dashed #b91c1c;background:#fff8f0;border-radius:8px;font-size:13px';
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.textContent = `⬇ If download didn't start, click here to save ${filename} (${Math.round(blob.size/1024)}KB)`;
  link.style.cssText = 'color:#b91c1c;font-weight:600;text-decoration:underline;word-break:break-all';
  // also open in new tab on click as fallback for iOS
  link.target = '_blank';
  link.rel = 'noopener';
  fallback.appendChild(link);
  const note = document.createElement('div');
  note.textContent = 'Tip: If blocked, right-click → Save link as, or open preview directly (not inside editor).';
  note.style.cssText = 'margin-top:6px;color:#666;font-size:11px';
  fallback.appendChild(note);
  // attach near error element or body
  const errEl2 = document.getElementById('error');
  if (errEl2 && errEl2.parentElement) errEl2.parentElement.appendChild(fallback);
  else document.body.appendChild(fallback);
  // auto-remove after 60s and revoke URL
  setTimeout(() => {
    try { URL.revokeObjectURL(url); } catch {}
    try { a.remove(); } catch {}
    try { fallback.remove(); } catch {}
    if (win) try { win.close(); } catch {}
  }, 60000);
  console.log(`[MatchCutter] download triggered ${filename} ${Math.round(blob.size/1024)}KB type=${blob.type} clicked=${clicked} win=${!!win} — fallback link shown`);
}

export function filenameFor(ext: string): string {
  // Mi15: UTC via toISOString for deterministic filename across timezones (Asia/Calcutta etc).
  // Keeps file sort stable even if user changes local clock; alternative would be toLocaleString with offset.
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `matchcutter-${ts}.${ext}`;
}
