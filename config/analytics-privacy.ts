/**
 * Analytics privacy rules for the public marketing site.
 * Vercel Analytics is mounted; do not send form field contents as events.
 */

export const analyticsPrivacy = {
  provider: 'Vercel Analytics',
  sendFormFieldContents: false,
  sendPiiAsEventProps: false,
  notes: [
    'Page views only via @vercel/analytics.',
    'Do not emit contact/estimate field values as custom events.',
    'Do not attach email, phone, HIN, or message bodies to analytics payloads.',
    'Review any future tag manager before installation — not selected for launch.',
  ],
} as const;
