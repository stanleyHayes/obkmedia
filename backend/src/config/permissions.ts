/**
 * Central permission catalog. Roles hold a subset of these keys;
 * route guards check them via requirePermission().
 */
export const PERMISSIONS = {
  'portfolio.view': 'View portfolio items and galleries',
  'portfolio.manage': 'Create, edit, and delete portfolio items and gallery images',
  'portfolio.publish': 'Publish, unpublish, and feature portfolio items',
  'categories.view': 'View portfolio categories',
  'categories.manage': 'Create, edit, and delete categories',
  'messages.view': 'Read contact messages',
  'messages.manage': 'Mark contact messages read/unread and delete them',
  'users.view': 'View admin users',
  'users.manage': 'Create, edit, deactivate, and delete admin users',
  'roles.view': 'View roles and their permissions',
  'roles.manage': 'Create, edit, and delete roles',
  'settings.view': 'View site content settings',
  'settings.manage': 'Edit site content: branding, hero, about, pricing, services, contact, and socials',
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export const OWNER_ROLE_NAME = 'Owner';

/** Seeded system roles. Owner always carries every permission. */
export const SYSTEM_ROLES: Array<{
  name: string;
  description: string;
  permissions: Permission[];
}> = [
  {
    name: OWNER_ROLE_NAME,
    description: 'Full access to everything, including users and roles. At least one active owner must always exist.',
    permissions: ALL_PERMISSIONS,
  },
  {
    name: 'Manager',
    description: 'Runs the studio day-to-day: full content and inbox control, can view users and roles.',
    permissions: [
      'portfolio.view',
      'portfolio.manage',
      'portfolio.publish',
      'categories.view',
      'categories.manage',
      'messages.view',
      'messages.manage',
      'users.view',
      'roles.view',
      'settings.view',
      'settings.manage',
    ],
  },
  {
    name: 'Editor',
    description: 'Prepares portfolio content and reads inquiries, but cannot publish or administer.',
    permissions: ['portfolio.view', 'portfolio.manage', 'categories.view', 'messages.view'],
  },
  {
    name: 'Viewer',
    description: 'Read-only access to portfolio content and messages.',
    permissions: ['portfolio.view', 'categories.view', 'messages.view'],
  },
];
