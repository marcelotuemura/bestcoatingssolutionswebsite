import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Unit tests use the in-memory publication repository only.
vi.stubEnv('MEDIA_PUBLICATION_REPOSITORY', 'memory');

// Ensure the DOM is reset between component tests to avoid cross-test leakage.
afterEach(() => {
  cleanup();
});
