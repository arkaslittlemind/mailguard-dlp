<script setup lang="ts">
import { useId } from 'vue';

defineProps<{
  modelValue: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}>();

defineEmits<{ 'update:modelValue': [value: string] }>();

const id = useId();
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label">{{ label }}</label>
    <select
      :id="id"
      class="field__input"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
}
.field__input {
  height: 38px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--c-text);
  background: var(--c-surface);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--radius-sm);
}
</style>
