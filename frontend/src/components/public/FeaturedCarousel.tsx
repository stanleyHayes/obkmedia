import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
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

  const scrollBy = (direction: 1 | -1) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.7, behavior: 'smooth' });
  };

  if (error || (items && items.length === 0)) return null;

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 16 }, position: 'relative', overflow: 'hidden' }}>
      <SectionDecor sx={{ left: { xs: -50, md: 20 }, top: 0 }}>
        <CollectionsOutlinedIcon sx={{ fontSize: { xs: 220, md: 320 } }} />
      </SectionDecor>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
          <Reveal>
            <SectionHeading eyebrow={t('featured.eyebrow')} title={t('featured.title')} />
          </Reveal>
          <Stack direction="row" spacing={1} sx={{ mb: { xs: 5, md: 7 } }}>
            <IconButton aria-label={t('a11y.scrollBack')} onClick={() => scrollBy(-1)} sx={{ border: `1px solid ${palette.inkBorder}`, color: palette.ivory }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label={t('a11y.scrollForward')} onClick={() => scrollBy(1)} sx={{ border: `1px solid ${palette.inkBorder}`, color: palette.ivory }}>
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Container>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          ref={scrollerRef}
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            pb: 2,
            mx: -0.5,
            px: 0.5,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { background: palette.wine },
          }}
        >
          {items === null
            ? Array.from({ length: 3 }, (_, i) => (
                <Box key={i} sx={{ flex: '0 0 auto', width: { xs: '85%', sm: '46%', md: '31%' } }}>
                  <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3', height: 'auto', bgcolor: palette.inkRaised }} />
                  <Skeleton width="60%" sx={{ mt: 2 }} />
                </Box>
              ))
            : items.map((item) => (
                <Box
                  key={item._id}
                  sx={{ flex: '0 0 auto', width: { xs: '85%', sm: '46%', md: '31%' }, scrollSnapAlign: 'start' }}
                >
                  <PortfolioCard item={item} />
                </Box>
              ))}
        </Box>
        <Reveal>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="outlined" onClick={() => { navigate('/portfolio'); window.scrollTo({ top: 0 }); }}>
              {t('featured.viewFull')}
            </Button>
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
}
