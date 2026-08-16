<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }>(),
  { variant: 'primary', type: 'button', disabled: false },
);
</script>

<template>
  <button :type="type" :disabled="disabled" :class="['btn', `btn--${variant}`]">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, opacity 0.15s;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn--primary {
  background: var(--c-primary);
  color: var(--c-primary-text);
}
.btn--primary:not(:disabled):hover {
  background: var(--c-primary-hover);
}
.btn--secondary {
  background: var(--c-surface);
  border-color: var(--c-border-strong);
  color: var(--c-text);
}
.btn--secondary:not(:disabled):hover {
  background: var(--c-surface-2);
}
.btn--ghost {
  background: transparent;
  color: var(--c-text-muted);
}
.btn--ghost:not(:disabled):hover {
  background: var(--c-surface-2);
  color: var(--c-text);
}
.btn--danger {
  background: transparent;
  border-color: var(--c-high);
  color: var(--c-high);
}
.btn--danger:not(:disabled):hover {
  background: var(--c-high-weak);
}
</style>
