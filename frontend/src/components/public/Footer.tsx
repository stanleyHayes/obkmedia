import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import ConnectWithoutContactOutlinedIcon from '@mui/icons-material/ConnectWithoutContactOutlined';
import CopyrightOutlinedIcon from '@mui/icons-material/CopyrightOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useBrand } from '../../SiteSettingsContext';
import { palette } from '../../theme';
import ObkLogo from '../ObkLogo';
import ParallaxFrame from '../ParallaxFrame';
import Reveal from '../Reveal';
import SocialLinks from './SocialLinks';

const EXPLORE = [
  { key: 'home', to: '/', icon: <HomeOutlinedIcon /> },
  { key: 'portfolio', to: '/portfolio', icon: <CollectionsOutlinedIcon /> },
  { key: 'about', to: '/#about', icon: <InfoOutlinedIcon /> },
  { key: 'services', to: '/#services', icon: <CameraAltOutlinedIcon /> },
  { key: 'contact', to: '/#contact', icon: <MailOutlineIcon /> },
] as const;

const LEGAL = [
  { key: 'legalPrivacy', to: '/privacy', icon: <ShieldOutlinedIcon /> },
  { key: 'legalTerms', to: '/terms', icon: <ArticleOutlinedIcon /> },
  { key: 'legalCopyright', to: '/terms', icon: <CopyrightOutlinedIcon /> },
] as const;

const SERVICE_HIGHLIGHTS = [0, 1, 2, 4] as const;

const eyebrowSx = {
  color: palette.rose,
  display: 'block',
  mb: 1.5,
} as const;

const footerLinkSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1.25,
  width: 'fit-content',
  color: palette.ivoryMuted,
  fontSize: '0.9rem',
  fontWeight: 300,
  textDecoration: 'none',
  transition: 'color 220ms ease, transform 220ms ease',
  '& svg': { fontSize: '1.05rem', color: palette.rose, opacity: 0.85 },
  '&:hover': { color: palette.ivory, transform: 'translateX(4px)' },
} as const;

const contactRowSx = {
  display: 'grid',
  gridTemplateColumns: '32px minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: 1.5,
  py: 1.75,
  color: palette.ivoryMuted,
  textDecoration: 'none',
  borderBottom: `1px solid ${palette.inkBorder}`,
  '& svg': { color: palette.rose, fontSize: '1.05rem' },
  '& .obk-footer-value': {
    color: palette.ivory,
    transition: 'color 220ms ease',
    wordBreak: 'break-word',
  },
  '& .obk-footer-arrow': {
    opacity: 0,
    transform: 'translate(-6px, 6px)',
    transition: 'opacity 220ms ease, transform 220ms ease',
  },
  '&:hover .obk-footer-value': { color: palette.rose },
  '&:hover .obk-footer-arrow': { opacity: 1, transform: 'translate(0, 0)' },
} as const;

function ColumnHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5 }}>
      <Box sx={{ color: palette.rose, display: 'flex', '& svg': { fontSize: '1.05rem' } }}>{icon}</Box>
      <Typography variant="overline" sx={{ color: palette.rose }}>
        {children}
      </Typography>
    </Stack>
  );
}

