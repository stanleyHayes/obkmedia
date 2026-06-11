import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../../content';
import { palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import SectionDecor from './SectionDecor';

// Placeholder until the client's profile image is supplied.
const ABOUT_IMAGE = 'https://picsum.photos/seed/obk-about/900/1200';

export default function AboutSection() {
  const { t } = useTranslation();
  const paragraphs = [t('about.p1'), t('about.p2'), t('about.p3')];
  const stats = [
    { value: `${BRAND.yearsExperience}+`, label: t('about.statYears') },
    { value: t('about.nationwide'), label: t('about.statAreas') },
    { value: t('about.hours'), label: t('about.statHours') },
  ];
  return (
    <Box component="section" id="about" sx={{ py: { xs: 10, md: 16 }, position: 'relative', overflow: 'hidden' }}>
      <SectionDecor sx={{ left: { xs: -50, md: -20 }, bottom: 30 }}>
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
          <Reveal>
            <Box sx={{ position: 'relative', pr: { md: 4 }, pb: { md: 4 } }}>
              <Box
                component="img"
                src={ABOUT_IMAGE}
                alt="OBK MEDIA photographer at work"
                loading="lazy"
                sx={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', display: 'block', filter: 'saturate(0.9)' }}
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
          </Reveal>

          <Box>
            <Reveal>
              <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.title')} />
            </Reveal>
            {paragraphs.map((paragraph, i) => (
              <Reveal key={i} delay={i * 120}>
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
                “{t('about.difference')}”
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
          <Reveal>
            <Box sx={{ border: `1px solid ${palette.inkBorder}`, p: { xs: 3.5, md: 5 } }}>
              <Typography variant="overline" sx={{ color: palette.rose }}>
                {t('about.missionLabel')}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1.5, color: palette.ivory }}>
                {t('about.mission')}
              </Typography>
            </Box>
          </Reveal>
          <Reveal delay={140}>
            <Box sx={{ border: `1px solid ${palette.inkBorder}`, p: { xs: 3.5, md: 5 } }}>
              <Typography variant="overline" sx={{ color: palette.rose }}>
                {t('about.visionLabel')}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1.5, color: palette.ivory }}>
                {t('about.vision')}
              </Typography>
            </Box>
          </Reveal>
        </Box>
      </Container>
    </Box>
  );
}
