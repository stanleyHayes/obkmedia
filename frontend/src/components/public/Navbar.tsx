import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { BRAND } from '../../content';
import { onDark, palette } from '../../theme';
import LanguageSwitcher from '../LanguageSwitcher';
import SocialLinks from './SocialLinks';
import ThemeToggle from '../ThemeToggle';

interface NavItem {
  key: 'home' | 'portfolio' | 'about' | 'services' | 'contact';
  to: string;
  hash: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', to: '/', hash: '' },
  { key: 'portfolio', to: '/portfolio', hash: '' },
  { key: 'about', to: '/', hash: 'about' },
  { key: 'services', to: '/', hash: 'services' },
  { key: 'contact', to: '/', hash: 'contact' },
];

const SECTION_IDS = ['about', 'services', 'contact'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy: highlight the nav item for the section currently in view.
  useEffect(() => {
    if (!isHome) {
      setActiveSection('');
      return;
    }
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
        else if (window.scrollY < 200) setActiveSection('');
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome]);

  const isActive = (item: NavItem): boolean => {
    if (item.to === '/portfolio') return location.pathname.startsWith('/portfolio');
    if (item.hash) return isHome && activeSection === item.hash;
    // Home
    return isHome && activeSection === '';
  };

  const go = (item: NavItem) => {
    setOpen(false);
    if (item.hash) {
      if (location.pathname !== '/') {
        navigate(`/#${item.hash}`);
      } else {
        document.getElementById(item.hash)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(item.to);
      window.scrollTo({ top: 0 });
    }
  };

  // Only the home page and portfolio detail pages open with an always-dark
  // hero image; everywhere else the unscrolled bar sits on the page background.
  // Over a dark hero the text must stay light in both themes; otherwise it
  // follows the active theme (the scrolled scrim also flips with the theme).
  const hasDarkHero = isHome || /^\/portfolio\/.+/.test(location.pathname);
  const overDark = !scrolled && hasDarkHero;
  const navText = overDark ? onDark.ivory : palette.ivory;
  const navMuted = overDark ? 'rgba(244,237,231,0.72)' : palette.ivoryMuted;
  const navRose = overDark ? onDark.rose : palette.rose;

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled ? palette.scrim : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: `1px solid ${scrolled ? palette.inkBorder : 'transparent'}`,
          transition: 'all 360ms ease',
        }}
      >
        {/* Top utility strip — collapses away on scroll */}
        <Box
          sx={{
            overflow: 'hidden',
            maxHeight: scrolled ? 0 : 44,
            opacity: scrolled ? 0 : 1,
            transition: 'all 360ms ease',
            borderBottom: `1px solid ${overDark ? 'rgba(223,169,201,0.12)' : palette.inkBorder}`,
          }}
        >
          <Container maxWidth="xl">
            <Stack
              direction="row"
              sx={{
                height: 44,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={3} sx={{ alignItems: 'center', color: navMuted }}>
                <Link
                  href={`mailto:${BRAND.email}`}
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: 'inherit', fontSize: '0.72rem', letterSpacing: '0.08em', '&:hover': { color: navRose } }}
                >
                  <EmailOutlinedIcon sx={{ fontSize: '0.95rem' }} /> {BRAND.email}
                </Link>
                <Link
                  href="tel:+233546175921"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' }, alignItems: 'center', gap: 0.75, color: 'inherit', fontSize: '0.72rem', letterSpacing: '0.08em', '&:hover': { color: navRose } }}
                >
                  <PhoneOutlinedIcon sx={{ fontSize: '0.95rem' }} /> {BRAND.phoneIntl}
                </Link>
              </Stack>
              <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                <SocialLinks color={navMuted} size={18} />
                <Box sx={{ width: '1px', height: 16, bgcolor: overDark ? 'rgba(244,237,231,0.2)' : palette.inkBorder }} />
                <LanguageSwitcher color={navMuted} />
                <ThemeToggle sx={{ color: navMuted, p: 0.5 }} />
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Main bar */}
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 62, md: scrolled ? 70 : 80 },
              transition: 'min-height 360ms ease',
              justifyContent: 'space-between',
            }}
          >
            <Box
              component={RouterLink}
              to="/"
              onClick={() => window.scrollTo({ top: 0 })}
              sx={{ textDecoration: 'none', lineHeight: 1 }}
            >
              <Typography variant="h5" component="span" sx={{ color: navText, letterSpacing: '0.16em', fontWeight: 600 }}>
                OBK
                <Box component="span" sx={{ color: navRose, fontStyle: 'italic' }}>
                  {' '}
                  MEDIA
                </Box>
              </Typography>
            </Box>

            <Stack direction="row" spacing={4.5} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item);
                return (
                  <Typography
                    key={item.key}
                    component="button"
                    onClick={() => go(item)}
                    sx={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: active ? navRose : navText,
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: '0.76rem',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      fontWeight: 400,
                      p: 0,
                      position: 'relative',
                      transition: 'color 240ms ease',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        bottom: -7,
                        width: '100%',
                        height: '1px',
                        bgcolor: navRose,
                        transform: active ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: 'transform 280ms ease',
                      },
                      '&:hover': { color: navRose },
                      '&:hover::after': { transform: 'scaleX(1)' },
                    }}
                  >
                    {t(`nav.${item.key}`)}
                  </Typography>
                );
              })}
              <Button
                variant="contained"
                color="primary"
                size="small"
                endIcon={<ArrowOutwardIcon sx={{ fontSize: '1rem !important' }} />}
                onClick={() => go(NAV_ITEMS[4])}
              >
                {t('nav.book')}
              </Button>
            </Stack>

            <IconButton
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: navText }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>

        {/* Wine scroll-progress line */}
        <Box
          aria-hidden
          sx={{
            height: '2px',
            width: `${progress * 100}%`,
            bgcolor: palette.wineBright,
            opacity: scrolled ? 1 : 0,
            transition: 'opacity 360ms ease',
          }}
        />
      </AppBar>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: '100%',
              maxWidth: 380,
              bgcolor: palette.ink,
              backgroundImage: 'radial-gradient(ellipse at 80% 0%, rgba(95,5,58,0.35), transparent 60%)',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: palette.ivory, letterSpacing: '0.14em' }}>
            OBK <Box component="span" sx={{ color: palette.rose, fontStyle: 'italic' }}>MEDIA</Box>
          </Typography>
          <IconButton aria-label="Close menu" onClick={() => setOpen(false)} sx={{ color: palette.ivory }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={3.5} sx={{ mt: 7, px: 1, flex: 1 }}>
          {NAV_ITEMS.map((item, index) => (
            <Typography
              key={item.key}
              component="button"
              onClick={() => go(item)}
              sx={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: isActive(item) ? palette.rose : palette.ivory,
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '2.1rem',
                lineHeight: 1,
                p: 0,
                opacity: 0,
                animation: `obk-fade-up 500ms ease forwards ${120 + index * 70}ms`,
                '&:hover': { color: palette.rose },
              }}
            >
              {t(`nav.${item.key}`)}
            </Typography>
          ))}
        </Stack>

        <Box sx={{ px: 1, pb: 1 }}>
          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowOutwardIcon />}
            onClick={() => go(NAV_ITEMS[4])}
            sx={{ mb: 3 }}
          >
            {t('nav.book')}
          </Button>
          <Stack spacing={1}>
            <Link href={`mailto:${BRAND.email}`} sx={{ color: palette.ivoryMuted, fontSize: '0.85rem', fontWeight: 300 }}>
              {BRAND.email}
            </Link>
            <Link href="tel:+233546175921" sx={{ color: palette.ivoryMuted, fontSize: '0.85rem', fontWeight: 300 }}>
              {BRAND.phoneIntl}
            </Link>
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
            <SocialLinks color={palette.ivoryMuted} />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LanguageSwitcher color={palette.ivoryMuted} />
              <ThemeToggle sx={{ color: palette.ivoryMuted }} />
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
