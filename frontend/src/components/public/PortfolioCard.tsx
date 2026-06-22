import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import type { Portfolio } from '../../api/types';
import { onDark, palette } from '../../theme';
import { categoryName } from './portfolioUtils';

interface PortfolioCardProps {
  item: Portfolio;
  /** index used to stagger reveal animations */
  index?: number;
  variant?: 'standard' | 'showcase';
}

export default function PortfolioCard({ item, variant = 'standard' }: PortfolioCardProps) {
  const { t } = useTranslation();
  const category = categoryName(item);

  if (variant === 'showcase') {
    const imageCount = item.imageCount ?? 0;

    return (
      <Box
        component={RouterLink}
        to={`/portfolio/${item.slug}`}
        onClick={() => window.scrollTo({ top: 0 })}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: { xs: 0, md: 560 },
          textDecoration: 'none',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: palette.inkRaised,
          border: `1px solid ${palette.inkBorder}`,
          transition: 'transform 320ms ease, border-color 320ms ease, box-shadow 320ms ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            borderColor: palette.wineBright,
            boxShadow: '0 28px 80px rgba(11, 7, 9, 0.18)',
          },
          '&:hover img': { transform: 'scale(1.045)' },
          '&:hover .obk-card-title': { color: palette.rose },
          '&:hover .obk-card-link': { gap: 1.75 },
        }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden', aspectRatio: { xs: '4 / 3', md: '16 / 10' }, bgcolor: palette.ink }}>
          <Box
            component="img"
            src={item.coverImageUrl}
            alt={item.title}
            loading="lazy"
            draggable={false}
            onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 28%',
              display: 'block',
              transition: 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(11,7,9,0.68) 0%, rgba(11,7,9,0.08) 58%, rgba(11,7,9,0.2) 100%)',
            }}
          />
          {category && (
            <Chip
              label={category}
              size="small"
              sx={{
                position: 'absolute',
                top: 18,
                left: 18,
                bgcolor: 'rgba(11, 7, 9, 0.72)',
                color: onDark.rose,
                backdropFilter: 'blur(8px)',
              }}
            />
          )}
          {imageCount > 0 && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                right: 18,
                bottom: 18,
                color: onDark.ivory,
                bgcolor: 'rgba(11, 7, 9, 0.62)',
                px: 1.4,
                py: 0.75,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(8px)',
              }}
            >
              {imageCount} {imageCount === 1 ? t('portfolio.imageSingular') : t('portfolio.imagePlural')}
            </Typography>
          )}
        </Box>
        <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Typography
            className="obk-card-title"
            variant="h4"
            sx={{ color: palette.ivory, transition: 'color 300ms ease', fontSize: { xs: '1.9rem', md: '2.25rem' } }}
          >
            {item.title}
          </Typography>
          <Typography variant="body1" sx={{ color: palette.ivoryMuted, mt: 1.5 }}>
            {item.shortDescription}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 3, mt: 'auto', pt: 4 }}>
            {(item.location || item.shootDate) && (
              <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {[item.location, item.shootDate ? new Date(item.shootDate).getFullYear() : null]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            )}
            <Box
              className="obk-card-link"
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                color: palette.rose,
                fontSize: '0.78rem',
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                transition: 'gap 260ms ease',
              }}
            >
              {t('portfolio.openStory')}
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component={RouterLink}
      to={`/portfolio/${item.slug}`}
      onClick={() => window.scrollTo({ top: 0 })}
      sx={{
        display: 'block',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        '&:hover img': { transform: 'scale(1.05)' },
        '&:hover .obk-card-veil': { opacity: 1 },
        '&:hover .obk-card-title': { color: palette.rose },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', aspectRatio: '4 / 3', bgcolor: palette.inkRaised }}>
        <Box
          component="img"
          src={item.coverImageUrl}
          alt={item.title}
          loading="lazy"
          draggable={false}
          onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 28%',
            display: 'block',
            transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        <Box
          className="obk-card-veil"
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to top, rgba(95, 5, 58, 0.55), transparent 60%)`,
            opacity: 0,
            transition: 'opacity 400ms ease',
          }}
        />
        {category && (
          <Chip
            label={category}
            size="small"
            sx={{
              position: 'absolute',
              top: 14,
              left: 14,
              bgcolor: 'rgba(11, 7, 9, 0.72)',
              color: onDark.rose,
              backdropFilter: 'blur(6px)',
            }}
          />
        )}
      </Box>
      <Box sx={{ pt: 2.5, pb: 1 }}>
        <Typography
          className="obk-card-title"
          variant="h5"
          sx={{ color: palette.ivory, transition: 'color 300ms ease', fontSize: '1.35rem' }}
        >
          {item.title}
        </Typography>
        <Typography variant="body2" sx={{ color: palette.ivoryMuted, mt: 0.75 }}>
          {item.shortDescription}
        </Typography>
        {(item.location || item.shootDate) && (
          <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block', mt: 1, letterSpacing: '0.08em' }}>
            {[item.location, item.shootDate ? new Date(item.shootDate).getFullYear() : null]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
