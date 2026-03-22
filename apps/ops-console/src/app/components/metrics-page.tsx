import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Card, Flex, Text } from '@radix-ui/themes';
import {
  PageContainer,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@ultima-forma/shared-ui';

interface MetricsPageProps {
  apiBase: string;
  apiKey?: string;
}

interface MetricValue {
  name: string;
  label: string;
  value: string;
}

function parsePrometheusText(text: string): Map<string, string> {
  const metrics = new Map<string, string>();
  for (const line of text.split('\n')) {
    if (line.startsWith('#') || !line.trim()) continue;
    const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\s+(.+)$/);
    if (match) {
      const [, name, value] = match;
      if (!metrics.has(name)) {
        metrics.set(name, value);
      }
    }
  }
  return metrics;
}

const TRACKED_METRICS = [
  'uf_requests_total',
  'uf_consents_total',
  'uf_webhook_deliveries_total',
];

export function MetricsPage({ apiBase, apiKey }: MetricsPageProps) {
  const { t } = useTranslation(['ops', 'common']);
  const [metricValues, setMetricValues] = useState<MetricValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    const headers: Record<string, string> = {};
    if (apiKey) headers['X-API-Key'] = apiKey;

    fetch(`${apiBase}/metrics`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const parsed = parsePrometheusText(text);
        const values: MetricValue[] = TRACKED_METRICS.map((name) => ({
          name,
          label: t(`ops:metrics.${name}`, { defaultValue: name.replace(/_/g, ' ') }),
          value: parsed.get(name) ?? '—',
        }));
        setMetricValues(values);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('ops:metrics.error'));
        setMetricValues([]);
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PageContainer title={t('ops:metrics.title')} description={t('ops:metrics.description')}>
      {error ? (
        <ErrorState message={error} onRetry={fetchData} retryLabel={t('common:retry')} />
      ) : loading ? (
        <LoadingState message={t('common:loading')} />
      ) : metricValues.length === 0 ? (
        <EmptyState title={t('ops:metrics.noResults')} />
      ) : (
        <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
          {metricValues.map((m) => (
            <Card key={m.name}>
              <Flex direction="column" gap="2" p="4">
                <Text size="1" weight="medium" color="gray">{m.label}</Text>
                <Text size="6" weight="bold">{m.value}</Text>
              </Flex>
            </Card>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}
