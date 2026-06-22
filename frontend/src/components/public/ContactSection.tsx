import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useBrand, useSocials } from '../../SiteSettingsContext';
import { onDark, palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import ContactForm from './ContactForm';
import SectionDecor from './SectionDecor';

const overlineSx = {
  fontFamily: '"Outfit", sans-serif',
  fontSize: '0.62rem',
  fontWeight: 500,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: palette.ivoryMuted,
} as const;

export default function ContactSection() {
  const { t } = useTranslation();
  const brand = useBrand();
  const socials = useSocials();
  const details = [
    { label: t('contact.labels.email'), value: brand.email, href: `mailto:${brand.email}` },
    { label: t('contact.labels.whatsapp'), value: brand.phoneIntl, href: brand.whatsappUrl },
    { label: t('contact.labels.studio'), value: brand.location, href: brand.mapsUrl },
    { label: t('contact.labels.hours'), value: t('contact.hours') },
  ];
  return (
    <Box component="section" id="contact" sx={{ py: { xs: 10, md: 16 }, bgcolor: palette.inkRaised, position: 'relative', overflow: 'hidden' }}>
      <SectionDecor speed={0.06} sx={{ right: { xs: -50, md: 30 }, bottom: 10 }}>
        <EmailOutlinedIcon sx={{ fontSize: { xs: 220, md: 340 } }} />
      </SectionDecor>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 7fr' }, gap: { xs: 6, md: 10 } }}>
          <Box>
            <Reveal>
              <SectionHeading eyebrow={t('contact.eyebrow')} title={t('contact.title')} />
            </Reveal>
            <Reveal delay={100}>
              <Typography variant="body1" sx={{ color: palette.ivoryMuted, mb: 5 }}>
                {t('contact.intro')}
              </Typography>
            </Reveal>

            {/* Contact ledger — hairline-ruled rows, serif values */}
            <Box sx={{ borderTop: `1px solid ${palette.inkBorder}` }}>
              {details.map((detail, index) => {
                const inner = (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography component="span" sx={overlineSx}>
                        {detail.label}
                      </Typography>
                      {detail.href && (
                        <ArrowOutwardIcon
                          className="obk-row-arrow"
                          sx={{
                            fontSize: 15,
                            color: palette.rose,
                            opacity: 0,
                            transform: 'translate(-6px, 6px)',
                            transition: 'opacity 280ms ease, transform 280ms ease',
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      className="obk-row-value"
                      sx={{
                        mt: 0.75,
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                        fontWeight: 500,
                        fontSize: { xs: '1.35rem', md: '1.5rem' },
                        lineHeight: 1.25,
                        color: palette.ivory,
                        wordBreak: 'break-word',
                        transition: 'color 280ms ease',
                      }}
                    >
                      {detail.value}
                    </Typography>
                  </>
                );
                const rowSx = {
                  display: 'block',
                  textDecoration: 'none',
                  py: 2.25,
                  pl: 0,
                  borderBottom: `1px solid ${palette.inkBorder}`,
                  transition: 'padding-left 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                  '&:hover': detail.href
                    ? {
                        pl: 1.25,
                        '& .obk-row-value': { color: palette.rose },
                        '& .obk-row-arrow': { opacity: 1, transform: 'translate(0, 0)' },
                      }
                    : undefined,
                } as const;
                return (
                  <Reveal key={detail.label} delay={140 + index * 90} variant="soft">
                    {detail.href ? (
                      <Box
                        component="a"
                        href={detail.href}
                        target={detail.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener"
                        sx={rowSx}
                      >
                        {inner}
                      </Box>
                    ) : (
                      <Box sx={rowSx}>{inner}</Box>
                    )}
                  </Reveal>
                );
              })}
            </Box>

            {/* Boxed WhatsApp CTA — wine fill sweeps in on hover */}
            <Reveal delay={500} variant="tilt-left">
              <Box
                component="a"
                href={brand.whatsappUrl}
                target="_blank"
                rel="noopener"
                sx={{
                  mt: 5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  p: '18px 22px',
                  border: `1px solid ${palette.inkBorder}`,
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 320ms ease',
                  // The fill is always wine (fixed dark), so hover text uses the
                  // fixed onDark colors in both themes.
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    bgcolor: palette.wine,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
                  },
                  '& > *': { position: 'relative' },
                  '&:hover': { borderColor: palette.wine },
                  '&:hover::before': { transform: 'scaleX(1)' },
                  '&:hover .obk-wa-label': { color: onDark.ivory },
                  '&:hover .obk-wa-icon': { color: onDark.rose },
                  '&:hover .obk-wa-arrow': { color: onDark.rose, transform: 'translate(2px, -2px)' },
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <WhatsAppIcon className="obk-wa-icon" sx={{ fontSize: 20, color: palette.rose, transition: 'color 320ms ease' }} />
                  <Typography
                    className="obk-wa-label"
                    sx={{
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: palette.ivory,
                      transition: 'color 320ms ease',
                    }}
                  >
                    {t('contact.whatsapp')}
                  </Typography>
                </Stack>
                <ArrowOutwardIcon
                  className="obk-wa-arrow"
                  sx={{ fontSize: 17, color: palette.rose, transition: 'color 320ms ease, transform 320ms ease' }}
                />
              </Box>
            </Reveal>

            {/* Indexed social links */}
            <Reveal delay={560} variant="soft">
              <Box sx={{ mt: 5 }}>
                <Typography component="p" sx={{ ...overlineSx, mb: 1.75 }}>
                  {t('contact.labels.follow')}
                </Typography>
                <Stack direction="row" spacing={3.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
                  {socials.map((social, index) => (
                    <Box
                      key={social.name}
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'baseline',
                        gap: 0.9,
                        textDecoration: 'none',
                        color: palette.ivoryMuted,
                        fontSize: '0.72rem',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        transition: 'color 220ms ease',
                        '&:hover': { color: palette.rose },
                      }}
                    >
                      <Box component="span" sx={{ fontSize: '0.58rem', color: palette.rose, letterSpacing: '0.08em' }}>
                        {String(index + 1).padStart(2, '0')}
                      </Box>
                      {social.name}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Reveal>
          </Box>
          <Reveal delay={150} variant="tilt-right">
            <ContactForm />
          </Reveal>
        </Box>
      </Container>
    </Box>
  );
}
