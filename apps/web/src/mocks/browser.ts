import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.js';

export const worker = setupWorker(...handlers);

/** Start the mock service worker unless explicitly disabled via env. */
export async function enableMocks(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return;
  await worker.start({ onUnhandledRequest: 'bypass' });
}
