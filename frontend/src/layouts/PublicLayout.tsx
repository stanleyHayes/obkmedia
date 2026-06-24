import Box from '@mui/material/Box';
import { Suspense } from 'react';
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
        {/* Boundary for lazy-loaded public pages; navbar/footer stay mounted. */}
        <Suspense fallback={<Box sx={{ minHeight: '70vh' }} />}>
          <Outlet />
        </Suspense>
      </Box>
      <Footer />
      <WhatsAppFab />
    </Box>
  );
}
