import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import { BRAND } from '../../content';

export default function WhatsAppFab() {
  return (
    <Tooltip title="Chat with us on WhatsApp" placement="left">
      <Fab
        component="a"
        href={BRAND.whatsappUrl}
        target="_blank"
        rel="noopener"
        aria-label="Chat on WhatsApp"
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 28 },
          bottom: { xs: 'max(18px, env(safe-area-inset-bottom))', md: 28 },
          width: { xs: 48, md: 56 },
          height: { xs: 48, md: 56 },
          minHeight: { xs: 48, md: 56 },
          bgcolor: '#1faf57',
          color: '#fff',
          zIndex: (theme) => theme.zIndex.speedDial,
          boxShadow: '0 14px 32px rgba(20, 88, 47, 0.28)',
          '& svg': { fontSize: { xs: '1.35rem', md: '1.5rem' } },
          '&:hover': { bgcolor: '#178a45', transform: 'translateY(-2px)' },
        }}
      >
        <WhatsAppIcon />
      </Fab>
    </Tooltip>
  );
}
