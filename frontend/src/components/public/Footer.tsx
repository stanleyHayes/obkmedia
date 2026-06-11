import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { BRAND, SOCIALS } from '../../content';
import { palette } from '../../theme';

const EXPLORE = [
  { label: 'Home', to: '/' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'About', to: '/#about' },
  { label: 'Services', to: '/#services' },
  { label: 'Contact', to: '/#contact' },
];

const LEGAL = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Image Copyright', to: '/terms' },
];

const linkSx = {
  color: palette.ivoryMuted,
  fontSize: '0.9rem',
  fontWeight: 300,
  width: 'fit-content',
  transition: 'color 200ms ease, padding-left 200ms ease',
  '&:hover': { color: palette.rose, pl: 0.5 },
};

export default function Footer() {
  const navigate = useNavigate();
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderTop: `1px solid ${palette.inkBorder}`,
        background: `linear-gradient(180deg, ${palette.ink} 0%, #120a0f 100%)`,
      }}
    >
      {/* Wine accent hairline across the very top */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${palette.wineBright}, transparent)`,
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', pt: { xs: 9, md: 13 } }}>
        {/* Closing call-to-action */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 4,
            pb: { xs: 7, md: 9 },
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: palette.rose, display: 'block', mb: 2 }}>
              {BRAND.tagline}
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '2.3rem', md: '3.4rem' }, maxWidth: 640, lineHeight: 1.08 }}>
              Let’s create something{' '}
              <Box component="em" sx={{ color: palette.rose, fontStyle: 'italic' }}>
                timeless
              </Box>
              .
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowOutwardIcon />}
            onClick={() => navigate('/#contact')}
          >
            {BRAND.primaryCta}
          </Button>
        </Box>

        {/* Link + contact grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.6fr 1fr 1fr 1.2fr' },
            gap: { xs: 5, md: 4 },
            borderTop: `1px solid ${palette.inkBorder}`,
            pt: { xs: 6, md: 7 },
            pb: { xs: 8, md: 10 },
          }}
        >
          <Box sx={{ maxWidth: 360 }}>
            <Typography variant="h4" sx={{ letterSpacing: '0.08em', mb: 2 }}>
              OBK{' '}
              <Box component="span" sx={{ fontStyle: 'italic', color: palette.rose }}>
                MEDIA
              </Box>
            </Typography>
            <Typography variant="body2" sx={{ color: palette.ivoryMuted, mb: 3 }}>
              {BRAND.intro}
            </Typography>
            <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.1em' }}>
              {BRAND.location} · {BRAND.areasServed}
            </Typography>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: palette.rose, display: 'block', mb: 2.5 }}>
              Explore
            </Typography>
            <Stack spacing={1.5}>
              {EXPLORE.map((item) => (
                <Link
                  key={item.label}
                  component={RouterLink}
                  to={item.to}
                  onClick={() => item.to === '/' && window.scrollTo({ top: 0 })}
                  sx={linkSx}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: palette.rose, display: 'block', mb: 2.5 }}>
              Legal
            </Typography>
            <Stack spacing={1.5}>
              {LEGAL.map((item) => (
                <Link key={item.label} component={RouterLink} to={item.to} onClick={toTop} sx={linkSx}>
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: palette.rose, display: 'block', mb: 2.5 }}>
              Get in touch
            </Typography>
            <Stack spacing={1.5}>
              <Link href={`mailto:${BRAND.email}`} sx={linkSx}>
                {BRAND.email}
              </Link>
              <Link href={`tel:+233546175921`} sx={linkSx}>
                {BRAND.phoneIntl}
              </Link>
              <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.08em' }}>
                {BRAND.hours}
              </Typography>
              <Stack direction="row" spacing={2.5} sx={{ pt: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
                {SOCIALS.map((social) => (
                  <Link
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener"
                    sx={{
                      color: palette.ivoryMuted,
                      fontSize: '0.72rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      '&:hover': { color: palette.rose },
                    }}
                  >
                    {social.name}
                  </Link>
                ))}
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Oversized brand watermark */}
        <Box
          aria-hidden
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 0.8,
            fontSize: 'clamp(3.5rem, 17vw, 16rem)',
            letterSpacing: '0.04em',
            color: 'transparent',
            background: `linear-gradient(180deg, rgba(223,169,201,0.12), rgba(95,5,58,0))`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            userSelect: 'none',
            pointerEvents: 'none',
            mb: { xs: -1, md: -3 },
          }}
        >
          OBK MEDIA
        </Box>

        {/* Bottom bar */}
        <Box
          sx={{
            borderTop: `1px solid ${palette.inkBorder}`,
            py: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved. Images may not be used without written permission.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: palette.ivoryMuted, fontStyle: 'italic', fontFamily: '"Cormorant Garamond", serif', fontSize: '0.95rem' }}>
              The Master’s Touch You Need
            </Typography>
            <IconButton
              aria-label="Back to top"
              onClick={toTop}
              size="small"
              sx={{
                color: palette.ivory,
                border: `1px solid ${palette.inkBorder}`,
                borderRadius: 0,
                '&:hover': { borderColor: palette.rose, color: palette.rose },
              }}
            >
              <KeyboardArrowUpIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
