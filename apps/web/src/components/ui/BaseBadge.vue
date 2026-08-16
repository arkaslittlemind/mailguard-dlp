<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'high' | 'medium' | 'low' | 'success' | 'primary' | 'neutral';
  }>(),
  { tone: 'neutral' },
);
</script>

<template>
  <span :class="['badge', `badge--${tone}`]"><slot /></span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.6;
  white-space: nowrap;
}
.badge--high {
  background: var(--c-high-weak);
  color: var(--c-high);
}
.badge--medium {
  background: var(--c-medium-weak);
  color: var(--c-medium);
}
.badge--low {
  background: var(--c-low-weak);
  color: var(--c-low);
}
.badge--success {
  background: var(--c-success-weak);
  color: var(--c-success);
}
.badge--primary {
  background: var(--c-primary-weak);
  color: var(--c-primary);
}
.badge--neutral {
  background: var(--c-surface-2);
  color: var(--c-text-muted);
}
</style>
