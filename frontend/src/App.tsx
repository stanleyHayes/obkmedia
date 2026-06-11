import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';
import PortfolioDetailPage from './pages/PortfolioDetailPage';
import PortfolioPage from './pages/PortfolioPage';

/**
 * The admin dashboard is a fully separate route tree, lazy-loaded so the
 * public marketing site never ships any admin code to visitors.
 */
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
