import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { palette } from '../../theme';

const shimmer = { bgcolor: palette.decor };

/** Page heading placeholder. */
export function HeadingSkeleton() {
  return <Skeleton variant="text" width={220} height={54} sx={{ ...shimmer, mb: 4 }} />;
}

/** Row-based list placeholder for the admin CRUD list pages. */
export function ListSkeleton({ rows = 5, thumb = false }: { rows?: number; thumb?: boolean }) {
  return (
    <Box>
      <HeadingSkeleton />
      <Box sx={{ border: `1px solid ${palette.inkBorder}` }}>
        {Array.from({ length: rows }, (_, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2.5,
              borderTop: i === 0 ? 'none' : `1px solid ${palette.inkBorder}`,
            }}
          >
            {thumb && <Skeleton variant="rectangular" width={84} height={56} sx={shimmer} />}
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={`${40 + ((i * 13) % 35)}%`} height={24} sx={shimmer} />
              <Skeleton variant="text" width={`${55 + ((i * 7) % 30)}%`} height={18} sx={shimmer} />
            </Box>
            <Skeleton variant="rounded" width={72} height={26} sx={shimmer} />
            <Skeleton variant="circular" width={30} height={30} sx={shimmer} />
            <Skeleton variant="circular" width={30} height={30} sx={shimmer} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Dashboard stat-cards + recent-list placeholder. */
export function DashboardSkeleton() {
  return (
    <Box>
      <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 3, md: 4.5 }, mb: 3 }}>
        <Skeleton variant="rounded" width={132} height={26} sx={{ ...shimmer, mb: 2 }} />
        <Skeleton variant="text" width="58%" height={70} sx={shimmer} />
        <Skeleton variant="text" width="42%" height={24} sx={shimmer} />
        <Box sx={{ display: 'flex', gap: 1.5, mt: 4 }}>
          <Skeleton variant="rounded" width={150} height={44} sx={shimmer} />
          <Skeleton variant="rounded" width={130} height={44} sx={shimmer} />
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.42fr 0.58fr' }, gap: 3, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} variant="rectangular" height={148} sx={shimmer} />
          ))}
        </Box>
        <Skeleton variant="rectangular" height={320} sx={shimmer} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '0.95fr 1.05fr' }, gap: 3 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} variant="rectangular" height={72} sx={shimmer} />
        ))}
      </Box>
    </Box>
  );
}

/** Card-grid placeholder for the Roles page. */
export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Box>
      <HeadingSkeleton />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {Array.from({ length: count }, (_, i) => (
          <Box key={i} sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: 3 }}>
            <Skeleton variant="text" width="45%" height={28} sx={shimmer} />
            <Skeleton variant="text" width="65%" height={18} sx={{ ...shimmer, mb: 2 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Array.from({ length: 4 }, (_, j) => (
                <Skeleton key={j} variant="rounded" width={84} height={22} sx={shimmer} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Edit-form placeholder for the portfolio editor. */
export function FormSkeleton() {
  return (
    <Box>
      <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 }, mb: 3 }}>
        <Skeleton variant="text" width={140} height={28} sx={{ ...shimmer, mb: 2 }} />
        <Skeleton variant="text" width="42%" height={58} sx={shimmer} />
        <Skeleton variant="text" width="56%" height={24} sx={shimmer} />
        <Skeleton variant="rounded" width={150} height={44} sx={{ ...shimmer, mt: 2 }} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.45fr) minmax(320px, 0.55fr)' }, gap: 3, alignItems: 'start', mb: 3 }}>
        <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} variant="rounded" height={52} sx={shimmer} />
            ))}
          </Box>
          <Skeleton variant="rounded" height={80} sx={{ ...shimmer, mt: 2.5 }} />
          <Skeleton variant="rounded" height={140} sx={{ ...shimmer, mt: 2.5 }} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 3 } }}>
            <Skeleton variant="rectangular" sx={{ ...shimmer, aspectRatio: '4 / 3', height: 'auto', mb: 2 }} />
            <Skeleton variant="rounded" height={42} sx={shimmer} />
          </Box>
          <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 3 } }}>
            <Skeleton variant="text" width="45%" height={30} sx={shimmer} />
            <Skeleton variant="rounded" height={54} sx={{ ...shimmer, mt: 2 }} />
            <Skeleton variant="rounded" height={54} sx={{ ...shimmer, mt: 1.5 }} />
          </Box>
        </Box>
      </Box>
      <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 } }}>
        <Skeleton variant="text" width="24%" height={34} sx={{ ...shimmer, mb: 2.5 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 2.5 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <Box key={i} sx={{ border: `1px solid ${palette.inkBorder}`, p: 2 }}>
              <Skeleton variant="rectangular" sx={{ ...shimmer, aspectRatio: '4 / 3', height: 'auto', mb: 2 }} />
              <Skeleton variant="rounded" height={42} sx={shimmer} />
              <Skeleton variant="rounded" height={42} sx={{ ...shimmer, mt: 1.5 }} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
