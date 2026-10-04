// src/ui/examples.ts — three clickable example prompts

export const EXAMPLE_PROMPTS: string[] = [
  'Markets jittery. ==TACO again==.',
  'Breaking: ==NEWS== hits the stands.',
  'Extra! ==SALE== today only.',
];

export function renderExamples(container: HTMLElement, onPick: (text: string) => void): void {
  container.innerHTML = '';
  for (const prompt of EXAMPLE_PROMPTS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = prompt;
    btn.style.marginRight = '8px';
    btn.style.marginBottom = '4px';
    btn.addEventListener('click', () => onPick(prompt));
    container.appendChild(btn);
  }
}
