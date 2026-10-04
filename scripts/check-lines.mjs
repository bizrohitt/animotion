#!/usr/bin/env node
// check-lines.mjs — fails if any source file exceeds 600 lines
// Usage: node scripts/check-lines.mjs [--max 600] [--target 450]

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const MAX = 600;
const WARN = 450;

const args = process.argv.slice(2);
const maxIdx = args.indexOf('--max');
const max = maxIdx !== -1 ? Number(args[maxIdx + 1]) : MAX;
const warn = WARN;

const roots = ['src', 'tests', 'scripts', 'skills'];
const exts = new Set(['.ts', '.js', '.mjs', '.md', '.css', '.html']);
const ignoreDirs = new Set(['node_modules', 'dist', '.git']);

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    if (ignoreDirs.has(e)) continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (exts.has(extname(p)) || p.endsWith('.md')) out.push(p);
  }
}

const files = [];
for (const r of roots) walk(r, files);
// also check top-level html/md
for (const f of ['index.html', 'PLAN.md', 'TASKS.md', 'CLAUDE.md', 'MASTER_PROMPT.md']) {
  try {
    if (statSync(f).isFile()) files.push(f);
  } catch {}
}

let failed = false;
let warned = false;

for (const f of files.sort()) {
  const content = readFileSync(f, 'utf8');
  const lines = content.split('\n').length;
  if (lines > max) {
    console.error(`✗ ${f}: ${lines} lines > ${max} (hard limit)`);
    failed = true;
  } else if (lines > warn) {
    console.warn(`⚠ ${f}: ${lines} lines > ${warn} (consider splitting)`);
    warned = true;
  }
}

if (failed) {
  console.error(`\ncheck-lines: FAILED — one or more files exceed ${max} lines.`);
  process.exit(1);
} else if (warned) {
  console.log(`\ncheck-lines: OK with warnings (all ≤ ${max}, some > ${warn}).`);
  process.exit(0);
} else {
  console.log(`check-lines: OK — all ${files.length} files ≤ ${max} lines.`);
  process.exit(0);
}
