<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge.vue';
import { useAuditStore } from '@/stores/audit';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const store = useAuditStore();

onMounted(() => {
  void store.fetchAll();
});

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(locale.value);
}
</script>

<template>
  <section>
    <h1 class="title">{{ t('audit.title') }}</h1>

    <p v-if="store.loading" class="state">{{ t('common.loading') }}</p>
    <p v-else-if="store.items.length === 0" class="state">{{ t('common.empty') }}</p>

    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>{{ t('audit.subject') }}</th>
            <th>{{ t('audit.recipients') }}</th>
            <th>{{ t('audit.outcome') }}</th>
            <th>{{ t('audit.violations') }}</th>
            <th>{{ t('audit.when') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in store.items" :key="record.id">
            <td>{{ record.subject || '—' }}</td>
            <td>{{ record.recipientCount }}</td>
            <td>
              <BaseBadge :tone="record.blocked ? 'high' : 'success'">
                {{ record.blocked ? t('audit.blocked') : t('audit.allowed') }}
              </BaseBadge>
            </td>
            <td>{{ record.violations.length }}</td>
            <td class="table__time">{{ formatTime(record.scannedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 18px;
}
.state {
  padding: 24px 0;
  color: var(--c-text-muted);
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.table th {
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--c-text-subtle);
  padding: 10px 14px;
  background: var(--c-surface-2);
}
.table td {
  padding: 10px 14px;
  border-top: 1px solid var(--c-border);
}
.table__time {
  color: var(--c-text-muted);
  white-space: nowrap;
}
</style>
