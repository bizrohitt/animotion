# Skill: Code Quality (600-Line Rule, Naming, Testing, Commits)

## Purpose

Keep MatchCutter modular, readable, and shippable across many small sessions with a hard 600-line file cap and strict typing.

## Rules

1. **600-line hard limit:** No file over 600 lines. Target 150-300. `scripts/check-lines.mjs` fails CI if violated. Split at ~450 lines. Long data → separate `*.data.ts` files.
2. **One responsibility per module:** A module does one thing, exposes a typed interface from `src/types.ts`. No circular imports. No reaching into another module's internals — use its exported API.
3. **Strict TS:** `strict:true`, `noImplicitAny`, `noUnusedLocals` (or warn), `esModuleInterop`. All public functions have explicit return types. Prefer `unknown` over `any`.
4. **Naming:** `camelCase` for vars/fns, `PascalCase` for types/classes, `SCREAMING_SNAKE` for constants, `kebab-case` for files. Descriptive names; no abbreviations beyond `ctx`, `rng`, `dims`.
5. **Testing:** Vitest for pure logic only (parser, timeline, layout math, synth timing). No DOM/canvas snapshot tests in unit suite. Each pure module has a sibling `tests/*.test.ts`. Aim ≥80% branch coverage for parser/timeline.
6. **Lint/format:** ESLint (flat config, `eslint:recommended` + `ts` + `prettier`) + Prettier. `npm run lint` and `npm run format:check` must pass before commit. No `console.log` in committed code.
7. **Commits:** One task → one commit, message `T-<id>: <summary>` (e.g. `T-010: add ==word== parser with validation`). Append 5-10 lines to `SESSION_LOG.md` per session.
8. **Session hygiene:** Read `CLAUDE.md` + `TASKS.md` + ONE relevant skill file at session start. Reference types, not bodies. Output only diffs. At ~60% context, stop and request fresh session.

## Code Patterns (short)

```ts
// prefer explicit types
export function parseInput(raw: string): ParseResult {
  /* ... */
}

// split data
// fillerText.data.ts  ← long array
// fillerText.ts       ← generator logic (short)
```

```ts
// check-lines.mjs (excerpt)
const max = 600;
for (const f of files) if (lines(f) > max) fail(`${f}: ${lines(f)} > ${max}`);
```

## Pitfalls

- Letting `main.ts` grow into a god file — keep it <150 lines, wiring only; push logic into `ui/*`.
- Importing across layers (e.g. `render` importing `ui`) — respect the DAG: `parser → layout → render → timeline → audio → encode → ui → main`.
- Forgetting to run `check-lines` and shipping a 700-line file.
- Testing canvas pixels in Vitest — test math/helpers instead; manual visual QA for pixels.

## Definition of Done

- `npm run lint`, `npm test`, `node scripts/check-lines.mjs` all pass on every commit.
- No file >600 lines; `main.ts` <150 lines.
- No circular deps (`madge` or manual check).
- Every exported pure function has a test or a documented reason not to.
- SESSION_LOG.md updated.
