import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { SERVICES } from '../../content';
import { palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

export default function ServicesSection() {
  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <Box component="section" id="services" sx={{ py: { xs: 10, md: 16 }, bgcolor: palette.inkRaised }}>
      <Container maxWidth="xl">
        <Reveal>
          <SectionHeading eyebrow="What we do" title="Crafted services for every story" />
        </Reveal>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 0,
            borderTop: `1px solid ${palette.inkBorder}`,
            borderLeft: `1px solid ${palette.inkBorder}`,
          }}
        >
          {SERVICES.map((service, index) => (
            <Reveal key={service.title} delay={(index % 3) * 120}>
              <Box
                sx={{
                  borderRight: `1px solid ${palette.inkBorder}`,
                  borderBottom: `1px solid ${palette.inkBorder}`,
                  p: { xs: 3.5, md: 5 },
                  height: '100%',
                  position: 'relative',
                  transition: 'background-color 360ms ease',
                  '&:hover': { bgcolor: 'rgba(95, 5, 58, 0.14)' },
                  '&:hover .obk-service-num': { color: palette.rose },
                }}
              >
                <Typography
                  className="obk-service-num"
                  sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '2.6rem',
                    color: 'rgba(244, 237, 231, 0.16)',
                    transition: 'color 360ms ease',
                    lineHeight: 1,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </Typography>
                <Typography variant="h5" sx={{ mt: 2.5, mb: 1.5, color: palette.ivory }}>
                  {service.title}
                </Typography>
                <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                  {service.description}
                </Typography>
              </Box>
            </Reveal>
          ))}
        </Box>
        <Reveal delay={200}>
          <Box sx={{ mt: 6, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
            <Typography variant="body2" sx={{ color: palette.ivoryMuted, maxWidth: 520 }}>
              Bespoke packages are tailored to every story — request a quote and we’ll build the
              right coverage for your day.
            </Typography>
            <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={scrollToContact}>
              Request pricing
            </Button>
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
}
