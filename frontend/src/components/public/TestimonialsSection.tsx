import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { TESTIMONIALS } from '../../content';
import { palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import SectionDecor from './SectionDecor';

export default function TestimonialsSection() {
  const { t } = useTranslation();
  return (
    <Box component="section" sx={{ py: { xs: 10, md: 16 }, position: 'relative', overflow: 'hidden' }}>
      <SectionDecor speed={-0.055} sx={{ right: { xs: -40, md: 60 }, top: { xs: 10, md: -10 } }}>
        <FormatQuoteIcon sx={{ fontSize: { xs: 200, md: 300 }, transform: 'scaleX(-1)' }} />
      </SectionDecor>
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Reveal>
          <SectionHeading eyebrow={t('testimonials.eyebrow')} title={t('testimonials.title')} align="center" />
        </Reveal>
        {TESTIMONIALS.map((testimonial) => (
          <Reveal key={testimonial.name} delay={120} variant="soft">
            <Box sx={{ textAlign: 'center' }}>
              <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', mb: 3 }}>
                {Array.from({ length: testimonial.rating }, (_, i) => (
                  <StarIcon key={i} sx={{ color: palette.rose, fontSize: 20 }} />
                ))}
              </Stack>
              <Typography
                variant="h4"
                sx={{ fontStyle: 'italic', color: palette.ivory, lineHeight: 1.45, fontSize: { xs: '1.5rem', md: '2rem' } }}
              >
                “{t('testimonials.quote')}”
              </Typography>
              <Typography variant="overline" sx={{ color: palette.rose, display: 'block', mt: 4 }}>
                {testimonial.name} — {t('testimonials.role')}
              </Typography>
            </Box>
          </Reveal>
        ))}
      </Container>
    </Box>
  );
}
