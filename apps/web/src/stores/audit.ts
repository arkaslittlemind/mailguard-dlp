import { api } from '@/api/client';
import type { AuditRecord } from '@mailguard/schemas';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuditStore = defineStore('audit', () => {
  const items = ref<AuditRecord[]>([]);
  const loading = ref(false);

  async function fetchAll(): Promise<void> {
    loading.value = true;
    try {
      items.value = await api.listAudit();
    } finally {
      loading.value = false;
    }
  }

  return { items, loading, fetchAll };
});
