import type { EmailDraft, Policy, RuleDefinition } from '@mailguard/schemas';
import { describe, expect, it } from 'vitest';
import { scanEmail } from './engine.js';

let idCounter = 0;
function makePolicy(definition: RuleDefinition, overrides: Partial<Policy> = {}): Policy {
  idCounter += 1;
  return {
    id: `00000000-0000-0000-0000-${String(idCounter).padStart(12, '0')}`,
    name: overrides.name ?? `Policy ${idCounter}`,
    enabled: overrides.enabled ?? true,
    action: overrides.action ?? 'block',
    definition,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function email(partial: Partial<EmailDraft> = {}): EmailDraft {
  return { to: [], subject: '', body: '', attachments: [], ...partial };
}

describe('scanEmail — PII credit card', () => {
  const policy = makePolicy({ type: 'pii', detector: 'credit_card' });

  it('flags a Luhn-valid card in the body and blocks', () => {
    const result = scanEmail(email({ body: 'card: 4111 1111 1111 1111 thanks' }), [policy]);
    expect(result.blocked).toBe(true);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]?.severity).toBe('high');
    expect(result.violations[0]?.message).toContain('credit card');
    expect(result.violations[0]?.matches[0]?.field).toBe('body');
  });

  it('does NOT flag a 16-digit number that fails Luhn (false-positive guard)', () => {
    const result = scanEmail(email({ body: 'ref 4111 1111 1111 1112 only' }), [policy]);
    expect(result.violations).toHaveLength(0);
    expect(result.blocked).toBe(false);
  });
});

describe('scanEmail — keyword', () => {
  it('matches case-insensitively by default', () => {
    const policy = makePolicy({ type: 'keyword', term: 'Confidential', caseSensitive: false });
    const result = scanEmail(email({ body: 'this is confidential' }), [policy]);
    expect(result.violations).toHaveLength(1);
  });

  it('respects caseSensitive', () => {
    const policy = makePolicy({ type: 'keyword', term: 'Confidential', caseSensitive: true });
    const result = scanEmail(email({ body: 'this is confidential' }), [policy]);
    expect(result.violations).toHaveLength(0);
  });
});

describe('scanEmail — regex', () => {
  it('matches a valid user pattern', () => {
    const policy = makePolicy({ type: 'regex', pattern: 'PROJECT-\\d+', flags: 'g' });
    const result = scanEmail(email({ subject: 'about PROJECT-42' }), [policy]);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]?.matches[0]?.field).toBe('subject');
  });

  it('treats an invalid pattern as never-matching instead of throwing', () => {
    const policy = makePolicy({ type: 'regex', pattern: '(', flags: 'g' });
    expect(() => scanEmail(email({ body: 'anything (' }), [policy])).not.toThrow();
  });
});

describe('scanEmail — recipient domain', () => {
  it('blocklist flags recipients on a blocked domain', () => {
    const policy = makePolicy({
      type: 'recipientDomain',
      mode: 'blocklist',
      domains: ['gmail.com'],
    });
    const result = scanEmail(email({ to: ['a@gmail.com', 'b@corp.com'] }), [policy]);
    expect(result.violations[0]?.matches).toHaveLength(1);
    expect(result.violations[0]?.matches[0]?.snippet).toBe('a@gmail.com');
  });

  it('allowlist flags recipients outside the allowed domains', () => {
    const policy = makePolicy({
      type: 'recipientDomain',
      mode: 'allowlist',
      domains: ['corp.com'],
    });
    const result = scanEmail(email({ to: ['a@gmail.com', 'b@corp.com'] }), [policy]);
    expect(result.violations[0]?.matches).toHaveLength(1);
    expect(result.violations[0]?.matches[0]?.snippet).toBe('a@gmail.com');
  });
});

describe('scanEmail — attachments', () => {
  it('flags a blocked extension', () => {
    const policy = makePolicy({ type: 'attachment', blockedExtensions: ['exe'] });
    const result = scanEmail(email({ attachments: [{ filename: 'setup.EXE', sizeBytes: 10 }] }), [
      policy,
    ]);
    expect(result.violations).toHaveLength(1);
  });

  it('flags an attachment over the size limit', () => {
    const policy = makePolicy({ type: 'attachment', blockedExtensions: [], maxSizeBytes: 100 });
    const result = scanEmail(email({ attachments: [{ filename: 'big.pdf', sizeBytes: 500 }] }), [
      policy,
    ]);
    expect(result.violations).toHaveLength(1);
  });
});

describe('scanEmail — orchestration', () => {
  it('skips disabled policies', () => {
    const policy = makePolicy(
      { type: 'keyword', term: 'secret', caseSensitive: false },
      { enabled: false },
    );
    const result = scanEmail(email({ body: 'secret' }), [policy]);
    expect(result.violations).toHaveLength(0);
  });

  it('a warn action does not block and is medium severity', () => {
    const policy = makePolicy(
      { type: 'keyword', term: 'draft', caseSensitive: false },
      { action: 'warn' },
    );
    const result = scanEmail(email({ body: 'draft' }), [policy]);
    expect(result.blocked).toBe(false);
    expect(result.violations[0]?.severity).toBe('medium');
  });

  it('collects violations from multiple policies', () => {
    const a = makePolicy(
      { type: 'keyword', term: 'secret', caseSensitive: false },
      { action: 'warn' },
    );
    const b = makePolicy({ type: 'pii', detector: 'credit_card' }, { action: 'block' });
    const result = scanEmail(email({ body: 'secret 4111 1111 1111 1111' }), [a, b]);
    expect(result.violations).toHaveLength(2);
    expect(result.blocked).toBe(true);
  });

  it('returns no violations for a clean email', () => {
    const policy = makePolicy({ type: 'pii', detector: 'credit_card' });
    const result = scanEmail(email({ subject: 'Lunch?', body: 'See you at noon.' }), [policy]);
    expect(result.violations).toHaveLength(0);
    expect(result.blocked).toBe(false);
  });
});
