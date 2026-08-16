import { ref } from 'vue';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'mailguard.theme';

function stored(): Theme {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === 'light' || value === 'dark' ? value : 'system';
}

const theme = ref<Theme>(stored());

function apply(next: Theme): void {
  const root = document.documentElement;
  if (next === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', next);
}

apply(theme.value);

/** Shared theme state: light → dark → system → light. */
export function useTheme() {
  function setTheme(next: Theme): void {
    theme.value = next;
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  }
  function cycle(): void {
    setTheme(theme.value === 'light' ? 'dark' : theme.value === 'dark' ? 'system' : 'light');
  }
  return { theme, setTheme, cycle };
}
