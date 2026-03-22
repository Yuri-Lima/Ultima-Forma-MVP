import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Flex,
  Card,
  TextField,
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

const STATUS_BADGE_COLOR: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  pending: 'yellow',
  completed: 'green',
  rejected: 'red',
  expired: 'gray',
};

export function RequestList({ apiBase, apiKey }: RequestListProps) {
  const { t, i18n } = useTranslation(['ops', 'common']);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [tenantId, setTenantId] = useState('');
  const [page, setPage] = useState(0);
  const limit = 20;

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (tenantId) params.set('tenantId', tenantId);
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));

    const headers: Record<string, string> = {
      'Accept-Language': i18n.language || 'pt-BR',
    };
    if (apiKey) headers['X-API-Key'] = apiKey;
    fetch(`${apiBase}/internal/requests?${params}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <PageContainer title={t('ops:requests.title')} description={t('ops:requests.description')}>
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
                <Select.Item value="pending">{t('ops:requests.statusPending')}</Select.Item>
                <Select.Item value="completed">{t('ops:requests.statusCompleted')}</Select.Item>
                <Select.Item value="rejected">{t('ops:requests.statusRejected')}</Select.Item>
                <Select.Item value="expired">{t('ops:requests.statusExpired')}</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex direction="column" gap="2" className="min-w-[200px]">
            <Text as="label" size="2" weight="medium">
              {t('ops:filters.tenantId')}
            </Text>
            <TextField.Root
              value={tenantId}
              onChange={(e) => {
                setTenantId(e.target.value);
                setPage(0);
              }}
              placeholder={t('ops:filters.filterByTenant')}
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
        <EmptyState title={t('ops:requests.noResults')} />
      ) : (
        <Card>
          <div className="-mx-4 overflow-x-auto md:mx-0">
            <Table.Root style={{ minWidth: 600 }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell style={{ minWidth: 120 }}>{t('ops:requests.columns.id')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 100 }}>{t('ops:requests.columns.consumer')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 80 }}>{t('ops:requests.columns.status')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 100 }}>{t('ops:requests.columns.purpose')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 90 }}>{t('ops:requests.columns.expires')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 90 }}>{t('ops:requests.columns.created')}</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {items.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell className="max-w-[140px] truncate font-mono text-xs" style={{ minWidth: 120 }} title={item.id}>{item.id}</Table.Cell>
                    <Table.Cell style={{ minWidth: 100 }}>{item.consumerName || item.consumerId}</Table.Cell>
                  <Table.Cell style={{ minWidth: 80 }}>
                    <Badge
                      color={STATUS_BADGE_COLOR[item.status] ?? 'gray'}
                      variant="soft"
                      size="1"
                    >
                      {{
                        pending: t('ops:requests.statusPending'),
                        completed: t('ops:requests.statusCompleted'),
                        rejected: t('ops:requests.statusRejected'),
                        expired: t('ops:requests.statusExpired'),
                      }[item.status] ?? item.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell style={{ minWidth: 100 }}>{item.purpose}</Table.Cell>
                  <Table.Cell style={{ minWidth: 90 }}>{item.expiresAt}</Table.Cell>
                  <Table.Cell style={{ minWidth: 90 }}>{item.createdAt}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            </Table.Root>
          </div>
          <Flex
            align="center"
            gap="3"
            p="4"
            className="border-t border-[var(--gray-6)]"
          >
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
