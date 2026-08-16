import type {
  EmailDraft,
  Match,
  Policy,
  PolicyAction,
  RuleDefinition,
  ScanField,
  ScanResult,
  Severity,
  Violation,
} from '@mailguard/schemas';
import { type TextMatch, findByDetector, findRegexMatches } from './detectors.js';

// Text rules scan the subject and body; recipient/attachment rules have their
// own fields.
const TEXT_FIELDS = ['subject', 'body'] as const satisfies readonly ScanField[];

function severityForAction(action: PolicyAction): Severity {
  switch (action) {
    case 'block':
      return 'high';
    case 'warn':
      return 'medium';
    case 'log':
      return 'low';
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

function textForField(email: EmailDraft, field: (typeof TEXT_FIELDS)[number]): string {
  return field === 'subject' ? email.subject : email.body;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Run a text-finder over both subject and body, tagging each hit with its field. */
function scanTextFields(email: EmailDraft, find: (text: string) => TextMatch[]): Match[] {
  const matches: Match[] = [];
  for (const field of TEXT_FIELDS) {
    for (const hit of find(textForField(email, field))) {
      matches.push({ field, snippet: hit.snippet, start: hit.start, end: hit.end });
    }
  }
  return matches;
}

function domainOf(recipient: string): string | null {
  const at = recipient.lastIndexOf('@');
  if (at === -1 || at === recipient.length - 1) return null;
  return recipient.slice(at + 1).toLowerCase();
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase();
}

/** Evaluate one rule definition against the email, returning every match. */
function evaluate(definition: RuleDefinition, email: EmailDraft): Match[] {
  switch (definition.type) {
    case 'keyword': {
      const flags = definition.caseSensitive ? 'g' : 'gi';
      const re = new RegExp(escapeRegExp(definition.term), flags);
      return scanTextFields(email, (text) => findRegexMatches(text, re));
    }
    case 'regex': {
      let re: RegExp;
      try {
        re = new RegExp(definition.pattern, definition.flags);
      } catch {
        // An invalid user-supplied pattern simply never matches.
        return [];
      }
      return scanTextFields(email, (text) => findRegexMatches(text, re));
    }
    case 'pii':
      return scanTextFields(email, (text) => findByDetector(definition.detector, text));
    case 'recipientDomain': {
      const set = new Set(definition.domains.map((d) => d.toLowerCase()));
      const matches: Match[] = [];
      for (const recipient of email.to) {
        const domain = domainOf(recipient);
        const inSet = domain !== null && set.has(domain);
        const violates = definition.mode === 'blocklist' ? inSet : !inSet;
        if (violates) {
          matches.push({ field: 'recipients', snippet: recipient });
        }
      }
      return matches;
    }
    case 'attachment': {
      const blocked = new Set(
        definition.blockedExtensions.map((e) => e.replace(/^\./, '').toLowerCase()),
      );
      const matches: Match[] = [];
      for (const attachment of email.attachments) {
        const tooBig =
          definition.maxSizeBytes !== undefined && attachment.sizeBytes > definition.maxSizeBytes;
        const badExt = blocked.has(extensionOf(attachment.filename));
        if (tooBig || badExt) {
          matches.push({ field: 'attachments', snippet: attachment.filename });
        }
      }
      return matches;
    }
    default: {
      const _exhaustive: never = definition;
      return _exhaustive;
    }
  }
}

function describe(policy: Policy, matchCount: number): string {
  const def = policy.definition;
  switch (def.type) {
    case 'keyword':
      return `Contains blocked keyword "${def.term}"`;
    case 'regex':
      return `Matches blocked pattern /${def.pattern}/${def.flags}`;
    case 'pii': {
      const labels: Record<typeof def.detector, string> = {
        credit_card: 'a credit card number',
        email: 'an email address',
        phone: 'a phone number',
        national_id: 'a national ID number',
      };
      return `Contains ${labels[def.detector]}`;
    }
    case 'recipientDomain':
      return def.mode === 'blocklist'
        ? `${matchCount} recipient(s) on a blocked domain`
        : `${matchCount} recipient(s) outside the allowed domains`;
    case 'attachment':
      return `${matchCount} attachment(s) not permitted`;
    default: {
      const _exhaustive: never = def;
      return _exhaustive;
    }
  }
}

/**
 * Scan an email against a set of policies.
 *
 * Pure and deterministic apart from the `scannedAt` timestamp — which is why it
 * runs unchanged both in the browser (for instant feedback while typing) and on
 * the server (as the authoritative check before "sending").
 */
export function scanEmail(email: EmailDraft, policies: Policy[]): ScanResult {
  const violations: Violation[] = [];

  for (const policy of policies) {
    if (!policy.enabled) continue;
    const matches = evaluate(policy.definition, email);
    if (matches.length === 0) continue;

    violations.push({
      policyId: policy.id,
      policyName: policy.name,
      ruleType: policy.definition.type,
      action: policy.action,
      severity: severityForAction(policy.action),
      message: describe(policy, matches.length),
      matches,
    });
  }

  return {
    blocked: violations.some((v) => v.action === 'block'),
    violations,
    scannedAt: new Date().toISOString(),
  };
}
