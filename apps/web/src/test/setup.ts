// Adds matchers like `toBeInTheDocument()` / `toHaveAttribute()` to `expect`.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/vue';
import { afterEach } from 'vitest';

// Unmount whatever a test rendered, so each test starts from a clean page.
afterEach(() => {
  cleanup();
});
