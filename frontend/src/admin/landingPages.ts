import type { AdminUser, Permission } from '../api/types';

export interface LandingPage {
  value: string;
  label: string;
  permission?: Permission;
}

/** Single source of truth for landing-page choices and the permission each needs. */
export const LANDING_PAGES: LandingPage[] = [
  { value: '/admin', label: 'Dashboard' },
  { value: '/admin/portfolio', label: 'Portfolio', permission: 'portfolio.view' },
  { value: '/admin/messages', label: 'Messages', permission: 'messages.view' },
];

/** Honor a saved landing page only if the user's role can still reach it. */
export function landingFor(admin: AdminUser): string {
  const target = admin.preferences.defaultLandingPage || '/admin';
  const page = LANDING_PAGES.find((p) => p.value === target);
  if (!page || (page.permission && !admin.permissions.includes(page.permission))) return '/admin';
  return target;
}
