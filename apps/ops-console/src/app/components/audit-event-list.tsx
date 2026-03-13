import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AuditItem {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

interface AuditEventListProps {
  apiBase: string;
  apiKey?: string;
}

export function AuditEventList({ apiBase, apiKey }: AuditEventListProps) {
  const { t, i18n } = useTranslation(['ops', 'common']);
  const [items, setItems] = useState<AuditItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventType, setEventType] = useState('');
  const [aggregateId, setAggregateId] = useState('');
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (eventType) params.set('eventType', eventType);
    if (aggregateId) params.set('aggregateId', aggregateId);
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));

    const headers: Record<string, string> = {
      'Accept-Language': i18n.language || 'pt-BR',
    };
    if (apiKey) headers['X-API-Key'] = apiKey;
    fetch(`${apiBase}/internal/audit-events?${params}`, { headers })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('ops:audit.error'));
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey, eventType, aggregateId, page, i18n.language, t]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div>
      <h1>{t('ops:audit.title')}</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <label>
          {t('ops:filters.eventType')}
          <select
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value);
              setPage(0);
            }}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="">{t('ops:filters.all')}</option>
            <option value="request_created">{t('ops:audit.eventRequestCreated')}</option>
            <option value="consent_granted">{t('ops:audit.eventConsentGranted')}</option>
            <option value="consent_rejected">{t('ops:audit.eventConsentRejected')}</option>
            <option value="request_expired">{t('ops:audit.eventRequestExpired')}</option>
          </select>
        </label>
        <label>
          {t('ops:filters.aggregateId')}
          <input
            type="text"
            value={aggregateId}
            onChange={(e) => {
              setAggregateId(e.target.value);
              setPage(0);
            }}
            placeholder={t('ops:filters.filterById')}
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          />
        </label>
      </div>
      {error && (
        <p style={{ color: '#c00', marginBottom: '1rem' }}>{error}</p>
      )}
      {loading ? (
        <p>{t('common:loading')}</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#1a1a2e',
                    }}
                  >
                    {item.eventType}
                  </span>
                  <span style={{ color: '#666' }}>{item.aggregateType}</span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85em',
                      color: '#555',
                    }}
                  >
                    {item.aggregateId}
                  </span>
                  <span style={{ color: '#888', fontSize: '0.9em' }}>
                    {item.createdAt}
                  </span>
                </div>
                {Object.keys(item.payload).length > 0 && (
                  <pre
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '4px',
                      fontSize: '0.8em',
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(item.payload, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
          {items.length === 0 && <p style={{ marginTop: '1rem' }}>{t('ops:audit.noResults')}</p>}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t('ops:pagination.previous')}
            </button>
            <span>
              {t('ops:pagination.page', { current: page + 1, total: totalPages, count: total })}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('ops:pagination.next')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
