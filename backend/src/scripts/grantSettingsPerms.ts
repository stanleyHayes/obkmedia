/**
 * Grants the new settings.* permissions to existing roles without re-running
 * the full seed (which would recreate demo portfolios/categories).
 *
 * Run: cd backend && npx tsx src/scripts/grantSettingsPerms.ts
 */
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { ALL_PERMISSIONS } from '../config/permissions.js';
import { Role } from '../models/Role.js';

async function main(): Promise<void> {
  await connectDb();

  // Owner always carries every permission.
  const owner = await Role.updateOne({ name: 'Owner' }, { $set: { permissions: ALL_PERMISSIONS } });
  // Manager gains site-content control.
  const manager = await Role.updateOne(
    { name: 'Manager' },
    { $addToSet: { permissions: { $each: ['settings.view', 'settings.manage'] } } },
  );

  console.log(`[perms] Owner updated: ${owner.modifiedCount}, Manager updated: ${manager.modifiedCount}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[perms] failed', err);
  process.exit(1);
});
