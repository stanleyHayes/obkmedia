import bcrypt from 'bcryptjs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { env } from '../config/env.js';
import {
  AUTH_COOKIE,
  requireAuth,
  resolvePermissions,
  signToken,
  type AuthedRequest,
} from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { validateBody } from '../middleware/validate.js';
import { Admin, LANDING_PAGES } from '../models/Admin.js';

export const adminAuthRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts — please try again later' },
});

const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

interface SerializableAdmin {
  _id: unknown;
  fullName: string;
  email: string;
  roleId?: { _id: unknown; name: string; permissions: string[]; isSystem: boolean } | null;
  preferences?: { notifyOnContact?: boolean; defaultLandingPage?: string } | null;
  lastLoginAt?: Date | null;
  isActive?: boolean;
  createdAt?: Date;
}

export function serializeAdmin(admin: SerializableAdmin) {
  return {
    id: String(admin._id),
    fullName: admin.fullName,
    email: admin.email,
    role: admin.roleId
      ? { id: String(admin.roleId._id), name: admin.roleId.name, isSystem: admin.roleId.isSystem }
      : null,
    permissions: resolvePermissions(admin.roleId),
    preferences: {
      notifyOnContact: admin.preferences?.notifyOnContact ?? false,
      defaultLandingPage: admin.preferences?.defaultLandingPage ?? '/admin',
    },
    lastLoginAt: admin.lastLoginAt ?? null,
    isActive: admin.isActive ?? true,
    createdAt: admin.createdAt ?? null,
  };
}

const ROLE_FIELDS = 'name permissions isSystem';

async function loadAdmin(id: string) {
  return Admin.findById(id)
    .populate<{ roleId: SerializableAdmin['roleId'] }>('roleId', ROLE_FIELDS)
    .lean();
}

adminAuthRouter.post('/login', loginLimiter, validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
  const valid = admin && (await bcrypt.compare(password, admin.passwordHash));
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  admin.lastLoginAt = new Date();
  await admin.save();
  const populated = await loadAdmin(String(admin._id));
  res.cookie(AUTH_COOKIE, signToken(String(admin._id), admin.tokenVersion ?? 0), cookieOptions);
  res.json({ admin: serializeAdmin(populated!) });
});

adminAuthRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
  res.json({ ok: true });
});

adminAuthRouter.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const admin = await loadAdmin(req.adminId!);
  if (!admin) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  res.json({ admin: serializeAdmin(admin) });
});

// ---- Self-service: profile, password, preferences ----

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(150),
  email: z.email('Enter a valid email').max(255),
});

adminAuthRouter.patch('/profile', requireAuth, validateBody(profileSchema), async (req: AuthedRequest, res) => {
  const { fullName, email } = req.body as z.infer<typeof profileSchema>;
  const existing = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: req.adminId } })
    .select('_id')
    .lean();
  if (existing) throw new HttpError(409, 'That email is already in use by another user');
  await Admin.updateOne({ _id: req.adminId }, { fullName, email: email.toLowerCase() });
  const admin = await loadAdmin(req.adminId!);
  res.json({ admin: serializeAdmin(admin!) });
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(200),
});

adminAuthRouter.patch('/password', requireAuth, validateBody(passwordSchema), async (req: AuthedRequest, res) => {
  const { currentPassword, newPassword } = req.body as z.infer<typeof passwordSchema>;
  const admin = await Admin.findById(req.adminId);
  if (!admin) throw new HttpError(401, 'Authentication required');
  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) throw new HttpError(400, 'Current password is incorrect');
  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  // Invalidate other existing sessions, then re-issue this one so the current
  // user stays signed in after changing their own password.
  admin.tokenVersion = (admin.tokenVersion ?? 0) + 1;
  await admin.save();
  res.cookie(AUTH_COOKIE, signToken(String(admin._id), admin.tokenVersion), cookieOptions);
  res.json({ ok: true });
});

const preferencesSchema = z.object({
  notifyOnContact: z.boolean().optional(),
  defaultLandingPage: z.enum(LANDING_PAGES).optional(),
});

adminAuthRouter.patch(
  '/preferences',
  requireAuth,
  validateBody(preferencesSchema),
  async (req: AuthedRequest, res) => {
    const body = req.body as z.infer<typeof preferencesSchema>;
    const update: Record<string, unknown> = {};
    if (body.notifyOnContact !== undefined) update['preferences.notifyOnContact'] = body.notifyOnContact;
    if (body.defaultLandingPage !== undefined) {
      update['preferences.defaultLandingPage'] = body.defaultLandingPage;
    }
    await Admin.updateOne({ _id: req.adminId }, { $set: update });
    const admin = await loadAdmin(req.adminId!);
    res.json({ admin: serializeAdmin(admin!) });
  },
);
