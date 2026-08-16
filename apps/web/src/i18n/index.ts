import { createI18n } from 'vue-i18n';
import en from './en.js';
import ja from './ja.js';

export type AppLocale = 'en' | 'ja';

const STORAGE_KEY = 'mailguard.locale';

function initialLocale(): AppLocale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'ja') return stored;
  return navigator.language.startsWith('ja') ? 'ja' : 'en';
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'en',
  messages: { en, ja },
});

export function setLocale(locale: AppLocale): void {
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.setAttribute('lang', locale);
}
