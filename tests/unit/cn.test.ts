import { describe, expect, it } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn', () => {
  it('joins truthy class values with a space', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values', () => {
    const isActive = false;
    const isPrimary = true;
    expect(cn('base', isActive && 'active', isPrimary && 'primary')).toBe(
      'base primary',
    );
  });

  it('returns an empty string when nothing is truthy', () => {
    expect(cn(undefined, null, false)).toBe('');
  });
});
