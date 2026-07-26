/**
 * Vitest runs in a Node environment that is not React Server Components.
 * `server-only` is a Next.js boundary marker — noop it under unit tests.
 */
import { vi } from 'vitest';

vi.mock('server-only', () => ({}));
