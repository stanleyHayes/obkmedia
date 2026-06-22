import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MovieCreationOutlinedIcon from '@mui/icons-material/MovieCreationOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { palette } from '../../theme';
import ParallaxFrame from '../ParallaxFrame';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

interface MomentItem {
  title: string;
  body: string;
}

const ICONS: ReactNode[] = [
  <FavoriteBorderOutlinedIcon key="love" />,
  <MovieCreationOutlinedIcon key="film" />,
  <GroupsOutlinedIcon key="people" />,
  <WorkOutlineOutlinedIcon key="brand" />,
];

export default function SignatureMomentsSection() {
  const { t } = useTranslation();
  const moments = t('moments.items', { returnObjects: true }) as MomentItem[];
  const marquee = t('moments.marquee', { returnObjects: true }) as string[];

  return (
    <Box component="section" sx={{ position: 'relative', overflow: 'hidden', py: { xs: 9, md: 13 } }}>
      <ParallaxFrame
        aria-hidden
        speed={-0.05}
        maxOffset={44}
        sx={{
          position: 'absolute',
          right: { xs: -80, md: 50 },
          top: { xs: 18, md: 30 },
          color: palette.decor,
          lineHeight: 0,
          pointerEvents: 'none',
          '& svg': { fontSize: { xs: 210, md: 330 } },
        }}
      >
        <AutoAwesomeOutlinedIcon />
      </ParallaxFrame>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '0.8fr 1.2fr' },
            gap: { xs: 5, md: 8 },
            alignItems: 'end',
            mb: { xs: 5, md: 7 },
          }}
        >
          <Reveal variant="tilt-left">
            <SectionHeading eyebrow={t('moments.eyebrow')} title={t('moments.title')} />
          </Reveal>
          <Reveal delay={120} variant="soft">
            <Typography variant="body1" sx={{ color: palette.ivoryMuted, maxWidth: 720 }}>
              {t('moments.intro')}
            </Typography>
          </Reveal>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
            borderTop: `1px solid ${palette.inkBorder}`,
            borderLeft: `1px solid ${palette.inkBorder}`,
            perspective: '1200px',
          }}
        >
          {moments.map((moment, index) => (
            <Reveal key={moment.title} delay={index * 90} variant={index % 2 === 0 ? 'tilt-left' : 'tilt-right'}>
              <Box
                sx={{
                  minHeight: 260,
                  height: '100%',
                  p: { xs: 3.5, md: 4 },
                  borderRight: `1px solid ${palette.inkBorder}`,
                  borderBottom: `1px solid ${palette.inkBorder}`,
                  background: index === 0 ? `linear-gradient(145deg, ${palette.decor}, transparent 58%)` : 'transparent',
                  transform: 'translateZ(0)',
                  transformStyle: 'preserve-3d',
                  transition: 'background-color 320ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                  '&:hover': {
                    bgcolor: 'rgba(95, 5, 58, 0.12)',
                    transform: 'translate3d(0, -8px, 28px) rotateX(2deg)',
                  },
                  '&:hover .obk-moment-icon': { color: palette.rose, borderColor: palette.rose },
                }}
              >
                <Box
                  className="obk-moment-icon"
                  sx={{
                    width: 48,
                    height: 48,
                    display: 'grid',
                    placeItems: 'center',
                    border: `1px solid ${palette.inkBorder}`,
                    color: palette.ivoryMuted,
                    mb: 4,
                    transition: 'color 260ms ease, border-color 260ms ease',
                    '& svg': { fontSize: 22 },
                  }}
                >
                  {ICONS[index % ICONS.length]}
                </Box>
                <Typography variant="h5" sx={{ color: palette.ivory, mb: 1.5 }}>
                  {moment.title}
                </Typography>
                <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                  {moment.body}
                </Typography>
              </Box>
            </Reveal>
          ))}
        </Box>
      </Container>

      <Box
        aria-hidden
        sx={{
          mt: { xs: 7, md: 10 },
          borderTop: `1px solid ${palette.inkBorder}`,
          borderBottom: `1px solid ${palette.inkBorder}`,
          overflow: 'hidden',
          color: palette.ghost,
        }}
      >
        <Stack
          direction="row"
          spacing={4}
          sx={{
            width: 'max-content',
            py: 2.5,
            animation: 'obk-marquee 30s linear infinite',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          {[...marquee, ...marquee].map((item, index) => (
            <Typography
              key={`${item}-${index}`}
              sx={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: { xs: '2rem', md: '3.6rem' },
                fontWeight: 500,
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {item}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
