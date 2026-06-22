import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { notifyMessagesUpdated } from '../../admin/NotificationsContext';
import { adminApi } from '../../api/admin';
import type { ContactMessage } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { onDark, palette } from '../../theme';

type StatusFilter = '' | 'unread' | 'read';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diff / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function DetailCard({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <Box sx={{ border: `1px solid ${palette.inkBorder}`, p: 1.75, minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.9, color: palette.rose }}>
        {icon}
        <Typography variant="caption" sx={{ letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {label}
        </Typography>
      </Stack>
      {children}
    </Box>
  );
}

export default function MessagesPage() {
  const { can } = useAuth();
  const canManage = can('messages.manage');
  const [items, setItems] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .listMessages({ search: debounced || undefined, status: status || undefined })
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, status]);

  const counts = useMemo(() => {
    const all = items ?? [];
    return {
      total: all.length,
      unread: all.filter((item) => item.status === 'unread').length,
      read: all.filter((item) => item.status === 'read').length,
    };
  }, [items]);

  const open = async (message: ContactMessage) => {
    setSelected(message);
    if (message.status === 'unread' && canManage) {
      try {
        const res = await adminApi.setMessageStatus(message._id, 'read');
        setItems((prev) => prev?.map((m) => (m._id === message._id ? res.item : m)) ?? prev);
        setSelected(res.item);
        notifyMessagesUpdated();
      } catch {
        // non-fatal — leave as unread
      }
    }
  };

  const toggleStatus = async (message: ContactMessage) => {
    const next = message.status === 'read' ? 'unread' : 'read';
    try {
      const res = await adminApi.setMessageStatus(message._id, next);
      setItems((prev) => prev?.map((m) => (m._id === message._id ? res.item : m)) ?? prev);
      if (selected?._id === message._id) setSelected(res.item);
      notifyMessagesUpdated();
    } catch {
      setToast('Failed to update status');
    }
  };

  const remove = async (message: ContactMessage) => {
    try {
      await adminApi.deleteMessage(message._id);
      setItems((prev) => prev?.filter((m) => m._id !== message._id) ?? prev);
      if (selected?._id === message._id) setSelected(null);
      setToast('Message deleted');
      notifyMessagesUpdated();
    } catch {
      setToast('Delete failed');
    }
  };

  if (error) return <Alert severity="error">Couldn’t load messages — refresh to try again.</Alert>;

  const detailRows = selected
    ? [
        { label: 'Email', value: selected.email, href: `mailto:${selected.email}`, icon: <AlternateEmailOutlinedIcon fontSize="small" /> },
        { label: 'Phone', value: selected.phone, href: selected.phone ? `tel:${selected.phone}` : undefined, icon: <LocalPhoneOutlinedIcon fontSize="small" /> },
        { label: 'Company', value: selected.company, icon: <WorkOutlineOutlinedIcon fontSize="small" /> },
        { label: 'Location', value: selected.location, icon: <LocationOnOutlinedIcon fontSize="small" /> },
        {
          label: 'Preferred date',
          value: selected.preferredDate ? new Date(selected.preferredDate).toDateString() : undefined,
          icon: <CalendarMonthOutlinedIcon fontSize="small" />,
        },
      ].filter((row) => row.value)
    : [];

  return (
    <Box>
      <Box
        sx={{
          border: `1px solid ${palette.inkBorder}`,
          bgcolor: palette.inkRaised,
          backgroundImage: `linear-gradient(135deg, rgba(95, 5, 58, 0.22), transparent 42%), linear-gradient(90deg, ${palette.decor}, transparent 62%)`,
          p: { xs: 3, md: 4 },
          mb: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(320px, 0.45fr)' },
          gap: 3,
          alignItems: 'end',
        }}
      >
        <Box>
          <Typography variant="overline" sx={{ color: palette.rose }}>
            Inquiry desk
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '2.35rem', md: '3.3rem' }, maxWidth: 720, mt: 1 }}>
            Messages from people ready to make something.
          </Typography>
          <Typography variant="body1" sx={{ color: palette.ivoryMuted, maxWidth: 680, mt: 2 }}>
            Search, triage, and respond to booking inquiries without leaving the studio workflow.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: `1px solid ${palette.inkBorder}` }}>
          {[
            ['Total', counts.total],
            ['Unread', counts.unread],
            ['Read', counts.read],
          ].map(([label, value], index) => (
            <Box key={label} sx={{ p: 2, borderLeft: index === 0 ? 'none' : `1px solid ${palette.inkBorder}` }}>
              <Typography variant="h4" sx={{ color: label === 'Unread' && counts.unread > 0 ? palette.rose : palette.ivory, lineHeight: 1 }}>
                {value}
              </Typography>
              <Typography variant="caption" sx={{ color: palette.ivoryMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
          alignItems: 'center',
          justifyContent: 'space-between',
          border: `1px solid ${palette.inkBorder}`,
          bgcolor: palette.inkRaised,
          p: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search name, brief, shoot type…"
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
          sx={{ width: { xs: '100%', md: 360 } }}
        />
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {([
            ['', 'All', counts.total],
            ['unread', 'Unread', counts.unread],
            ['read', 'Read', counts.read],
          ] as const).map(([value, label, count]) => (
            <Chip
              key={label}
              label={`${label} ${count}`}
              clickable
              onClick={() => setStatus(value)}
              sx={{
                bgcolor: status === value ? palette.wine : 'transparent',
                border: `1px solid ${status === value ? palette.wine : palette.inkBorder}`,
                color: status === value ? onDark.ivory : palette.ivoryMuted,
              }}
            />
          ))}
        </Stack>
      </Box>

      {items === null ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3 }}>
          <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised }}>
            {Array.from({ length: 5 }, (_, i) => (
              <Box key={i} sx={{ p: 2.5, borderTop: i === 0 ? 'none' : `1px solid ${palette.inkBorder}` }}>
                <Skeleton variant="text" width="45%" height={22} sx={{ bgcolor: palette.decor }} />
                <Skeleton variant="text" width="30%" height={16} sx={{ bgcolor: palette.decor }} />
                <Skeleton variant="text" width="80%" height={18} sx={{ bgcolor: palette.decor }} />
              </Box>
            ))}
          </Box>
          <Skeleton variant="rectangular" height={420} sx={{ bgcolor: palette.decor }} />
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, border: `1px dashed ${palette.inkBorder}`, bgcolor: palette.inkRaised }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            No messages
          </Typography>
          <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
            {debounced || status ? 'Try a different search or filter.' : 'New booking inquiries will appear here.'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.92fr 1.08fr' }, gap: 3, alignItems: 'start' }}>
          <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, maxHeight: '74vh', overflowY: 'auto' }}>
            {items.map((message, index) => (
              <Box
                key={message._id}
                component="button"
                onClick={() => open(message)}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  display: 'block',
                  p: 2.5,
                  cursor: 'pointer',
                  borderTop: index === 0 ? 'none' : `1px solid ${palette.inkBorder}`,
                  borderLeft: `3px solid ${selected?._id === message._id ? palette.wineBright : message.status === 'unread' ? palette.rose : 'transparent'}`,
                  bgcolor: selected?._id === message._id ? 'rgba(142, 27, 99, 0.13)' : 'transparent',
                  transition: 'background-color 220ms ease, border-color 220ms ease',
                  '&:hover': { bgcolor: 'rgba(142, 27, 99, 0.08)' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: palette.ivory, fontWeight: message.status === 'unread' ? 600 : 350 }} noWrap>
                      {message.fullName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: palette.rose }}>
                      {message.shootType || 'General inquiry'}
                    </Typography>
                  </Box>
                  <Stack spacing={0.6} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    {message.status === 'unread' && <Chip label="New" size="small" sx={{ bgcolor: palette.wine, color: onDark.ivory }} />}
                    <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                      {timeAgo(message.createdAt)}
                    </Typography>
                  </Stack>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: palette.ivoryMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 1 }}
                >
                  {message.message}
                </Typography>
              </Box>
            ))}
          </Box>

          {selected ? (
            <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="overline" sx={{ color: palette.rose }}>
                    Selected inquiry
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 0.75 }}>
                    {selected.fullName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                    {new Date(selected.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ display: canManage ? 'flex' : 'none' }}>
                  <Tooltip title={selected.status === 'read' ? 'Mark as unread' : 'Mark as read'}>
                    <IconButton onClick={() => toggleStatus(selected)} sx={{ color: palette.ivory }}>
                      {selected.status === 'read' ? (
                        <MarkEmailUnreadOutlinedIcon fontSize="small" />
                      ) : (
                        <MarkEmailReadOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => remove(selected)} sx={{ color: palette.ivoryMuted }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
                <Button variant="contained" href={`mailto:${selected.email}`} startIcon={<AlternateEmailOutlinedIcon />}>
                  Reply by email
                </Button>
                {selected.phone && (
                  <Button variant="outlined" href={`tel:${selected.phone}`} startIcon={<LocalPhoneOutlinedIcon />}>
                    Call
                  </Button>
                )}
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 3 }}>
                {detailRows.map((row) => (
                  <DetailCard key={row.label} icon={row.icon} label={row.label}>
                    {row.href ? (
                      <Link href={row.href} sx={{ display: 'block', color: palette.ivory, wordBreak: 'break-word' }}>
                        {row.value}
                      </Link>
                    ) : (
                      <Typography sx={{ color: palette.ivory, wordBreak: 'break-word' }}>{row.value}</Typography>
                    )}
                  </DetailCard>
                ))}
                {selected.budgetRange && (
                  <DetailCard icon={<WorkOutlineOutlinedIcon fontSize="small" />} label="Budget">
                    <Typography sx={{ color: palette.ivory }}>{selected.budgetRange}</Typography>
                  </DetailCard>
                )}
                {selected.shootType && (
                  <DetailCard icon={<WorkOutlineOutlinedIcon fontSize="small" />} label="Shoot type">
                    <Typography sx={{ color: palette.ivory }}>{selected.shootType}</Typography>
                  </DetailCard>
                )}
              </Box>

              <Box sx={{ borderTop: `1px solid ${palette.inkBorder}`, pt: 3 }}>
                <Typography variant="overline" sx={{ color: palette.rose }}>
                  Message brief
                </Typography>
                <Typography variant="body1" sx={{ color: palette.ivoryMuted, whiteSpace: 'pre-wrap', mt: 1.5 }}>
                  {selected.message}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ border: `1px dashed ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: 6, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Choose an inquiry
              </Typography>
              <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                Select a message to see contact details, project context, and reply actions.
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
