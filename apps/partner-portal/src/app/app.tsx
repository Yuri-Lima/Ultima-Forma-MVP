import { useTranslation } from 'react-i18next';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider, AppLayout, type SidebarLink, ErrorBoundary, ToastProvider, ThemeToggle } from '@ultima-forma/shared-ui';
import { AuthProvider, useAuth } from './lib/auth-context';

import { LoginPage } from './pages/login';
import { DashboardPage } from './pages/dashboard';
import { RequestsPage } from './pages/requests';
import { ClaimsPage } from './pages/claims';
import { CredentialsPage } from './pages/credentials';
import { WebhooksPage } from './pages/webhooks';
import { SettingsPage } from './pages/settings';
import { DocsPage } from './pages/docs';

function ProtectedRoutes() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('partner');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const links: SidebarLink[] = [
    { label: t('nav.dashboard'), href: '/dashboard', active: location.pathname === '/dashboard' },
    { label: t('nav.requests'), href: '/requests', active: location.pathname === '/requests' },
    { label: t('nav.claims'), href: '/claims', active: location.pathname === '/claims' },
    { label: t('nav.credentials'), href: '/credentials', active: location.pathname === '/credentials' },
    { label: t('nav.webhooks'), href: '/webhooks', active: location.pathname === '/webhooks' },
    { label: t('nav.docs'), href: '/docs', active: location.pathname === '/docs' },
    { label: t('nav.settings'), href: '/settings', active: location.pathname === '/settings' },
  ];

  return (
    <AppLayout
      sidebarTitle={t('nav.appName')}
      sidebarLinks={links}
      onNavigate={(href) => navigate(href)}
      topbarContent={<ThemeToggle />}
      sidebarFooter={
        <button
          onClick={logout}
          className="w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
        >
          {t('nav.logout')}
        </button>
      }
    >
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/credentials" element={<CredentialsPage />} />
        <Route path="/webhooks" element={<WebhooksPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Theme accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/*" element={<ProtectedRoutes />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </Theme>
    </ErrorBoundary>
  );
}

export default App;
