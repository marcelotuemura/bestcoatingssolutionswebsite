/**
 * Phase 6 — Launch readiness scanner (non-blocking inventory).
 * Prints blocker status for logo, legal, form delivery wiring, photography deferral.
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
const demoThankYou = /demonstration mode/i.test(privacyEn);
const hasFormConsent = /formConsent/.test(privacyEn);
const hasLastUpdated = /lastUpdatedLabel/.test(privacyEn);

const processSubmission = readFileSync(
  path.join(root, 'lib/submissions/process-submission.ts'),
  'utf8',
);
const mailer = readFileSync(
  path.join(root, 'lib/submissions/mailer.ts'),
  'utf8',
);
const deliveryWired =
  processSubmission.includes('sendInternalNotification') &&
  mailer.includes('Resend') &&
  existsSync(path.join(root, 'app/actions/submit-contact.ts')) &&
  existsSync(path.join(root, 'app/actions/submit-estimate.ts'));

const matrix = readFileSync(
  path.join(root, 'docs/brand-transformation/LAUNCH_READINESS_MATRIX.md'),
  'utf8',
);
const photographyDeferred =
  /Deferred by owner approval — pending approved assets/i.test(matrix);

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
          : 'Preferred bcs-logo-official.webp present'
        : 'Official logo file present (prefer bcs-logo-official.webp)'
      : 'Missing public/brand/bcs-logo-official.{webp|svg|png}',
  },
  {
    id: 'privacy-terms-production',
    ok: !privacyProvisional && hasFormConsent && hasLastUpdated,
    blocker: true,
    note:
      !privacyProvisional && hasFormConsent && hasLastUpdated
        ? 'Privacy/Terms production copy present (no provisional review badge)'
        : 'Privacy/Terms still provisional or missing consent/last-updated keys',
  },
  {
    id: 'form-delivery-demo-copy',
    ok: !demoThankYou,
    blocker: true,
    note: demoThankYou
      ? 'Thank-you/form copy still mentions demonstration mode'
      : 'Demonstration-mode thank-you copy cleared',
  },
  {
    id: 'form-delivery-wiring',
    ok: deliveryWired,
    blocker: true,
    note: deliveryWired
      ? 'Server Actions + Resend mailer wired (confirm Production env + domain separately)'
      : 'Missing Resend/Server Action delivery wiring',
  },
  {
    id: 'photography-deferred',
    ok: photographyDeferred,
    blocker: false,
    note: photographyDeferred
      ? 'Authentic photography recorded as owner-approved deferral (not a technical blocker)'
      : 'Matrix missing photography deferral decision language',
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
  `\nBlockers open: ${blockers}. Production Resend domain/env verification is an ops gate — see docs/FORM_DELIVERY.md and LAUNCH_READINESS_MATRIX.md`,
);
process.exitCode = 0; // inventory only — never fail CI until owner flips gate
