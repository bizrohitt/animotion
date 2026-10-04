// src/ui/history.ts — recent phrases in localStorage (cap 8, local only)
const KEY = 'matchcutter:recent';
const MAX = 8;

export function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr.filter((s) => typeof s === 'string') as string[]) : [];
  } catch {
    return [];
  }
}

export function saveRecent(phrase: string): string[] {
  const trimmed = phrase.trim();
  if (!trimmed) return loadRecent();
  let rec = loadRecent();
  rec = [trimmed, ...rec.filter((p) => p !== trimmed)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(rec));
  } catch {
    // quota or disabled
  }
  return rec;
}

export function clearRecent(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function renderRecent(container: HTMLElement, onPick: (phrase: string) => void): void {
  const rec = loadRecent();
  container.innerHTML = '';
  if (rec.length === 0) return;
  const title = document.createElement('div');
  title.textContent = 'Recent';
  title.className = 'hint';
  title.style.marginTop = '8px';
  container.appendChild(title);
  const wrap = document.createElement('div');
  wrap.className = 'examples';
  for (const phrase of rec) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = phrase.length > 40 ? `${phrase.slice(0, 40)}…` : phrase;
    btn.title = phrase;
    btn.addEventListener('click', () => onPick(phrase));
    wrap.appendChild(btn);
  }
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.textContent = 'Clear';
  clearBtn.setAttribute('aria-label', 'Clear recent phrases');
  clearBtn.style.opacity = '0.6';
  clearBtn.addEventListener('click', () => {
    clearRecent();
    container.innerHTML = '';
  });
  wrap.appendChild(clearBtn);
  container.appendChild(wrap);
}
