import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { OWNER_ROLE_NAME } from '../config/permissions.js';
import {
  actorCanGrant,
  actorOutranks,
  requirePermission,
  resolvePermissions,
  type AuthedRequest,
} from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { validateBody } from '../middleware/validate.js';
import { Admin } from '../models/Admin.js';
import { Role } from '../models/Role.js';
import { sendNewUserEmail } from '../services/email.js';
import { generatePassword } from '../utils/tokens.js';
import { serializeAdmin } from './adminAuth.js';

export const adminUsersRouter = Router();

const ROLE_FIELDS = 'name permissions isSystem';

interface RoleLite {
  _id: unknown;
  name: string;
  permissions: string[];
  isSystem: boolean;
}

async function loadRole(roleId: string): Promise<RoleLite> {
  const role = await Role.findById(roleId).select(ROLE_FIELDS).lean();
  if (!role) throw new HttpError(400, 'Selected role does not exist');
  return role as RoleLite;
}

/**
 * Guards privilege escalation: the actor may only assign a role whose
 * permissions they themselves hold (so a non-Owner can never grant the Owner
 * role or any permission above their own level).
 */
function assertCanAssignRole(req: AuthedRequest, role: RoleLite): void {
  if (!actorCanGrant(req.adminPermissions ?? [], resolvePermissions(role))) {
    throw new HttpError(403, 'You can only assign roles whose permissions you hold yourself');
  }
}

async function countActiveOwners(): Promise<number> {
  const ownerRole = await Role.findOne({ isSystem: true, name: OWNER_ROLE_NAME }).select('_id').lean();
  if (!ownerRole) return 0;
  return Admin.countDocuments({ roleId: ownerRole._id, isActive: true });
}

async function isActiveOwner(userId: string): Promise<boolean> {
  const ownerRole = await Role.findOne({ isSystem: true, name: OWNER_ROLE_NAME }).select('_id').lean();
  if (!ownerRole) return false;
  const target = await Admin.findById(userId).select('roleId isActive').lean();
  return Boolean(target && target.isActive && String(target.roleId) === String(ownerRole._id));
}

adminUsersRouter.get('/', requirePermission('users.view'), async (_req, res) => {
  const items = await Admin.find()
    .select('-passwordHash')
    .populate('roleId', ROLE_FIELDS)
    .sort({ createdAt: 1 })
    .lean();
  res.json({ items: items.map((item) => serializeAdmin(item as never)) });
});

const createSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email: z.email('Enter a valid email').max(255),
  roleId: z.string().min(1, 'Select a role'),
});

adminUsersRouter.post('/', requirePermission('users.manage'), validateBody(createSchema), async (req: AuthedRequest, res) => {
  const body = req.body as z.infer<typeof createSchema>;
  const role = await loadRole(body.roleId);
  assertCanAssignRole(req, role);
  const existing = await Admin.findOne({ email: body.email.toLowerCase() }).select('_id').lean();
  if (existing) throw new HttpError(409, 'That email is already in use by another user');
  // The server generates the password and emails it; the user must change it on
  // first sign-in. Admins never see or set the initial password.
  const tempPassword = generatePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const created = await Admin.create({
    fullName: body.fullName,
    email: body.email.toLowerCase(),
    passwordHash,
    roleId: body.roleId,
    isActive: true,
    mustResetPassword: true,
  });
  await sendNewUserEmail(created.email, created.fullName, tempPassword);
  const populated = await Admin.findById(created._id)
    .select('-passwordHash')
    .populate('roleId', ROLE_FIELDS)
    .lean();
  res.status(201).json({ item: serializeAdmin(populated as never) });
});

