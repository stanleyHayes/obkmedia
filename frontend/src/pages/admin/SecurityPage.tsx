import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { MetaItem, PageHeading, Section } from '../../components/admin/SettingsSection';
import { palette } from '../../theme';

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {met ? (
        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
      ) : (
        <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: palette.ivoryMuted }} />
      )}
      <Typography variant="caption" sx={{ color: met ? palette.ivory : palette.ivoryMuted }}>
        {label}
      </Typography>
    </Stack>
  );
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

export default function SecurityPage() {
  const { admin } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!admin) return null;

  const longEnough = newPassword.length >= 8;
  const differsFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;
  const matches = newPassword.length > 0 && newPassword === confirmPassword;
  const allMet = longEnough && differsFromCurrent && matches;

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!allMet) {
      setError('Please satisfy all the password requirements below.');
      return;
    }
    setSaving(true);
    try {
      await adminApi.updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToast('Password changed');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Change failed — try again.');
    } finally {
      setSaving(false);
    }
  };

  const visibilityAdornment = (
    <InputAdornment position="end">
      <IconButton
        aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
        onClick={() => setShowPasswords((v) => !v)}
        edge="end"
        sx={{ color: palette.ivoryMuted }}
      >
        {showPasswords ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box>
      <PageHeading
        title="Security"
        subtitle="Keep your account safe — update your password regularly and review your sign-in details."
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, alignItems: 'start' }}>
        <Section
          icon={<KeyOutlinedIcon />}
          title="Change password"
          subtitle="You’ll stay signed in here after the change."
        >
          <Box component="form" onSubmit={savePassword}>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {error}
              </Alert>
            )}
            <Stack spacing={2.5}>
              <TextField
                label="Current password"
                type={showPasswords ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                slotProps={{ input: { endAdornment: visibilityAdornment } }}
              />
              <TextField
                label="New password"
                type={showPasswords ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                slotProps={{ input: { endAdornment: visibilityAdornment } }}
              />
              <TextField
                label="Confirm new password"
                type={showPasswords ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                slotProps={{ input: { endAdornment: visibilityAdornment } }}
              />

              <Stack spacing={0.75} sx={{ pl: 0.5 }}>
                <Requirement met={longEnough} label="At least 8 characters" />
                <Requirement met={differsFromCurrent} label="Different from your current password" />
                <Requirement met={matches} label="Matches the confirmation" />
              </Stack>

              <Box>
                <Button type="submit" variant="contained" disabled={saving || !allMet || !currentPassword}>
                  {saving ? 'Saving…' : 'Change password'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Section>

        <Section
          icon={<VerifiedUserOutlinedIcon />}
          title="Sign-in details"
          subtitle="What we know about how this account signs in."
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 3, mb: 3 }}>
            <MetaItem label="Sign-in email" value={admin.email} />
            <MetaItem label="Last sign-in" value={formatDateTime(admin.lastLoginAt)} />
          </Box>
          <Stack spacing={1.25}>
            <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
              Use a passphrase that’s unique to this account — a few unrelated words beats a short
              complex string, and a password manager beats both.
            </Typography>
            <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
              Forgot your current password? Sign out and use “Forgot password” on the sign-in page —
              we’ll email you a reset link.
            </Typography>
            <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
              If you suspect your account is compromised, change your password immediately and tell
              an administrator so they can review your account.
            </Typography>
          </Stack>
        </Section>
      </Box>

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
