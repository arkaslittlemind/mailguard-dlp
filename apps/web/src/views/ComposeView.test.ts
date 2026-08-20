import type { Policy } from '@mailguard/schemas';
import { fireEvent, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import { usePoliciesStore } from '@/stores/policies';
import { renderWithApp } from '@/test/render';
import ComposeView from './ComposeView.vue';

// A single enabled policy that blocks credit-card numbers, to scan against.
function creditCardPolicy(): Policy {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Block credit card numbers',
    enabled: true,
    action: 'block',
    definition: { type: 'pii', detector: 'credit_card' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };
}

// `fireEvent.update` is Testing Library for Vue's v-model-aware way to set an
// input's value — it sets the value AND flushes reactivity, which plain
// keystroke simulation can get wrong on controlled (v-model) inputs.
const type = (name: string, value: string) =>
  fireEvent.update(screen.getByRole('textbox', { name }), value);

// Seed the policies the composer scans against, before mount. No network
// needed: the live scan is a pure function of the draft + enabled policies.
const withCreditCardPolicy = () => {
  usePoliciesStore().items = [creditCardPolicy()];
};

describe('ComposeView — live scanning', () => {
  it('flags a credit-card number as you type and blocks sending', async () => {
    renderWithApp(ComposeView, withCreditCardPolicy);

    await type('Message', 'my card is 4111 1111 1111 1111');

    // The live panel shows the violation message. We match the message text
    // specifically — matching just /credit card/i would ALSO hit the policy's
    // name ("Block credit card numbers"), and findByText errors on 2+ matches.
    expect(await screen.findByText(/contains a credit card/i)).toBeInTheDocument();
    // …warns that sending is blocked…
    expect(screen.getByText(/sending blocked/i)).toBeInTheDocument();
    // …and disables the Send button.
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('shows an all-clear for a clean message', async () => {
    renderWithApp(ComposeView, withCreditCardPolicy);

    await type('Message', 'see you at noon');

    expect(await screen.findByText(/no policy violations/i)).toBeInTheDocument();
    expect(screen.queryByText(/contains a credit card/i)).not.toBeInTheDocument();
  });
});
