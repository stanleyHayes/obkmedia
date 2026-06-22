import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import DownloadDoneOutlinedIcon from '@mui/icons-material/DownloadDoneOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { palette } from '../../theme';
import ParallaxFrame from '../ParallaxFrame';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

interface ExperienceStep {
  title: string;
  body: string;
  meta: string;
}

const STEP_ICONS: ReactNode[] = [
  <EventAvailableOutlinedIcon key="event" />,
  <TuneOutlinedIcon key="tune" />,
  <CameraAltOutlinedIcon key="camera" />,
  <DownloadDoneOutlinedIcon key="delivery" />,
];

export default function ExperienceSection() {
  const { t } = useTranslation();
  const steps = t('experience.steps', { returnObjects: true }) as ExperienceStep[];
  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 16 }, bgcolor: palette.inkRaised, position: 'relative', overflow: 'hidden' }}>
      <ParallaxFrame
        aria-hidden
        speed={0.055}
        maxOffset={52}
        sx={{
          position: 'absolute',
          right: { xs: -35, md: 20 },
          bottom: { xs: 20, md: 44 },
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: 'clamp(5rem, 19vw, 18rem)',
          fontWeight: 600,
          lineHeight: 0.8,
          color: palette.ghost,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        FRAME
      </ParallaxFrame>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '0.78fr 1.22fr' },
            gap: { xs: 6, md: 9 },
            alignItems: 'start',
          }}
        >
          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 112 } }}>
            <Reveal variant="tilt-left">
              <SectionHeading eyebrow={t('experience.eyebrow')} title={t('experience.title')} />
            </Reveal>
            <Reveal delay={120} variant="soft">
              <Typography variant="body1" sx={{ color: palette.ivoryMuted, maxWidth: 560, mb: 4 }}>
                {t('experience.intro')}
              </Typography>
              <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={scrollToContact}>
                {t('experience.cta')}
              </Button>
            </Reveal>
          </Box>

          <Box sx={{ borderTop: `1px solid ${palette.inkBorder}`, perspective: '1200px' }}>
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 100} variant={index % 2 === 0 ? 'tilt-right' : 'tilt-left'}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '88px minmax(0, 1fr) minmax(120px, 0.36fr)' },
                    gap: { xs: 2.5, sm: 3.5 },
                    alignItems: 'center',
                    py: { xs: 3.5, md: 4.5 },
                    borderBottom: `1px solid ${palette.inkBorder}`,
                    transform: 'translateZ(0)',
                    transformStyle: 'preserve-3d',
                    transition: 'padding-left 320ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                    '&:hover': { pl: { md: 2 }, transform: 'translate3d(0, -4px, 24px)' },
                    '&:hover .obk-step-icon': { color: palette.rose, borderColor: palette.rose },
                    '&:hover .obk-step-index': { color: palette.rose },
                  }}
                >
                  <Stack direction="row" spacing={1.4} sx={{ alignItems: 'center' }}>
                    <Typography
                      className="obk-step-index"
                      sx={{
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                        fontSize: '2.3rem',
                        lineHeight: 1,
                        color: palette.ghost,
                        transition: 'color 260ms ease',
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Typography>
                    <Box
                      className="obk-step-icon"
                      sx={{
                        width: 42,
                        height: 42,
                        display: 'grid',
                        placeItems: 'center',
                        border: `1px solid ${palette.inkBorder}`,
                        color: palette.ivoryMuted,
                        transition: 'color 260ms ease, border-color 260ms ease',
                        '& svg': { fontSize: 20 },
                      }}
                    >
                      {STEP_ICONS[index % STEP_ICONS.length]}
                    </Box>
                  </Stack>

                  <Box>
                    <Typography variant="h5" sx={{ color: palette.ivory, mb: 0.75 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: palette.ivoryMuted, maxWidth: 640 }}>
                      {step.body}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: palette.rose,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      justifySelf: { sm: 'end' },
                    }}
                  >
                    {step.meta}
                  </Typography>
                </Box>
              </Reveal>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
