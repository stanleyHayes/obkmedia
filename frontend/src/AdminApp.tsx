import { Route, Routes } from 'react-router-dom';
import { NotificationsProvider } from './admin/NotificationsContext';
import { AuthProvider } from './auth/AuthContext';
import RequirePermission from './auth/RequirePermission';
import AdminLayout from './layouts/AdminLayout';
import AdminNotFoundPage from './pages/admin/AdminNotFoundPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import DashboardPage from './pages/admin/DashboardPage';
import LoginPage from './pages/admin/LoginPage';
import MessagesPage from './pages/admin/MessagesPage';
import PortfolioEditPage from './pages/admin/PortfolioEditPage';
import PortfolioListPage from './pages/admin/PortfolioListPage';
import PreferencesPage from './pages/admin/PreferencesPage';
import ProfilePage from './pages/admin/ProfilePage';
import ResetPasswordPage from './pages/admin/ResetPasswordPage';
import SecurityPage from './pages/admin/SecurityPage';
import SettingsPage from './pages/admin/SettingsPage';
import RolesPage from './pages/admin/RolesPage';
import UsersPage from './pages/admin/UsersPage';

/** Admin dashboard application — independent of the public marketing site. */
export default function AdminApp() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route
            path="portfolio"
            element={
              <RequirePermission permission="portfolio.view">
                <PortfolioListPage />
              </RequirePermission>
            }
          />
          <Route
            path="portfolio/new"
            element={
              <RequirePermission permission="portfolio.manage">
                <PortfolioEditPage />
              </RequirePermission>
            }
          />
          <Route
            path="portfolio/:id"
            element={
              <RequirePermission permission="portfolio.manage">
                <PortfolioEditPage />
              </RequirePermission>
            }
          />
          <Route
            path="categories"
            element={
              <RequirePermission permission="categories.view">
                <CategoriesPage />
              </RequirePermission>
            }
          />
          <Route
            path="messages"
            element={
              <RequirePermission permission="messages.view">
                <MessagesPage />
              </RequirePermission>
            }
          />
          <Route
            path="users"
            element={
              <RequirePermission permission="users.view">
                <UsersPage />
              </RequirePermission>
            }
          />
          <Route
            path="roles"
            element={
              <RequirePermission permission="roles.view">
                <RolesPage />
              </RequirePermission>
            }
          />
          <Route
            path="settings"
            element={
              <RequirePermission permission="settings.view">
                <SettingsPage />
              </RequirePermission>
            }
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="preferences" element={<PreferencesPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="*" element={<AdminNotFoundPage />} />
        </Route>
        </Routes>
      </NotificationsProvider>
    </AuthProvider>
  );
}
