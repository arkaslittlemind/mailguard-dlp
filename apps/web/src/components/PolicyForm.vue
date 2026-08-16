<script setup lang="ts">
import {
  type PiiDetector,
  type Policy,
  type PolicyAction,
  type PolicyInput,
  type RuleDefinition,
  policyInputSchema,
} from '@mailguard/schemas';
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseButton from './ui/BaseButton.vue';
import BaseSelect from './ui/BaseSelect.vue';
import BaseTextField from './ui/BaseTextField.vue';
import BaseToggle from './ui/BaseToggle.vue';

const props = defineProps<{ policy?: Policy | null }>();
const emit = defineEmits<{ save: [input: PolicyInput]; cancel: [] }>();

const { t } = useI18n();

// Select fields are kept as plain strings to avoid v-model union-type friction;
// the values are validated by Zod on submit anyway.
const form = reactive({
  name: '',
  description: '',
  action: 'block',
  enabled: true,
  type: 'keyword',
  term: '',
  caseSensitive: false,
  pattern: '',
  flags: 'g',
  detector: 'credit_card',
  mode: 'blocklist',
  domainsText: '',
  extensionsText: '',
  maxSizeText: '',
});

const formError = ref<string | null>(null);

const typeOptions = computed(() =>
  (['keyword', 'regex', 'pii', 'recipientDomain', 'attachment'] as const).map((value) => ({
    value,
    label: t(`policy.types.${value}`),
  })),
);
const actionOptions = computed(() =>
  (['block', 'warn', 'log'] as const).map((value) => ({ value, label: t(`actions.${value}`) })),
);
const detectorOptions = computed(() =>
  (['credit_card', 'email', 'phone', 'national_id'] as const).map((value) => ({
    value,
    label: t(`policy.detectors.${value}`),
  })),
);
const modeOptions = computed(() =>
  (['blocklist', 'allowlist'] as const).map((value) => ({
    value,
    label: t(`policy.modes.${value}`),
  })),
);

const splitList = (text: string) =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

function buildDefinition(): RuleDefinition {
  switch (form.type) {
    case 'regex':
      return { type: 'regex', pattern: form.pattern, flags: form.flags || 'g' };
    case 'pii':
      return { type: 'pii', detector: form.detector as PiiDetector };
    case 'recipientDomain':
      return {
        type: 'recipientDomain',
        mode: form.mode === 'allowlist' ? 'allowlist' : 'blocklist',
        domains: splitList(form.domainsText),
      };
    case 'attachment':
      return {
        type: 'attachment',
        blockedExtensions: splitList(form.extensionsText),
        maxSizeBytes: form.maxSizeText ? Number(form.maxSizeText) : undefined,
      };
    default:
      return { type: 'keyword', term: form.term, caseSensitive: form.caseSensitive };
  }
}

function onSubmit(): void {
  formError.value = null;
  const input: PolicyInput = {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    enabled: form.enabled,
    action: form.action as PolicyAction,
    definition: buildDefinition(),
  };
  const parsed = policyInputSchema.safeParse(input);
  if (!parsed.success) {
    formError.value = parsed.error.issues[0]?.message ?? 'Invalid policy';
    return;
  }
  emit('save', parsed.data);
}

function hydrate(p: Policy): void {
  form.name = p.name;
  form.description = p.description ?? '';
  form.enabled = p.enabled;
  form.action = p.action;
  const d = p.definition;
  form.type = d.type;
  if (d.type === 'keyword') {
    form.term = d.term;
    form.caseSensitive = d.caseSensitive;
  } else if (d.type === 'regex') {
    form.pattern = d.pattern;
    form.flags = d.flags;
  } else if (d.type === 'pii') {
    form.detector = d.detector;
  } else if (d.type === 'recipientDomain') {
    form.mode = d.mode;
    form.domainsText = d.domains.join(', ');
  } else if (d.type === 'attachment') {
    form.extensionsText = d.blockedExtensions.join(', ');
    form.maxSizeText = d.maxSizeBytes ? String(d.maxSizeBytes) : '';
  }
}

onMounted(() => {
  if (props.policy) hydrate(props.policy);
});
</script>

<template>
  <form class="policy-form" @submit.prevent="onSubmit">
    <h2 class="policy-form__title">
      {{ props.policy ? t('policy.editTitle') : t('policy.newTitle') }}
    </h2>

    <BaseTextField v-model="form.name" :label="t('policy.name')" required />
    <BaseTextField v-model="form.description" :label="t('policy.description')" />

    <div class="policy-form__row">
      <BaseSelect v-model="form.type" :label="t('policy.type')" :options="typeOptions" />
      <BaseSelect v-model="form.action" :label="t('policy.action')" :options="actionOptions" />
    </div>

    <!-- Fields specific to the chosen rule type. -->
    <template v-if="form.type === 'keyword'">
      <BaseTextField v-model="form.term" :label="t('policy.fields.term')" required />
      <BaseToggle v-model="form.caseSensitive" :label="t('policy.fields.caseSensitive')" />
    </template>

    <template v-else-if="form.type === 'regex'">
      <div class="policy-form__row">
        <BaseTextField v-model="form.pattern" :label="t('policy.fields.pattern')" required />
        <BaseTextField v-model="form.flags" :label="t('policy.fields.flags')" />
      </div>
    </template>

    <template v-else-if="form.type === 'pii'">
      <BaseSelect v-model="form.detector" :label="t('policy.fields.detector')" :options="detectorOptions" />
    </template>

    <template v-else-if="form.type === 'recipientDomain'">
      <BaseSelect v-model="form.mode" :label="t('policy.fields.mode')" :options="modeOptions" />
      <BaseTextField
        v-model="form.domainsText"
        :label="t('policy.fields.domains')"
        placeholder="corp.example, partner.example"
        required
      />
    </template>

    <template v-else-if="form.type === 'attachment'">
      <BaseTextField
        v-model="form.extensionsText"
        :label="t('policy.fields.blockedExtensions')"
        placeholder="exe, bat, js"
      />
      <BaseTextField
        v-model="form.maxSizeText"
        :label="t('policy.fields.maxSizeBytes')"
        type="number"
      />
    </template>

    <p v-if="formError" class="policy-form__error" role="alert">{{ formError }}</p>

    <div class="policy-form__actions">
      <BaseButton variant="secondary" type="button" @click="emit('cancel')">
        {{ t('common.cancel') }}
      </BaseButton>
      <BaseButton type="submit">{{ t('common.save') }}</BaseButton>
    </div>
  </form>
</template>

<style scoped>
.policy-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.policy-form__title {
  font-size: 16px;
  font-weight: 700;
}
.policy-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.policy-form__error {
  font-size: 13px;
  color: var(--c-high);
}
.policy-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
@media (max-width: 560px) {
  .policy-form__row {
    grid-template-columns: 1fr;
  }
}
</style>
