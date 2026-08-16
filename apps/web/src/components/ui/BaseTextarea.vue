<script setup lang="ts">
import { useId } from 'vue';

withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    rows?: number;
    placeholder?: string;
    invalid?: boolean;
  }>(),
  { rows: 6, invalid: false },
);

defineEmits<{ 'update:modelValue': [value: string] }>();

const id = useId();
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label">{{ label }}</label>
    <textarea
      :id="id"
      class="field__input"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-invalid="invalid || undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
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
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  color: var(--c-text);
  background: var(--c-surface);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--radius-sm);
  resize: vertical;
}
.field__input[aria-invalid='true'] {
  border-color: var(--c-high);
}
</style>
