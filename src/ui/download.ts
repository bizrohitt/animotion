// src/ui/download.ts — trigger download from Blob
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

export function filenameFor(ext: string): string {
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `matchcutter-${ts}.${ext}`;
}
