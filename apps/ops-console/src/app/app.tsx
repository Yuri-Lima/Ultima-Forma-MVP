import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { RequestList } from './components/request-list';
import { AuditEventList } from './components/audit-event-list';
import styles from './app.module.css';

const API_BASE =
  import.meta.env['VITE_API_URL'] ?? 'http://localhost:3334';

export function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <nav className={styles.nav}>
          <Link to="/requests" className={styles.navLink}>
            Requests
          </Link>
          <Link to="/audit" className={styles.navLink}>
            Audit
          </Link>
        </nav>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Navigate to="/requests" replace />} />
            <Route
              path="/requests"
              element={<RequestList apiBase={API_BASE} />}
            />
            <Route
              path="/audit"
              element={<AuditEventList apiBase={API_BASE} />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
