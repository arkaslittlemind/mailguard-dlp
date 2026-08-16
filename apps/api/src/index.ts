import 'dotenv/config';
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  console.log(`[api] MailGuard DLP API listening on http://localhost:${port}`);
  console.log(`[api] DynamoDB endpoint: ${process.env.DYNAMODB_ENDPOINT ?? '(real AWS)'}`);
});
