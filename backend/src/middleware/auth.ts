import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ALL_PERMISSIONS, OWNER_ROLE_NAME, type Permission } from '../config/permissions.js';
import { Admin } from '../models/Admin.js';

export const AUTH_COOKIE = 'obk_admin_token';

export interface AuthedRequest extends Request {
  adminId?: string;
  adminPermissions?: Permission[];
}

interface PopulatedRole {
  _id: unknown;
  name: string;
  permissions: string[];
  isSystem: boolean;
}

export function signToken(adminId: string, tokenVersion: number): string {
  return jwt.sign({ sub: adminId, ver: tokenVersion }, env.jwtSecret, { expiresIn: '7d' });
}

export function resolvePermissions(role: PopulatedRole | null | undefined): Permission[] {
  if (!role) return [];
  // The system Owner role always carries every permission, including any
  // added to the catalog after the role document was seeded.
  if (role.isSystem && role.name === OWNER_ROLE_NAME) return [...ALL_PERMISSIONS];
  return role.permissions.filter((p): p is Permission =>
    (ALL_PERMISSIONS as string[]).includes(p),
  );
}

/** True when `subset` is fully contained in `actorPerms` — i.e. the actor may grant it. */
export function actorCanGrant(actorPerms: Permission[], subset: Permission[]): boolean {
  return subset.every((p) => actorPerms.includes(p));
}

/** True when the actor holds every permission the target role/user does (can act on them). */
export function actorOutranks(actorPerms: Permission[], targetPerms: Permission[]): boolean {
  return targetPerms.every((p) => actorPerms.includes(p));
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[AUTH_COOKIE] as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; ver?: number };
    const admin = await Admin.findById(payload.sub)
      .select('_id isActive roleId tokenVersion')
      .populate<{ roleId: PopulatedRole | null }>('roleId', 'name permissions isSystem')
      .lean();
    if (!admin || !admin.isActive) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    // Password change/reset bumps tokenVersion, invalidating older cookies.
    if ((payload.ver ?? 0) !== (admin.tokenVersion ?? 0)) {
      res.status(401).json({ error: 'Session expired, please log in again' });
      return;
    }
    req.adminId = String(admin._id);
    req.adminPermissions = resolvePermissions(admin.roleId);
    next();
  } catch {
    res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

export function requirePermission(permission: Permission) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.adminPermissions?.includes(permission)) {
      res.status(403).json({ error: 'You don’t have permission to do that' });
      return;
    }
    next();
  };
}
