import { useEffect, useState } from 'react';

interface ProfileUpdateItem {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

interface ProfileUpdateListProps {
  apiBase: string;
  apiKey?: string;
}

export function ProfileUpdateList({ apiBase, apiKey }: ProfileUpdateListProps) {
  const [items, setItems] = useState<ProfileUpdateItem[]>([]);
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

    const fetchOne = (evType: string) => {
      const params = new URLSearchParams();
      params.set('eventType', evType);
      if (aggregateId) params.set('aggregateId', aggregateId);
      params.set('limit', String(limit));
      params.set('offset', String(page * limit));
      const headers: Record<string, string> = {};
      if (apiKey) headers['X-API-Key'] = apiKey;
      return fetch(`${apiBase}/internal/audit-events?${params}`, { headers });
    };

    const headers: Record<string, string> = {};
    if (apiKey) headers['X-API-Key'] = apiKey;

    const params = new URLSearchParams();
    if (eventType) params.set('eventType', eventType);
    if (aggregateId) params.set('aggregateId', aggregateId);
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));

    const promise = eventType
      ? fetch(`${apiBase}/internal/audit-events?${params}`, { headers }).then(
          (res) => {
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            return res.json();
          }
        )
      : Promise.all([
          fetchOne('issuer_updated'),
          fetchOne('consumer_updated'),
        ]).then(([a, b]) => {
          if (!a.ok) throw new Error(`Request failed: ${a.status}`);
          if (!b.ok) throw new Error(`Request failed: ${b.status}`);
          return Promise.all([a.json(), b.json()]).then(([da, db]) => ({
            items: [...(da.items ?? []), ...(db.items ?? [])].sort(
              (x: { createdAt: string }, y: { createdAt: string }) =>
                new Date(y.createdAt).getTime() -
                new Date(x.createdAt).getTime()
            ),
            total: (da.total ?? 0) + (db.total ?? 0),
          }));
        });

    promise
      .then((data: { items: ProfileUpdateItem[]; total: number }) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load profile updates'
        );
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey, eventType, aggregateId, page]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div>
      <h1>Profile Updates</h1>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <label>
          Event Type
          <select
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value);
              setPage(0);
            }}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="">All</option>
            <option value="issuer_updated">issuer_updated</option>
            <option value="consumer_updated">consumer_updated</option>
          </select>
        </label>
        <label>
          Aggregate ID
          <input
            type="text"
            value={aggregateId}
            onChange={(e) => {
              setAggregateId(e.target.value);
              setPage(0);
            }}
            placeholder="Filter by ID"
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
          {items.length === 0 && (
            <p style={{ marginTop: '1rem' }}>No profile updates found.</p>
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
