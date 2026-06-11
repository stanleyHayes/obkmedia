import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TESTIMONIALS } from '../../content';
import { palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import SectionDecor from './SectionDecor';

export default function TestimonialsSection() {
  return (
    <Box component="section" sx={{ py: { xs: 10, md: 16 }, position: 'relative', overflow: 'hidden' }}>
      <SectionDecor sx={{ right: { xs: -40, md: 60 }, top: { xs: 10, md: -10 } }}>
        <FormatQuoteIcon sx={{ fontSize: { xs: 200, md: 300 }, transform: 'scaleX(-1)' }} />
      </SectionDecor>
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Reveal>
          <SectionHeading eyebrow="Kind words" title="What clients remember" align="center" />
        </Reveal>
        {TESTIMONIALS.map((testimonial) => (
          <Reveal key={testimonial.name} delay={120}>
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
                “{testimonial.quote}”
              </Typography>
              <Typography variant="overline" sx={{ color: palette.rose, display: 'block', mt: 4 }}>
                {testimonial.name} — {testimonial.role}
              </Typography>
            </Box>
          </Reveal>
        ))}
      </Container>
    </Box>
  );
}
