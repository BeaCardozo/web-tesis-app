#!/usr/bin/env node
/**
 * Falla si el front público referencia el API del scraper/DWH o variables NEXT_PUBLIC_* al scraper.
 * Uso: node scripts/check-no-public-scraper.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..');

const BLOCK = [
  /NEXT_PUBLIC[^\n]*SCRAPER/gi,
  /NEXT_PUBLIC[^\n]*8000/g,
  /localhost:8000/g,
  /127\.0\.0\.1:8000/g,
];

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts|jsx|js|mjs)$/.test(name)) acc.push(p);
  }
}

const files = [];
walk(path.join(appRoot, 'app'), files);

let failed = false;
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  const rel = path.relative(appRoot, f);
  for (const re of BLOCK) {
    re.lastIndex = 0;
    if (re.test(text)) {
      console.error(`[check-no-public-scraper] Patrón prohibido en ${rel}: ${re}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('\nLa web solo debe usar NEXT_PUBLIC_API_URL → ca-api. El DWH se consulta desde el servidor Nest.');
  process.exit(1);
}
console.log('OK: no hay referencias públicas al scraper en app/.');
process.exit(0);
