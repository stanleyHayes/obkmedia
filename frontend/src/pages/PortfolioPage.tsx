import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { publicApi } from '../api/public';
import type { Portfolio } from '../api/types';
import Reveal from '../components/Reveal';
import PortfolioCard from '../components/public/PortfolioCard';
import { onDark, palette } from '../theme';
import Seo from '../seo/Seo';

const collageSlotSx = [
  {
    gridColumn: { xs: '1 / -1', sm: '1 / 2' },
    gridRow: { sm: '1 / span 2' },
    minHeight: { xs: 340, sm: 540 },
  },
  {
    gridColumn: { xs: '1 / -1', sm: '2 / 3' },
    minHeight: { xs: 220, sm: 0 },
  },
  {
    gridColumn: { xs: '1 / -1', sm: '2 / 3' },
    minHeight: { xs: 220, sm: 0 },
  },
];

export default function PortfolioPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') ?? '';
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState<Portfolio[]>([]);
  const [loadedQuery, setLoadedQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const portfolioError = t('portfolio.error');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const queryKey = `${activeCategory}::${debouncedSearch}`;
    publicApi
      .listPortfolio({ category: activeCategory || undefined, search: debouncedSearch || undefined })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setError(portfolioError);
      })
      .finally(() => {
        if (!cancelled) setLoadedQuery(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory, debouncedSearch, portfolioError]);

  const activeQuery = `${activeCategory}::${debouncedSearch}`;
  const loadingPortfolio = loadedQuery !== activeQuery;
  const heroItems = useMemo(() => items.slice(0, 3), [items]);
  const hasFilters = Boolean(activeCategory || debouncedSearch || search);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSearchParams({});
  };

  return (
    <>
      <Seo
        title={t('seo.portfolioTitle')}
        description={t('seo.portfolioDescription')}
      />

      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 15, md: 19 },
          pb: { xs: 8, md: 11 },
          borderBottom: `1px solid ${palette.inkBorder}`,
          background:
            `linear-gradient(135deg, ${palette.ink} 0%, ${palette.inkRaised} 54%, rgba(95, 5, 58, 0.12) 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: { xs: 'auto -20% 6% auto', md: '8% -8% auto auto' },
            width: { xs: 280, md: 520 },
            height: { xs: 280, md: 520 },
            border: `1px solid ${palette.inkBorder}`,
            transform: 'rotate(18deg)',
            opacity: 0.5,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.86fr) minmax(520px, 1.14fr)' },
              gap: { xs: 5, md: 8 },
              alignItems: 'center',
            }}
          >
            <Reveal>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2.5 }}>
                <Box sx={{ width: 48, height: '1px', bgcolor: palette.wineBright }} />
                <Typography variant="overline" sx={{ color: palette.rose }}>
                  {t('portfolio.bannerKicker')}
                </Typography>
              </Stack>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                  maxWidth: 760,
                  mb: 3,
                }}
              >
                {t('portfolio.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: palette.ivoryMuted, maxWidth: 610, fontSize: '1.06rem' }}>
                {t('portfolio.intro')}
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 2,
                  mt: { xs: 4, md: 5 },
                  maxWidth: 620,
                }}
              >
                <Box sx={{ borderTop: `1px solid ${palette.inkBorder}`, pt: 2.25 }}>
                  {loadingPortfolio ? (
                    <Skeleton width={72} height={44} sx={{ bgcolor: palette.ghost }} />
                  ) : (
                    <Typography variant="h3" sx={{ color: palette.ivory, lineHeight: 1 }}>
                      {items.length}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {items.length === 1 ? t('portfolio.storySingular') : t('portfolio.storyPlural')}
                  </Typography>
                </Box>
                <Box sx={{ borderTop: `1px solid ${palette.inkBorder}`, pt: 2.25 }}>
                  <Typography variant="h3" sx={{ color: palette.ivory, lineHeight: 1 }}>
                    2x2
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {t('portfolio.bannerMetaLayout')}
                  </Typography>
                </Box>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: { xs: 4, md: 5 } }}>
                <Button component={RouterLink} to="/#contact" variant="contained" endIcon={<ArrowForwardIcon />}>
                  {t('nav.book')}
                </Button>
                <Button component={RouterLink} to="/#pricing" variant="outlined">
                  {t('nav.pricing')}
                </Button>
              </Stack>
            </Reveal>

            <Reveal variant="tilt-right" delay={120}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1.1fr 0.9fr' },
                  gridTemplateRows: { sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1.5,
                  minHeight: { xs: 0, sm: 540 },
                }}
              >
                {loadingPortfolio &&
                  collageSlotSx.map((slot, index) => (
                    <Skeleton
                      key={index}
                      variant="rectangular"
                      sx={{
                        ...slot,
                        height: '100%',
                        bgcolor: palette.ghost,
                      }}
                    />
                  ))}

                {!loadingPortfolio &&
                  heroItems.map((item, index) => (
                    <Box
                      key={item._id}
                      component={RouterLink}
                      to={`/portfolio/${item.slug}`}
                      onClick={() => window.scrollTo({ top: 0 })}
                      sx={{
                        ...collageSlotSx[index],
                        position: 'relative',
                        display: 'block',
                        overflow: 'hidden',
                        minHeight: collageSlotSx[index].minHeight,
                        bgcolor: palette.inkRaised,
                        color: onDark.ivory,
                        textDecoration: 'none',
                        '&:hover img': { transform: 'scale(1.05)' },
                      }}
                    >
                      <Box
                        component="img"
                        src={item.coverImageUrl}
                        alt={item.title}
                        draggable={false}
                        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
                        sx={{
                          width: '100%',
                          height: '100%',
                          minHeight: 'inherit',
                          objectFit: 'cover',
                          objectPosition: 'center 28%',
                          display: 'block',
                          filter: 'saturate(0.94)',
                          transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(11,7,9,0.7), transparent 56%)',
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          left: 18,
                          bottom: 18,
                          right: 18,
                          color: onDark.ivory,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                  ))}

                {!loadingPortfolio && heroItems.length === 0 && (
                  <Box
                    sx={{
                      gridColumn: '1 / -1',
                      minHeight: { xs: 320, md: 540 },
                      border: `1px dashed ${palette.inkBorder}`,
                      display: 'grid',
                      placeItems: 'center',
                      textAlign: 'center',
                      px: 4,
                    }}
                  >
                    <Box>
                      <PhotoLibraryOutlinedIcon sx={{ fontSize: 52, color: palette.rose, mb: 2 }} />
                      <Typography variant="h4" sx={{ color: palette.ivory }}>
                        {t('portfolio.emptyTitle')}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Reveal>
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 7, md: 10 } }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(320px, 460px)' },
              gap: { xs: 3, md: 6 },
              alignItems: 'end',
              mb: { xs: 4, md: 6 },
            }}
          >
            <Reveal>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: 40, height: '1px', bgcolor: palette.wineBright }} />
                <Typography variant="overline" sx={{ color: palette.rose }}>
                  {t('portfolio.archiveEyebrow')}
                </Typography>
              </Stack>
              <Typography variant="h2" sx={{ fontSize: { xs: '2.35rem', md: '3.35rem' }, maxWidth: 680 }}>
                {t('portfolio.archiveTitle')}
              </Typography>
              <Typography variant="body1" sx={{ color: palette.ivoryMuted, maxWidth: 680, mt: 2 }}>
                {t('portfolio.archiveIntro')}
              </Typography>
            </Reveal>

            <Reveal variant="soft" delay={100}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  size="small"
                  placeholder={t('portfolio.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: palette.ivoryMuted }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                {hasFilters && (
                  <Button variant="outlined" onClick={clearFilters} sx={{ whiteSpace: 'nowrap' }}>
                    {t('portfolio.clearFilters')}
                  </Button>
                )}
              </Stack>
            </Reveal>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {!error && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: { xs: 3.5, md: 5 },
                alignItems: 'stretch',
              }}
            >
              {loadingPortfolio
                ? Array.from({ length: 4 }, (_, i) => (
                    <Box key={i} sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised }}>
                      <Skeleton variant="rectangular" sx={{ aspectRatio: '16 / 10', height: 'auto', bgcolor: palette.ghost }} />
                      <Box sx={{ p: { xs: 3, md: 4 } }}>
                        <Skeleton width="60%" sx={{ mb: 2 }} />
                        <Skeleton width="92%" />
                        <Skeleton width="72%" />
                      </Box>
                    </Box>
                  ))
                : items.map((item, index) => (
                    <Reveal key={item._id} delay={(index % 2) * 100} variant={index % 2 === 0 ? 'tilt-left' : 'tilt-right'} sx={{ height: '100%' }}>
                      <PortfolioCard item={item} variant="showcase" />
                    </Reveal>
                  ))}
            </Box>
          )}

          {!loadingPortfolio && items.length === 0 && !error && (
            <Box sx={{ textAlign: 'center', py: { xs: 8, md: 12 }, mt: 4, border: `1px dashed ${palette.inkBorder}`, px: 3 }}>
              <Typography variant="h4" sx={{ color: palette.ivory, mb: 1.5 }}>
                {t('portfolio.emptyTitle')}
              </Typography>
              <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                {debouncedSearch || activeCategory ? t('portfolio.emptyFiltered') : t('portfolio.emptyDefault')}
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
}
