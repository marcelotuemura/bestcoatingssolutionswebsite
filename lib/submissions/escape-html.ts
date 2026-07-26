/** Escape user-provided text before embedding in HTML email bodies. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function plainTextLine(label: string, value: string): string {
  return `${label}: ${value.replace(/[\r\n]+/g, ' ').trim()}`;
}
