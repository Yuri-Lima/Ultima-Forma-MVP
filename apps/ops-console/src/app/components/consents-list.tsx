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

interface ConsentItem {
  id: string;
  tenantId: string;
  status: string;
  createdAt: string;
}

interface ConsentsListProps {
  apiBase: string;
  apiKey?: string;
}

const STATUS_BADGE_COLOR: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  granted: 'green',
  rejected: 'red',
  pending: 'yellow',
  revoked: 'gray',
};

export function ConsentsList({ apiBase, apiKey }: ConsentsListProps) {
  const { t, i18n } = useTranslation(['ops', 'common']);
  const [items, setItems] = useState<ConsentItem[]>([]);
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
    fetch(`${apiBase}/internal/consents?${params}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('ops:consents.error'));
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey, status, tenantId, page, i18n.language, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    const headers: Record<string, string> = {
      'Accept-Language': i18n.language || 'pt-BR',
    };
    if (apiKey) headers['X-API-Key'] = apiKey;
    try {
      const res = await fetch(`${apiBase}/internal/consents/${id}/approve`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      fetchData();
    } catch {
      fetchData();
    }
  };

  const handleReject = async (id: string) => {
    const headers: Record<string, string> = {
      'Accept-Language': i18n.language || 'pt-BR',
    };
    if (apiKey) headers['X-API-Key'] = apiKey;
    try {
      const res = await fetch(`${apiBase}/internal/consents/${id}/reject`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      fetchData();
    } catch {
      fetchData();
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <PageContainer title={t('ops:consents.title')} description={t('ops:consents.description')}>
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
                <Select.Item value="pending">{t('ops:consents.statusPending')}</Select.Item>
                <Select.Item value="granted">{t('ops:consents.statusGranted')}</Select.Item>
                <Select.Item value="rejected">{t('ops:consents.statusRejected')}</Select.Item>
                <Select.Item value="revoked">{t('ops:consents.statusRevoked')}</Select.Item>
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
        <EmptyState title={t('ops:consents.noResults')} />
      ) : (
        <Card>
          <div className="-mx-4 overflow-x-auto md:mx-0">
            <Table.Root style={{ minWidth: 500 }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell style={{ minWidth: 120 }}>{t('ops:consents.columns.id')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 100 }}>{t('ops:consents.columns.tenant')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 80 }}>{t('ops:consents.columns.status')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 90 }}>{t('ops:consents.columns.created')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ minWidth: 140 }}>{t('ops:consents.columns.actions')}</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {items.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell className="max-w-[140px] truncate font-mono text-xs" style={{ minWidth: 120 }} title={item.id}>{item.id}</Table.Cell>
                    <Table.Cell style={{ minWidth: 100 }}>{item.tenantId}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={STATUS_BADGE_COLOR[item.status] ?? 'gray'}
                      variant="soft"
                      size="1"
                    >
                      {item.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell style={{ minWidth: 90 }}>{item.createdAt}</Table.Cell>
                  <Table.Cell style={{ minWidth: 140 }}>
                    {item.status === 'pending' && (
                      <Flex gap="2">
                        <Button size="1" onClick={() => handleApprove(item.id)}>
                          {t('ops:consents.approve')}
                        </Button>
                        <Button size="1" color="red" variant="soft" onClick={() => handleReject(item.id)}>
                          {t('ops:consents.reject')}
                        </Button>
                      </Flex>
                    )}
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
