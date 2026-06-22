import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BRAND } from '../content';
import { palette } from '../theme';
import BrandLogo from './BrandLogo';

interface SplashScreenProps {
  /** When false, renders inline (fills its parent) instead of full-viewport. */
  fullscreen?: boolean;
}

const loadingSteps = ['Frame', 'Focus', 'Finish'];

/**
 * Branded loading screen used for route/auth loads. It mirrors the static
 * first-paint splash in index.html so the transition into React feels seamless.
 */
export default function SplashScreen({ fullscreen = true }: SplashScreenProps) {
  return (
    <Box
      role="status"
      aria-label="Loading OBK MEDIA"
      sx={{
        position: fullscreen ? 'fixed' : 'relative',
        inset: fullscreen ? 0 : undefined,
        minHeight: fullscreen ? '100vh' : '60vh',
        zIndex: fullscreen ? 1400 : undefined,
        display: 'grid',
        placeItems: 'center',
        px: 3,
        overflow: 'hidden',
        bgcolor: palette.ink,
        color: palette.ivory,
        backgroundImage:
          `radial-gradient(circle at 50% 42%, rgba(142, 27, 99, 0.24), transparent 34%), radial-gradient(circle at 18% 18%, ${palette.decor}, transparent 28%), radial-gradient(circle at 84% 78%, rgba(223, 169, 201, 0.08), transparent 30%)`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: { xs: 18, sm: 28 },
          border: `1px solid ${palette.inkBorder}`,
          opacity: 0.72,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: { xs: 76, sm: 120 },
            height: { xs: 76, sm: 120 },
            borderColor: palette.rose,
            opacity: 0.45,
          },
          '&::before': {
            left: -1,
            top: -1,
            borderLeft: '1px solid',
            borderTop: '1px solid',
          },
          '&::after': {
            right: -1,
            bottom: -1,
            borderRight: '1px solid',
            borderBottom: '1px solid',
          },
        }}
      />

      <Box
        sx={{
          width: 'min(100%, 520px)',
          display: 'grid',
          justifyItems: 'center',
          gap: { xs: 2.4, md: 3 },
          textAlign: 'center',
          transformStyle: 'preserve-3d',
          animation: 'obk-3d-rise 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <BrandLogo
          animated
          subtitle={BRAND.tagline}
          sx={{
            width: { xs: 'min(100%, 330px)', sm: 'min(100%, 410px)', md: 'min(100%, 470px)' },
            filter: 'drop-shadow(0 28px 70px rgba(11, 7, 9, 0.32))',
          }}
        />

        <Box sx={{ width: 'min(100%, 320px)', mt: 1.5 }}>
          <Box
            sx={{
              position: 'relative',
              height: 3,
              bgcolor: palette.ghost,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                width: '36%',
                background: `linear-gradient(90deg, ${palette.wine}, ${palette.wineBright}, ${palette.rose})`,
                animation: 'obk-track 1.35s ease-in-out infinite',
              }}
            />
          </Box>
          <Box
            aria-hidden
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
              mt: 1.5,
            }}
          >
            {loadingSteps.map((step, index) => (
              <Typography
                key={step}
                variant="caption"
                sx={{
                  color: index === 1 ? palette.rose : palette.ivoryMuted,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontSize: '0.62rem',
                }}
              >
                {step}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
