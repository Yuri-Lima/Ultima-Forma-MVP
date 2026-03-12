import { useEffect, useState } from 'react';

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
}

export function AuditEventList({ apiBase }: AuditEventListProps) {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventType, setEventType] = useState('');
  const [aggregateId, setAggregateId] = useState('');
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (eventType) params.set('eventType', eventType);
    if (aggregateId) params.set('aggregateId', aggregateId);
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));

    fetch(`${apiBase}/internal/audit-events?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [apiBase, eventType, aggregateId, page]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div>
      <h1>Audit Events</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
            <option value="request_created">request_created</option>
            <option value="consent_granted">consent_granted</option>
            <option value="consent_rejected">consent_rejected</option>
            <option value="request_expired">request_expired</option>
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
      {loading ? (
        <p>Loading...</p>
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
          {items.length === 0 && <p style={{ marginTop: '1rem' }}>No audit events found.</p>}
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
