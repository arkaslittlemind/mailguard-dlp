import type { Policy } from '@mailguard/schemas';

const T = '2024-01-01T00:00:00.000Z';

/** A believable starter set of DLP policies for the mock backend. */
export function seedPolicies(): Policy[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Block credit card numbers',
      description: 'Prevent card numbers (Luhn-validated) from leaving over email.',
      enabled: true,
      action: 'block',
      definition: { type: 'pii', detector: 'credit_card' },
      createdAt: T,
      updatedAt: T,
    },
    {
      id: crypto.randomUUID(),
      name: 'Internal recipients only',
      description: 'Only allow mail to corp.example addresses.',
      enabled: true,
      action: 'block',
      definition: { type: 'recipientDomain', mode: 'allowlist', domains: ['corp.example'] },
      createdAt: T,
      updatedAt: T,
    },
    {
      id: crypto.randomUUID(),
      name: 'Flag "confidential"',
      description: 'Warn when a message is marked confidential.',
      enabled: true,
      action: 'warn',
      definition: { type: 'keyword', term: 'confidential', caseSensitive: false },
      createdAt: T,
      updatedAt: T,
    },
    {
      id: crypto.randomUUID(),
      name: 'Block executable attachments',
      enabled: true,
      action: 'block',
      definition: { type: 'attachment', blockedExtensions: ['exe', 'bat', 'js', 'scr'] },
      createdAt: T,
      updatedAt: T,
    },
    {
      id: crypto.randomUUID(),
      name: 'Log phone numbers',
      description: 'Record (but allow) messages that contain phone numbers.',
      enabled: false,
      action: 'log',
      definition: { type: 'pii', detector: 'phone' },
      createdAt: T,
      updatedAt: T,
    },
  ];
}
