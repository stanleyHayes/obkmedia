import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';

// HomePage stays eager (it's the landing page / LCP). The other public pages
// and the whole admin tree are split into their own chunks so the homepage
// doesn't ship code visitors may never reach.
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const PortfolioDetailPage = lazy(() => import('./pages/PortfolioDetailPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminApp = lazy(() => import('./AdminApp'));

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="portfolio/:slug" element={<PortfolioDetailPage />} />
        <Route path="privacy" element={<LegalPage kind="privacy" />} />
        <Route path="terms" element={<LegalPage kind="terms" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route
        path="admin/*"
        element={
          <Suspense fallback={<SplashScreen />}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  );
}
