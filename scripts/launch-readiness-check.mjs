/**
 * Phase 6 — Launch readiness scanner (non-blocking inventory).
 * Prints blocker status for logo, placeholders, legal provisional markers.
 *
 *   node scripts/launch-readiness-check.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = path.join(root, 'public', 'brand');

const officialCandidates = [
  'bcs-logo-official.webp',
  'bcs-logo-official.svg',
  'bcs-logo-official.png',
];

const preferredOfficial = 'bcs-logo-official.webp';
const officialPresent = officialCandidates.some((f) =>
  existsSync(path.join(brandDir, f)),
);
const preferredOfficialPresent = existsSync(
  path.join(brandDir, preferredOfficial),
);
const headerPresent = existsSync(path.join(brandDir, 'bcs-logo-header.webp'));

const privacyEn = readFileSync(
  path.join(root, 'i18n/dictionaries/conversion-en.ts'),
  'utf8',
);
const privacyProvisional =
  /Requires owner \/ legal review before production/.test(privacyEn);
const demoThankYou = /demonstration mode/.test(privacyEn);

const about = readFileSync(path.join(root, 'content/about.ts'), 'utf8');
const hasConfirmedShaefer = /\bShaefer\b/.test(about);
const hasWrongSheaffer = /\bSheaffer\b/.test(about);
const hasWrongSchaefer = /\bSchaefer\b/.test(about);
const manufacturerSpellingOk =
  hasConfirmedShaefer && !hasWrongSheaffer && !hasWrongSchaefer;

const rows = [
  {
    id: 'official-logo',
    ok: officialPresent,
    blocker: true,
    note: officialPresent
      ? preferredOfficialPresent
        ? headerPresent
          ? 'Preferred bcs-logo-official.webp + header.webp present'
          : 'Preferred bcs-logo-official.webp present (header.webp optional fallback to official)'
        : 'Official logo file present (prefer bcs-logo-official.webp)'
      : 'Missing public/brand/bcs-logo-official.{webp|svg|png}',
  },
  {
    id: 'privacy-terms-provisional',
    ok: !privacyProvisional,
    blocker: true,
    note: privacyProvisional
      ? 'Privacy/Terms still marked for owner/legal review'
      : 'Provisional review badge text cleared',
  },
  {
    id: 'form-delivery-demo-copy',
    ok: !demoThankYou,
    blocker: true,
    note: demoThankYou
      ? 'Thank-you copy still mentions demonstration mode'
      : 'Thank-you copy no longer demonstration-only',
  },
  {
    id: 'manufacturer-shaefer-spelling',
    ok: manufacturerSpellingOk,
    blocker: true,
    note: manufacturerSpellingOk
      ? 'Owner-confirmed spelling Shaefer present; incorrect variants absent'
      : 'Expected Shaefer in About; remove Sheaffer/Schaefer variants',
  },
];

const out = (line) => process.stdout.write(`${line}\n`);
out('Launch readiness check\n');
let blockers = 0;
for (const row of rows) {
  const mark = row.ok ? '✅' : row.blocker ? '🚫' : '⏳';
  if (!row.ok && row.blocker) blockers += 1;
  out(`${mark} ${row.id}: ${row.note}`);
}

out(
  `\nBlockers open: ${blockers}. See docs/brand-transformation/LAUNCH_READINESS_MATRIX.md`,
);
process.exitCode = 0; // inventory only — never fail CI until owner flips gate
