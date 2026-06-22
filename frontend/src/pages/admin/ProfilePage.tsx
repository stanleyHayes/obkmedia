import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import type { Permission } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { onDark, palette } from '../../theme';

const PERMISSION_GROUP_LABELS: Record<string, string> = {
  portfolio: 'Portfolio',
  categories: 'Categories',
  messages: 'Messages',
  users: 'Users',
  roles: 'Roles',
  settings: 'Settings',
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
  'settings.view': 'View',
  'settings.manage': 'Manage',
};

const GROUP_ORDER = ['portfolio', 'categories', 'messages', 'users', 'roles', 'settings'];

const panelSx = {
  border: `1px solid ${palette.inkBorder}`,
  bgcolor: palette.inkRaised,
};

function formatDate(value?: string | null): string {
  if (!value) return '-';
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

function MiniMetric({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: palette.ivoryMuted, mb: 0.75 }}>
        <Box sx={{ display: 'flex', '& svg': { fontSize: 17 } }}>{icon}</Box>
        <Typography
          sx={{
            fontSize: '0.62rem',
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: palette.ivory, overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Box>
  );
}

function SectionHeader({ icon, eyebrow, title, body }: { icon: ReactNode; eyebrow: string; title: string; body?: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 3 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          display: 'grid',
          placeItems: 'center',
          border: `1px solid ${palette.inkBorder}`,
          color: palette.rose,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            color: palette.ivoryMuted,
            fontSize: '0.66rem',
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.25 }}>
          {title}
        </Typography>
        {body && (
          <Typography variant="body2" sx={{ color: palette.ivoryMuted, mt: 0.5 }}>
            {body}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function StatusLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        py: 1.5,
        borderTop: `1px solid ${palette.inkBorder}`,
      }}
    >
      <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: palette.ivory, textAlign: 'right', overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Box>
  );
}

function ShortcutButton({ to, icon, title, body }: { to: string; icon: ReactNode; title: string; body: string }) {
  return (
    <Button
      component={RouterLink}
      to={to}
      variant="outlined"
      fullWidth
      endIcon={<ArrowForwardIcon />}
      sx={{
        justifyContent: 'space-between',
        textAlign: 'left',
        gap: 2,
        px: 2,
        py: 1.75,
        '& .MuiButton-startIcon': { color: palette.rose },
        '& .MuiButton-endIcon': { ml: 2 },
      }}
      startIcon={icon}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: palette.ivory }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block', mt: 0.25, textTransform: 'none', letterSpacing: 0 }}>
          {body}
        </Typography>
      </Box>
    </Button>
  );
}

