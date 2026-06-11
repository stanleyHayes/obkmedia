import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { palette } from '../../theme';

export default function AdminNotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', py: { xs: 8, md: 14 }, border: `1px dashed ${palette.inkBorder}` }}>
      <Typography variant="h2" sx={{ color: palette.rose, fontSize: { xs: '3rem', md: '4rem' }, mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 1.5 }}>
        Page not found
      </Typography>
      <Typography variant="body2" sx={{ color: palette.ivoryMuted, mb: 4 }}>
        That admin page doesn’t exist. It may have been moved or you mistyped the address.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/admin')}>
        Back to dashboard
      </Button>
    </Box>
  );
}
