import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { AdminStats, ContactMessage, Permission } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { palette } from '../../theme';

export default function DashboardPage() {
  const { can } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<ContactMessage[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    adminApi
      .stats()
      .then((res) => {
        setStats(res.stats);
        setRecent(res.recentMessages);
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <Alert severity="error">Couldn’t load dashboard stats — refresh to try again.</Alert>;
  if (!stats) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  const allCards: Array<{ label: string; value: number; to: string; permission: Permission; highlight?: boolean }> = [
    { label: 'Portfolio items', value: stats.portfolios, to: '/admin/portfolio', permission: 'portfolio.view' },
    { label: 'Published', value: stats.published, to: '/admin/portfolio', permission: 'portfolio.view' },
    { label: 'Featured', value: stats.featured, to: '/admin/portfolio', permission: 'portfolio.view' },
    { label: 'Categories', value: stats.categories, to: '/admin/categories', permission: 'categories.view' },
    { label: 'Messages', value: stats.messages, to: '/admin/messages', permission: 'messages.view' },
    { label: 'Unread messages', value: stats.unread, to: '/admin/messages', permission: 'messages.view', highlight: stats.unread > 0 },
  ];
  const cards = allCards.filter((card) => can(card.permission));

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
        {cards.map((card) => (
          <Box
            key={card.label}
            component={RouterLink}
            to={card.to}
            sx={{
              textDecoration: 'none',
              border: `1px solid ${card.highlight ? palette.wineBright : palette.inkBorder}`,
              bgcolor: card.highlight ? 'rgba(142, 27, 99, 0.14)' : palette.inkRaised,
              p: 3,
              transition: 'border-color 240ms ease',
              '&:hover': { borderColor: palette.rose },
            }}
          >
            <Typography variant="h3" sx={{ color: palette.ivory }}>
              {card.value}
            </Typography>
            <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {card.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {can('messages.view') && (
        <>
      <Typography variant="h4" sx={{ mt: 6, mb: 3 }}>
        Recent messages
      </Typography>
      {recent.length === 0 ? (
        <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
          No messages yet — new booking inquiries will appear here.
        </Typography>
      ) : (
        <Box sx={{ border: `1px solid ${palette.inkBorder}` }}>
          {recent.map((message, index) => (
            <Box
              key={message._id}
              component={RouterLink}
              to="/admin/messages"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                p: 2.5,
                borderTop: index === 0 ? 'none' : `1px solid ${palette.inkBorder}`,
                '&:hover': { bgcolor: 'rgba(142, 27, 99, 0.08)' },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: palette.ivory, fontWeight: 400 }}>
                  {message.fullName}
                  {message.shootType ? ` — ${message.shootType}` : ''}
                </Typography>
                <Typography variant="body2" sx={{ color: palette.ivoryMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 520 }}>
                  {message.message}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                {message.status === 'unread' && <Chip label="New" size="small" sx={{ bgcolor: palette.wine, color: palette.ivory }} />}
                <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                  {new Date(message.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
        </>
      )}
    </Box>
  );
}
