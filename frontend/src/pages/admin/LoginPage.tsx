import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { landingFor } from '../../admin/landingPages';
import { adminApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import BrandLogo from '../../components/BrandLogo';
import ThemeToggle from '../../components/ThemeToggle';
import { BRAND } from '../../content';
import Seo from '../../seo/Seo';
import { onDark, palette } from '../../theme';

const LOGIN_IMAGE =
  'https://res.cloudinary.com/dvoqbonr2/image/upload/c_limit,f_auto,q_auto,w_1800/v1/obkmedia/portfolio/IMG_5650?_a=BAMAPqRj0';

const studioNotes = [
  { label: 'Portfolio', value: 'Live gallery control' },
  { label: 'Inbox', value: 'Client inquiries' },
  { label: 'Studio', value: 'Pricing and content' },
] as const;

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
  const [showPassword, setShowPassword] = useState(false);

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
      setError(err instanceof ApiError ? err.message : 'Something went wrong - please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: 'login' | 'forgot') => {
    setMode(next);
    setError(null);
    setForgotSent(false);
  };

  const pageTitle = mode === 'login' ? 'Welcome back to the studio desk.' : 'Reset admin access.';
  const pageBody =
    mode === 'login'
      ? 'Sign in to manage galleries, messages, pricing, and the public OBK MEDIA story.'
      : 'Enter your admin email and we will send a secure reset link if the account exists.';

  return (
    <>
      <Seo title="Admin Login" />
      <Box
        sx={{
          minHeight: '100svh',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(520px, 0.92fr) minmax(0, 1.08fr)' },
          bgcolor: palette.ink,
          color: palette.ivory,
          backgroundImage: `radial-gradient(ellipse at 8% 8%, rgba(142, 27, 99, 0.18), transparent 34%), radial-gradient(ellipse at 58% 100%, ${palette.decor}, transparent 42%)`,
        }}
      >
        <Box
          sx={{
            minHeight: { xs: '100svh', lg: 'auto' },
            display: 'flex',
            flexDirection: 'column',
            px: { xs: 2.5, sm: 5, lg: 7 },
            py: { xs: 3, md: 5 },
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: { xs: 6, md: 8 } }}>
            <BrandLogo suffix="ADMIN" animated subtitle="Secure workspace" sx={{ width: { xs: 210, sm: 238 } }} />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <ThemeToggle />
              <Button
                component={RouterLink}
                to="/"
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon fontSize="small" />}
                sx={{ display: { xs: 'none', sm: 'inline-flex' }, px: 2.2, py: 1 }}
              >
                Website
              </Button>
            </Stack>
          </Stack>

          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
              width: '100%',
              maxWidth: 520,
              mt: 'auto',
              mb: 'auto',
              mx: 'auto',
              border: `1px solid ${palette.inkBorder}`,
              bgcolor: palette.inkRaised,
              boxShadow: '0 26px 80px rgba(0, 0, 0, 0.24)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: `linear-gradient(135deg, ${palette.decor}, transparent 48%)`,
              },
            }}
          >
            <Box sx={{ position: 'relative', p: { xs: 3, sm: 4.5, md: 5 } }}>
              <Typography variant="overline" sx={{ color: palette.rose }}>
                OBK MEDIA ADMIN
              </Typography>
              <Typography variant="h3" sx={{ mt: 1.3, maxWidth: 390, fontSize: { xs: '2.25rem', sm: '2.8rem' } }}>
                {pageTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: palette.ivoryMuted, mt: 1.5, maxWidth: 390 }}>
                {pageBody}
              </Typography>

              <Divider sx={{ my: { xs: 3, sm: 4 }, borderColor: palette.inkBorder }} />

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {mode === 'forgot' && forgotSent ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    If an account exists for that email, we have sent a reset link. Check your inbox.
                  </Alert>
                  <Button variant="outlined" fullWidth onClick={() => switchMode('login')}>
                    Back to sign in
                  </Button>
                </Box>
              ) : (
                <Stack spacing={2.4}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutlineIcon fontSize="small" sx={{ color: palette.ivoryMuted }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  {mode === 'login' && (
                    <TextField
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon fontSize="small" sx={{ color: palette.ivoryMuted }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                edge="end"
                                onClick={() => setShowPassword((value) => !value)}
                                sx={{ color: palette.ivoryMuted }}
                              >
                                {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}

                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {mode === 'login' ? 'Private studio access' : 'Password recovery'}
                    </Typography>
                    {mode === 'login' ? (
                      <Button variant="text" size="small" onClick={() => switchMode('forgot')} sx={{ color: palette.rose, px: 0 }}>
                        Forgot password?
                      </Button>
                    ) : (
                      <Button variant="text" size="small" onClick={() => switchMode('login')} sx={{ color: palette.ivoryMuted, px: 0 }}>
                        Back to sign in
                      </Button>
                    )}
                  </Stack>

                  <Button type="submit" variant="contained" fullWidth size="large" disabled={submitting} endIcon={<ArrowForwardIcon />}>
                    {submitting
                      ? mode === 'login'
                        ? 'Signing in...'
                        : 'Sending...'
                      : mode === 'login'
                        ? 'Sign in'
                        : 'Send reset link'}
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>

          <Typography sx={{ color: palette.ivoryMuted, fontSize: '0.74rem', mt: { xs: 5, md: 7 }, textAlign: 'center' }}>
            {BRAND.location} · Secure access for OBK MEDIA workspace operators.
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'relative',
            minHeight: '100svh',
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'flex-end',
            overflow: 'hidden',
            borderLeft: `1px solid ${palette.inkBorder}`,
          }}
        >
          <Box
            component="img"
            src={LOGIN_IMAGE}
            alt=""
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '50% 28%',
              filter: 'saturate(0.92) brightness(0.84)',
              transform: 'scale(1.02)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(11, 7, 9, 0.78) 0%, rgba(11, 7, 9, 0.32) 48%, rgba(11, 7, 9, 0.86) 100%), linear-gradient(to top, rgba(11, 7, 9, 0.96) 0%, transparent 58%)',
            }}
          />
          <Box sx={{ position: 'relative', width: '100%', p: { lg: 6, xl: 8 } }}>
            <Typography variant="overline" sx={{ color: onDark.rose }}>
              Studio operations
            </Typography>
            <Typography variant="h1" sx={{ color: onDark.ivory, mt: 1.5, maxWidth: 680, fontSize: { lg: '4.5rem', xl: '5.6rem' } }}>
              Keep every story moving.
            </Typography>
            <Typography variant="body1" sx={{ color: onDark.ivoryMuted, mt: 2.5, maxWidth: 540, fontSize: '1.02rem' }}>
              A focused workspace for the shoots, galleries, inquiries, and public content behind OBK MEDIA.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.5, mt: 5, maxWidth: 720 }}>
              {studioNotes.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    border: '1px solid rgba(244, 237, 231, 0.2)',
                    bgcolor: 'rgba(11, 7, 9, 0.46)',
                    backdropFilter: 'blur(12px)',
                    p: 2,
                    minHeight: 108,
                  }}
                >
                  <Typography sx={{ color: onDark.rose, fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ color: onDark.ivory, mt: 1, fontSize: '0.96rem', lineHeight: 1.35 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
