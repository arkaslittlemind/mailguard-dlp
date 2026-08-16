/** Table names, overridable via env so the same code runs local and in AWS. */
export const TABLES = {
  policies: process.env.POLICIES_TABLE ?? 'mailguard-policies',
  audit: process.env.AUDIT_TABLE ?? 'mailguard-audit',
} as const;
