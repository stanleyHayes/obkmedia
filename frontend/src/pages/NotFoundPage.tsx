import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import Seo from '../seo/Seo';
import { palette } from '../theme';

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" />
      <Container maxWidth="md" sx={{ pt: 26, pb: 18, textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '4rem', md: '6rem' }, color: palette.rose }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          This frame is empty
        </Typography>
        <Typography variant="body1" sx={{ color: palette.ivoryMuted, mb: 5 }}>
          The page you’re looking for doesn’t exist or has been moved.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/">
          Back to home
        </Button>
      </Container>
    </>
  );
}
