<script setup lang="ts">
import PolicyForm from '@/components/PolicyForm.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import { usePoliciesStore } from '@/stores/policies';
import type { Policy, PolicyAction, PolicyInput } from '@mailguard/schemas';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = usePoliciesStore();

const showForm = ref(false);
const editing = ref<Policy | null>(null);

const actionTone = (action: PolicyAction) =>
  action === 'block' ? 'high' : action === 'warn' ? 'medium' : 'neutral';

function openCreate(): void {
  editing.value = null;
  showForm.value = true;
}
function openEdit(policy: Policy): void {
  editing.value = policy;
  showForm.value = true;
}
function closeForm(): void {
  showForm.value = false;
  editing.value = null;
}

async function onSave(input: PolicyInput): Promise<void> {
  if (editing.value) await store.update(editing.value.id, input);
  else await store.create(input);
  closeForm();
}

async function onDelete(policy: Policy): Promise<void> {
  if (confirm(t('policy.deleteConfirm'))) await store.remove(policy.id);
}
</script>

<template>
  <section>
    <div class="head">
      <h1 class="head__title">{{ t('nav.policies') }}</h1>
      <BaseButton v-if="!showForm" @click="openCreate">＋ {{ t('common.add') }}</BaseButton>
    </div>

    <BaseCard v-if="showForm" class="form-card">
      <!-- key forces a fresh form instance when switching between create/edit -->
      <PolicyForm :key="editing?.id ?? 'new'" :policy="editing" @save="onSave" @cancel="closeForm" />
    </BaseCard>

    <p v-if="store.loading" class="state">{{ t('common.loading') }}</p>
    <div v-else-if="store.error" class="state state--error">
      <span>{{ store.error }}</span>
      <BaseButton variant="secondary" @click="store.fetchAll()">{{ t('common.retry') }}</BaseButton>
    </div>
    <p v-else-if="store.items.length === 0" class="state">{{ t('common.empty') }}</p>

    <ul v-else class="policies">
      <li v-for="policy in store.items" :key="policy.id">
        <BaseCard class="policy">
          <div class="policy__main">
            <div class="policy__badges">
              <BaseBadge tone="primary">{{ t(`policy.types.${policy.definition.type}`) }}</BaseBadge>
              <BaseBadge :tone="actionTone(policy.action)">{{ t(`actions.${policy.action}`) }}</BaseBadge>
            </div>
            <p class="policy__name">{{ policy.name }}</p>
            <p v-if="policy.description" class="policy__desc">{{ policy.description }}</p>
          </div>
          <div class="policy__side">
            <BaseToggle
              :model-value="policy.enabled"
              :label="policy.enabled ? t('common.enabled') : t('common.disabled')"
              @update:model-value="store.toggle(policy)"
            />
            <div class="policy__actions">
              <BaseButton variant="ghost" @click="openEdit(policy)">{{ t('common.edit') }}</BaseButton>
              <BaseButton variant="danger" @click="onDelete(policy)">{{ t('common.delete') }}</BaseButton>
            </div>
          </div>
        </BaseCard>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.head__title {
  font-size: 22px;
  font-weight: 700;
}
.form-card {
  margin-bottom: 18px;
}
.state {
  padding: 24px 0;
  color: var(--c-text-muted);
}
.state--error {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--c-high);
}
.policies {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.policy {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.policy__badges {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.policy__name {
  font-size: 15px;
  font-weight: 600;
}
.policy__desc {
  margin-top: 2px;
  font-size: 13px;
  color: var(--c-text-muted);
}
.policy__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.policy__actions {
  display: flex;
  gap: 4px;
}
@media (max-width: 560px) {
  .policy {
    flex-direction: column;
  }
  .policy__side {
    align-items: flex-start;
  }
}
</style>