function ContactRow({
  href,
  icon,
  label,
  value,
}: {
  href?: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const inner = (
    <>
      <Box sx={{ display: 'flex' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="span"
          sx={{
            display: 'block',
            color: palette.ivoryMuted,
            fontSize: '0.62rem',
            fontWeight: 500,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Typography>
        <Typography className="obk-footer-value" component="span" sx={{ display: 'block', mt: 0.4, fontSize: '0.95rem' }}>
          {value}
        </Typography>
      </Box>
      <ArrowOutwardIcon className="obk-footer-arrow" sx={{ fontSize: '0.95rem' }} />
    </>
  );

  if (!href) return <Box sx={contactRowSx}>{inner}</Box>;

  return (
    <Box
      component="a"
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener' : undefined}
      sx={contactRowSx}
    >
      {inner}
    </Box>
  );
}

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const brand = useBrand();
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const serviceHighlights = SERVICE_HIGHLIGHTS.map((index) => t(`services.items.${index}.title`));

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderTop: `1px solid ${palette.inkBorder}`,
        background: `linear-gradient(180deg, ${palette.inkRaised} 0%, ${palette.ink} 42%, ${palette.inkRaised} 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.22,
          backgroundImage: `linear-gradient(90deg, ${palette.inkBorder} 1px, transparent 1px), linear-gradient(180deg, ${palette.inkBorder} 1px, transparent 1px)`,
          backgroundSize: '88px 88px',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 12%, #000 82%, transparent 100%)',
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${palette.wineBright}, ${palette.rose}, transparent)`,
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(340px, 0.65fr)' },
            gap: { xs: 5, md: 7 },
            pt: { xs: 8, md: 12 },
            pb: { xs: 6, md: 8 },
            borderBottom: `1px solid ${palette.inkBorder}`,
          }}
        >
          <Reveal variant="tilt-left">
            <Box sx={{ maxWidth: 780 }}>
              <Typography variant="overline" sx={eyebrowSx}>
                {brand.tagline}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  maxWidth: 760,
                  fontSize: { xs: '2.45rem', sm: '3rem', md: '4rem' },
                  lineHeight: 1,
                }}
              >
                {t('footer.cta')}{' '}
                <Box component="em" sx={{ color: palette.rose, fontStyle: 'italic' }}>
                  {t('footer.ctaEm')}
                </Box>
                .
              </Typography>
              <Typography variant="body1" sx={{ color: palette.ivoryMuted, maxWidth: 620, mt: 3 }}>
                {t('footer.ctaBody')}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' }, mt: 4 }}>
                <Button variant="contained" size="large" endIcon={<ArrowOutwardIcon />} onClick={() => navigate('/#contact')}>
                  {t('nav.book')}
                </Button>
                <Button variant="outlined" size="large" component={RouterLink} to="/portfolio" onClick={toTop}>
                  {t('hero.viewPortfolio')}
                </Button>
              </Stack>
            </Box>
          </Reveal>

          <Reveal delay={120} variant="tilt-right">
            <Box
              sx={{
                alignSelf: 'stretch',
                border: `1px solid ${palette.inkBorder}`,
                background: `linear-gradient(145deg, ${palette.decor}, transparent 58%)`,
                p: { xs: 3, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 300,
              }}
            >
              <Box>
                <Typography variant="overline" sx={eyebrowSx}>
                  {t('footer.contactCardTitle')}
                </Typography>
                <Typography variant="h4" sx={{ maxWidth: 320, mb: 2 }}>
                  {t('footer.contactCardBody')}
                </Typography>
              </Box>
              <Stack spacing={1.25}>
                <Button
                  variant="contained"
                  size="large"
                  href={brand.whatsappUrl}
                  target="_blank"
                  rel="noopener"
                  startIcon={<WhatsAppIcon />}
                  endIcon={<ArrowOutwardIcon />}
                  fullWidth
                >
                  {t('contact.whatsapp')}
                </Button>
                <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.08em', textAlign: 'center' }}>
                  {t('footer.responseValue')} · {brand.phoneIntl}
                </Typography>
              </Stack>
            </Box>
          </Reveal>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1.35fr 0.78fr 0.78fr 1.1fr' },
            gap: { xs: 5, md: 5 },
            py: { xs: 6, md: 8 },
            borderBottom: `1px solid ${palette.inkBorder}`,
          }}
        >
          <Reveal variant="soft">
            <Box sx={{ maxWidth: 470 }}>
              <ObkLogo sx={{ height: { xs: 46, md: 54 }, mb: 2.5 }} />
              <Typography variant="body2" sx={{ color: palette.ivoryMuted, mb: 3 }}>
                {brand.intro}
              </Typography>
              <Box
                sx={{
                  borderLeft: `1px solid ${palette.rose}`,
                  pl: 2,
                  mb: 3.5,
                }}
              >
                <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {t('footer.studioNote')}
                </Typography>
              </Box>
              <Typography variant="overline" sx={{ color: palette.rose, display: 'block', mb: 1.5 }}>
                {t('footer.services')}
              </Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {serviceHighlights.map((service) => (
                  <Box
                    key={service}
                    sx={{
                      border: `1px solid ${palette.inkBorder}`,
                      color: palette.ivoryMuted,
                      px: 1.4,
                      py: 0.8,
                      fontSize: '0.68rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {service}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Reveal>

          <Reveal delay={80} variant="soft">
            <Box>
              <ColumnHeading icon={<ExploreOutlinedIcon />}>{t('footer.explore')}</ColumnHeading>
              <Stack spacing={1.45}>
                {EXPLORE.map((item) => (
                  <Link
                    key={item.key}
                    component={RouterLink}
                    to={item.to}
                    underline="none"
                    onClick={() => item.to === '/' && toTop()}
                    sx={footerLinkSx}
                  >
                    {item.icon}
                    {t(`nav.${item.key}`)}
                  </Link>
                ))}
              </Stack>
            </Box>
          </Reveal>

          <Reveal delay={140} variant="soft">
            <Box>
              <ColumnHeading icon={<GavelOutlinedIcon />}>{t('footer.legal')}</ColumnHeading>
              <Stack spacing={1.45}>
                {LEGAL.map((item) => (
                  <Link key={item.key} component={RouterLink} to={item.to} underline="none" onClick={toTop} sx={footerLinkSx}>
                    {item.icon}
                    {t(`footer.${item.key}`)}
                  </Link>
                ))}
              </Stack>
            </Box>
          </Reveal>

          <Reveal delay={200} variant="soft">
            <Box>
              <ColumnHeading icon={<ConnectWithoutContactOutlinedIcon />}>{t('footer.getInTouch')}</ColumnHeading>
              <Box sx={{ borderTop: `1px solid ${palette.inkBorder}` }}>
                <ContactRow href={`mailto:${brand.email}`} icon={<EmailOutlinedIcon />} label={t('contact.labels.email')} value={brand.email} />
                <ContactRow href={`tel:${brand.phoneIntl.replace(/\s+/g, '')}`} icon={<PhoneOutlinedIcon />} label={t('contact.labels.whatsapp')} value={brand.phoneIntl} />
                <ContactRow href={brand.mapsUrl} icon={<PlaceOutlinedIcon />} label={t('contact.labels.studio')} value={brand.location} />
                <ContactRow icon={<ScheduleOutlinedIcon />} label={t('contact.labels.hours')} value={t('contact.hours')} />
              </Box>
              <Box sx={{ mt: 3 }}>
                <SocialLinks color={palette.ivoryMuted} size={20} gap={1.8} />
              </Box>
            </Box>
          </Reveal>
        </Box>

        <ParallaxFrame speed={-0.045} maxOffset={42}>
          <Box
            aria-hidden
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 0.82,
              fontSize: 'clamp(3.25rem, 15vw, 15rem)',
              letterSpacing: '0.05em',
              color: palette.ghost,
              userSelect: 'none',
              pointerEvents: 'none',
              mt: { xs: 2, md: 3 },
              mb: { xs: -0.5, md: -2.5 },
            }}
          >
            OBK MEDIA
          </Box>
        </ParallaxFrame>

        <Box
          sx={{
            borderTop: `1px solid ${palette.inkBorder}`,
            pt: 3,
            pb: { xs: 11, sm: 9, md: 3 },
            pr: { xs: 8, sm: 10, md: 0 },
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
            <CopyrightOutlinedIcon sx={{ fontSize: '0.95rem', color: palette.ivoryMuted }} />
            <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
              {new Date().getFullYear()} {brand.name}. {t('footer.rights')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                color: palette.ivoryMuted,
                fontStyle: 'italic',
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '0.95rem',
              }}
            >
              {t('footer.masterTouch')}
            </Typography>
            <IconButton
              aria-label={t('a11y.backToTop')}
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
