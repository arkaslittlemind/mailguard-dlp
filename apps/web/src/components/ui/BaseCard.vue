<script setup lang="ts">
defineProps<{ as?: string }>();
</script>

<template>
  <component :is="as ?? 'div'" class="card">
    <slot />
  </component>
</template>

<style scoped>
.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 18px;
}
</style>
