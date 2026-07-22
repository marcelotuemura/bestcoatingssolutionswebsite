import { describe, expect, it } from 'vitest';
import { buttonClassName } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

describe('buttonClassName', () => {
  it('includes focus ring utilities for accessibility', () => {
    const className = buttonClassName({ variant: 'primary' });
    expect(className).toContain('focus-visible:ring-2');
    expect(className).toContain('min-h-');
  });

  it('merges custom class names', () => {
    expect(buttonClassName({ className: 'mt-2' })).toContain('mt-2');
  });
});

describe('cn', () => {
  it('joins truthy class values', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });
});
