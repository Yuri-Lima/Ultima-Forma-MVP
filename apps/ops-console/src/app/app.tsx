import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { RequestList, AuditEventList } from './components';
import styles from './app.module.css';

const API_BASE =
  import.meta.env['VITE_API_URL'] ?? 'http://localhost:3334';
const INTERNAL_API_KEY = import.meta.env['VITE_INTERNAL_API_KEY'] ?? '';

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
