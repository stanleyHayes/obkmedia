import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

async function main(): Promise<void> {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[api] OBK MEDIA API listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('[api] failed to start', err);
  process.exit(1);
});
