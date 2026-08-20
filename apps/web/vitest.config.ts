import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Reuse the app's Vite config (the `@` alias, the Vue plugin) and just add the
// test-specific bits on top, so tests resolve imports exactly like the app does.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Simulate a browser (document, window, etc.) in Node so component tests
      // can render real DOM without opening a real browser.
      environment: 'jsdom',
      // Run this file once before any test — it registers the extra matchers.
      setupFiles: ['./src/test/setup.ts'],
      // Playwright specs live in e2e/ and are run by Playwright, not Vitest.
      exclude: [...configDefaults.exclude, 'e2e/**'],
    },
  }),
);
