import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingState,
  ErrorState,
} from '@ultima-forma/shared-ui';
import { signedFetch, withPartnerId } from '../lib/api';

interface DashboardData {
  totalRequests: number;
  consentsApproved: number;
  consentsRejected: number;
  consentsPending: number;
  webhooksSent: number;
}

export function DashboardPage() {
  const { t } = useTranslation('partner');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    signedFetch(withPartnerId('/v1/partner/dashboard'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const stats = [
    {
      label: t('dashboard.totalRequests'),
      value: data?.totalRequests ?? 0,
      variant: 'default' as const,
    },
    {
      label: t('dashboard.approved'),
      value: data?.consentsApproved ?? 0,
      variant: 'success' as const,
    },
    {
      label: t('dashboard.rejected'),
      value: data?.consentsRejected ?? 0,
      variant: 'danger' as const,
    },
    {
      label: t('dashboard.pending'),
      value: data?.consentsPending ?? 0,
      variant: 'warning' as const,
    },
    {
      label: t('dashboard.webhooksSent'),
      value: data?.webhooksSent ?? 0,
      variant: 'secondary' as const,
    },
  ];

  return (
    <PageContainer
      title={t('dashboard.title')}
      description={t('dashboard.description')}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
