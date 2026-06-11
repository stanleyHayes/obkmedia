import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { publicApi } from '../api/public';
import type { Portfolio, PortfolioImage } from '../api/types';
import Reveal from '../components/Reveal';
import Lightbox from '../components/public/Lightbox';
import PortfolioCard, { categoryName } from '../components/public/PortfolioCard';
import Watermark from '../components/public/Watermark';
import { BRAND } from '../content';
import Seo from '../seo/Seo';
import { onDark, palette } from '../theme';

export default function PortfolioDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Portfolio | null>(null);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [related, setRelated] = useState<Portfolio[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(false);
    setItem(null);
    publicApi
      .portfolioBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        setItem(res.item);
        setImages(res.images);
        setRelated(res.related);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return (
      <Container maxWidth="md" sx={{ pt: 24, pb: 16, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          {t('detail.notFoundTitle')}
        </Typography>
        <Typography variant="body1" sx={{ color: palette.ivoryMuted, mb: 5 }}>
          {t('detail.notFoundBody')}
        </Typography>
        <Button variant="outlined" component={RouterLink} to="/portfolio" startIcon={<ArrowBackIcon />}>
          {t('detail.backToPortfolio')}
        </Button>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ pt: 24, pb: 16 }}>
        <Alert severity="error">{t('detail.error')}</Alert>
      </Container>
    );
  }

  const category = item ? categoryName(item) : null;
  const meta = item
    ? [
        category,
        item.location,
        item.shootDate
          ? new Date(item.shootDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
          : null,
        item.clientName ? `For ${item.clientName}` : null,
      ].filter(Boolean)
    : [];

  return (
    <>
      {item && <Seo title={item.title} description={item.shortDescription} image={item.coverImageUrl} type="article" />}

      {/* Cover */}
      <Box sx={{ position: 'relative', height: { xs: '62vh', md: '78vh' }, overflow: 'hidden' }}>
        {loading || !item ? (
          <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%', bgcolor: palette.inkRaised }} />
        ) : (
          <>
            <Box
              component="img"
              src={item.coverImageUrl}
              alt={item.title}
              draggable={false}
              onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) brightness(0.85)' }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(11,7,9,0.96) 0%, rgba(11,7,9,0.25) 55%, rgba(11,7,9,0.4) 100%)',
              }}
            />
            <Container maxWidth="xl" sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', pb: { xs: 5, md: 8 }, left: '50%', transform: 'translateX(-50%)' }}>
              <Box>
                <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1.5 }}>
                  {meta.map((entry) => (
                    <Chip key={String(entry)} label={entry} size="small" sx={{ bgcolor: 'rgba(11,7,9,0.7)', color: onDark.rose, backdropFilter: 'blur(6px)' }} />
                  ))}
                </Stack>
                <Typography variant="h1" sx={{ fontSize: { xs: '2.4rem', md: '4rem' }, maxWidth: 900, color: onDark.ivory }}>
                  {item.title}
                </Typography>
              </Box>
            </Container>
          </>
        )}
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
        <Button onClick={() => navigate('/portfolio')} startIcon={<ArrowBackIcon />} sx={{ color: palette.ivoryMuted, mb: 5, px: 0 }}>
          {t('detail.allProjects')}
        </Button>

        {item && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 4fr' }, gap: { xs: 4, md: 10 }, mb: { xs: 7, md: 10 } }}>
            <Box>
              <Typography variant="h4" sx={{ mb: 3, color: palette.ivory }}>
                {item.shortDescription}
              </Typography>
              {item.fullDescription &&
                item.fullDescription.split('\n').filter(Boolean).map((paragraph, i) => (
                  <Typography key={i} variant="body1" sx={{ color: palette.ivoryMuted, mb: 2 }}>
                    {paragraph}
                  </Typography>
                ))}
            </Box>
            <Box sx={{ border: `1px solid ${palette.inkBorder}`, p: 4, alignSelf: 'start' }}>
              <Typography variant="overline" sx={{ color: palette.rose }}>
                {t('detail.lovedEyebrow')}
              </Typography>
              <Typography variant="h5" sx={{ my: 2, color: palette.ivory }}>
                {t('detail.bookSimilar')}
              </Typography>
              <Button variant="contained" fullWidth onClick={() => navigate('/#contact')}>
                {BRAND.primaryCta}
              </Button>
            </Box>
          </Box>
        )}

        {/* Gallery */}
        {loading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} variant="rectangular" sx={{ aspectRatio: '3 / 2', height: 'auto', bgcolor: palette.inkRaised }} />
            ))}
          </Box>
        ) : images.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            {images.map((image, index) => (
              <Reveal key={image._id} delay={(index % 2) * 100}>
                <Box
                  onClick={() => setLightboxIndex(index)}
                  sx={{
                    position: 'relative',
                    cursor: 'zoom-in',
                    overflow: 'hidden',
                    '&:hover img': { transform: 'scale(1.04)' },
                  }}
                >
                  <Box
                    component="img"
                    src={image.imageUrl}
                    alt={image.altText || `${item?.title ?? 'Portfolio'} image ${index + 1}`}
                    loading="lazy"
                    draggable={false}
                    onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
                    sx={{
                      width: '100%',
                      aspectRatio: '3 / 2',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                  <Watermark />
                </Box>
              </Reveal>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: palette.ivoryMuted, textAlign: 'center', py: 6 }}>
            {t('detail.galleryComingSoon')}
          </Typography>
        )}

        {/* Related */}
        {related.length > 0 && (
          <Box sx={{ mt: { xs: 10, md: 14 } }}>
            <Typography variant="overline" sx={{ color: palette.rose }}>
              {t('detail.relatedEyebrow')}
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, mb: 5 }}>
              {t('detail.relatedTitle')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
              {related.map((rel) => (
                <PortfolioCard key={rel._id} item={rel} />
              ))}
            </Box>
          </Box>
        )}
      </Container>

      <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
    </>
  );
}
