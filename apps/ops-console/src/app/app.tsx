import { useTranslation } from 'react-i18next';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import { ThemeProvider, AppLayout, ErrorBoundary, ToastProvider } from '@ultima-forma/shared-ui';
import type { SidebarLink } from '@ultima-forma/shared-ui';
import {
  RequestList,
  AuditEventList,
  ProfileUpdateList,
  WebhookDeliveryList,
  ConsentsList,
  PartnersList,
  CredentialsPage,
  MetricsPage,
  SystemPage,
  LocaleSwitcher,
  Inbox,
} from './components';
import { ThemeToggle } from '@ultima-forma/shared-ui';

const API_BASE =
  import.meta.env['VITE_API_URL'] ?? 'http://localhost:3334';
const INTERNAL_API_KEY = import.meta.env['VITE_INTERNAL_API_KEY'] ?? '';

function AppShell() {
  const { t } = useTranslation('ops');
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarLinks: SidebarLink[] = [
    { label: 'Inbox', href: '/inbox', active: location.pathname === '/inbox' },
    { label: t('nav.requests'), href: '/requests', active: location.pathname === '/requests' },
    { label: t('nav.audit'), href: '/audit', active: location.pathname === '/audit' },
    { label: t('nav.consents'), href: '/consents', active: location.pathname === '/consents' },
    { label: t('nav.webhooks'), href: '/webhooks', active: location.pathname === '/webhooks' },
    { label: t('nav.partners'), href: '/partners', active: location.pathname === '/partners' },
    { label: t('nav.credentials'), href: '/credentials', active: location.pathname === '/credentials' },
    { label: t('nav.metrics'), href: '/metrics', active: location.pathname === '/metrics' },
    { label: t('nav.system'), href: '/system', active: location.pathname === '/system' },
  ];

  return (
    <AppLayout
      sidebarTitle="Ops Console"
      sidebarLinks={sidebarLinks}
      onNavigate={(href) => navigate(href)}
      topbarContent={
        <>
          <ThemeToggle />
          <LocaleSwitcher />
        </>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/inbox" replace />} />
        <Route
          path="/inbox"
          element={<Inbox apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />}
        />
        <Route
          path="/requests"
          element={<RequestList apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />}
        />
        <Route
          path="/audit"
          element={<AuditEventList apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />}
        />
        <Route
          path="/profile-updates"
          element={<ProfileUpdateList apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />}
        />
        <Route
          path="/consents"
          element={<ConsentsList apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />}
        />
        <Route
          path="/webhooks"
          element={<WebhookDeliveryList apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />}
        />
        <Route
          path="/partners"
          element={<PartnersList apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />}
        />
        <Route
          path="/credentials"
          element={<CredentialsPage apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />}
        />
        <Route
          path="/metrics"
          element={<MetricsPage apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />}
        />
        <Route
          path="/system"
          element={<SystemPage apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />}
        />
      </Routes>
    </AppLayout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Theme accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
        <ThemeProvider defaultTheme="dark">
          <ToastProvider>
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </Theme>
    </ErrorBoundary>
  );
}

export default App;
