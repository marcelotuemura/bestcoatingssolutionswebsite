import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Unit tests use in-memory publication/corpus repositories only.
vi.stubEnv('MEDIA_PUBLICATION_REPOSITORY', 'memory');
vi.stubEnv('MEDIA_CORPUS_REPOSITORY', 'memory');

// Ensure the DOM is reset between component tests to avoid cross-test leakage.
afterEach(() => {
  cleanup();
});
