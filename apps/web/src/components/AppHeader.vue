<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import { type AppLocale, setLocale } from '@/i18n';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const { theme, cycle } = useTheme();

const navItems = [
  { name: 'policies', key: 'nav.policies' },
  { name: 'compose', key: 'nav.compose' },
  { name: 'audit', key: 'nav.audit' },
] as const;

const themeLabel = computed(() =>
  theme.value === 'light' ? '☀︎' : theme.value === 'dark' ? '☾' : '◐',
);

function onLocaleChange(event: Event): void {
  setLocale((event.target as HTMLSelectElement).value as AppLocale);
}
</script>

<template>
  <header class="header">
    <div class="header__brand">
      <span class="header__logo" aria-hidden="true">🛡️</span>
      <div>
        <p class="header__title">{{ t('app.title') }}</p>
        <p class="header__tagline">{{ t('app.tagline') }}</p>
      </div>
    </div>

    <nav class="header__nav" :aria-label="t('app.title')">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="header__link"
      >
        {{ t(item.key) }}
      </RouterLink>
    </nav>

    <div class="header__controls">
      <label class="sr-only" for="locale-select">{{ t('locale.label') }}</label>
      <select
        id="locale-select"
        class="header__locale"
        :value="locale"
        @change="onLocaleChange"
      >
        <option value="en">EN</option>
        <option value="ja">日本語</option>
      </select>
      <button type="button" class="header__theme" :title="t('theme.toggle')" @click="cycle">
        <span aria-hidden="true">{{ themeLabel }}</span>
        <span class="sr-only">{{ t('theme.toggle') }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 24px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
}
.header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header__logo {
  font-size: 22px;
}
.header__title {
  font-size: 15px;
  font-weight: 700;
}
.header__tagline {
  font-size: 12px;
  color: var(--c-text-muted);
}
.header__nav {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}
.header__link {
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-muted);
}
.header__link:hover {
  background: var(--c-surface-2);
  color: var(--c-text);
}
.header__link.router-link-active {
  background: var(--c-primary-weak);
  color: var(--c-primary);
}
.header__controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.header__locale {
  height: 34px;
  padding: 0 8px;
  font-size: 13px;
  color: var(--c-text);
  background: var(--c-surface);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--radius-sm);
}
.header__theme {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: var(--c-surface);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--c-text);
}
.header__theme:hover {
  background: var(--c-surface-2);
}
@media (max-width: 640px) {
  .header {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
