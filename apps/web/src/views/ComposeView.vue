<script setup lang="ts">
import ViolationList from '@/components/ViolationList.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseTextField from '@/components/ui/BaseTextField.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import { useAuditStore } from '@/stores/audit';
import { useComposerStore } from '@/stores/composer';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const composer = useComposerStore();
const audit = useAuditStore();

const newFilename = ref('');
const newSize = ref('');

const live = computed(() => composer.liveResult);
const canSend = computed(
  () => composer.toList.length > 0 && !live.value.blocked && composer.sendState !== 'sending',
);

function addAttachment(): void {
  if (!newFilename.value.trim()) return;
  composer.addAttachment({
    filename: newFilename.value.trim(),
    sizeBytes: Number(newSize.value) || 0,
  });
  newFilename.value = '';
  newSize.value = '';
}

async function onSend(): Promise<void> {
  await composer.send();
  // Keep the audit log fresh after each send attempt.
  await audit.fetchAll();
}
</script>

<template>
  <section class="compose">
    <div class="compose__form">
      <h1 class="compose__title">{{ t('nav.compose') }}</h1>

      <BaseTextField
        v-model="composer.recipients"
        :label="t('compose.to')"
        :hint="t('compose.toHint')"
        placeholder="alice@corp.example, bob@corp.example"
      />
      <BaseTextField v-model="composer.subject" :label="t('compose.subject')" />
      <BaseTextarea v-model="composer.body" :label="t('compose.body')" :rows="8" />

      <div class="attachments">
        <p class="attachments__label">{{ t('compose.attachments') }}</p>
        <ul v-if="composer.attachments.length" class="attachments__list">
          <li v-for="(a, i) in composer.attachments" :key="i" class="attachments__item">
            <span>{{ a.filename }} <small>({{ a.sizeBytes }} B)</small></span>
            <BaseButton variant="ghost" @click="composer.removeAttachment(i)">✕</BaseButton>
          </li>
        </ul>
        <div class="attachments__add">
          <BaseTextField v-model="newFilename" :label="t('compose.filename')" placeholder="report.pdf" />
          <BaseTextField v-model="newSize" :label="t('compose.size')" type="number" />
          <BaseButton variant="secondary" @click="addAttachment">{{ t('compose.addAttachment') }}</BaseButton>
        </div>
      </div>

      <div class="compose__send">
        <BaseButton :disabled="!canSend" @click="onSend">
          {{ composer.sendState === 'sending' ? t('compose.sending') : t('compose.send') }}
        </BaseButton>
      </div>

      <!-- API/result banner — kept visually separate from the live check below. -->
      <p v-if="composer.sendState === 'sent'" class="banner banner--ok" role="status">
        {{ t('compose.sent') }}
      </p>
      <p v-else-if="composer.sendState === 'warned'" class="banner banner--warn" role="status">
        {{ t('compose.warned') }}
      </p>
      <p v-else-if="composer.sendState === 'error'" class="banner banner--err" role="alert">
        {{ composer.sendError }}
      </p>
    </div>

    <BaseCard class="compose__live" as="aside">
      <h2 class="compose__live-title">{{ t('compose.liveHeading') }}</h2>
      <p
        v-if="live.blocked"
        class="banner banner--err"
        role="status"
        aria-live="polite"
      >
        {{ t('compose.blocked') }}
      </p>
      <p v-else-if="live.violations.length === 0" class="live-clean" role="status" aria-live="polite">
        ✓ {{ t('compose.clean') }}
      </p>
      <ViolationList v-if="live.violations.length" :violations="live.violations" />
    </BaseCard>
  </section>
</template>

<style scoped>
.compose {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
}
.compose__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.compose__title {
  font-size: 22px;
  font-weight: 700;
}
.attachments {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.attachments__label {
  font-size: 13px;
  font-weight: 600;
}
.attachments__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.attachments__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 8px;
  background: var(--c-surface-2);
  border-radius: var(--radius-sm);
}
.attachments__add {
  display: grid;
  grid-template-columns: 1fr 120px auto;
  gap: 8px;
  align-items: end;
}
.compose__send {
  display: flex;
  justify-content: flex-end;
}
.compose__live {
  position: sticky;
  top: 20px;
}
.compose__live-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
}
.live-clean {
  font-size: 14px;
  color: var(--c-success);
}
.banner {
  font-size: 14px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
}
.banner--ok {
  background: var(--c-success-weak);
  color: var(--c-success);
}
.banner--warn {
  background: var(--c-medium-weak);
  color: var(--c-medium);
}
.banner--err {
  background: var(--c-high-weak);
  color: var(--c-high);
}
@media (max-width: 720px) {
  .compose {
    grid-template-columns: 1fr;
  }
  .attachments__add {
    grid-template-columns: 1fr;
  }
}
</style>
