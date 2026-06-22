import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBrand, useSiteSettings } from '../../SiteSettingsContext';
import { onDark } from '../../theme';
import ParallaxFrame from '../ParallaxFrame';

const HERO_IMAGE =
  'https://res.cloudinary.com/dvoqbonr2/image/upload/c_limit,f_auto,q_auto,w_2200/v1/obkmedia/portfolio/IMG_5650?_a=BAMAPqRj0';

const heroRevealSx = (delay: number) => ({
  opacity: 0,
  transformOrigin: '50% 80%',
  transformStyle: 'preserve-3d',
  animation: `obk-3d-rise 980ms cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}ms`,
});

export default function HeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const brand = useBrand();
  const heroImage = settings?.heroImageUrl?.trim() || HERO_IMAGE;
  return (
    <Box
      component="section"
      sx={{ position: 'relative', minHeight: '100svh', display: 'flex', alignItems: 'center', overflow: 'hidden', perspective: '1200px' }}
    >
      <ParallaxFrame
        speed={0.16}
        maxOffset={120}
        scale={1.08}
        sx={{
          position: 'absolute',
          inset: '-8svh 0',
          height: '116%',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt=""
          aria-hidden
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: { xs: '52% 28%', md: '50% 30%' },
            animation: 'obk-ken-burns 18s ease-out forwards',
            filter: 'saturate(0.92) brightness(0.78)',
          }}
        />
      </ParallaxFrame>
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
            sx={{ alignItems: 'center', mb: 3, ...heroRevealSx(200) }}
          >
            <Box sx={{ width: 56, height: '1px', bgcolor: onDark.rose }} />
            <Typography variant="overline" sx={{ color: onDark.rose }}>
              {brand.tagline}
            </Typography>
          </Stack>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.9rem', sm: '4rem', md: '5.4rem' },
              color: onDark.ivory,
              ...heroRevealSx(420),
            }}
          >
            {settings?.heroHeadline?.trim() ? (
              settings.heroHeadline
            ) : (
              <>
                {t('hero.headlinePre')}{' '}
                <Box component="em" sx={{ color: onDark.rose, fontStyle: 'italic' }}>
                  {t('hero.headlineEm')}
                </Box>
              </>
            )}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 3.5,
              maxWidth: 560,
              color: onDark.ivoryMuted,
              fontSize: '1.05rem',
              ...heroRevealSx(640),
            }}
          >
            {settings?.heroSubheadline?.trim() || t('hero.subheadline')}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            sx={{ mt: 5.5, ...heroRevealSx(860) }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.book')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/portfolio')}
              sx={{ color: onDark.ivory, borderColor: 'rgba(244, 237, 231, 0.4)' }}
            >
              {t('hero.viewPortfolio')}
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
          background: `linear-gradient(to bottom, transparent, ${onDark.rose})`,
          opacity: 0.7,
        }}
      />
    </Box>
  );
}
