import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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
import { useEffect, useState } from 'react';
import { notifyMessagesUpdated } from '../../admin/NotificationsContext';
import { adminApi } from '../../api/admin';
import type { ContactMessage } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { onDark, palette } from '../../theme';

type StatusFilter = '' | 'unread' | 'read';

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
        { label: 'Email', value: selected.email, href: `mailto:${selected.email}` },
        { label: 'Phone', value: selected.phone },
        { label: 'Company', value: selected.company },
        { label: 'Shoot type', value: selected.shootType },
        {
          label: 'Preferred date',
          value: selected.preferredDate ? new Date(selected.preferredDate).toDateString() : undefined,
        },
        { label: 'Location', value: selected.location },
        { label: 'Budget', value: selected.budgetRange },
      ].filter((row) => row.value)
    : [];

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 4 }}>
        Messages
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search messages…"
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
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
        <Stack direction="row" spacing={1}>
          {([
            ['', 'All'],
            ['unread', 'Unread'],
            ['read', 'Read'],
          ] as const).map(([value, label]) => (
            <Chip
              key={label}
              label={label}
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
        <Box sx={{ border: `1px solid ${palette.inkBorder}`, maxWidth: { md: '42%' } }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Box key={i} sx={{ p: 2.5, borderTop: i === 0 ? 'none' : `1px solid ${palette.inkBorder}` }}>
              <Skeleton variant="text" width="45%" height={22} sx={{ bgcolor: palette.decor }} />
              <Skeleton variant="text" width="30%" height={16} sx={{ bgcolor: palette.decor }} />
              <Skeleton variant="text" width="80%" height={18} sx={{ bgcolor: palette.decor }} />
            </Box>
          ))}
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, border: `1px dashed ${palette.inkBorder}` }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            No messages
          </Typography>
          <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
            {debounced || status ? 'Try a different search or filter.' : 'New booking inquiries will appear here.'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3, alignItems: 'start' }}>
          <Box sx={{ border: `1px solid ${palette.inkBorder}`, maxHeight: '70vh', overflowY: 'auto' }}>
            {items.map((message, index) => (
              <Box
                key={message._id}
                onClick={() => open(message)}
                sx={{
                  p: 2.5,
                  cursor: 'pointer',
                  borderTop: index === 0 ? 'none' : `1px solid ${palette.inkBorder}`,
                  borderLeft: `2px solid ${selected?._id === message._id ? palette.wineBright : 'transparent'}`,
                  bgcolor: selected?._id === message._id ? 'rgba(142, 27, 99, 0.1)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(142, 27, 99, 0.08)' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{ color: palette.ivory, fontWeight: message.status === 'unread' ? 500 : 300 }}
                    noWrap
                  >
                    {message.fullName}
                  </Typography>
                  {message.status === 'unread' && (
                    <Chip label="New" size="small" sx={{ bgcolor: palette.wine, color: onDark.ivory, flexShrink: 0 }} />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: palette.rose }}>
                  {message.shootType || 'General Inquiry'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: palette.ivoryMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {message.message}
                </Typography>
                <Typography variant="caption" sx={{ color: palette.ivoryMuted }}>
                  {new Date(message.createdAt).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>

          {selected ? (
            <Box sx={{ border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised, p: { xs: 2.5, md: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="h4">{selected.fullName}</Typography>
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
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 3 }}>
                {detailRows.map((row) => (
                  <Box key={row.label}>
                    <Typography variant="caption" sx={{ color: palette.rose, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      {row.label}
                    </Typography>
                    {row.href ? (
                      <Link href={row.href} sx={{ display: 'block', color: palette.ivory }}>
                        {row.value}
                      </Link>
                    ) : (
                      <Typography sx={{ color: palette.ivory }}>{row.value}</Typography>
                    )}
                  </Box>
                ))}
              </Box>
              <Typography variant="body1" sx={{ color: palette.ivoryMuted, whiteSpace: 'pre-wrap', borderTop: `1px solid ${palette.inkBorder}`, pt: 3 }}>
                {selected.message}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ border: `1px dashed ${palette.inkBorder}`, p: 6, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
                Select a message to read it.
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}
