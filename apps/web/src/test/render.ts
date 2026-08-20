import { render } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import type { Component } from 'vue';
import { i18n } from '@/i18n';

/**
 * Render a component with the app's real plugins installed — a fresh Pinia store
 * and i18n — so stores and `t()` behave exactly like in the running app.
 *
 * `setActivePinia` also lets the TEST itself call `useSomeStore()` on the same
 * instance (handy for seeding data), and we pin the locale to English so text
 * assertions are deterministic.
 */
export function renderWithApp(component: Component, arrange?: () => void) {
  const pinia = createPinia();
  setActivePinia(pinia);
  i18n.global.locale.value = 'en';
  // Seed stores here — BEFORE mounting — so the component renders already
  // depending on the data, instead of us mutating it after mount (which races
  // the render).
  arrange?.();
  return render(component, {
    global: { plugins: [pinia, i18n] },
  });
}
