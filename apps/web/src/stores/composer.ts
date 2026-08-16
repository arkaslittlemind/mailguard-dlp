import { api } from '@/api/client';
import { scanEmail } from '@mailguard/dlp-engine';
import type { Attachment, EmailDraft, ScanResult } from '@mailguard/schemas';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { usePoliciesStore } from './policies';

export type SendState = 'idle' | 'sending' | 'sent' | 'warned' | 'blocked' | 'error';

export const useComposerStore = defineStore('composer', () => {
  const policiesStore = usePoliciesStore();

  const recipients = ref(''); // raw comma-separated text as typed
  const subject = ref('');
  const body = ref('');
  const attachments = ref<Attachment[]>([]);

  const sendState = ref<SendState>('idle');
  const sendError = ref<string | null>(null);

  const toList = computed(() =>
    recipients.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const draft = computed<EmailDraft>(() => ({
    to: toList.value,
    subject: subject.value,
    body: body.value,
    attachments: attachments.value,
  }));

  /**
   * Instant client-side scan for inline feedback. This recomputes on every
   * keystroke because it derives from the reactive draft + enabled policies —
   * the same "derive, don't store" idea, now in Vue.
   */
  const liveResult = computed<ScanResult>(() => scanEmail(draft.value, policiesStore.enabled));

  function addAttachment(a: Attachment): void {
    attachments.value = [...attachments.value, a];
  }
  function removeAttachment(index: number): void {
    attachments.value = attachments.value.filter((_, i) => i !== index);
  }
  function reset(): void {
    recipients.value = '';
    subject.value = '';
    body.value = '';
    attachments.value = [];
    sendState.value = 'idle';
    sendError.value = null;
  }

  /** Authoritative server-side scan; the outcome drives the send state. */
  async function send(): Promise<ScanResult | null> {
    sendState.value = 'sending';
    sendError.value = null;
    try {
      const result = await api.scan({ email: draft.value });
      sendState.value = result.blocked
        ? 'blocked'
        : result.violations.length > 0
          ? 'warned'
          : 'sent';
      return result;
    } catch (e) {
      sendState.value = 'error';
      sendError.value = e instanceof Error ? e.message : String(e);
      return null;
    }
  }

  return {
    recipients,
    subject,
    body,
    attachments,
    sendState,
    sendError,
    toList,
    draft,
    liveResult,
    addAttachment,
    removeAttachment,
    reset,
    send,
  };
});
