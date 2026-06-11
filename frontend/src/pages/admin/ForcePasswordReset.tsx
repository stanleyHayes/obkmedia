import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { palette } from '../../theme';

/**
 * Shown when a user signs in with a generated/admin-set password. They must
 * choose their own password before reaching the dashboard.
 */
export default function ForcePasswordReset() {
  const { admin, setAdmin, logout, refresh } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('New passwords don’t match.');
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.updatePassword({ currentPassword, newPassword });
      if (res.admin) setAdmin(res.admin);
      else await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t update password — try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
        background: `radial-gradient(ellipse at 30% 20%, rgba(95, 5, 58, 0.3), transparent 55%), ${palette.ink}`,
      }}
    >
      <Box component="form" onSubmit={submit} sx={{ width: '100%', maxWidth: 440, border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 4, md: 6 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <LockResetOutlinedIcon sx={{ color: palette.rose }} />
          <Typography variant="h4">Set your password</Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: palette.ivoryMuted, mb: 4 }}>
          Welcome{admin?.fullName ? `, ${admin.fullName}` : ''}. For your security, choose a new
          password before continuing to the dashboard.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2.5}>
          <TextField
            label="Temporary password"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            helperText="The password from your invitation email"
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
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" variant="contained" size="large" disabled={saving}>
            {saving ? 'Saving…' : 'Set password & continue'}
          </Button>
          <Button variant="text" onClick={() => logout()} sx={{ color: palette.ivoryMuted }}>
            Sign out
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
