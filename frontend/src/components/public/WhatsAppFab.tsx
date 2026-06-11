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
          right: { xs: 18, md: 28 },
          bottom: { xs: 18, md: 28 },
          bgcolor: '#1faf57',
          color: '#fff',
          zIndex: 1500,
          '&:hover': { bgcolor: '#178a45' },
        }}
      >
        <WhatsAppIcon />
      </Fab>
    </Tooltip>
  );
}
