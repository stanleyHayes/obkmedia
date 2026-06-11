import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { palette } from '../../theme';

const shimmer = { bgcolor: 'rgba(244, 237, 231, 0.06)' };

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
      <HeadingSkeleton />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} variant="rectangular" height={108} sx={shimmer} />
        ))}
      </Box>
      <Skeleton variant="text" width={200} height={40} sx={{ ...shimmer, mt: 6, mb: 2 }} />
      <Box sx={{ border: `1px solid ${palette.inkBorder}` }}>
        {Array.from({ length: 4 }, (_, i) => (
          <Box key={i} sx={{ p: 2.5, borderTop: i === 0 ? 'none' : `1px solid ${palette.inkBorder}` }}>
            <Skeleton variant="text" width="30%" height={22} sx={shimmer} />
            <Skeleton variant="text" width="70%" height={18} sx={shimmer} />
          </Box>
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
      <Skeleton variant="text" width={140} height={28} sx={{ ...shimmer, mb: 2 }} />
      <HeadingSkeleton />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 4 }}>
        <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} variant="rounded" height={52} sx={shimmer} />
            ))}
          </Box>
          <Skeleton variant="rounded" height={80} sx={{ ...shimmer, mt: 2.5 }} />
          <Skeleton variant="rounded" height={140} sx={{ ...shimmer, mt: 2.5 }} />
        </Box>
        <Box>
          <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 }, mb: 4 }}>
            <Skeleton variant="rectangular" sx={{ ...shimmer, aspectRatio: '4 / 3', height: 'auto', mb: 2 }} />
            <Skeleton variant="rounded" height={42} sx={shimmer} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