export default function ProfilePage() {
  const { admin, setAdmin } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  const [fullName, setFullName] = useState(admin?.fullName ?? '');
  const [email, setEmail] = useState(admin?.email ?? '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!admin) return null;

  const initialsSource = admin.fullName.trim() || admin.email;
  const initials = initialsSource
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const dirty = fullName !== admin.fullName || email !== admin.email;
  const permissionGroups = Object.entries(
    admin.permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
      const prefix = permission.split('.')[0];
      (acc[prefix] ??= []).push(permission);
      return acc;
    }, {}),
  ).sort(([a], [b]) => {
    const aIndex = GROUP_ORDER.indexOf(a);
    const bIndex = GROUP_ORDER.indexOf(b);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setSaving(true);
    try {
      const res = await adminApi.updateProfile({ fullName, email });
      setAdmin(res.admin);
      setFullName(res.admin.fullName);
      setEmail(res.admin.email);
      setToast('Profile updated');
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Update failed - try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          ...panelSx,
          p: { xs: 2.5, md: 4.5 },
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 18% 10%, rgba(142, 27, 99, 0.32), transparent 34%), linear-gradient(135deg, rgba(21, 13, 18, 0.98), rgba(11, 7, 9, 0.92))',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            border: '1px solid rgba(244, 237, 231, 0.05)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2.5, md: 4 }} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
            <Box
              sx={{
                width: { xs: 82, md: 108 },
                height: { xs: 82, md: 108 },
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(95, 5, 58, 0.72)',
                color: onDark.ivory,
                border: '1px solid rgba(244, 237, 231, 0.2)',
                boxShadow: '0 22px 60px rgba(0, 0, 0, 0.24)',
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: { xs: '2.05rem', md: '2.65rem' },
                flexShrink: 0,
              }}
            >
              {initials}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="overline" sx={{ color: onDark.rose }}>
                Admin profile
              </Typography>
              <Typography variant="h3" sx={{ color: onDark.ivory, mt: 0.5 }}>
                {admin.fullName}
              </Typography>
              <Typography variant="body2" sx={{ color: onDark.ivoryMuted, maxWidth: 680, mt: 1.25 }}>
                Your identity, access level, and account controls for the OBK MEDIA workspace.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mt: 2.5 }}>
                {admin.role && <Chip label={admin.role.name} size="small" sx={{ bgcolor: palette.wine, color: onDark.ivory }} />}
                <Chip
                  label={admin.isActive === false ? 'Deactivated' : 'Active'}
                  size="small"
                  sx={{ bgcolor: 'rgba(244, 237, 231, 0.08)', color: onDark.ivory, border: '1px solid rgba(244, 237, 231, 0.16)' }}
                />
                <Chip
                  label={`${admin.permissions.length} permissions`}
                  size="small"
                  sx={{ bgcolor: 'rgba(244, 237, 231, 0.08)', color: onDark.ivory, border: '1px solid rgba(244, 237, 231, 0.16)' }}
                />
              </Stack>
            </Box>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
              mt: { xs: 3, md: 4 },
              pt: { xs: 2.5, md: 3 },
              borderTop: '1px solid rgba(244, 237, 231, 0.13)',
            }}
          >
            <MiniMetric icon={<EmailOutlinedIcon />} label="Sign-in email" value={admin.email} />
            <MiniMetric icon={<CalendarMonthOutlinedIcon />} label="Member since" value={formatDate(admin.createdAt)} />
            <MiniMetric icon={<BadgeOutlinedIcon />} label="Last sign-in" value={formatDateTime(admin.lastLoginAt)} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.15fr 0.85fr' }, gap: 3, alignItems: 'start' }}>
        <Box component="form" onSubmit={saveProfile} sx={{ ...panelSx, p: { xs: 2.5, md: 4 } }}>
          <SectionHeader
            icon={<AccountCircleOutlinedIcon />}
            eyebrow="Editable profile"
            title="Profile details"
            body="Update the name and email attached to your admin account."
          />
          {profileError && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {profileError}
            </Alert>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
            <TextField label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <TextField
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText="This email is used for sign-in."
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              flexWrap: 'wrap',
              mt: 3,
              pt: 3,
              borderTop: `1px solid ${palette.inkBorder}`,
            }}
          >
            <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
              {dirty ? 'You have unsaved profile changes.' : 'Profile details are up to date.'}
            </Typography>
            <Button type="submit" variant="contained" disabled={saving || !dirty} sx={{ minWidth: 150 }}>
              {saving ? 'Saving...' : 'Save profile'}
            </Button>
          </Box>
        </Box>

        <Stack spacing={3}>
          <Box sx={{ ...panelSx, p: { xs: 2.5, md: 4 } }}>
            <SectionHeader
              icon={<ManageAccountsOutlinedIcon />}
              eyebrow="Account state"
              title="Workspace snapshot"
              body="A quick read on how this admin account is configured."
            />
            <StatusLine label="Account status" value={admin.isActive === false ? 'Deactivated' : 'Active'} />
            <StatusLine label="Assigned role" value={admin.role?.name ?? 'No role assigned'} />
            <StatusLine label="Role type" value={admin.role?.isSystem ? 'Built-in system role' : admin.role ? 'Custom role' : 'Not assigned'} />
            <StatusLine label="Permission groups" value={permissionGroups.length || 'None'} />
          </Box>

          <Box sx={{ ...panelSx, p: { xs: 2.5, md: 4 } }}>
            <SectionHeader icon={<LockOutlinedIcon />} eyebrow="Shortcuts" title="Related settings" body="Jump straight to the account controls nearby." />
            <Stack spacing={1.5}>
              <ShortcutButton
                to="/admin/security"
                icon={<ShieldOutlinedIcon />}
                title="Security"
                body="Change password and review sign-in details"
              />
              <ShortcutButton
                to="/admin/preferences"
                icon={<BadgeOutlinedIcon />}
                title="Preferences"
                body="Theme, notifications, and landing page"
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ ...panelSx, p: { xs: 2.5, md: 4 }, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'flex-end' }, flexWrap: 'wrap', gap: 2.5, mb: 3 }}>
          <SectionHeader
            icon={<ShieldOutlinedIcon />}
            eyebrow="Effective access"
            title="Role & permissions"
            body={
              admin.role
                ? `Access is granted by the ${admin.role.name} role${admin.role.isSystem ? ' (a built-in system role)' : ''}.`
                : 'No role is assigned to this account.'
            }
          />
          <Chip
            label={`${admin.permissions.length} total`}
            sx={{ bgcolor: 'transparent', border: `1px solid ${palette.inkBorder}`, color: palette.ivoryMuted, alignSelf: { xs: 'flex-start', md: 'center' } }}
          />
        </Box>

        {permissionGroups.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
            {permissionGroups.map(([prefix, permissions]) => (
              <Box key={prefix} sx={{ border: `1px solid ${palette.inkBorder}`, p: 2.25, minWidth: 0 }}>
                <Typography
                  sx={{
                    color: palette.ivoryMuted,
                    fontSize: '0.66rem',
                    fontWeight: 500,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    mb: 1.5,
                  }}
                >
                  {PERMISSION_GROUP_LABELS[prefix] ?? prefix}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  {permissions.map((permission) => (
                    <Chip
                      key={permission}
                      label={PERMISSION_LABELS[permission] ?? permission}
                      size="small"
                      sx={{ bgcolor: 'transparent', border: `1px solid ${palette.inkBorder}`, color: palette.ivory }}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ border: `1px dashed ${palette.inkBorder}`, p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
              This account currently has no permissions.
            </Typography>
          </Box>
        )}

        <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block', mt: 2.5 }}>
          Roles and permissions are managed by administrators under Administration - Roles.
        </Typography>
      </Box>

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
