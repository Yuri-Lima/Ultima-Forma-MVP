import { useTranslation } from 'react-i18next';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import {
  RequestList,
  AuditEventList,
  ProfileUpdateList,
  WebhookDeliveryList,
  LocaleSwitcher,
} from './components';
import styles from './app.module.css';

const API_BASE =
  import.meta.env['VITE_API_URL'] ?? 'http://localhost:3334';
const INTERNAL_API_KEY = import.meta.env['VITE_INTERNAL_API_KEY'] ?? '';

export function App() {
  const { t } = useTranslation('ops');
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <nav className={styles.nav}>
          <Link to="/requests" className={styles.navLink}>
            {t('nav.requests')}
          </Link>
          <Link to="/audit" className={styles.navLink}>
            {t('nav.audit')}
          </Link>
          <Link to="/profile-updates" className={styles.navLink}>
            {t('nav.profileUpdates')}
          </Link>
          <Link to="/webhooks" className={styles.navLink}>
            {t('nav.webhooks')}
          </Link>
          <LocaleSwitcher />
        </nav>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Navigate to="/requests" replace />} />
            <Route
              path="/requests"
              element={
                <RequestList apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />
              }
            />
            <Route
              path="/audit"
              element={
                <AuditEventList apiBase={API_BASE} apiKey={INTERNAL_API_KEY} />
              }
            />
            <Route
              path="/profile-updates"
              element={
                <ProfileUpdateList
                  apiBase={API_BASE}
                  apiKey={INTERNAL_API_KEY}
                />
              }
            />
            <Route
              path="/webhooks"
              element={
                <WebhookDeliveryList
                  apiBase={API_BASE}
                  apiKey={INTERNAL_API_KEY}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
