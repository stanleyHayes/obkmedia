import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import Seo from '../../seo/Seo';
import { palette } from '../../theme';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords don’t match.');
      return;
    }
    setSaving(true);
    try {
      await adminApi.resetPassword(token, newPassword);
      setDone(true);
      window.setTimeout(() => navigate('/admin/login'), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t reset your password — try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Seo title="Reset password" />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          p: 3,
          background: `radial-gradient(ellipse at 30% 20%, rgba(95, 5, 58, 0.3), transparent 55%), ${palette.ink}`,
        }}
      >
        <Box component="form" onSubmit={submit} sx={{ width: '100%', maxWidth: 420, border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 4, md: 6 } }}>
          <Typography variant="h4" sx={{ letterSpacing: '0.12em', mb: 0.5 }}>
            OBK <Box component="span" sx={{ color: palette.rose, fontStyle: 'italic' }}>MEDIA</Box>
          </Typography>
          <Typography variant="overline" sx={{ color: palette.ivoryMuted, display: 'block', mb: 4 }}>
            Reset your password
          </Typography>

          {!token && (
            <Alert severity="error" sx={{ mb: 3 }}>
              This reset link is missing its token. Please use the link from your email.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {done ? (
            <Alert severity="success">
              Your password has been reset. Redirecting you to sign in…
            </Alert>
          ) : (
            <>
              <TextField
                label="New password"
                type="password"
                fullWidth
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="At least 8 characters"
                sx={{ mb: 2.5 }}
                disabled={!token}
              />
              <TextField
                label="Confirm new password"
                type="password"
                fullWidth
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                sx={{ mb: 4 }}
                disabled={!token}
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={saving || !token}>
                {saving ? 'Resetting…' : 'Reset password'}
              </Button>
            </>
          )}
          <Button component={RouterLink} to="/admin/login" variant="text" fullWidth sx={{ mt: 2, color: palette.ivoryMuted }}>
            Back to sign in
          </Button>
        </Box>
      </Box>
    </>
  );
}
