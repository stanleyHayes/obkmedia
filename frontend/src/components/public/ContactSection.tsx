import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BRAND, SOCIALS } from '../../content';
import { palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import ContactForm from './ContactForm';
import SectionDecor from './SectionDecor';

const DETAILS = [
  { icon: <EmailOutlinedIcon />, label: BRAND.email, href: `mailto:${BRAND.email}` },
  { icon: <WhatsAppIcon />, label: BRAND.phoneIntl, href: BRAND.whatsappUrl },
  { icon: <PlaceOutlinedIcon />, label: BRAND.location, href: BRAND.mapsUrl },
  { icon: <ScheduleOutlinedIcon />, label: BRAND.hours },
];

export default function ContactSection() {
  return (
    <Box component="section" id="contact" sx={{ py: { xs: 10, md: 16 }, bgcolor: palette.inkRaised, position: 'relative', overflow: 'hidden' }}>
      <SectionDecor sx={{ right: { xs: -50, md: 30 }, bottom: 10 }}>
        <EmailOutlinedIcon sx={{ fontSize: { xs: 220, md: 340 } }} />
      </SectionDecor>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 7fr' }, gap: { xs: 6, md: 10 } }}>
          <Box>
            <Reveal>
              <SectionHeading eyebrow="Book a shoot" title="Let’s tell your story" />
            </Reveal>
            <Reveal delay={100}>
              <Typography variant="body1" sx={{ color: palette.ivoryMuted, mb: 5 }}>
                Tell us about your day, your vision, and your dream images. We respond within 24
                hours — or reach us instantly on WhatsApp.
              </Typography>
            </Reveal>
            <Stack spacing={2.5}>
              {DETAILS.map((detail, index) => (
                <Reveal key={detail.label} delay={140 + index * 90}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Box sx={{ color: palette.rose, display: 'flex' }}>{detail.icon}</Box>
                    {detail.href ? (
                      <Link
                        href={detail.href}
                        target={detail.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener"
                        sx={{ color: palette.ivory, fontWeight: 300 }}
                      >
                        {detail.label}
                      </Link>
                    ) : (
                      <Typography sx={{ color: palette.ivory, fontWeight: 300 }}>{detail.label}</Typography>
                    )}
                  </Stack>
                </Reveal>
              ))}
            </Stack>
            <Reveal delay={500}>
              <Button
                component="a"
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener"
                variant="outlined"
                startIcon={<WhatsAppIcon />}
                sx={{ mt: 5 }}
              >
                Chat on WhatsApp
              </Button>
            </Reveal>
            <Reveal delay={560}>
              <Stack direction="row" spacing={3} sx={{ mt: 5 }}>
                {SOCIALS.map((social) => (
                  <Link
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener"
                    sx={{
                      color: palette.ivoryMuted,
                      fontSize: '0.72rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      '&:hover': { color: palette.rose },
                    }}
                  >
                    {social.name}
                  </Link>
                ))}
              </Stack>
            </Reveal>
          </Box>
          <Reveal delay={150}>
            <ContactForm />
          </Reveal>
        </Box>
      </Container>
    </Box>
  );
}
