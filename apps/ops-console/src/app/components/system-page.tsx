import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Box, Card, Flex, Text, Badge } from '@radix-ui/themes';
import {
  PageContainer,
  LoadingState,
  ErrorState,
} from '@ultima-forma/shared-ui';

interface SystemPageProps {
  apiBase: string;
  apiKey?: string;
}

interface HealthData {
  status: string;
  db?: string;
  uptime?: number;
  [key: string]: unknown;
}

interface VersionData {
  version: string;
  gitCommit?: string;
  buildTime?: string;
  featureFlags?: Record<string, boolean>;
  [key: string]: unknown;
}

function formatUptime(seconds?: number): string {
  if (seconds == null) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

export function SystemPage({ apiBase, apiKey }: SystemPageProps) {
  const { t } = useTranslation(['ops', 'common']);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [version, setVersion] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    const headers: Record<string, string> = {};
    if (apiKey) headers['X-API-Key'] = apiKey;

    Promise.all([
      fetch(`${apiBase}/health`, { headers }).then((r) => {
        if (!r.ok) throw new Error(`Health: ${r.status}`);
        return r.json();
      }),
      fetch(`${apiBase}/version`, { headers }).then((r) => {
        if (!r.ok) throw new Error(`Version: ${r.status}`);
        return r.json();
      }),
    ])
      .then(([h, v]) => {
        setHealth(h);
        setVersion(v);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('ops:system.error'));
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PageContainer title={t('ops:system.title')} description={t('ops:system.description')}>
      {error ? (
        <ErrorState message={error} onRetry={fetchData} retryLabel={t('common:retry')} />
      ) : loading ? (
        <LoadingState message={t('common:loading')} />
      ) : (
        <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
          {/* Health */}
          <Card>
            <Flex direction="column" gap="2" p="4">
              <Text size="1" weight="medium" color="gray">{t('ops:system.health')}</Text>
              <Flex align="center" gap="2">
                <Text size="1">{t('ops:system.status')}:</Text>
                <Badge color={health?.status === 'ok' ? 'green' : 'red'} variant="soft" size="1">
                  {health?.status ?? '—'}
                </Badge>
              </Flex>
              <Flex align="center" gap="2">
                <Text size="1">{t('ops:system.database')}:</Text>
                <Badge color={health?.db === 'ok' ? 'green' : 'red'} variant="soft" size="1">
                  {health?.db ?? '—'}
                </Badge>
              </Flex>
            </Flex>
          </Card>

          {/* Uptime */}
          <Card>
            <Flex direction="column" gap="2" p="4">
              <Text size="1" weight="medium" color="gray">{t('ops:system.uptime')}</Text>
              <Text size="6" weight="bold">
                {formatUptime(health?.uptime as number | undefined)}
              </Text>
            </Flex>
          </Card>

          {/* Version */}
          <Card>
            <Flex direction="column" gap="2" p="4">
              <Text size="1" weight="medium" color="gray">{t('ops:system.version')}</Text>
              <Text size="3" weight="medium">{version?.version ?? '—'}</Text>
              {version?.gitCommit && (
                <Text size="1" color="gray" className="font-mono">
                  {t('ops:system.commit')}: {version.gitCommit.slice(0, 8)}
                </Text>
              )}
              {version?.buildTime && (
                <Text size="1" color="gray">
                  {t('ops:system.buildTime')}: {version.buildTime}
                </Text>
              )}
            </Flex>
          </Card>

          {/* Feature Flags */}
          {version?.featureFlags && Object.keys(version.featureFlags).length > 0 && (
            <Box style={{ gridColumn: '1 / -1' }}>
              <Card>
                <Flex direction="column" gap="2" p="4">
                  <Text size="1" weight="medium" color="gray">{t('ops:system.featureFlags')}</Text>
                  <Flex wrap="wrap" gap="2">
                    {Object.entries(version.featureFlags).map(([flag, enabled]) => (
                      <Badge
                        key={flag}
                        color={enabled ? 'green' : 'gray'}
                        variant="soft"
                        size="1"
                      >
                        {flag}: {enabled ? 'ON' : 'OFF'}
                      </Badge>
                    ))}
                  </Flex>
                </Flex>
              </Card>
            </Box>
          )}
        </Grid>
      )}
    </PageContainer>
  );
}
