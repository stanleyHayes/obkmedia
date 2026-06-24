/**
 * Creates or updates an admin user with the Owner role.
 * Credentials come from env vars so they never live in source.
 *
 * Run:
 *   cd backend && NEW_ADMIN_EMAIL=you@example.com NEW_ADMIN_PASSWORD='secret' \
 *     NEW_ADMIN_NAME='Your Name' npx tsx src/scripts/createAdmin.ts
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { Role } from '../models/Role.js';

async function main(): Promise<void> {
  const email = process.env.NEW_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.NEW_ADMIN_PASSWORD;
  const fullName = process.env.NEW_ADMIN_NAME?.trim() || 'Admin';
  if (!email || !password) {
    throw new Error('Set NEW_ADMIN_EMAIL and NEW_ADMIN_PASSWORD');
  }

  await connectDb();

  const owner = await Role.findOne({ name: 'Owner' }).select('_id').lean();
  if (!owner) throw new Error('Owner role not found — run the seed first');

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.findOneAndUpdate(
    { email },
    {
      $set: {
        fullName,
        email,
        passwordHash,
        roleId: owner._id,
        isActive: true,
        // Honour the supplied password — no forced reset on first sign-in.
        mustResetPassword: false,
      },
      $inc: { tokenVersion: 1 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(`[admin] ready: ${admin.email} (${admin.fullName}) — role Owner, active ${admin.isActive}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[admin] failed', err);
  process.exit(1);
});
