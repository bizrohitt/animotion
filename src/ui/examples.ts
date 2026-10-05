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
    btn.className = 'example-btn';
    btn.addEventListener('click', () => onPick(prompt));
    container.appendChild(btn);
  }
}
