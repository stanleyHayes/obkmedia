import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { BRAND } from '../../content';
import { palette } from '../../theme';

// Placeholder until the client's hero image is supplied (client confirmed one exists).
const HERO_IMAGE = 'https://picsum.photos/seed/obk-hero/1920/1200';

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <Box component="section" sx={{ position: 'relative', minHeight: '100svh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      <Box
        component="img"
        src={HERO_IMAGE}
        alt=""
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          animation: 'obk-ken-burns 18s ease-out forwards',
          filter: 'saturate(0.85) brightness(0.85)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(100deg, rgba(11,7,9,0.94) 0%, rgba(11,7,9,0.72) 45%, rgba(95,5,58,0.28) 100%), linear-gradient(to top, rgba(11,7,9,0.95) 0%, transparent 40%)',
        }}
      />
      <Container maxWidth="xl" sx={{ position: 'relative', pt: { xs: 14, md: 10 }, pb: 10 }}>
        <Box sx={{ maxWidth: 880 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', mb: 3, opacity: 0, animation: 'obk-fade-up 800ms ease forwards 200ms' }}
          >
            <Box sx={{ width: 56, height: '1px', bgcolor: palette.rose }} />
            <Typography variant="overline" sx={{ color: palette.rose }}>
              {BRAND.tagline}
            </Typography>
          </Stack>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.9rem', sm: '4rem', md: '5.4rem' },
              color: palette.ivory,
              opacity: 0,
              animation: 'obk-fade-up 900ms ease forwards 420ms',
            }}
          >
            Capturing moments that{' '}
            <Box component="em" sx={{ color: palette.rose, fontStyle: 'italic' }}>
              live beyond time
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 3.5,
              maxWidth: 560,
              color: palette.ivoryMuted,
              fontSize: '1.05rem',
              opacity: 0,
              animation: 'obk-fade-up 900ms ease forwards 640ms',
            }}
          >
            {BRAND.heroSubheadline}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            sx={{ mt: 5.5, opacity: 0, animation: 'obk-fade-up 900ms ease forwards 860ms' }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {BRAND.primaryCta}
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/portfolio')}>
              {BRAND.secondaryCta}
            </Button>
          </Stack>
        </Box>
      </Container>

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: '1px',
          height: 72,
          background: `linear-gradient(to bottom, transparent, ${palette.rose})`,
          opacity: 0.7,
        }}
      />
    </Box>
  );
}
