import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Flex,
  Card,
  TextField,
  Select,
  Badge,
  Button,
  Text,
} from '@radix-ui/themes';
import {
  PageContainer,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@ultima-forma/shared-ui';

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

const EVENT_BADGE_COLOR: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  request_created: 'gray',
  consent_granted: 'green',
  consent_rejected: 'red',
  request_expired: 'yellow',
};

export function AuditEventList({ apiBase, apiKey }: AuditEventListProps) {
  const { t, i18n } = useTranslation(['ops', 'common']);
  const [items, setItems] = useState<AuditItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventType, setEventType] = useState('all');
  const [aggregateId, setAggregateId] = useState('');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const limit = 50;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (eventType && eventType !== 'all') params.set('eventType', eventType);
    if (aggregateId) params.set('aggregateId', aggregateId);
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));

    const headers: Record<string, string> = {
      'Accept-Language': i18n.language || 'pt-BR',
    };
    if (apiKey) headers['X-API-Key'] = apiKey;
    fetch(`${apiBase}/internal/audit-events?${params}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <PageContainer title={t('ops:audit.title')} description={t('ops:audit.description')}>
      <Card className="mb-6">
        <Flex gap="4" wrap="wrap" align="end" p="4">
          <Flex direction="column" gap="2" className="min-w-[180px]">
            <Text as="label" size="2" weight="medium">
              {t('ops:filters.eventType')}
            </Text>
            <Select.Root
              value={eventType}
              onValueChange={(val) => {
                setEventType(val);
                setPage(0);
              }}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="all">{t('ops:filters.all')}</Select.Item>
                <Select.Item value="request_created">{t('ops:audit.eventRequestCreated')}</Select.Item>
                <Select.Item value="consent_granted">{t('ops:audit.eventConsentGranted')}</Select.Item>
                <Select.Item value="consent_rejected">{t('ops:audit.eventConsentRejected')}</Select.Item>
                <Select.Item value="request_expired">{t('ops:audit.eventRequestExpired')}</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex direction="column" gap="2" className="min-w-[200px]">
            <Text as="label" size="2" weight="medium">
              {t('ops:filters.aggregateId')}
            </Text>
            <TextField.Root
              value={aggregateId}
              onChange={(e) => {
                setAggregateId(e.target.value);
                setPage(0);
              }}
              placeholder={t('ops:filters.filterById')}
              size="2"
            />
          </Flex>
        </Flex>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} retryLabel={t('common:retry')} />
      ) : loading ? (
        <LoadingState message={t('common:loading')} />
      ) : items.length === 0 ? (
        <EmptyState title={t('ops:audit.noResults')} />
      ) : (
        <>
          <div className="relative ml-4 border-l-2 border-[var(--gray-6)] pl-6">
            {items.map((item) => {
              const isOpen = expanded.has(item.id);
              const hasPayload = Object.keys(item.payload).length > 0;
              return (
                <div key={item.id} className="relative mb-6 last:mb-0">
                  <div
                    className="absolute -left-[31px] top-3 h-3 w-3 rounded-full border-2 border-[var(--accent-8)] bg-[var(--color-background)]"
                    aria-hidden
                  />
                  <Card className="mb-0">
                    <Flex direction="column" gap="3" p="4">
                      <Flex wrap="wrap" align="center" gap="3">
                        <Badge
                          color={EVENT_BADGE_COLOR[item.eventType] ?? 'gray'}
                          variant="soft"
                          size="1"
                        >
                          {item.eventType}
                        </Badge>
                        <Text size="1" color="gray" className="font-mono">
                          {item.aggregateId} {item.aggregateType}
                        </Text>
                        <Text size="1" color="gray" className="ml-auto">
                          {item.createdAt}
                        </Text>
                      </Flex>
                      {hasPayload && (
                        <Flex direction="column" gap="2">
                          <Button
                            variant="ghost"
                            color="gray"
                            size="1"
                            onClick={() => toggleExpand(item.id)}
                          >
                            {isOpen ? t('ops:audit.hidePayload') : t('ops:audit.showPayload')}
                          </Button>
                          {isOpen && (
                            <pre className="max-h-64 overflow-auto rounded-md bg-[var(--gray-3)] p-3 text-xs">
                              {JSON.stringify(item.payload, null, 2)}
                            </pre>
                          )}
                        </Flex>
                      )}
                    </Flex>
                  </Card>
                </div>
              );
            })}
          </div>

          <Flex align="center" gap="3" mt="4">
            <Button
              variant="soft"
              size="1"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t('ops:pagination.previous')}
            </Button>
            <Text size="1" color="gray">
              {t('ops:pagination.page', { current: page + 1, total: totalPages, count: total })}
            </Text>
            <Button
              variant="soft"
              size="1"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('ops:pagination.next')}
            </Button>
          </Flex>
        </>
      )}
    </PageContainer>
  );
}
