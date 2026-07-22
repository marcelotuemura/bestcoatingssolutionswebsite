/**
 * Before/After comparison slider semantics:
 * value 0   → Before 100%, After 0%
 * value 50  → Before 50%, After 50%
 * value 100 → Before 0%, After 100%
 *
 * As value increases, more of the After layer is revealed.
 */
export function getComparisonPercents(value: number): {
  before: number;
  after: number;
} {
  const after = Math.min(100, Math.max(0, Math.round(value)));
  return { before: 100 - after, after };
}

/** Clip the After overlay from the right so the visible width equals `after%`. */
export function getAfterClipPath(afterPercent: number): string {
  const beforePercent = 100 - afterPercent;
  return `inset(0 ${beforePercent}% 0 0)`;
}

/**
 * Fill `{before}` / `{after}` placeholders in a localized valuetext template.
 * Example EN: "Before {before}%, After {after}%"
 */
export function formatComparisonValueText(
  template: string,
  beforePercent: number,
  afterPercent: number,
): string {
  return template
    .replaceAll('{before}', String(beforePercent))
    .replaceAll('{after}', String(afterPercent));
}
