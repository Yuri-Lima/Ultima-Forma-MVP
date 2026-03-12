import { useEffect, useState } from 'react';

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

    const headers: Record<string, string> = {};
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
        setError(err instanceof Error ? err.message : 'Failed to load requests');
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey, status, tenantId, page]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div>
      <h1>Data Requests</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <label>
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="">All</option>
            <option value="pending">pending</option>
            <option value="completed">completed</option>
            <option value="rejected">rejected</option>
            <option value="expired">expired</option>
          </select>
        </label>
        <label>
          Tenant ID
          <input
            type="text"
            value={tenantId}
            onChange={(e) => {
              setTenantId(e.target.value);
              setPage(0);
            }}
            placeholder="Filter by tenant"
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          />
        </label>
      </div>
      {error && (
        <p style={{ color: '#c00', marginBottom: '1rem' }}>{error}</p>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Consumer</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Purpose</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Expires</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.85em' }}>
                    {item.id}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{item.consumerName || item.consumerId}</td>
                  <td style={{ padding: '0.5rem' }}>{item.status}</td>
                  <td style={{ padding: '0.5rem' }}>{item.purpose}</td>
                  <td style={{ padding: '0.5rem' }}>{item.expiresAt}</td>
                  <td style={{ padding: '0.5rem' }}>{item.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p style={{ marginTop: '1rem' }}>No requests found.</p>}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {page + 1} of {totalPages} ({total} total)
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
