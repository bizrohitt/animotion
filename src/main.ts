// src/main.ts — wiring only (<150 lines)

function init(): void {
  const app = document.getElementById('app');
  if (!app) return;
  const p = document.createElement('p');
  p.textContent = 'MatchCutter scaffold — Vite + TS strict ready. Next: parser & layout.';
  app.appendChild(p);
  console.log('[MatchCutter] scaffold loaded');
}

init();
