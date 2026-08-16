<script setup lang="ts">
import { useId } from 'vue';

withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    type?: string;
    placeholder?: string;
    hint?: string;
    invalid?: boolean;
    required?: boolean;
  }>(),
  { type: 'text', invalid: false, required: false },
);

defineEmits<{ 'update:modelValue': [value: string] }>();

// Stable unique id so the <label> and its help text link to the input.
const id = useId();
const hintId = `${id}-hint`;
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label">
      {{ label }}
      <span v-if="required" aria-hidden="true" class="field__req">*</span>
    </label>
    <input
      :id="id"
      class="field__input"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="invalid || undefined"
      :aria-describedby="hint ? hintId : undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="hint" :id="hintId" class="field__hint">{{ hint }}</p>
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
.field__req {
  color: var(--c-high);
}
.field__input {
  height: 38px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--c-text);
  background: var(--c-surface);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--radius-sm);
  transition: border-color 0.15s;
}
.field__input::placeholder {
  color: var(--c-text-subtle);
}
.field__input[aria-invalid='true'] {
  border-color: var(--c-high);
}
.field__hint {
  font-size: 12px;
  color: var(--c-text-muted);
}
</style>
