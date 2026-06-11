import { Schema, model, type InferSchemaType } from 'mongoose';

export const LANDING_PAGES = ['/admin', '/admin/portfolio', '/admin/messages'] as const;

const preferencesSchema = new Schema(
  {
    /** Receive an email whenever a new contact inquiry arrives. */
    notifyOnContact: { type: Boolean, default: false },
    /** Page shown right after signing in. */
    defaultLandingPage: { type: String, enum: LANDING_PAGES, default: '/admin' },
  },
  { _id: false },
);

const adminSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    isActive: { type: Boolean, default: true },
    preferences: { type: preferencesSchema, default: () => ({}) },
    lastLoginAt: { type: Date, default: null },
    /** Bumped on every password change/reset to invalidate existing JWTs. */
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type AdminDoc = InferSchemaType<typeof adminSchema>;
export const Admin = model('Admin', adminSchema);
