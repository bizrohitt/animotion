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
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
