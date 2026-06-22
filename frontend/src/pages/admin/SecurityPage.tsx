import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { onDark, palette } from '../../theme';

const panelSx = {
  border: `1px solid ${palette.inkBorder}`,
  bgcolor: palette.inkRaised,
};

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
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: onDark.ivoryMuted, mb: 0.75 }}>
        <Box sx={{ display: 'flex', '& svg': { fontSize: 17 } }}>{icon}</Box>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: onDark.ivory, overflowWrap: 'anywhere' }}>
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
        <Typography sx={{ color: palette.ivoryMuted, fontSize: '0.66rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
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

function Requirement({ met, label, body }: { met: boolean; label: string; body: string }) {
  return (
    <Box sx={{ border: `1px solid ${met ? palette.rose : palette.inkBorder}`, p: 1.75, minWidth: 0 }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
        {met ? (
          <CheckCircleOutlineIcon sx={{ fontSize: 19, color: palette.rose, mt: 0.25 }} />
        ) : (
          <RadioButtonUncheckedIcon sx={{ fontSize: 19, color: palette.ivoryMuted, mt: 0.25 }} />
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ color: met ? palette.ivory : palette.ivoryMuted }}>
            {label}
          </Typography>
          <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block', mt: 0.25 }}>
            {body}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function StatusLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1.5, borderTop: `1px solid ${palette.inkBorder}` }}>
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
      startIcon={icon}
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
  const passwordScore = [longEnough, differsFromCurrent, matches].filter(Boolean).length;
  const strengthLabel = passwordScore === 0 ? 'Waiting for new password' : passwordScore === 3 ? 'Ready to change' : `${passwordScore}/3 checks met`;

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
      setError(err instanceof ApiError ? err.message : 'Change failed - try again.');
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
                flexShrink: 0,
              }}
            >
              <ShieldOutlinedIcon sx={{ fontSize: { xs: 38, md: 48 } }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="overline" sx={{ color: onDark.rose }}>
                Account security
              </Typography>
              <Typography variant="h3" sx={{ color: onDark.ivory, mt: 0.5 }}>
                Security
              </Typography>
              <Typography variant="body2" sx={{ color: onDark.ivoryMuted, maxWidth: 700, mt: 1.25 }}>
                Protect your admin access, rotate your password, and keep sign-in details easy to review.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mt: 2.5 }}>
                <Chip label="Password protected" size="small" sx={{ bgcolor: palette.wine, color: onDark.ivory }} />
                <Chip
                  label={showPasswords ? 'Passwords visible' : 'Passwords hidden'}
                  size="small"
                  sx={{ bgcolor: 'rgba(244, 237, 231, 0.08)', color: onDark.ivory, border: '1px solid rgba(244, 237, 231, 0.16)' }}
                />
                <Chip
                  label={admin.isActive === false ? 'Deactivated' : 'Active account'}
                  size="small"
                  sx={{ bgcolor: 'rgba(244, 237, 231, 0.08)', color: onDark.ivory, border: '1px solid rgba(244, 237, 231, 0.16)' }}
                />
              </Stack>
            </Box>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
              mt: { xs: 3, md: 4 },
              pt: { xs: 2.5, md: 3 },
              borderTop: '1px solid rgba(244, 237, 231, 0.13)',
            }}
          >
            <MiniMetric icon={<EmailOutlinedIcon />} label="Sign-in email" value={admin.email} />
            <MiniMetric icon={<VerifiedUserOutlinedIcon />} label="Last sign-in" value={formatDateTime(admin.lastLoginAt)} />
            <MiniMetric icon={<LockResetOutlinedIcon />} label="Password form" value={strengthLabel} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.15fr 0.85fr' }, gap: 3, alignItems: 'start' }}>
        <Box component="form" onSubmit={savePassword} sx={{ ...panelSx, p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' }, gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <SectionHeader
              icon={<KeyOutlinedIcon />}
              eyebrow="Password rotation"
              title="Change password"
              body="Enter your current password and choose the new one for future sign-ins."
            />
            <Button
              type="button"
              variant="outlined"
              startIcon={showPasswords ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
              onClick={() => setShowPasswords((v) => !v)}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
            >
              {showPasswords ? 'Hide' : 'Show'}
            </Button>
          </Box>

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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
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
            </Box>

            <Box sx={{ border: `1px solid ${palette.inkBorder}`, p: 2.25 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: palette.ivory }}>
                  Password readiness
                </Typography>
                <Typography variant="caption" sx={{ color: allMet ? palette.rose : palette.ivoryMuted }}>
                  {strengthLabel}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(passwordScore / 3) * 100}
                sx={{
                  height: 7,
                  bgcolor: palette.decor,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: allMet ? palette.rose : palette.wineBright,
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
              <Requirement met={longEnough} label="At least 8 characters" body="Give the password enough length." />
              <Requirement met={differsFromCurrent} label="Different password" body="Avoid reusing the current one." />
              <Requirement met={matches} label="Confirmation matches" body="Both new password fields agree." />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
                flexWrap: 'wrap',
                pt: 3,
                borderTop: `1px solid ${palette.inkBorder}`,
              }}
            >
              <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                You will stay signed in here after the password changes.
              </Typography>
              <Button type="submit" variant="contained" disabled={saving || !allMet || !currentPassword} sx={{ minWidth: 180 }}>
                {saving ? 'Saving...' : 'Change password'}
              </Button>
            </Box>
          </Stack>
        </Box>

        <Stack spacing={3}>
          <Box sx={{ ...panelSx, p: { xs: 2.5, md: 4 } }}>
            <SectionHeader
              icon={<VerifiedUserOutlinedIcon />}
              eyebrow="Sign-in details"
              title="Account snapshot"
              body="The important access details for this admin account."
            />
            <StatusLine label="Email" value={admin.email} />
            <StatusLine label="Last sign-in" value={formatDateTime(admin.lastLoginAt)} />
            <StatusLine label="Account status" value={admin.isActive === false ? 'Deactivated' : 'Active'} />
            <StatusLine label="Password visibility" value={showPasswords ? 'Visible while editing' : 'Hidden'} />
          </Box>

          <Box sx={{ ...panelSx, p: { xs: 2.5, md: 4 } }}>
            <SectionHeader icon={<ShieldOutlinedIcon />} eyebrow="Good practice" title="Security notes" body="Small habits that protect the workspace." />
            <Stack spacing={1.5}>
              {[
                'Use a password manager and avoid reusing passwords from other tools.',
                'If you suspect the account is compromised, change this password immediately.',
                'Forgot your current password? Sign out and use the reset link on the admin login page.',
              ].map((item) => (
                <Box key={item} sx={{ border: `1px solid ${palette.inkBorder}`, p: 1.75 }}>
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                    <CheckCircleOutlineIcon sx={{ color: palette.rose, fontSize: 18, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                      {item}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ ...panelSx, p: { xs: 2.5, md: 4 } }}>
            <SectionHeader icon={<ManageAccountsOutlinedIcon />} eyebrow="Nearby" title="Account links" body="Jump to related account pages." />
            <Stack spacing={1.5}>
              <ShortcutButton to="/admin/profile" icon={<ManageAccountsOutlinedIcon />} title="Profile" body="Name, email, role, and permissions" />
              <ShortcutButton to="/admin/preferences" icon={<VerifiedUserOutlinedIcon />} title="Preferences" body="Notifications, theme, and landing page" />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
