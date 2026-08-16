<script setup lang="ts">
import type { PolicyAction, Violation } from '@mailguard/schemas';
import { useI18n } from 'vue-i18n';
import BaseBadge from './ui/BaseBadge.vue';

defineProps<{ violations: Violation[] }>();

const { t } = useI18n();

const actionTone = (action: PolicyAction) =>
  action === 'block' ? 'high' : action === 'warn' ? 'medium' : 'neutral';
</script>

<template>
  <ul class="violations">
    <li v-for="(v, i) in violations" :key="`${v.policyId}-${i}`" class="violation">
      <div class="violation__head">
        <BaseBadge :tone="v.severity">{{ t(`severity.${v.severity}`) }}</BaseBadge>
        <BaseBadge :tone="actionTone(v.action)">{{ t(`actions.${v.action}`) }}</BaseBadge>
        <span class="violation__name">{{ v.policyName }}</span>
      </div>
      <p class="violation__msg">{{ v.message }}</p>
      <ul v-if="v.matches.length" class="violation__matches">
        <li v-for="(m, mi) in v.matches" :key="mi" class="violation__match">
          <code>{{ m.field }}</code>
          <span>“{{ m.snippet }}”</span>
        </li>
      </ul>
    </li>
  </ul>
</template>

<style scoped>
.violations {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.violation {
  border: 1px solid var(--c-border);
  border-left: 3px solid var(--c-border-strong);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  background: var(--c-surface);
}
.violation__head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.violation__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-muted);
}
.violation__msg {
  margin-top: 4px;
  font-size: 14px;
}
.violation__matches {
  list-style: none;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.violation__match {
  font-size: 12px;
  color: var(--c-text-muted);
  display: flex;
  gap: 6px;
}
.violation__match code {
  font-family: var(--font-mono);
  color: var(--c-text-subtle);
}
</style>
