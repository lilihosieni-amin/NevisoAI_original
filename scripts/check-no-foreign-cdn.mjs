#!/usr/bin/env node
/**
 * No-foreign-CDN gate (ARD §3.2, backend rule #1).
 *
 * Iran blocks foreign CDNs, so the built output must never load an asset from
 * an external host. We scan the surfaces that actually drive browser fetches —
 * rendered HTML (`<link>`, `<script src>`) and CSS (`@import`, `url(...)`).
 *
 * We intentionally do NOT scan framework JS chunks: Next.js embeds inert string
 * literals for `next/font/google` in its runtime even when unused, which would
 * be false positives. Runtime behaviour is additionally guarded by the e2e
 * "fonts served from our own origin" test.
 *
 * Run AFTER `next build`:  node scripts/check-no-foreign-cdn.mjs
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const BUILD_DIRS = [
  'apps/web/.next',
  'apps/web/out',
  'apps/admin/.next',
  'apps/admin/out',
];

// Hosts that must never appear in built output.
const FORBIDDEN_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'unpkg.com',
  'cdn.jsdelivr.net',
  'jsdelivr.net',
  'ajax.googleapis.com',
  'maxcdn.bootstrapcdn.com',
  'use.fontawesome.com',
  'stackpath.bootstrapcdn.com',
];

// Asset-loading surfaces only: HTML (<link>/<script src>) and CSS (@import/url()).
const SCANNABLE_EXT = new Set(['.css', '.html']);

const violations = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (SCANNABLE_EXT.has(extname(full))) {
      scanFile(full);
    }
  }
}

function scanFile(file) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    return;
  }
  for (const host of FORBIDDEN_HOSTS) {
    if (content.includes(host)) {
      violations.push({ file, host });
    }
  }
}

const scanned = [];
for (const dir of BUILD_DIRS) {
  if (existsSync(dir)) {
    scanned.push(dir);
    walk(dir);
  }
}

if (scanned.length === 0) {
  console.error(
    '✗ no-foreign-CDN check: no build output found. Run `npm run build` first.',
  );
  process.exit(1);
}

if (violations.length > 0) {
  console.error('✗ Foreign CDN reference(s) found in built output:');
  for (const v of violations) {
    console.error(`   - ${v.host}  →  ${v.file}`);
  }
  console.error('\nVendor the asset and serve it from our own infra (ARD §3.2).');
  process.exit(1);
}

console.log(`✓ no-foreign-CDN check passed (scanned: ${scanned.join(', ')})`);
