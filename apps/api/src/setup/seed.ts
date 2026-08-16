import 'dotenv/config';
import type { Policy } from '@mailguard/schemas';
import { putPolicy } from '../db/policies.js';

/**
 * Inserts a starter set of policies. Uses FIXED ids so re-running overwrites the
 * same items (PutItem replaces by key) instead of piling up duplicates.
 */
const T = '2024-01-01T00:00:00.000Z';

const seed: Policy[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Block credit card numbers',
    description: 'Prevent card numbers (Luhn-validated) from leaving over email.',
    enabled: true,
    action: 'block',
    definition: { type: 'pii', detector: 'credit_card' },
    createdAt: T,
    updatedAt: T,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Internal recipients only',
    description: 'Only allow mail to corp.example addresses.',
    enabled: true,
    action: 'block',
    definition: { type: 'recipientDomain', mode: 'allowlist', domains: ['corp.example'] },
    createdAt: T,
    updatedAt: T,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Flag "confidential"',
    description: 'Warn when a message is marked confidential.',
    enabled: true,
    action: 'warn',
    definition: { type: 'keyword', term: 'confidential', caseSensitive: false },
    createdAt: T,
    updatedAt: T,
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Block executable attachments',
    enabled: true,
    action: 'block',
    definition: { type: 'attachment', blockedExtensions: ['exe', 'bat', 'js', 'scr'] },
    createdAt: T,
    updatedAt: T,
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Log phone numbers',
    description: 'Record (but allow) messages that contain phone numbers.',
    enabled: false,
    action: 'log',
    definition: { type: 'pii', detector: 'phone' },
    createdAt: T,
    updatedAt: T,
  },
];

async function main(): Promise<void> {
  console.log(`Seeding ${seed.length} policies …`);
  for (const policy of seed) {
    await putPolicy(policy);
    console.log(`✓ ${policy.name}`);
  }
  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
