import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import type { Portfolio } from '../../api/types';
import { palette } from '../../theme';

export function categoryName(item: Portfolio): string | null {
  if (item.categoryId && typeof item.categoryId === 'object') return item.categoryId.name;
  return null;
}

interface PortfolioCardProps {
  item: Portfolio;
  /** index used to stagger reveal animations */
  index?: number;
}

export default function PortfolioCard({ item }: PortfolioCardProps) {
  const category = categoryName(item);
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
              color: palette.rose,
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
