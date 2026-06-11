import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { BRAND } from '../../content';
import { palette } from '../../theme';

const NAV_ITEMS = [
  { label: 'Home', to: '/', hash: '' },
  { label: 'Portfolio', to: '/portfolio', hash: '' },
  { label: 'About', to: '/', hash: 'about' },
  { label: 'Services', to: '/', hash: 'services' },
  { label: 'Contact', to: '/', hash: 'contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (item: (typeof NAV_ITEMS)[number]) => {
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

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled ? 'rgba(11, 7, 9, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? `1px solid ${palette.inkBorder}` : '1px solid transparent',
          transition: 'all 320ms ease',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 84 }, justifyContent: 'space-between' }}>
            <Box
              component={RouterLink}
              to="/"
              onClick={() => window.scrollTo({ top: 0 })}
              sx={{ textDecoration: 'none', lineHeight: 1 }}
            >
              <Typography
                variant="h5"
                component="span"
                sx={{ color: palette.ivory, letterSpacing: '0.16em', fontWeight: 600 }}
              >
                OBK
                <Box component="span" sx={{ color: palette.rose, fontStyle: 'italic' }}>
                  {' '}
                  MEDIA
                </Box>
              </Typography>
            </Box>

            <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {NAV_ITEMS.map((item) => (
                <Typography
                  key={item.label}
                  component="button"
                  onClick={() => go(item)}
                  sx={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: palette.ivory,
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: '0.78rem',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontWeight: 400,
                    p: 0,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      bottom: -6,
                      width: '100%',
                      height: '1px',
                      bgcolor: palette.rose,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 280ms ease',
                    },
                    '&:hover::after': { transform: 'scaleX(1)' },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
              <Button variant="contained" color="primary" size="small" onClick={() => go(NAV_ITEMS[4])}>
                {BRAND.primaryCta}
              </Button>
            </Stack>

            <IconButton
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: palette.ivory }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { width: '100%', maxWidth: 360, bgcolor: palette.ink, p: 3 } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton aria-label="Close menu" onClick={() => setOpen(false)} sx={{ color: palette.ivory }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Stack spacing={4} sx={{ mt: 6, px: 2 }}>
          {NAV_ITEMS.map((item, index) => (
            <Typography
              key={item.label}
              component="button"
              onClick={() => go(item)}
              sx={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: palette.ivory,
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '2rem',
                p: 0,
                opacity: 0,
                animation: `obk-fade-up 500ms ease forwards ${120 + index * 80}ms`,
                '&:hover': { color: palette.rose },
              }}
            >
              {item.label}
            </Typography>
          ))}
        </Stack>
      </Drawer>
    </>
  );
}
