import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Seo from '../seo/Seo';
import { palette } from '../theme';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <>
      <Seo title={t('notFound.errorLabel')} />
      <Box
        sx={{
          position: 'relative',
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(95,5,58,0.28), transparent 60%)',
        }}
      >
        {/* Oversized ghost numerals */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 600,
            fontSize: 'clamp(14rem, 42vw, 40rem)',
            lineHeight: 1,
            letterSpacing: '0.05em',
            color: palette.ghost,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          404
        </Box>

        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center', py: { xs: 18, md: 12 } }}>
          <Typography variant="overline" sx={{ color: palette.rose, display: 'block', mb: 2, letterSpacing: '0.32em' }}>
            {t('notFound.errorLabel')}
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.6rem', md: '4.2rem' }, mb: 2.5 }}>
            {t('notFound.titlePre')}{' '}
            <Box component="em" sx={{ color: palette.rose, fontStyle: 'italic' }}>
              {t('notFound.titleEm')}
            </Box>
          </Typography>
          <Typography variant="body1" sx={{ color: palette.ivoryMuted, maxWidth: 460, mx: 'auto', mb: 5 }}>
            {t('notFound.body')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button variant="contained" size="large" component={RouterLink} to="/" onClick={() => window.scrollTo({ top: 0 })}>
              {t('notFound.backHome')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowOutwardIcon />}
              component={RouterLink}
              to="/portfolio"
              onClick={() => window.scrollTo({ top: 0 })}
            >
              {t('notFound.viewPortfolio')}
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
