import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import type { Policy } from '@mailguard/schemas';
import { ddb } from './client.js';
import { TABLES } from './tableNames.js';

/**
 * Policies data access.
 *
 * We use Scan to list because the admin policy set is small (tens of items).
 * Scan reads the whole table, so for a high-volume table you would instead model
 * an access pattern with a partition/sort key or a GSI — noted in DECISIONS.
 */
export async function listPolicies(): Promise<Policy[]> {
  const out = await ddb.send(new ScanCommand({ TableName: TABLES.policies }));
  return (out.Items ?? []) as Policy[];
}

export async function getPolicy(id: string): Promise<Policy | undefined> {
  const out = await ddb.send(new GetCommand({ TableName: TABLES.policies, Key: { id } }));
  return out.Item as Policy | undefined;
}

export async function putPolicy(policy: Policy): Promise<void> {
  await ddb.send(new PutCommand({ TableName: TABLES.policies, Item: policy }));
}

export async function deletePolicy(id: string): Promise<void> {
  await ddb.send(new DeleteCommand({ TableName: TABLES.policies, Key: { id } }));
}
