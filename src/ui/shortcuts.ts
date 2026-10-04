// src/ui/shortcuts.ts — "/" to focus input

export function setupShortcuts(input: HTMLInputElement): void {
  document.addEventListener('keydown', (e) => {
    if (
      e.key === '/' &&
      !(e.target instanceof HTMLInputElement) &&
      !(e.target instanceof HTMLTextAreaElement)
    ) {
      e.preventDefault();
      input.focus();
    }
  });
}
