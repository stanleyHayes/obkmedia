import Box from '@mui/material/Box';
import { palette } from '../theme';

interface SplashScreenProps {
  /** When false, renders inline (fills its parent) instead of full-viewport. */
  fullscreen?: boolean;
}

/**
 * Branded loading screen — the wordmark with a sweeping wine shimmer and a
 * thin indeterminate progress line. Used for route/auth loads and mirrors the
 * static splash in index.html so the transition is seamless.
 */
export default function SplashScreen({ fullscreen = true }: SplashScreenProps) {
  return (
    <Box
      sx={{
        position: fullscreen ? 'fixed' : 'relative',
        inset: fullscreen ? 0 : undefined,
        minHeight: fullscreen ? '100vh' : '60vh',
        zIndex: fullscreen ? 1400 : undefined,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        bgcolor: palette.ink,
        backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(95,5,58,0.28), transparent 60%)',
      }}
    >
      <Box
        sx={{
          fontFamily: '"Cormorant Garamond", serif',
          fontWeight: 600,
          fontSize: { xs: '2.4rem', md: '3.4rem' },
          letterSpacing: '0.18em',
          color: palette.ivory,
          background: `linear-gradient(100deg, ${palette.ivory} 30%, ${palette.rose} 50%, ${palette.ivory} 70%)`,
          backgroundSize: '200% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'obk-shimmer 2s ease-in-out infinite',
        }}
      >
        OBK MEDIA
      </Box>
      <Box sx={{ position: 'relative', width: 160, height: '2px', bgcolor: 'rgba(244,237,231,0.12)', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            width: '40%',
            bgcolor: palette.wineBright,
            animation: 'obk-track 1.4s ease-in-out infinite',
          }}
        />
      </Box>
    </Box>
  );
}
