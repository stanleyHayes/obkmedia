import { Router } from 'express';
import { z } from 'zod';
import { ALL_PERMISSIONS, PERMISSIONS, type Permission } from '../config/permissions.js';
import { actorCanGrant, requirePermission, type AuthedRequest } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { validateBody } from '../middleware/validate.js';
import { Admin } from '../models/Admin.js';
import { Role } from '../models/Role.js';

export const adminRolesRouter = Router();

// Either roles.view OR users.manage may list roles: user managers need the role
// list to assign roles even without full role-administration rights.
function canListRoles(req: AuthedRequest): boolean {
  const perms = req.adminPermissions ?? [];
  return perms.includes('roles.view') || perms.includes('users.manage');
}

adminRolesRouter.get('/', (req: AuthedRequest, res, next) => {
  if (!canListRoles(req)) {
    res.status(403).json({ error: 'You don’t have permission to do that' });
    return;
  }
  next();
}, async (_req, res) => {
  const [items, counts] = await Promise.all([
    Role.find().sort({ isSystem: -1, name: 1 }).lean(),
    Admin.aggregate<{ _id: unknown; count: number }>([
      { $group: { _id: '$roleId', count: { $sum: 1 } } },
    ]),
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json({
    items: items.map((item) => ({ ...item, userCount: countMap.get(String(item._id)) ?? 0 })),
    catalog: PERMISSIONS,
  });
});

const permissionList = z
  .array(z.string())
  .min(1, 'Select at least one permission')
  .refine((perms) => perms.every((p) => (ALL_PERMISSIONS as string[]).includes(p)), {
    message: 'Unknown permission in list',
  });

const roleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  permissions: permissionList,
});

adminRolesRouter.post(
  '/',
  requirePermission('roles.manage'),
  validateBody(roleSchema),
  async (req: AuthedRequest, res) => {
    const body = req.body as z.infer<typeof roleSchema>;
    const permissions = [...new Set(body.permissions)] as Permission[];
    // You cannot grant a role permissions you do not hold yourself.
    if (!actorCanGrant(req.adminPermissions ?? [], permissions)) {
      throw new HttpError(403, 'You can only grant permissions you currently hold');
    }
    const existing = await Role.findOne({ name: body.name }).select('_id').lean();
    if (existing) throw new HttpError(409, 'A role with that name already exists');
    const item = await Role.create({
      name: body.name,
      description: body.description || '',
      permissions,
      isSystem: false,
    });
    res.status(201).json({ item });
  },
);

adminRolesRouter.patch(
  '/:id',
  requirePermission('roles.manage'),
  validateBody(roleSchema.partial()),
  async (req: AuthedRequest, res) => {
    const body = req.body as Partial<z.infer<typeof roleSchema>>;
    const role = await Role.findById(req.params.id).populate('_id');
    if (!role) throw new HttpError(404, 'Role not found');
    if (role.isSystem) throw new HttpError(409, 'Built-in roles cannot be edited');
    // Block editing the role you are currently assigned to — prevents self-escalation
    // by widening your own permissions.
    const self = await Admin.findById(req.adminId).select('roleId').lean();
    if (self && String(self.roleId) === String(role._id)) {
      throw new HttpError(409, 'You cannot edit the role you are currently assigned to');
    }
    if (body.name !== undefined && body.name !== role.name) {
      const dupe = await Role.findOne({ name: body.name, _id: { $ne: role._id } }).select('_id').lean();
      if (dupe) throw new HttpError(409, 'A role with that name already exists');
      role.name = body.name;
    }
    if (body.description !== undefined) role.description = body.description || '';
    if (body.permissions !== undefined) {
      const permissions = [...new Set(body.permissions)] as Permission[];
      if (!actorCanGrant(req.adminPermissions ?? [], permissions)) {
        throw new HttpError(403, 'You can only grant permissions you currently hold');
      }
      role.permissions = permissions;
    }
    await role.save();
    res.json({ item: role });
  },
);

adminRolesRouter.delete('/:id', requirePermission('roles.manage'), async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new HttpError(404, 'Role not found');
  if (role.isSystem) throw new HttpError(409, 'Built-in roles cannot be deleted');
  const inUse = await Admin.countDocuments({ roleId: role._id });
  if (inUse > 0) {
    throw new HttpError(409, `Role is assigned to ${inUse} user(s) — reassign them first`);
  }
  await role.deleteOne();
  res.json({ ok: true });
});
