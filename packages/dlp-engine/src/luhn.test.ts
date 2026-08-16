import { describe, expect, it } from 'vitest';
import { isValidLuhn } from './luhn.js';

describe('isValidLuhn', () => {
  it.each([
    ['Visa test number', '4111111111111111'],
    ['Stripe test number', '4242424242424242'],
    ['Mastercard test number', '5555555555554444'],
    ['Amex (15 digits)', '378282246310005'],
    ['with spaces', '4111 1111 1111 1111'],
    ['with dashes', '4111-1111-1111-1111'],
  ])('accepts a valid number: %s', (_label, value) => {
    expect(isValidLuhn(value)).toBe(true);
  });

  it.each([
    ['one digit off', '4111111111111112'],
    ['too short', '4111'],
    ['too long', '41111111111111111111'],
    ['contains letters', '4111abcd11111111'],
    ['empty', ''],
  ])('rejects an invalid number: %s', (_label, value) => {
    expect(isValidLuhn(value)).toBe(false);
  });
});
