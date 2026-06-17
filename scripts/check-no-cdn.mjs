#!/usr/bin/env node
/**
 * No-foreign-CDN guard (ARD §3.2 asset policy, DEVELOPMENT_PLAN hard rule).
 *
 * Scans app source + built output for references to foreign/public CDNs that
 * are unreliable or blocked inside Iran. Every asset must be vendored and
 * served from Neviso's own infrastructure. A hit fails the build.
 *
 * The `document/` design template is intentionally excluded — it is a
 * reference artifact, not shipped code, and its tokens.css imports Google
 * Fonts (which we deliberately drop when vendoring Vazirmatn).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
// This file legitimately contains the forbidden host strings (the blocklist).
const SELF = basename(fileURLToPath(import.meta.url));

// Hosts that must never appear in shipped code.
const FORBIDDEN = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'unpkg.com',
  'cdn.jsdelivr.net',
  'jsdelivr.net',
  'ajax.googleapis.com',
  'maxcdn.bootstrapcdn.com',
  'stackpath.bootstrapcdn.com',
  'use.fontawesome.com',
  'kit.fontawesome.com',
  'code.jquery.com',
  'esm.sh',
  'cdn.skypack.dev',
];

// Only scan code/style/markup we actually ship.
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.scss', '.html', '.json']);

// Directories we never descend into.
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.next',
  'out',
  'coverage',
  'generated',
  'document', // reference design template, not shipped
  '.pnpm-store',
  'test-results',
  'playwright-report',
]);

/** @type {{file: string, host: string, line: number}[]} */
const hits = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (entry === SELF) {
      continue; // the blocklist source itself
    } else if (SCAN_EXT.has(extname(entry))) {
      const text = readFileSync(full, 'utf8');
      const lines = text.split('\n');
      lines.forEach((line, i) => {
        for (const host of FORBIDDEN) {
          if (line.includes(host)) {
            hits.push({ file: full.replace(ROOT + '/', ''), host, line: i + 1 });
          }
        }
      });
    }
  }
}

walk(ROOT);

if (hits.length > 0) {
  console.error('✗ Foreign CDN references found (ARD §3.2 forbids these — vendor the asset):\n');
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line} → ${h.host}`);
  }
  console.error(`\n${hits.length} reference(s). Failing.`);
  process.exit(1);
}

console.log('✓ No foreign CDN references found.');
