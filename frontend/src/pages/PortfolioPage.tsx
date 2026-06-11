import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { publicApi } from '../api/public';
import type { Category, Portfolio } from '../api/types';
import Reveal from '../components/Reveal';
import PortfolioCard from '../components/public/PortfolioCard';
import { palette } from '../theme';
import Seo from '../seo/Seo';

export default function PortfolioPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') ?? '';
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Portfolio[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    publicApi
      .categories()
      .then((res) => setCategories(res.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);
    publicApi
      .listPortfolio({ category: activeCategory || undefined, search: debouncedSearch || undefined })
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch(() => {
        if (!cancelled) setError(t('portfolio.error'));
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory, debouncedSearch]);

  const filters = useMemo(
    () => [{ name: t('portfolio.all'), slug: '' }, ...categories.map((c) => ({ name: c.name, slug: c.slug }))],
    [categories],
  );

  return (
    <>
      <Seo
        title="Portfolio"
        description="Explore OBK MEDIA's portfolio — weddings, studio portraits, events, and fashion photography across Ghana."
      />
      <Box sx={{ pt: { xs: 16, md: 22 }, pb: { xs: 10, md: 14 } }}>
        <Container maxWidth="xl">
          <Reveal>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 40, height: '1px', bgcolor: palette.wineBright }} />
              <Typography variant="overline" sx={{ color: palette.rose }}>
                {t('portfolio.eyebrow')}
              </Typography>
            </Stack>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.6rem', md: '4rem' }, mb: 2 }}>
              {t('portfolio.title')}
            </Typography>
            <Typography variant="body1" sx={{ color: palette.ivoryMuted, maxWidth: 560 }}>
              {t('portfolio.intro')}
            </Typography>
          </Reveal>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 6,
              mb: 5,
              borderTop: `1px solid ${palette.inkBorder}`,
              pt: 4,
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
              {filters.map((filter) => (
                <Chip
                  key={filter.slug || 'all'}
                  label={filter.name}
                  clickable
                  onClick={() => {
                    setSearchParams(filter.slug ? { category: filter.slug } : {});
                  }}
                  sx={{
                    bgcolor: activeCategory === filter.slug ? palette.wine : 'transparent',
                    border: `1px solid ${activeCategory === filter.slug ? palette.wine : palette.inkBorder}`,
                    color: activeCategory === filter.slug ? palette.ivory : palette.ivoryMuted,
                    '&:hover': { bgcolor: 'rgba(95, 5, 58, 0.35)' },
                  }}
                />
              ))}
            </Stack>
            <TextField
              size="small"
              placeholder={t('portfolio.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: palette.ivoryMuted }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: '100%', sm: 280 } }}
            />
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {!error && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                gap: { xs: 4, md: 5 },
              }}
            >
              {items === null
                ? Array.from({ length: 6 }, (_, i) => (
                    <Box key={i}>
                      <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3', height: 'auto', bgcolor: palette.inkRaised }} />
                      <Skeleton width="65%" sx={{ mt: 2 }} />
                      <Skeleton width="90%" />
                    </Box>
                  ))
                : items.map((item, index) => (
                    <Reveal key={item._id} delay={(index % 3) * 110}>
                      <PortfolioCard item={item} />
                    </Reveal>
                  ))}
            </Box>
          )}

          {items !== null && items.length === 0 && !error && (
            <Box sx={{ textAlign: 'center', py: 12, border: `1px dashed ${palette.inkBorder}` }}>
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
