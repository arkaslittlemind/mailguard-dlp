<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  label: string;
  /** When true the visible label is hidden but still read by screen readers. */
  hideLabel?: boolean;
}>();

defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <label class="toggle">
    <input
      type="checkbox"
      role="switch"
      class="toggle__input sr-only"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="toggle__track" aria-hidden="true"><span class="toggle__thumb" /></span>
    <span :class="hideLabel ? 'sr-only' : 'toggle__text'">{{ label }}</span>
  </label>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.toggle__track {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: var(--c-border-strong);
  padding: 2px;
  transition: background-color 0.15s;
}
.toggle__thumb {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s;
}
.toggle__input:checked + .toggle__track {
  background: var(--c-primary);
}
.toggle__input:checked + .toggle__track .toggle__thumb {
  transform: translateX(16px);
}
.toggle__input:focus-visible + .toggle__track {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}
.toggle__text {
  font-size: 13px;
  color: var(--c-text-muted);
}
</style>
