import { describe, expect, it } from 'vitest';
import { policyInputSchema, ruleDefinitionSchema } from './policy.js';

describe('ruleDefinitionSchema (discriminated union)', () => {
  it('accepts a valid keyword rule and applies the caseSensitive default', () => {
    const parsed = ruleDefinitionSchema.parse({ type: 'keyword', term: 'confidential' });
    expect(parsed).toEqual({ type: 'keyword', term: 'confidential', caseSensitive: false });
  });

  it('rejects an unknown rule type', () => {
    expect(() => ruleDefinitionSchema.parse({ type: 'telepathy', term: 'x' })).toThrow();
  });

  it('rejects invalid regex flags', () => {
    const result = ruleDefinitionSchema.safeParse({ type: 'regex', pattern: '\\d+', flags: 'zzz' });
    expect(result.success).toBe(false);
  });

  it('requires at least one domain for a recipientDomain rule', () => {
    const result = ruleDefinitionSchema.safeParse({
      type: 'recipientDomain',
      mode: 'blocklist',
      domains: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('policyInputSchema', () => {
  it('accepts a well-formed policy input and defaults enabled to true', () => {
    const parsed = policyInputSchema.parse({
      name: 'Block credit cards',
      action: 'block',
      definition: { type: 'pii', detector: 'credit_card' },
    });
    expect(parsed.enabled).toBe(true);
    expect(parsed.action).toBe('block');
  });

  it('rejects an empty name', () => {
    const result = policyInputSchema.safeParse({
      name: '',
      action: 'warn',
      definition: { type: 'pii', detector: 'email' },
    });
    expect(result.success).toBe(false);
  });
});
