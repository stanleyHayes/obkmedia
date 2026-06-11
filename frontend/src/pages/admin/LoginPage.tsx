import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { AdminUser, Permission } from '../../api/types';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import Seo from '../../seo/Seo';
import { palette } from '../../theme';

const LANDING_PERMISSION: Record<string, Permission> = {
  '/admin/portfolio': 'portfolio.view',
  '/admin/messages': 'messages.view',
};

/** Honor the saved landing page only if the user's role can still reach it. */
function landingFor(admin: AdminUser): string {
  const target = admin.preferences.defaultLandingPage || '/admin';
  const needed = LANDING_PERMISSION[target];
  if (needed && !admin.permissions.includes(needed)) return '/admin';
  return target;
}

export default function LoginPage() {
  const { admin, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [forgotSent, setForgotSent] = useState(false);

  if (!loading && admin) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? landingFor(admin)} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'forgot') {
        await adminApi.forgotPassword(email);
        setForgotSent(true);
      } else {
        const signedIn = await login(email, password);
        const from = (location.state as { from?: string } | null)?.from;
        navigate(from ?? landingFor(signedIn), { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: 'login' | 'forgot') => {
    setMode(next);
    setError(null);
    setForgotSent(false);
  };

  return (
    <>
      <Seo title="Admin Login" />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          p: 3,
          background: `radial-gradient(ellipse at 30% 20%, rgba(95, 5, 58, 0.3), transparent 55%), ${palette.ink}`,
        }}
      >
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            width: '100%',
            maxWidth: 420,
            border: `1px solid ${palette.inkBorder}`,
            bgcolor: palette.inkRaised,
            p: { xs: 4, md: 6 },
          }}
        >
          <Typography variant="h4" sx={{ letterSpacing: '0.12em', mb: 0.5 }}>
            OBK{' '}
            <Box component="span" sx={{ color: palette.rose, fontStyle: 'italic' }}>
              MEDIA
            </Box>
          </Typography>
          <Typography variant="overline" sx={{ color: palette.ivoryMuted, display: 'block', mb: 4 }}>
            Admin dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {mode === 'forgot' && forgotSent ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                If an account exists for that email, we’ve sent a reset link. Check your inbox.
              </Alert>
              <Button variant="outlined" fullWidth onClick={() => switchMode('login')}>
                Back to sign in
              </Button>
            </>
          ) : (
            <>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2.5 }}
              />
              {mode === 'login' && (
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 1.5 }}
                />
              )}
              {mode === 'forgot' && (
                <Typography variant="body2" sx={{ color: palette.ivoryMuted, mb: 3 }}>
                  Enter your account email and we’ll send you a link to reset your password.
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: mode === 'login' ? 3 : 0 }}>
                {mode === 'login' ? (
                  <Button variant="text" size="small" onClick={() => switchMode('forgot')} sx={{ color: palette.rose }}>
                    Forgot password?
                  </Button>
                ) : (
                  <Button variant="text" size="small" onClick={() => switchMode('login')} sx={{ color: palette.ivoryMuted }}>
                    Back to sign in
                  </Button>
                )}
              </Box>
              <Button type="submit" variant="contained" fullWidth size="large" disabled={submitting}>
                {submitting
                  ? mode === 'login'
                    ? 'Signing in…'
                    : 'Sending…'
                  : mode === 'login'
                    ? 'Sign in'
                    : 'Send reset link'}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
