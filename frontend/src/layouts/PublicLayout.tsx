import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import Footer from '../components/public/Footer';
import Navbar from '../components/public/Navbar';
import WhatsAppFab from '../components/public/WhatsAppFab';

/** Shell for the public marketing site — completely independent of the admin dashboard. */
export default function PublicLayout() {
  return (
    <Box className="obk-grain" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <WhatsAppFab />
    </Box>
  );
}
