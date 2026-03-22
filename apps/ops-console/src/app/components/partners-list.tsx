import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Card, Flex, Text } from '@radix-ui/themes';
import {
  PageContainer,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@ultima-forma/shared-ui';

interface PartnerSummary {
  tenantId: string;
  requestCount: number;
}

interface PartnersListProps {
  apiBase: string;
  apiKey?: string;
}

export function PartnersList({ apiBase, apiKey }: PartnersListProps) {
  const { t, i18n } = useTranslation(['ops', 'common']);
  const [partners, setPartners] = useState<PartnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {
      'Accept-Language': i18n.language || 'pt-BR',
    };
    if (apiKey) headers['X-API-Key'] = apiKey;

    fetch(`${apiBase}/internal/requests?limit=1000&offset=0`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const items: Array<{ tenantId: string }> = data.items ?? [];
        const counts = new Map<string, number>();
        for (const item of items) {
          counts.set(item.tenantId, (counts.get(item.tenantId) ?? 0) + 1);
        }
        const summaries: PartnerSummary[] = Array.from(counts.entries())
          .map(([tenantId, requestCount]) => ({ tenantId, requestCount }))
          .sort((a, b) => b.requestCount - a.requestCount);
        setPartners(summaries);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('ops:partners.error'));
        setPartners([]);
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey, i18n.language, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PageContainer title={t('ops:partners.title')} description={t('ops:partners.description')}>
      {error ? (
        <ErrorState message={error} onRetry={fetchData} retryLabel={t('common:retry')} />
      ) : loading ? (
        <LoadingState message={t('common:loading')} />
      ) : partners.length === 0 ? (
        <EmptyState title={t('ops:partners.noResults')} />
      ) : (
        <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
          {partners.map((p) => (
            <Card key={p.tenantId}>
              <Flex direction="column" gap="2" p="4">
                <Text size="2" weight="medium">{p.tenantId}</Text>
                <Flex align="baseline" gap="2">
                  <Text size="6" weight="bold">{p.requestCount}</Text>
                  <Text size="1" color="gray">{t('ops:partners.requests')}</Text>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}
