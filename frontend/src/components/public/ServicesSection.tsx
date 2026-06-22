import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../SiteSettingsContext';
import { palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import SectionDecor from './SectionDecor';

interface ServiceItem { title: string; description: string }

export default function ServicesSection() {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const services =
    settings?.services && settings.services.length > 0
      ? settings.services
      : (t('services.items', { returnObjects: true }) as ServiceItem[]);
  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <Box component="section" id="services" sx={{ py: { xs: 10, md: 16 }, bgcolor: palette.inkRaised, position: 'relative', overflow: 'hidden' }}>
      <SectionDecor speed={0.07} sx={{ right: { xs: -50, md: 30 }, top: 20 }}>
        <CameraAltOutlinedIcon sx={{ fontSize: { xs: 220, md: 340 } }} />
      </SectionDecor>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Reveal>
          <SectionHeading eyebrow={t('services.eyebrow')} title={t('services.title')} />
        </Reveal>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 0,
            borderTop: `1px solid ${palette.inkBorder}`,
            borderLeft: `1px solid ${palette.inkBorder}`,
            perspective: '1200px',
          }}
        >
          {services.map((service, index) => (
            <Reveal key={service.title} delay={(index % 3) * 120} variant={index % 2 === 0 ? 'tilt-left' : 'tilt-right'}>
              <Box
                sx={{
                  borderRight: `1px solid ${palette.inkBorder}`,
                  borderBottom: `1px solid ${palette.inkBorder}`,
                  p: { xs: 3.5, md: 5 },
                  height: '100%',
                  position: 'relative',
                  transform: 'translateZ(0)',
                  transformStyle: 'preserve-3d',
                  transition: 'background-color 360ms ease, transform 360ms cubic-bezier(0.22, 1, 0.36, 1)',
                  '&:hover': { bgcolor: 'rgba(95, 5, 58, 0.14)', transform: 'translate3d(0, -8px, 28px) rotateX(2deg)' },
                  '&:hover .obk-service-num': { color: palette.rose },
                }}
              >
                <Typography
                  className="obk-service-num"
                  sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '2.6rem',
                    color: palette.ghost,
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
              {t('services.packagesNote')}
            </Typography>
            <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={scrollToContact}>
              {t('services.requestPricing')}
            </Button>
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
}
