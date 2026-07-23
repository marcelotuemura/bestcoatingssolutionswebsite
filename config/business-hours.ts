/**
 * Business hours for the Contact page — single source of truth.
 * Update here rather than duplicating across components.
 */
export const businessHours = {
  timezone: 'America/New_York',
  timezoneLabel: 'Eastern Time',
  days: [
    { id: 'mon-fri', daysKey: 'weekdays', open: '08:00', close: '18:00' },
    { id: 'sat', daysKey: 'saturday', open: '09:00', close: '14:00' },
    { id: 'sun', daysKey: 'sunday', open: null, close: null },
  ],
} as const;

export type BusinessHours = typeof businessHours;