const updateSchema = z.object({
  fullName: z.string().trim().min(2).max(150).optional(),
  email: z.email('Enter a valid email').max(255).optional(),
  roleId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

adminUsersRouter.patch(
  '/:id',
  requirePermission('users.manage'),
  validateBody(updateSchema),
  async (req: AuthedRequest, res) => {
    const body = req.body as z.infer<typeof updateSchema>;
    const targetId = String(req.params.id);
    const isSelf = targetId === req.adminId;

    const target = await Admin.findById(targetId).select('roleId isActive');
    if (!target) throw new HttpError(404, 'User not found');

    if (isSelf && body.isActive === false) {
      throw new HttpError(409, 'You cannot deactivate your own account');
    }
    // You cannot change your own role (prevents self-escalation, e.g. to Owner).
    if (isSelf && body.roleId !== undefined && body.roleId !== String(target.roleId)) {
      throw new HttpError(409, 'You cannot change your own role — ask another administrator');
    }

    const prevRoleId = String(target.roleId);
    const prevActive = target.isActive;
    const willDemote = body.roleId !== undefined && body.roleId !== prevRoleId;
    const willDeactivate = body.isActive === false && prevActive;

    // Fast path: clear error for the common sequential last-owner case.
    if ((willDemote || willDeactivate) && (await isActiveOwner(targetId)) && (await countActiveOwners()) <= 1) {
      throw new HttpError(409, 'This is the last active owner — assign another owner first');
    }

    if (body.fullName !== undefined) target.fullName = body.fullName;
    if (body.email !== undefined) {
      const existing = await Admin.findOne({ email: body.email.toLowerCase(), _id: { $ne: targetId } })
        .select('_id')
        .lean();
      if (existing) throw new HttpError(409, 'That email is already in use by another user');
      target.email = body.email.toLowerCase();
    }
    if (body.roleId !== undefined) {
      const role = await loadRole(body.roleId);
      assertCanAssignRole(req, role);
      target.roleId = role._id as never;
    }
    if (body.isActive !== undefined) target.isActive = body.isActive;

    await target.save();

    // Race guard: the check above is not atomic with the write, so re-verify the
    // invariant afterwards and roll back if this change emptied the owner pool.
    if ((willDemote || willDeactivate) && (await countActiveOwners()) === 0) {
      target.roleId = prevRoleId as never;
      target.isActive = prevActive;
      await target.save();
      throw new HttpError(409, 'This is the last active owner — assign another owner first');
    }

    const item = await Admin.findById(targetId)
      .select('-passwordHash')
      .populate('roleId', ROLE_FIELDS)
      .lean();
    res.json({ item: serializeAdmin(item as never) });
  },
);

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

adminUsersRouter.patch(
  '/:id/password',
  requirePermission('users.manage'),
  validateBody(resetPasswordSchema),
  async (req: AuthedRequest, res) => {
    const { password } = req.body as z.infer<typeof resetPasswordSchema>;
    const target = await Admin.findById(req.params.id).populate<{ roleId: RoleLite | null }>('roleId', ROLE_FIELDS);
    if (!target) throw new HttpError(404, 'User not found');
    // You may not reset the password of a user more privileged than you.
    if (String(target._id) !== req.adminId && !actorOutranks(req.adminPermissions ?? [], resolvePermissions(target.roleId))) {
      throw new HttpError(403, 'You cannot reset the password of a more privileged user');
    }
    target.passwordHash = await bcrypt.hash(password, 12);
    target.tokenVersion = (target.tokenVersion ?? 0) + 1; // log the target out everywhere
    target.mustResetPassword = true; // force them to choose their own at next sign-in
    await target.save();
    res.json({ ok: true });
  },
);

adminUsersRouter.delete('/:id', requirePermission('users.manage'), async (req: AuthedRequest, res) => {
  const targetId = String(req.params.id);
  if (targetId === req.adminId) {
    throw new HttpError(409, 'You cannot delete your own account');
  }
  const wasActiveOwner = await isActiveOwner(targetId);
  if (wasActiveOwner && (await countActiveOwners()) <= 1) {
    throw new HttpError(409, 'This is the last active owner — assign another owner first');
  }
  const item = await Admin.findByIdAndDelete(targetId);
  if (!item) throw new HttpError(404, 'User not found');

  // Race guard: if a concurrent delete/demote emptied the owner pool, restore.
  if (wasActiveOwner && (await countActiveOwners()) === 0) {
    await Admin.create(item.toObject());
    throw new HttpError(409, 'This is the last active owner — assign another owner first');
  }
  res.json({ ok: true });
});
