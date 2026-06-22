import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../SiteSettingsContext';
import { onDark, palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import SectionDecor from './SectionDecor';

interface OutdoorTier {
  count?: number;
  label: string;
  price: string;
}

interface WeddingPackage {
  name: string;
  features: string[];
  oneDay: string;
  twoDays: string;
  popular?: boolean;
}

export default function PricingSection() {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const p = settings?.pricing;
  const outdoor: OutdoorTier[] =
    p?.outdoor && p.outdoor.length > 0
      ? p.outdoor.map((tier) => ({ label: tier.label, price: tier.price }))
      : (t('pricing.outdoor', { returnObjects: true }) as OutdoorTier[]);
  const wedding =
    p?.wedding && p.wedding.length > 0 ? p.wedding : (t('pricing.wedding', { returnObjects: true }) as WeddingPackage[]);
  const currency = p?.currency?.trim() || t('pricing.currency');
  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  const price = (value: string, color = palette.ivory) => (
    <Box component="span" sx={{ whiteSpace: 'nowrap', color }}>
      <Box component="span" sx={{ fontSize: '0.56em', verticalAlign: 'super', mr: 0.35, color: palette.rose }}>
        {currency}
      </Box>
      {value}
    </Box>
  );

  const startingOutdoor = outdoor[0];
  const featuredWedding = wedding[wedding.length - 1];

  return (
    <Box
      component="section"
      id="pricing"
      sx={{
        py: { xs: 10, md: 16 },
        bgcolor: palette.inkRaised,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SectionDecor speed={0.07} sx={{ right: { xs: -80, md: 10 }, top: 40 }}>
        <LocalOfferOutlinedIcon sx={{ fontSize: { xs: 220, md: 360 } }} />
      </SectionDecor>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.95fr) minmax(320px, 0.55fr)' },
            gap: { xs: 4, md: 6 },
            alignItems: 'stretch',
            mb: { xs: 5, md: 7 },
          }}
        >
          <Reveal>
            <Box>
              <SectionHeading eyebrow={t('pricing.eyebrow')} title={t('pricing.title')} />
              <Typography variant="body1" sx={{ color: palette.ivoryMuted, maxWidth: 660 }}>
                {p?.intro?.trim() || t('pricing.intro')}
              </Typography>
              <Button variant="outlined" endIcon={<ArrowForwardIcon />} onClick={scrollToContact} sx={{ mt: 4 }}>
                {t('pricing.cta')}
              </Button>
            </Box>
          </Reveal>

          <Reveal variant="soft">
            <Box
              sx={{
                border: `1px solid ${palette.inkBorder}`,
                bgcolor: palette.ink,
                p: { xs: 3, md: 4 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="overline" sx={{ color: palette.rose }}>
                {t('pricing.snapshotEyebrow')}
              </Typography>
              <Box sx={{ mt: 3 }}>
                {startingOutdoor && (
                  <Box sx={{ pb: 3, borderBottom: `1px solid ${palette.inkBorder}` }}>
                    <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                      {t('pricing.outdoorStarts')}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: { xs: '3.2rem', md: '4rem' }, lineHeight: 1 }}>
                      {price(startingOutdoor.price)}
                    </Typography>
                  </Box>
                )}
                {featuredWedding && (
                  <Box sx={{ pt: 3 }}>
                    <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                      {t('pricing.weddingStarts', { packageName: featuredWedding.name })}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: { xs: '2.7rem', md: '3.2rem' }, lineHeight: 1 }}>
                      {price(featuredWedding.oneDay)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Reveal>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '0.42fr 0.58fr' },
            gap: { xs: 3, md: 4 },
            alignItems: 'stretch',
            mb: { xs: 6, md: 8 },
          }}
        >
          <Reveal variant="soft">
            <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.ink, p: { xs: 3, md: 4 }, height: '100%' }}>
              <Typography variant="overline" sx={{ color: palette.rose }}>
                {p?.outdoorNote?.trim() || t('pricing.outdoorNote')}
              </Typography>
              <Typography variant="h4" sx={{ color: palette.ivory, mt: 1, mb: 2 }}>
                {p?.outdoorTitle?.trim() || t('pricing.outdoorTitle')}
              </Typography>
              <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                {t('pricing.outdoorBody')}
              </Typography>
            </Box>
          </Reveal>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))', lg: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            {outdoor.map((tier, index) => (
              <Reveal key={`${index}-${tier.label}`} delay={(index % 4) * 80}>
                <Box
                  sx={{
                    border: `1px solid ${palette.inkBorder}`,
                    bgcolor: palette.ink,
                    p: { xs: 2.5, md: 3 },
                    minHeight: 170,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 300ms ease, border-color 300ms ease',
                    '&:hover': { transform: 'translateY(-6px)', borderColor: palette.wineBright },
                  }}
                >
                  <Typography sx={{ color: palette.ivoryMuted, fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    {tier.count ? `${tier.count} ${t('pricing.picturesLabel')}` : tier.label}
                  </Typography>
                  <Box>
                    <Typography sx={{ color: palette.ivoryMuted, mb: 0.75 }}>{tier.count ? tier.label : ''}</Typography>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: { xs: '2.45rem', md: '2.9rem' }, lineHeight: 1 }}>
                      {price(tier.price)}
                    </Typography>
                  </Box>
                </Box>
              </Reveal>
            ))}
          </Box>
        </Box>

        <Reveal>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 1.5, mb: 3 }}>
            <Box>
              <Typography variant="overline" sx={{ color: palette.rose }}>
                {t('pricing.coverageEyebrow')}
              </Typography>
              <Typography variant="h4" sx={{ color: palette.ivory, mt: 0.5 }}>
                {p?.weddingTitle?.trim() || t('pricing.weddingTitle')}
              </Typography>
            </Box>
          </Stack>
        </Reveal>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: { xs: 3, md: 4 }, alignItems: 'stretch' }}>
          {wedding.map((pkg, index) => {
            const popular = pkg.popular ?? index === wedding.length - 1;
            return (
              <Reveal key={pkg.name} delay={index * 120} variant={index === 0 ? 'tilt-left' : 'tilt-right'} sx={{ height: '100%' }}>
                <Box
                  sx={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${popular ? palette.wine : palette.inkBorder}`,
                    bgcolor: popular ? 'rgba(95, 5, 58, 0.12)' : palette.ink,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: { xs: 3, md: 4 }, borderBottom: `1px solid ${palette.inkBorder}` }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                      <Typography variant="h5" sx={{ color: palette.ivory }}>
                        {pkg.name}
                      </Typography>
                      {popular && <Chip label={t('pricing.popular')} size="small" sx={{ bgcolor: palette.wine, color: onDark.ivory, flexShrink: 0 }} />}
                    </Stack>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        border: `1px solid ${palette.inkBorder}`,
                        mt: 3,
                      }}
                    >
                      {[
                        { label: t('pricing.oneDay'), value: pkg.oneDay },
                        { label: t('pricing.twoDays'), value: pkg.twoDays },
                      ].map((option, optionIndex) => (
                        <Box
                          key={option.label}
                          sx={{
                            p: { xs: 2, md: 2.5 },
                            borderLeft: optionIndex === 0 ? 'none' : `1px solid ${palette.inkBorder}`,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {option.label}
                          </Typography>
                          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: { xs: '2.3rem', md: '2.8rem' }, lineHeight: 1.05 }}>
                            {price(option.value)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Typography variant="overline" sx={{ color: palette.rose, mb: 2 }}>
                      {t('pricing.includesLabel')}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 2.5, rowGap: 1.25, mb: 4 }}>
                      {pkg.features.map((feature) => (
                        <Stack key={feature} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                          <CheckRoundedIcon sx={{ fontSize: 18, color: palette.wineBright, mt: '2px', flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                            {feature}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>

                    <Button
                      variant={popular ? 'contained' : 'outlined'}
                      endIcon={<ArrowForwardIcon />}
                      onClick={scrollToContact}
                      sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                    >
                      {t('pricing.cta')}
                    </Button>
                  </Box>
                </Box>
              </Reveal>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
