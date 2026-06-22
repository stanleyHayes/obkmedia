import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import PublishedWithChangesOutlinedIcon from '@mui/icons-material/PublishedWithChangesOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { AdminStats, ContactMessage, Permission } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { DashboardSkeleton } from '../../components/admin/Skeletons';
import { onDark, palette } from '../../theme';

function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.max(0, Math.round(diff / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

interface StatCard {
  label: string;
  value: number;
  to: string;
  permission: Permission;
  icon: ReactNode;
  eyebrow: string;
  tone?: 'alert' | 'normal';
}

interface ActionCard {
  title: string;
  body: string;
  to: string;
  permission: Permission;
  icon: ReactNode;
  label: string;
}

export default function DashboardPage() {
  const { admin, can } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<ContactMessage[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .stats()
      .then((res) => {
        if (cancelled) return;
        setStats(res.stats);
        setRecent(res.recentMessages);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = admin?.fullName.split(' ')[0] || 'there';

  const cards = useMemo(() => {
    if (!stats) return [];
    const allCards: StatCard[] = [
      {
        label: 'Portfolio items',
        value: stats.portfolios,
        to: '/admin/portfolio',
        permission: 'portfolio.view',
        icon: <PhotoLibraryOutlinedIcon />,
        eyebrow: 'Library',
      },
      {
        label: 'Published stories',
        value: stats.published,
        to: '/admin/portfolio',
        permission: 'portfolio.view',
        icon: <PublishedWithChangesOutlinedIcon />,
        eyebrow: `${percent(stats.published, stats.portfolios)}% live`,
      },
      {
        label: 'Featured picks',
        value: stats.featured,
        to: '/admin/portfolio',
        permission: 'portfolio.view',
        icon: <AutoAwesomeOutlinedIcon />,
        eyebrow: 'Homepage',
      },
      {
        label: 'Categories',
        value: stats.categories,
        to: '/admin/categories',
        permission: 'categories.view',
        icon: <CategoryOutlinedIcon />,
        eyebrow: 'Taxonomy',
      },
      {
        label: 'Total inquiries',
        value: stats.messages,
        to: '/admin/messages',
        permission: 'messages.view',
        icon: <InboxOutlinedIcon />,
        eyebrow: 'Bookings',
      },
      {
        label: 'Unread',
        value: stats.unread,
        to: '/admin/messages',
        permission: 'messages.view',
        icon: <MarkEmailUnreadOutlinedIcon />,
        eyebrow: stats.unread > 0 ? 'Needs reply' : 'Clear',
        tone: stats.unread > 0 ? 'alert' : 'normal',
      },
    ];
    return allCards.filter((card) => can(card.permission));
  }, [can, stats]);

  const actions = useMemo(() => {
    const allActions: ActionCard[] = [
      {
        title: 'Curate portfolio',
        body: 'Add new projects, update cover images, and choose what appears on the public site.',
        to: '/admin/portfolio',
        permission: 'portfolio.view',
        icon: <CollectionsOutlinedIcon />,
        label: 'Open library',
      },
      {
        title: 'Follow up',
        body: 'Review fresh booking inquiries before they cool down.',
        to: '/admin/messages',
        permission: 'messages.view',
        icon: <DraftsOutlinedIcon />,
        label: 'Read messages',
      },
      {
        title: 'Organize categories',
        body: 'Keep weddings, portraits, events, and brand work easy to browse.',
        to: '/admin/categories',
        permission: 'categories.view',
        icon: <CategoryOutlinedIcon />,
        label: 'Manage taxonomy',
      },
    ];
    return allActions.filter((action) => can(action.permission));
  }, [can]);

  if (error) return <Alert severity="error">Couldn’t load dashboard stats — refresh to try again.</Alert>;
  if (!stats) return <DashboardSkeleton />;

  const publishedPercent = percent(stats.published, stats.portfolios);
  const featuredPercent = percent(stats.featured, Math.max(stats.published, 1));
  const unreadPercent = percent(stats.unread, stats.messages);
  const hasMessages = can('messages.view');

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${palette.inkBorder}`,
          bgcolor: palette.inkRaised,
          p: { xs: 3, md: 4.5 },
          mb: 3,
          backgroundImage: `linear-gradient(135deg, rgba(95, 5, 58, 0.24), transparent 42%), linear-gradient(90deg, ${palette.decor}, transparent 62%)`,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            right: { xs: -28, md: 22 },
            bottom: { xs: -22, md: -34 },
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: { xs: '6rem', md: '11rem' },
            fontWeight: 600,
            lineHeight: 0.8,
            letterSpacing: '0.06em',
            color: palette.ghost,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          OBK
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 820 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
            <Chip
              icon={<InsightsOutlinedIcon />}
              label="Studio command"
              size="small"
              sx={{ bgcolor: palette.wine, color: onDark.ivory, '& .MuiChip-icon': { color: onDark.rose } }}
            />
            {admin?.role?.name && (
              <Chip
                label={admin.role.name}
                size="small"
                sx={{ bgcolor: 'transparent', border: `1px solid ${palette.inkBorder}`, color: palette.ivoryMuted }}
              />
            )}
          </Stack>
          <Typography variant="h2" sx={{ maxWidth: 720, fontSize: { xs: '2.4rem', md: '3.7rem' }, lineHeight: 1 }}>
            Welcome back,{' '}
            <Box component="span" sx={{ color: palette.rose, fontStyle: 'italic' }}>
              {firstName}
            </Box>
            .
          </Typography>
          <Typography variant="body1" sx={{ color: palette.ivoryMuted, maxWidth: 640, mt: 2.5 }}>
            Keep the public portfolio fresh, reply to inquiries, and shape what visitors see from one calm operating room.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4, alignItems: { xs: 'stretch', sm: 'center' } }}>
            {can('portfolio.manage') && (
              <Button variant="contained" component={RouterLink} to="/admin/portfolio/new" endIcon={<ArrowForwardIcon />}>
                New portfolio
              </Button>
            )}
            <Button variant="outlined" component="a" href="/" target="_blank" rel="noopener" endIcon={<OpenInNewIcon />}>
              View website
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.42fr 0.58fr' }, gap: 3, alignItems: 'stretch', mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {cards.map((card) => (
            <Box
              key={card.label}
              component={RouterLink}
              to={card.to}
              sx={{
                minHeight: 148,
                textDecoration: 'none',
                border: `1px solid ${card.tone === 'alert' ? palette.wineBright : palette.inkBorder}`,
                bgcolor: card.tone === 'alert' ? 'rgba(142, 27, 99, 0.16)' : palette.inkRaised,
                p: { xs: 2.25, md: 2.75 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 240ms ease, transform 240ms ease, background-color 240ms ease',
                '&:hover': { borderColor: palette.rose, transform: 'translateY(-4px)', bgcolor: 'rgba(95, 5, 58, 0.1)' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{ color: card.tone === 'alert' ? palette.rose : palette.ivoryMuted, '& svg': { fontSize: 24 } }}>{card.icon}</Box>
                <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {card.eyebrow}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h3" sx={{ color: palette.ivory, lineHeight: 0.95 }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.13em', textTransform: 'uppercase' }}>
                  {card.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            border: `1px solid ${palette.inkBorder}`,
            bgcolor: palette.inkRaised,
            p: { xs: 2.5, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 320,
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: palette.rose }}>
              Publishing health
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
              Public site readiness
            </Typography>
            <Stack spacing={2.4}>
              {[
                { label: 'Published portfolio', value: publishedPercent, helper: `${stats.published}/${stats.portfolios || 0} live` },
                { label: 'Featured coverage', value: featuredPercent, helper: `${stats.featured}/${Math.max(stats.published, 0)} featured` },
                { label: 'Unread queue', value: unreadPercent, helper: `${stats.unread}/${stats.messages || 0} waiting` },
              ].map((item) => (
                <Box key={item.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.85 }}>
                    <Typography variant="body2" sx={{ color: palette.ivory }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                      {item.helper}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(item.value, 100)}
                    sx={{
                      height: 4,
                      bgcolor: palette.decor,
                      '& .MuiLinearProgress-bar': { bgcolor: item.label === 'Unread queue' && stats.unread > 0 ? palette.wineBright : palette.rose },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
          <Typography variant="body2" sx={{ color: palette.ivoryMuted, mt: 3 }}>
            {stats.unread > 0
              ? `${stats.unread} inquiry${stats.unread === 1 ? '' : 'ies'} should be answered soon.`
              : 'No unread inquiries right now. Beautifully quiet.'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: hasMessages ? '0.95fr 1.05fr' : '1fr' }, gap: 3 }}>
        <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="overline" sx={{ color: palette.rose }}>
                Next moves
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.75 }}>
                Quick actions
              </Typography>
            </Box>
            <TrendingUpOutlinedIcon sx={{ color: palette.ghost, fontSize: 42 }} />
          </Box>

          <Stack spacing={1.5}>
            {actions.map((action) => (
              <Box
                key={action.title}
                component={RouterLink}
                to={action.to}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '42px minmax(0, 1fr) auto',
                  gap: 1.75,
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: palette.ivory,
                  border: `1px solid ${palette.inkBorder}`,
                  p: 1.75,
                  transition: 'border-color 220ms ease, background-color 220ms ease, transform 220ms ease',
                  '&:hover': { borderColor: palette.rose, bgcolor: 'rgba(95, 5, 58, 0.1)', transform: 'translateX(4px)' },
                  '&:hover .obk-action-icon': { color: palette.rose },
                }}
              >
                <Box className="obk-action-icon" sx={{ color: palette.ivoryMuted, display: 'flex', transition: 'color 220ms ease' }}>
                  {action.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: palette.ivory }}>{action.title}</Typography>
                  <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                    {action.body}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: palette.rose, letterSpacing: '0.12em', textTransform: 'uppercase', display: { xs: 'none', sm: 'block' } }}>
                  {action.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {hasMessages && (
          <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="overline" sx={{ color: palette.rose }}>
                  Inquiry desk
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.75 }}>
                  Recent messages
                </Typography>
              </Box>
              <Button component={RouterLink} to="/admin/messages" size="small" endIcon={<ArrowForwardIcon />}>
                Inbox
              </Button>
            </Box>

            {recent.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 7, border: `1px dashed ${palette.inkBorder}` }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No messages yet
                </Typography>
                <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                  Booking inquiries from the public contact form will land here.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.25}>
                {recent.map((message) => (
                  <Box
                    key={message._id}
                    component={RouterLink}
                    to="/admin/messages"
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' },
                      gap: 1.5,
                      textDecoration: 'none',
                      border: `1px solid ${message.status === 'unread' ? palette.wineBright : palette.inkBorder}`,
                      bgcolor: message.status === 'unread' ? 'rgba(142, 27, 99, 0.12)' : 'transparent',
                      p: 2,
                      transition: 'border-color 220ms ease, background-color 220ms ease',
                      '&:hover': { borderColor: palette.rose, bgcolor: 'rgba(95, 5, 58, 0.1)' },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ color: palette.ivory, fontWeight: message.status === 'unread' ? 500 : 350 }} noWrap>
                          {message.fullName}
                        </Typography>
                        {message.status === 'unread' && <Chip label="New" size="small" sx={{ bgcolor: palette.wine, color: onDark.ivory }} />}
                      </Stack>
                      <Typography variant="caption" sx={{ color: palette.rose }}>
                        {message.shootType || 'General inquiry'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: palette.ivoryMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 620 }}
                      >
                        {message.message}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { sm: 'right' } }}>
                      <Typography variant="caption" sx={{ color: palette.ivoryMuted, display: 'block' }}>
                        {timeAgo(message.createdAt)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                        {formatDate(message.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
