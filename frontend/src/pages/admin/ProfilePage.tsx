import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent, type ReactNode } from 'react';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { palette } from '../../theme';

import type { Permission } from '../../api/types';

const LANDING_PAGES: Array<{ value: string; label: string; permission?: Permission }> = [
  { value: '/admin', label: 'Dashboard' },
  { value: '/admin/portfolio', label: 'Portfolio', permission: 'portfolio.view' },
  { value: '/admin/messages', label: 'Messages', permission: 'messages.view' },
];

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 } }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
        <Box sx={{ color: palette.rose, display: 'flex' }}>{icon}</Box>
        <Typography variant="h5">{title}</Typography>
      </Stack>
      {children}
    </Box>
  );
}

export default function ProfilePage() {
  const { admin, setAdmin, can } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const landingOptions = LANDING_PAGES.filter((page) => !page.permission || can(page.permission));

  // Profile
  const [fullName, setFullName] = useState(admin?.fullName ?? '');
  const [email, setEmail] = useState(admin?.email ?? '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Preferences
  const [savingPrefs, setSavingPrefs] = useState(false);

  if (!admin) return null;

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setSavingProfile(true);
    try {
      const res = await adminApi.updateProfile({ fullName, email });
      setAdmin(res.admin);
      setToast('Profile updated');
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Update failed — try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords don’t match.');
      return;
    }
    setSavingPassword(true);
    try {
      await adminApi.updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToast('Password changed');
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Change failed — try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  const savePreference = async (payload: Parameters<typeof adminApi.updatePreferences>[0]) => {
    setSavingPrefs(true);
    try {
      const res = await adminApi.updatePreferences(payload);
      setAdmin(res.admin);
      setToast('Preferences saved');
    } catch {
      setToast('Couldn’t save preferences — try again');
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        <Typography variant="h3">My profile</Typography>
        {admin.role && (
          <Chip
            label={admin.role.name}
            size="small"
            sx={{ bgcolor: palette.wine, color: palette.ivory }}
          />
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, alignItems: 'start' }}>
        <Stack spacing={4}>
          <Section icon={<AccountCircleOutlinedIcon />} title="Profile details">
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
                  helperText="You’ll use this email to sign in"
                />
                <Box>
                  <Button type="submit" variant="contained" disabled={savingProfile}>
                    {savingProfile ? 'Saving…' : 'Save profile'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Section>

          <Section icon={<TuneOutlinedIcon />} title="Preferences">
            <Stack spacing={2.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={admin.preferences.notifyOnContact}
                    disabled={savingPrefs}
                    onChange={(e) => savePreference({ notifyOnContact: e.target.checked })}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ color: palette.ivory }}>
                      Email me about new inquiries
                    </Typography>
                    <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                      Get a copy of every contact form submission at {admin.email}
                    </Typography>
                  </Box>
                }
              />
              <TextField
                select
                label="After sign-in, take me to"
                value={admin.preferences.defaultLandingPage}
                disabled={savingPrefs}
                onChange={(e) => savePreference({ defaultLandingPage: e.target.value })}
                sx={{ maxWidth: 320 }}
              >
                {landingOptions.map((page) => (
                  <MenuItem key={page.value} value={page.value}>
                    {page.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Section>
        </Stack>

        <Section icon={<KeyOutlinedIcon />} title="Change password">
          <Box component="form" onSubmit={savePassword}>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {passwordError}
              </Alert>
            )}
            <Stack spacing={2.5}>
              <TextField
                label="Current password"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <TextField
                label="New password"
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="At least 8 characters"
              />
              <TextField
                label="Confirm new password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Box>
                <Button type="submit" variant="contained" disabled={savingPassword}>
                  {savingPassword ? 'Saving…' : 'Change password'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Section>
      </Box>

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
