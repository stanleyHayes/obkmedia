import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import type { Permission } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { MetaItem, PageHeading, Section } from '../../components/admin/SettingsSection';
import { onDark, palette } from '../../theme';

const PERMISSION_GROUP_LABELS: Record<string, string> = {
  portfolio: 'Portfolio',
  categories: 'Categories',
  messages: 'Messages',
  users: 'Users',
  roles: 'Roles',
};

const PERMISSION_LABELS: Record<Permission, string> = {
  'portfolio.view': 'View',
  'portfolio.manage': 'Create & edit',
  'portfolio.publish': 'Publish & feature',
  'categories.view': 'View',
  'categories.manage': 'Manage',
  'messages.view': 'View',
  'messages.manage': 'Manage',
  'users.view': 'View',
  'users.manage': 'Manage',
  'roles.view': 'View',
  'roles.manage': 'Manage',
};

function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(value?: string | null): string {
  if (!value) return 'Never';
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProfilePage() {
  const { admin, setAdmin } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  const [fullName, setFullName] = useState(admin?.fullName ?? '');
  const [email, setEmail] = useState(admin?.email ?? '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!admin) return null;

  const initials = admin.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const dirty = fullName !== admin.fullName || email !== admin.email;

  // Group the effective permissions by area so the access summary reads as
  // "Portfolio: View · Create & edit" rather than a flat list of keys.
  const permissionGroups = Object.entries(
    admin.permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
      const prefix = permission.split('.')[0];
      (acc[prefix] ??= []).push(permission);
      return acc;
    }, {}),
  );

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setSaving(true);
    try {
      const res = await adminApi.updateProfile({ fullName, email });
      setAdmin(res.admin);
      // Sync inputs to the server-normalized values (trimmed name, lowercased
      // email) so the dirty check clears after a successful save.
      setFullName(res.admin.fullName);
      setEmail(res.admin.email);
      setToast('Profile updated');
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Update failed — try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeading title="My profile" subtitle="Your identity across the OBK MEDIA admin — who you are, how you sign in, and what you can access." />

      {/* Identity banner */}
      <Box
        sx={{
          border: `1px solid ${palette.inkBorder}`,
          bgcolor: palette.inkRaised,
          p: { xs: 2.5, md: 4 },
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 2, md: 3 },
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            display: 'grid',
            placeItems: 'center',
            bgcolor: palette.wine,
            color: onDark.ivory,
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.9rem',
            flexShrink: 0,
          }}
        >
          {initials}
        </Box>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
            <Typography variant="h4">{admin.fullName}</Typography>
            {admin.role && <Chip label={admin.role.name} size="small" sx={{ bgcolor: palette.wine, color: onDark.ivory }} />}
            <Chip
              label={admin.isActive === false ? 'Deactivated' : 'Active'}
              size="small"
              sx={{ bgcolor: 'transparent', border: `1px solid ${palette.inkBorder}`, color: palette.ivoryMuted }}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: palette.ivoryMuted, mt: 0.75 }}>
            {admin.email}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(140px, auto))',
            gap: { xs: 2, md: 4 },
          }}
        >
          <MetaItem label="Member since" value={formatDate(admin.createdAt)} />
          <MetaItem label="Last sign-in" value={formatDateTime(admin.lastLoginAt)} />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, alignItems: 'start' }}>
        <Section
          icon={<AccountCircleOutlinedIcon />}
          title="Profile details"
          subtitle="Shown to other admins across the dashboard."
        >
          <Box component="form" onSubmit={saveProfile}>
            {profileError && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {profileError}
              </Alert>
            )}
            <Stack spacing={2.5}>
              <TextField label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <TextField
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="You’ll use this email to sign in — changing it changes your login."
              />
              <Box>
                <Button type="submit" variant="contained" disabled={saving || !dirty}>
                  {saving ? 'Saving…' : 'Save profile'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Section>

        <Stack spacing={4}>
          <Section
            icon={<ShieldOutlinedIcon />}
            title="Role & access"
            subtitle={
              admin.role
                ? `Your access is granted by the ${admin.role.name} role${admin.role.isSystem ? ' (a built-in system role)' : ''}.`
                : 'No role is assigned to your account — ask an administrator to assign one.'
            }
          >
            {permissionGroups.length > 0 ? (
              <Stack spacing={2}>
                {permissionGroups.map(([prefix, permissions]) => (
                  <Box key={prefix} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography
                      sx={{
                        fontSize: '0.62rem',
                        fontWeight: 500,
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                        color: palette.ivoryMuted,
                        minWidth: 96,
                      }}
                    >
                      {PERMISSION_GROUP_LABELS[prefix] ?? prefix}
                    </Typography>
                    {permissions.map((permission) => (
                      <Chip
                        key={permission}
                        label={PERMISSION_LABELS[permission] ?? permission}
                        size="small"
                        sx={{ bgcolor: 'transparent', border: `1px solid ${palette.inkBorder}`, color: palette.ivory }}
                      />
                    ))}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                Your account currently has no permissions.
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block', mt: 2.5 }}>
              Roles and permissions are managed by administrators under Administration → Roles.
            </Typography>
          </Section>

          <Section icon={<BadgeOutlinedIcon />} title="Related settings" subtitle="Looking for something else?">
            <Stack spacing={1.5}>
              <Link
                component={RouterLink}
                to="/admin/preferences"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: palette.rose }}
              >
                Notifications, theme, and workspace preferences <ArrowForwardIcon sx={{ fontSize: 15 }} />
              </Link>
              <Link
                component={RouterLink}
                to="/admin/security"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: palette.rose }}
              >
                Change your password and review sign-in security <ArrowForwardIcon sx={{ fontSize: 15 }} />
              </Link>
            </Stack>
          </Section>
        </Stack>
      </Box>

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
