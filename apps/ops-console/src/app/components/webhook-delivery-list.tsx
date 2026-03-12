import { useEffect, useState } from 'react';

interface WebhookDeliveryItem {
  id: string;
  subscriptionId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: string;
  attempts: number;
  lastError: string | null;
  nextRetryAt: string | null;
  succeededAt: string | null;
  createdAt: string;
}

interface WebhookDeliveryListProps {
  apiBase: string;
  apiKey?: string;
}

export function WebhookDeliveryList({
  apiBase,
  apiKey,
}: WebhookDeliveryListProps) {
  const [items, setItems] = useState<WebhookDeliveryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));

    const headers: Record<string, string> = {};
    if (apiKey) headers['X-API-Key'] = apiKey;
    fetch(`${apiBase}/internal/webhook-deliveries?${params}`, { headers })
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
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load webhook deliveries'
        );
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey, status, page]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div>
      <h1>Webhook Deliveries</h1>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
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
            <option value="succeeded">succeeded</option>
            <option value="failed">failed</option>
          </select>
        </label>
      </div>
      {error && (
        <p style={{ color: '#c00', marginBottom: '1rem' }}>{error}</p>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
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
                      color:
                        item.status === 'succeeded'
                          ? '#0a0'
                          : item.status === 'failed'
                            ? '#c00'
                            : '#1a1a2e',
                    }}
                  >
                    {item.status}
                  </span>
                  <span style={{ color: '#666' }}>{item.eventType}</span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85em',
                      color: '#555',
                    }}
                  >
                    {item.subscriptionId.slice(0, 8)}...
                  </span>
                  <span style={{ color: '#888', fontSize: '0.9em' }}>
                    attempts: {item.attempts}
                  </span>
                  <span style={{ color: '#888', fontSize: '0.9em' }}>
                    {item.createdAt}
                  </span>
                </div>
                {item.lastError && (
                  <p
                    style={{
                      marginTop: '0.5rem',
                      color: '#c00',
                      fontSize: '0.85em',
                    }}
                  >
                    {item.lastError}
                  </p>
                )}
                {item.nextRetryAt && item.status === 'failed' && (
                  <p
                    style={{
                      marginTop: '0.25rem',
                      color: '#666',
                      fontSize: '0.85em',
                    }}
                  >
                    Next retry: {item.nextRetryAt}
                  </p>
                )}
              </div>
            ))}
          </div>
          {items.length === 0 && (
            <p style={{ marginTop: '1rem' }}>No webhook deliveries found.</p>
          )}
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
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
