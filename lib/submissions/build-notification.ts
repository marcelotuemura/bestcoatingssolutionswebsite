import { escapeHtml, plainTextLine } from '@/lib/submissions/escape-html';
import type { EstimateAttachmentMeta } from '@/lib/submissions/types';

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#64748b;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0f172a;">${escapeHtml(value)}</td></tr>`;
}

function asString(value: unknown, fallback = '—'): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) {
    const joined = value.filter((v) => typeof v === 'string').join(', ');
    return joined || fallback;
  }
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  return fallback;
}

export function buildContactNotification(input: {
  readonly payload: Record<string, unknown>;
  readonly sourcePath: string;
  readonly submittedAt: string;
}): { subject: string; text: string; html: string; replyTo: string } {
  const name = asString(input.payload.name, 'Customer');
  const email = asString(input.payload.email);
  const phone = asString(input.payload.phone);
  const inquiryType = asString(input.payload.inquiryType);
  const preferred = asString(input.payload.preferredContactMethod);
  const message = asString(input.payload.message);

  const subject = `New BCS contact request — ${name}`;
  const text = [
    'New Best Coatings Solutions contact request',
    plainTextLine('Name', name),
    plainTextLine('Email', email),
    plainTextLine('Phone', phone),
    plainTextLine('Inquiry type', inquiryType),
    plainTextLine('Preferred contact', preferred),
    plainTextLine('Source page', input.sourcePath),
    plainTextLine('Submitted at', input.submittedAt),
    '',
    'Message:',
    message,
  ].join('\n');

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.5;">
      <h1 style="font-size:18px;color:#0f172a;">New BCS contact request</h1>
      <table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px;">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Phone', phone)}
        ${row('Inquiry type', inquiryType)}
        ${row('Preferred contact', preferred)}
        ${row('Source page', input.sourcePath)}
        ${row('Submitted at', input.submittedAt)}
      </table>
      <h2 style="font-size:14px;margin-top:20px;color:#0f172a;">Message</h2>
      <p style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px;color:#0f172a;">${escapeHtml(message)}</p>
    </div>
  `.trim();

  return { subject, text, html, replyTo: email };
}

export function buildEstimateNotification(input: {
  readonly payload: Record<string, unknown>;
  readonly attachments: readonly EstimateAttachmentMeta[];
  readonly sourcePath: string;
  readonly submittedAt: string;
}): { subject: string; text: string; html: string; replyTo: string } {
  const name = asString(input.payload.fullName, 'Customer');
  const email = asString(input.payload.email);
  const phone = asString(input.payload.phone);
  const preferred = asString(input.payload.preferredContactMethod);
  const services = asString(input.payload.services);
  const manufacturer = asString(input.payload.manufacturer);
  const model = asString(input.payload.model);
  const year = asString(input.payload.year);
  const lengthFeet = asString(input.payload.lengthFeet);
  const vesselName = asString(input.payload.vesselName);
  const location = asString(input.payload.currentLocation);
  const marina = asString(input.payload.marinaName);
  const damage = asString(input.payload.damageDescription);
  const affectedArea = asString(input.payload.affectedArea);
  const urgency = asString(input.payload.urgency);
  const insurance = asString(input.payload.insuranceRelated);
  const operability = asString(input.payload.operability);
  const photoNote =
    input.attachments.length === 0
      ? 'None selected (photos are not uploaded in this release)'
      : `${input.attachments.length} selected locally (filenames only; binaries not uploaded): ${input.attachments
          .map((a) => a.name)
          .join(', ')}`;

  const vessel = [
    manufacturer,
    model,
    year,
    lengthFeet ? `${lengthFeet} ft` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const subject = `New BCS estimate request — ${name}`;
  const text = [
    'New Best Coatings Solutions marine estimate request',
    plainTextLine('Name', name),
    plainTextLine('Email', email),
    plainTextLine('Phone', phone),
    plainTextLine('Preferred contact', preferred),
    plainTextLine('Services', services),
    plainTextLine('Vessel', vessel || '—'),
    plainTextLine('Vessel name', vesselName),
    plainTextLine('Location', location),
    plainTextLine('Marina', marina),
    plainTextLine('Affected area', affectedArea),
    plainTextLine('Operability', operability),
    plainTextLine('Insurance related', insurance),
    plainTextLine('Urgency', urgency),
    plainTextLine('Photos', photoNote),
    plainTextLine('Source page', input.sourcePath),
    plainTextLine('Submitted at', input.submittedAt),
    '',
    'Project details:',
    damage,
  ].join('\n');

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.5;">
      <h1 style="font-size:18px;color:#0f172a;">New BCS estimate request</h1>
      <table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px;">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Phone', phone)}
        ${row('Preferred contact', preferred)}
        ${row('Services / division', `Marine · ${services}`)}
        ${row('Vessel', vessel || '—')}
        ${row('Vessel name', vesselName)}
        ${row('Location', location)}
        ${row('Marina', marina)}
        ${row('Affected area', affectedArea)}
        ${row('Operability', operability)}
        ${row('Insurance related', insurance)}
        ${row('Urgency', urgency)}
        ${row('Photos', photoNote)}
        ${row('Source page', input.sourcePath)}
        ${row('Submitted at', input.submittedAt)}
      </table>
      <h2 style="font-size:14px;margin-top:20px;color:#0f172a;">Project details</h2>
      <p style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px;color:#0f172a;">${escapeHtml(damage)}</p>
    </div>
  `.trim();

  return { subject, text, html, replyTo: email };
}
