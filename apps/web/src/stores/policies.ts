import { api } from '@/api/client';
import { type Policy, type PolicyInput, policyInputSchema } from '@mailguard/schemas';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

export const usePoliciesStore = defineStore('policies', () => {
  const items = ref<Policy[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** Only enabled policies take part in scanning. */
  const enabled = computed(() => items.value.filter((p) => p.enabled));

  async function fetchAll(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      items.value = await api.listPolicies();
    } catch (e) {
      error.value = errorMessage(e);
    } finally {
      loading.value = false;
    }
  }

  async function create(input: PolicyInput): Promise<void> {
    const created = await api.createPolicy(input);
    items.value = [created, ...items.value];
  }

  async function update(id: string, input: PolicyInput): Promise<void> {
    const updated = await api.updatePolicy(id, input);
    items.value = items.value.map((p) => (p.id === id ? updated : p));
  }

  async function remove(id: string): Promise<void> {
    await api.deletePolicy(id);
    items.value = items.value.filter((p) => p.id !== id);
  }

  /** Flip a policy's enabled flag (parsing back to input drops server-owned fields). */
  async function toggle(policy: Policy): Promise<void> {
    const input = policyInputSchema.parse({ ...policy, enabled: !policy.enabled });
    await update(policy.id, input);
  }

  return { items, loading, error, enabled, fetchAll, create, update, remove, toggle };
});
