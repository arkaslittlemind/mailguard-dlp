/**
 * The Luhn checksum — the same algorithm banks use to catch mistyped card
 * numbers. We use it so the credit-card detector doesn't fire on any random
 * 16-digit string, only on ones that could actually be a card. This is what
 * keeps false positives (and noisy DLP alerts) down.
 *
 * @param value digits only, or with spaces/dashes already stripped by the caller
 */
export function isValidLuhn(value: string): boolean {
  const digits = value.replace(/[\s-]/g, '');
  if (!/^\d+$/.test(digits) || digits.length < 12 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let double = false;
  // Walk right-to-left, doubling every second digit.
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48; // '0' is char code 48
    if (double) {
      d *= 2;
      if (d > 9) d -= 9; // same as summing the two digits of the doubled value
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}
