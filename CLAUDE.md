# CLAUDE.md — Session Rules for MatchCutter

> Read this file at the start of every session. Keep it under 80 lines.

1. **Session start:** Read `CLAUDE.md`, `TASKS.md`, and ONLY the skill file(s) needed for the current task. Do not re-read the whole codebase.
2. **One task per session:** Pick the next unchecked task in `TASKS.md` whose dependencies are done. Finish it (code + test + lint) before starting another.
3. **Interfaces first:** Modules talk only via `src/types.ts`. No circular imports. No reaching into internals.
4. **600-line limit:** No file over 600 lines. Target 150-300. Run `node scripts/check-lines.mjs` before every commit. Split at ~450 lines.
5. **Functionality before styling:** P0-P8 use browser-default HTML. No CSS/theming until P8 functional freeze. Canvas rendering is the exception.
6. **Client-only & permissive licenses only:** MIT/Apache-2.0/BSD/ISC/OFL/CC0/Unlicense/MPL-2.0 (unmodified). No GPL/AGPL/LGPL, no ffmpeg.wasm, no unclear assets. List everything in `docs/LICENSES.md`.
7. **Synthesize, don't download:** Sounds via Web Audio API, paper textures via canvas noise. Self-host OFL fonts.
8. **Deterministic & typed:** Strict TS, `npm run lint` + `npm test` must pass. Use seeded PRNG for frame generation.
9. **Commit per task:** Message `T-<id>: <summary>`. Append 5-10 lines to `SESSION_LOG.md` at session end (done, decisions, next task, bugs).
10. **Small context:** Reference types, not bodies. Output only changed files/diffs. At ~60% context, stop and request a fresh session.
