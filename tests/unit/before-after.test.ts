import { describe, expect, it } from 'vitest';
import {
  formatComparisonValueText,
  getAfterClipPath,
  getComparisonPercents,
} from '@/utils/before-after';

describe('before/after comparison semantics', () => {
  it('maps value 0 / 50 / 100 to consistent before/after percents', () => {
    expect(getComparisonPercents(0)).toEqual({ before: 100, after: 0 });
    expect(getComparisonPercents(50)).toEqual({ before: 50, after: 50 });
    expect(getComparisonPercents(100)).toEqual({ before: 0, after: 100 });
  });

  it('clips After from the right so higher values reveal more After', () => {
    expect(getAfterClipPath(0)).toBe('inset(0 100% 0 0)');
    expect(getAfterClipPath(50)).toBe('inset(0 50% 0 0)');
    expect(getAfterClipPath(100)).toBe('inset(0 0% 0 0)');
  });

  it('formats localized valuetext templates', () => {
    expect(
      formatComparisonValueText('Before {before}%, After {after}%', 50, 50),
    ).toBe('Before 50%, After 50%');
    expect(
      formatComparisonValueText('Antes {before}%, Después {after}%', 0, 100),
    ).toBe('Antes 0%, Después 100%');
  });
});
