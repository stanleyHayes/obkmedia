import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useBrand, useSiteSettings } from '../../SiteSettingsContext';
import { palette } from '../../theme';
import ParallaxFrame from '../ParallaxFrame';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import SectionDecor from './SectionDecor';

const ABOUT_IMAGE =
  'https://res.cloudinary.com/dvoqbonr2/image/upload/c_fill,g_face,h_1400,w_1050,f_auto,q_auto/v1/obkmedia/portfolio/IMG_0264';

export default function AboutSection() {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const brand = useBrand();
  const aboutImage = settings?.aboutImageUrl?.trim() || ABOUT_IMAGE;
  const paragraphs =
    settings?.aboutParagraphs && settings.aboutParagraphs.length > 0
      ? settings.aboutParagraphs
      : [t('about.p1'), t('about.p2'), t('about.p3')];
  const difference = settings?.aboutDifference?.trim() || t('about.difference');
  const mission = settings?.mission?.trim() || t('about.mission');
  const vision = settings?.vision?.trim() || t('about.vision');
  const stats =
    settings?.stats && settings.stats.length > 0
      ? settings.stats
      : [
          { value: `${brand.yearsExperience}+`, label: t('about.statYears') },
          { value: t('about.nationwide'), label: t('about.statAreas') },
          { value: t('about.hours'), label: t('about.statHours') },
        ];
  return (
    <Box component="section" id="about" sx={{ py: { xs: 10, md: 16 }, position: 'relative', overflow: 'hidden' }}>
      <SectionDecor speed={-0.06} sx={{ left: { xs: -50, md: -20 }, bottom: 30 }}>
        <AutoStoriesOutlinedIcon sx={{ fontSize: { xs: 220, md: 320 } }} />
      </SectionDecor>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '5fr 6fr' },
            gap: { xs: 6, md: 10 },
            alignItems: 'center',
          }}
        >
          <Reveal variant="tilt-right">
            <ParallaxFrame speed={-0.045} maxOffset={44}>
              <Box sx={{ position: 'relative', pr: { md: 4 }, pb: { md: 4 } }}>
                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    border: `1px solid ${palette.inkBorder}`,
                    backgroundColor: palette.ink,
                    boxShadow: '0 34px 90px rgba(11, 7, 9, 0.32)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, rgba(11,7,9,0) 52%, rgba(11,7,9,0.34) 100%), linear-gradient(90deg, rgba(159,25,104,0.16), transparent 36%)',
                      pointerEvents: 'none',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={aboutImage}
                    alt="Studio portrait photographed by OBK MEDIA"
                    loading="lazy"
                    sx={{
                      width: '100%',
                      aspectRatio: '3 / 4',
                      objectFit: 'cover',
                      objectPosition: '50% 24%',
                      display: 'block',
                      filter: 'saturate(0.96) contrast(1.03)',
                    }}
                  />
                  <Typography
                    variant="overline"
                    sx={{
                      position: 'absolute',
                      left: { xs: 18, md: 24 },
                      bottom: { xs: 18, md: 24 },
                      zIndex: 1,
                      color: palette.ivory,
                      backgroundColor: 'rgba(17, 8, 13, 0.72)',
                      border: `1px solid ${palette.inkBorder}`,
                      px: 1.5,
                      py: 0.75,
                      letterSpacing: 0,
                    }}
                  >
                    OBK Studios
                  </Typography>
                </Box>
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    left: { xs: 16, md: -20 },
                    top: { xs: 16, md: -20 },
                    width: { xs: 72, md: 104 },
                    height: { xs: 72, md: 104 },
                    borderTop: `1px solid ${palette.wineBright}`,
                    borderLeft: `1px solid ${palette.wineBright}`,
                    opacity: 0.8,
                  }}
                />
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: '70%',
                    height: '70%',
                    border: `1px solid ${palette.wineBright}`,
                    transform: 'translate(16px, 16px)',
                    display: { xs: 'none', md: 'block' },
                  }}
                />
              </Box>
            </ParallaxFrame>
          </Reveal>

          <Box>
            <Reveal>
              <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.title')} />
            </Reveal>
            {paragraphs.map((paragraph, i) => (
              <Reveal key={i} delay={i * 120} variant="soft">
                <Typography variant="body1" sx={{ color: palette.ivoryMuted, mb: 2.5 }}>
                  {paragraph}
                </Typography>
              </Reveal>
            ))}
            <Reveal delay={360}>
              <Typography
                variant="h5"
                sx={{ color: palette.rose, fontStyle: 'italic', my: 4, borderLeft: `2px solid ${palette.wine}`, pl: 3 }}
              >
                “{difference}”
              </Typography>
            </Reveal>
            <Reveal delay={420}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 5 }}>
                {stats.map((stat) => (
                  <Box key={stat.label} sx={{ borderTop: `1px solid ${palette.inkBorder}`, pt: 2 }}>
                    <Typography variant="h4" sx={{ color: palette.ivory }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Reveal>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 8 },
            mt: { xs: 8, md: 12 },
          }}
        >
          <Reveal variant="tilt-left">
            <Box sx={{ border: `1px solid ${palette.inkBorder}`, p: { xs: 3.5, md: 5 } }}>
              <Typography variant="overline" sx={{ color: palette.rose }}>
                {t('about.missionLabel')}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1.5, color: palette.ivory }}>
                {mission}
              </Typography>
            </Box>
          </Reveal>
          <Reveal delay={140} variant="tilt-right">
            <Box sx={{ border: `1px solid ${palette.inkBorder}`, p: { xs: 3.5, md: 5 } }}>
              <Typography variant="overline" sx={{ color: palette.rose }}>
                {t('about.visionLabel')}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1.5, color: palette.ivory }}>
                {vision}
              </Typography>
            </Box>
          </Reveal>
        </Box>
      </Container>
    </Box>
  );
}
