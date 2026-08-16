import type { PiiDetector } from '@mailguard/schemas';
import { isValidLuhn } from './luhn.js';

/** A hit within a single piece of text (offsets are relative to that text). */
export interface TextMatch {
  start: number;
  end: number;
  snippet: string;
}

/**
 * Run any RegExp over text and collect matches with their positions.
 * We always run in global mode (cloning the regex if needed) so `matchAll`
 * works, and skip zero-length matches so a loose pattern can't loop forever.
 */
export function findRegexMatches(text: string, re: RegExp): TextMatch[] {
  const global = re.global ? re : new RegExp(re.source, `${re.flags}g`);
  const out: TextMatch[] = [];
  for (const m of text.matchAll(global)) {
    if (m.index === undefined || m[0] === '') continue;
    out.push({ start: m.index, end: m.index + m[0].length, snippet: m[0] });
  }
  return out;
}

// A run of 12–19 digits, optionally separated by single spaces or dashes.
const CREDIT_CARD_CANDIDATE = /\d(?:[ -]?\d){11,18}/g;

/** Credit cards: find digit runs, then keep only Luhn-valid ones. */
export function findCreditCards(text: string): TextMatch[] {
  const out: TextMatch[] = [];
  for (const m of text.matchAll(CREDIT_CARD_CANDIDATE)) {
    if (m.index === undefined) continue;
    const raw = m[0];
    if (isValidLuhn(raw)) {
      out.push({ start: m.index, end: m.index + raw.length, snippet: raw });
    }
  }
  return out;
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
export function findEmails(text: string): TextMatch[] {
  return findRegexMatches(text, EMAIL_RE);
}

// Loose international-ish phone numbers: 8–15 digits with optional +, spaces,
// dashes, and parentheses. Note: phone and credit-card patterns can overlap on
// bare digit runs — that's acceptable because each is a separately opt-in rule.
const PHONE_RE = /(?<!\w)\+?\d(?:[\d ()-]{6,15})\d(?!\w)/g;
export function findPhones(text: string): TextMatch[] {
  return findRegexMatches(text, PHONE_RE);
}

// US SSN style (123-45-6789) or a bare 12-digit Japanese "My Number".
const NATIONAL_ID_RE = /(?<!\d)(?:\d{3}-\d{2}-\d{4}|\d{12})(?!\d)/g;
export function findNationalIds(text: string): TextMatch[] {
  return findRegexMatches(text, NATIONAL_ID_RE);
}

/** Dispatch to the detector named by a `pii` rule. */
export function findByDetector(detector: PiiDetector, text: string): TextMatch[] {
  switch (detector) {
    case 'credit_card':
      return findCreditCards(text);
    case 'email':
      return findEmails(text);
    case 'phone':
      return findPhones(text);
    case 'national_id':
      return findNationalIds(text);
    default: {
      // Exhaustiveness guard: if a new detector is added to the schema and not
      // handled here, this line becomes a compile error.
      const _exhaustive: never = detector;
      return _exhaustive;
    }
  }
}
