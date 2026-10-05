// src/ui/share.ts — deep-link + copy link (browser-only)
export function getPhraseFromURL(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('phrase');
  } catch {
    return null;
  }
}

export function setPhraseInURL(phrase: string): void {
  try {
    const url = new URL(window.location.href);
    if (phrase.trim()) url.searchParams.set('phrase', phrase);
    else url.searchParams.delete('phrase');
    window.history.replaceState({}, '', url);
  } catch {
    // ignore
  }
}

export function buildShareURL(phrase: string, base = window.location.href): string {
  const url = new URL(base);
  if (phrase.trim()) url.searchParams.set('phrase', phrase);
  else url.searchParams.delete('phrase');
  return url.toString();
}

export async function copyShareLink(phrase: string): Promise<boolean> {
  const text = buildShareURL(phrase);
  // M7: prefer modern clipboard; deprecated execCommand removed — if denied, caller shows URL for manual copy
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // permission denied or insecure context
  }
  // No execCommand fallback (deprecated). Return false so UI can show share URL for manual copy.
  // Legacy fallback removed per audit M7 — execCommand is disabled in modern Chrome.
  return false;
}
