import 'dotenv/config';
import {
  CreateTableCommand,
  DynamoDBClient,
  type KeyType,
  ResourceInUseException,
  type ScalarAttributeType,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import { TABLES } from '../db/tableNames.js';

/**
 * Creates the two tables. DynamoDB Local starts empty, so you run this once
 * after the container is up. It is idempotent: running it again on existing
 * tables is a no-op.
 *
 * Each table has a single partition key `id` (string). That is the ONLY schema
 * DynamoDB enforces — every other field of a policy/audit item is schemaless.
 */
const endpoint = process.env.DYNAMODB_ENDPOINT;
const region = process.env.AWS_REGION ?? 'ap-northeast-1';

const client = new DynamoDBClient({
  region,
  ...(endpoint
    ? { endpoint, credentials: { accessKeyId: 'local', secretAccessKey: 'local' } }
    : {}),
});

async function ensureTable(name: string): Promise<void> {
  try {
    await client.send(
      new CreateTableCommand({
        TableName: name,
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' as ScalarAttributeType }],
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' as KeyType }],
        // On-demand capacity: no throughput to provision, you pay per request.
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await waitUntilTableExists({ client, maxWaitTime: 30 }, { TableName: name });
    console.log(`✓ created table: ${name}`);
  } catch (err) {
    if (err instanceof ResourceInUseException) {
      console.log(`• table already exists: ${name}`);
      return;
    }
    throw err;
  }
}

async function main(): Promise<void> {
  console.log(`Creating tables at ${endpoint ?? '(real AWS)'} …`);
  await ensureTable(TABLES.policies);
  await ensureTable(TABLES.audit);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
