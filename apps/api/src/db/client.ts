import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

/**
 * One DynamoDB client for the whole process.
 *
 * - When DYNAMODB_ENDPOINT is set (local dev), we point at DynamoDB Local and
 *   pass throwaway credentials — the local emulator ignores their values but the
 *   AWS SDK refuses to sign a request without *some* credentials.
 * - When it is unset (real AWS), we pass nothing special: the SDK's default
 *   credential chain kicks in (env vars locally, or the Lambda's IAM role in
 *   production). That single switch is all that separates local from cloud.
 */
const endpoint = process.env.DYNAMODB_ENDPOINT;
const region = process.env.AWS_REGION ?? 'ap-northeast-1';

const baseClient = new DynamoDBClient({
  region,
  ...(endpoint
    ? { endpoint, credentials: { accessKeyId: 'local', secretAccessKey: 'local' } }
    : {}),
});

/**
 * The "document" client lets us read/write plain JS objects instead of
 * DynamoDB's low-level typed format (e.g. { id: { S: "abc" } }). removeUndefined
 * lets optional fields simply be absent rather than erroring.
 */
export const ddb = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: { removeUndefinedValues: true },
});
