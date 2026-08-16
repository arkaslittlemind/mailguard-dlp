import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import type { AuditRecord } from '@mailguard/schemas';
import { ddb } from './client.js';
import { TABLES } from './tableNames.js';

/** Append one scan record to the audit log. */
export async function putAudit(record: AuditRecord): Promise<void> {
  await ddb.send(new PutCommand({ TableName: TABLES.audit, Item: record }));
}

/** Most-recent-first, capped. Sorting happens in app code since Scan is unordered. */
export async function listAudit(limit = 100): Promise<AuditRecord[]> {
  const out = await ddb.send(new ScanCommand({ TableName: TABLES.audit }));
  const items = (out.Items ?? []) as AuditRecord[];
  return items.sort((a, b) => b.scannedAt.localeCompare(a.scannedAt)).slice(0, limit);
}
