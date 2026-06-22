import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { publicApi } from '../../api/public';
import type { Portfolio } from '../../api/types';
import { palette } from '../../theme';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import PortfolioCard from './PortfolioCard';
import SectionDecor from './SectionDecor';

export default function FeaturedCarousel() {
  const [items, setItems] = useState<Portfolio[] | null>(null);
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    publicApi
      .featured()
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error || (items && items.length === 0)) return null;

  const visibleItems = items?.slice(0, 4) ?? [];

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 16 }, position: 'relative', overflow: 'hidden' }}>
      <SectionDecor speed={0.065} sx={{ left: { xs: -50, md: 20 }, top: 0 }}>
        <CollectionsOutlinedIcon sx={{ fontSize: { xs: 220, md: 320 } }} />
      </SectionDecor>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3, mb: { xs: 3, md: 5 } }}>
          <Reveal sx={{ '& > div': { mb: 0 } }}>
            <SectionHeading eyebrow={t('featured.eyebrow')} title={t('featured.title')} />
          </Reveal>
          <Reveal variant="soft">
            <Button component={RouterLink} to="/portfolio" variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => window.scrollTo({ top: 0 })}>
              {t('featured.viewFull')}
            </Button>
          </Reveal>
        </Box>

        {items === null ? (
          <Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: { xs: 3, md: 4 },
              }}
            >
              {Array.from({ length: 4 }, (_, i) => (
                <Box key={i}>
                  <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3', height: 'auto', bgcolor: palette.inkRaised }} />
                  <Skeleton width="60%" sx={{ mt: 2 }} />
                  <Skeleton width="86%" />
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: { xs: 3, md: 4 },
              alignItems: 'stretch',
            }}
          >
            {visibleItems.map((item, index) => (
              <Reveal key={item._id} delay={(index % 2) * 90} variant={index % 2 === 0 ? 'tilt-left' : 'tilt-right'} sx={{ height: '100%' }}>
                <PortfolioCard item={item} />
              </Reveal>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
