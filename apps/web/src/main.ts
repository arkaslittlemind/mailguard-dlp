import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { i18n, setLocale } from './i18n';
import { enableMocks } from './mocks/browser';
import { router } from './router';
import './style.css';

async function bootstrap(): Promise<void> {
  // Start the in-browser mock API before mounting so the first data fetch works.
  await enableMocks();

  // Keep <html lang> in sync with the active locale for accessibility.
  setLocale(i18n.global.locale.value);

  createApp(App).use(createPinia()).use(router).use(i18n).mount('#app');
}

void bootstrap();
