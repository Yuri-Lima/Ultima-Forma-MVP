import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Flex,
  Card,
  Select,
  Table,
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

const STATUS_BADGE_COLOR: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  succeeded: 'green',
  failed: 'red',
  pending: 'yellow',
};

export function WebhookDeliveryList({ apiBase, apiKey }: WebhookDeliveryListProps) {
  const { t, i18n } = useTranslation(['ops', 'common']);
  const [items, setItems] = useState<WebhookDeliveryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const limit = 50;

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));

    const headers: Record<string, string> = {
      'Accept-Language': i18n.language || 'pt-BR',
    };
    if (apiKey) headers['X-API-Key'] = apiKey;
    fetch(`${apiBase}/internal/webhook-deliveries?${params}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('ops:webhooks.error'));
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey, status, page, i18n.language, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <PageContainer title={t('ops:webhooks.title')} description={t('ops:webhooks.description')}>
      <Card className="mb-6">
        <Flex gap="4" wrap="wrap" align="end" p="4">
          <Flex direction="column" gap="2" className="min-w-[160px]">
            <Text as="label" size="2" weight="medium">
              {t('ops:filters.status')}
            </Text>
            <Select.Root
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(0);
              }}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="all">{t('ops:filters.all')}</Select.Item>
                <Select.Item value="pending">{t('ops:webhooks.statusPending')}</Select.Item>
                <Select.Item value="succeeded">{t('ops:webhooks.statusSucceeded')}</Select.Item>
                <Select.Item value="failed">{t('ops:webhooks.statusFailed')}</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} retryLabel={t('common:retry')} />
      ) : loading ? (
        <LoadingState message={t('common:loading')} />
      ) : items.length === 0 ? (
        <EmptyState title={t('ops:webhooks.noResults')} />
      ) : (
        <Card>
          <div className="-mx-4 overflow-x-auto md:mx-0">
            <Table.Root style={{ minWidth: 600 }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell style={{ minWidth: 80 }}>{t('ops:webhooks.columns.status')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 100 }}>{t('ops:webhooks.columns.eventType')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 100 }}>{t('ops:webhooks.columns.subscription')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 70 }}>{t('ops:webhooks.columns.attempts')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 100 }}>{t('ops:webhooks.columns.lastError')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 120 }}>{t('ops:webhooks.columns.created')}</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
              {items.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    <Badge
                      color={STATUS_BADGE_COLOR[item.status] ?? 'gray'}
                      variant="soft"
                      size="1"
                    >
                      {{
                        succeeded: t('ops:webhooks.statusSucceeded'),
                        failed: t('ops:webhooks.statusFailed'),
                        pending: t('ops:webhooks.statusPending'),
                      }[item.status] ?? item.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{item.eventType}</Table.Cell>
                  <Table.Cell className="max-w-[120px] truncate font-mono text-xs" style={{ minWidth: 100 }} title={item.subscriptionId}>
                    {item.subscriptionId.slice(0, 8)}...
                  </Table.Cell>
                  <Table.Cell>{item.attempts}</Table.Cell>
                  <Table.Cell className="max-w-xs truncate text-xs text-danger-600">
                    {item.lastError || '—'}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex direction="column" gap="0">
                      <Text size="1">{item.createdAt}</Text>
                      {item.nextRetryAt && item.status === 'failed' && (
                        <Text size="1" color="gray">
                          {t('ops:webhooks.nextRetry')}: {item.nextRetryAt}
                        </Text>
                      )}
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            </Table.Root>
          </div>
          <Flex align="center" gap="3" p="4" className="border-t border-[var(--gray-6)]">
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
        </Card>
      )}
    </PageContainer>
  );
}
