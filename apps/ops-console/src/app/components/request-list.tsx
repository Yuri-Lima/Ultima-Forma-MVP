import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RequestItem {
  id: string;
  consumerId: string;
  consumerName: string;
  tenantId: string;
  status: string;
  purpose: string;
  expiresAt: string;
  createdAt: string;
}

interface RequestListProps {
  apiBase: string;
  apiKey?: string;
}

export function RequestList({ apiBase, apiKey }: RequestListProps) {
  const { t, i18n } = useTranslation(['ops', 'common']);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (tenantId) params.set('tenantId', tenantId);
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));

    const headers: Record<string, string> = {
      'Accept-Language': i18n.language || 'pt-BR',
    };
    if (apiKey) headers['X-API-Key'] = apiKey;
    fetch(`${apiBase}/internal/requests?${params}`, { headers })
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
        setError(err instanceof Error ? err.message : t('ops:requests.error'));
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey, status, tenantId, page, i18n.language, t]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div>
      <h1>{t('ops:requests.title')}</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <label>
          {t('ops:filters.status')}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="">{t('ops:filters.all')}</option>
            <option value="pending">{t('ops:requests.statusPending')}</option>
            <option value="completed">{t('ops:requests.statusCompleted')}</option>
            <option value="rejected">{t('ops:requests.statusRejected')}</option>
            <option value="expired">{t('ops:requests.statusExpired')}</option>
          </select>
        </label>
        <label>
          {t('ops:filters.tenantId')}
          <input
            type="text"
            value={tenantId}
            onChange={(e) => {
              setTenantId(e.target.value);
              setPage(0);
            }}
            placeholder={t('ops:filters.filterByTenant')}
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
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>{t('ops:requests.columns.id')}</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>{t('ops:requests.columns.consumer')}</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>{t('ops:requests.columns.status')}</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>{t('ops:requests.columns.purpose')}</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>{t('ops:requests.columns.expires')}</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>{t('ops:requests.columns.created')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.85em' }}>
                    {item.id}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{item.consumerName || item.consumerId}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {{
                      pending: t('ops:requests.statusPending'),
                      completed: t('ops:requests.statusCompleted'),
                      rejected: t('ops:requests.statusRejected'),
                      expired: t('ops:requests.statusExpired'),
                    }[item.status] ?? item.status}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{item.purpose}</td>
                  <td style={{ padding: '0.5rem' }}>{item.expiresAt}</td>
                  <td style={{ padding: '0.5rem' }}>{item.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p style={{ marginTop: '1rem' }}>{t('ops:requests.noResults')}</p>}
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
