/**
 * Minimal, dependency-free className combiner.
 *
 * Filters out falsy values so conditional classes read cleanly:
 *   cn('base', isActive && 'active', undefined) => 'base active'
 *
 * Kept dependency-free on purpose (KISS / no unnecessary dependencies). If class
 * conflict resolution becomes necessary, this is the single place to swap in
 * `clsx` + `tailwind-merge`.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
