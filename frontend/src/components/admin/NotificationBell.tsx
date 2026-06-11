import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../admin/NotificationsContext';
import { palette } from '../../theme';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const { count, items } = useNotifications();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  const goToMessages = () => {
    setAnchor(null);
    navigate('/admin/messages');
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: palette.ivory }}>
          <Badge
            badgeContent={count}
            max={99}
            color="primary"
            sx={{ '& .MuiBadge-badge': { bgcolor: palette.wineBright, color: palette.ivory } }}
          >
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: '92vw', border: `1px solid ${palette.inkBorder}`, bgcolor: palette.inkRaised } } }}
      >
        <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
            Notifications
          </Typography>
          {count > 0 && (
            <Typography variant="caption" sx={{ color: palette.rose, letterSpacing: '0.1em' }}>
              {count} unread
            </Typography>
          )}
        </Box>
        <Divider sx={{ borderColor: palette.inkBorder }} />

        {items.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: palette.ivoryMuted }}>
              You’re all caught up.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {items.map((item) => (
              <Box
                key={item.id}
                onClick={goToMessages}
                sx={{
                  px: 2.5,
                  py: 1.75,
                  cursor: 'pointer',
                  borderBottom: `1px solid ${palette.inkBorder}`,
                  '&:hover': { bgcolor: 'rgba(142, 27, 99, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ color: palette.ivory, fontSize: '0.92rem' }} noWrap>
                    {item.fullName}
                    {item.shootType ? ` · ${item.shootType}` : ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.ivoryMuted, flexShrink: 0 }}>
                    {timeAgo(item.createdAt)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: palette.ivoryMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.message}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ borderColor: palette.inkBorder }} />
        <Box sx={{ p: 1.5 }}>
          <Button fullWidth onClick={goToMessages} sx={{ color: palette.rose }}>
            View all messages
          </Button>
        </Box>
      </Popover>
    </>
  );
}
