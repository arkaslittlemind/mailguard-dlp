import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import BaseTextField from './BaseTextField.vue';

// `describe` groups related tests. `it` (alias of `test`) is one test case.
describe('BaseTextField', () => {
  it('uses its label as the input’s accessible name', () => {
    // 1. RENDER the component into a fake page, passing props.
    render(BaseTextField, { props: { modelValue: '', label: 'Username' } });

    // 2. FIND it the way a user (or screen reader) would: "the textbox
    //    called Username". getByRole throws if it can't find exactly one,
    //    which is itself a useful assertion.
    const input = screen.getByRole('textbox', { name: 'Username' });

    // 3. ASSERT something is true about it.
    expect(input).toBeInTheDocument();
  });

  it('tells the parent what the user typed (v-model)', async () => {
    const user = userEvent.setup();
    // `emitted` records the events the component fired.
    const { emitted } = render(BaseTextField, { props: { modelValue: '', label: 'Email' } });

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'a');

    // Typing one character should emit one `update:modelValue` with that value.
    expect(emitted()['update:modelValue']).toEqual([['a']]);
  });

  it('flags itself invalid for assistive tech when invalid=true', () => {
    render(BaseTextField, { props: { modelValue: 'x', label: 'Password', invalid: true } });

    // aria-invalid is what a screen reader announces as "invalid entry".
    expect(screen.getByRole('textbox', { name: 'Password' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
