import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@ultima-forma/shared-ui';
import { signedFetch, withPartnerId } from '../lib/api';

interface ClaimDefinition {
  id: string;
  key: string;
  displayName: string;
  namespace: string;
  sensitivityLevel: string;
}

const sensitivityVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

const SENSITIVITY_LABELS: Record<string, string> = {
  low: 'claims.sensitivityLow',
  medium: 'claims.sensitivityMedium',
  high: 'claims.sensitivityHigh',
};

export function ClaimsPage() {
  const { t } = useTranslation('partner');
  const [claims, setClaims] = useState<ClaimDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = () => {
    setLoading(true);
    setError(null);
    signedFetch(withPartnerId('/v1/claims'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setClaims(data.items ?? data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchClaims} />;

  return (
    <PageContainer
      title={t('claims.title')}
      description={t('claims.description')}
    >
      {claims.length === 0 ? (
        <EmptyState
          title={t('claims.empty')}
          description={t('claims.emptyDescription')}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('claims.key')}</TableHead>
              <TableHead>{t('claims.displayName')}</TableHead>
              <TableHead>{t('claims.namespace')}</TableHead>
              <TableHead>{t('claims.sensitivity')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell className="font-mono text-xs">{claim.key}</TableCell>
                <TableCell>{claim.displayName}</TableCell>
                <TableCell>{claim.namespace}</TableCell>
                <TableCell>
                  <Badge variant={sensitivityVariant[claim.sensitivityLevel] ?? 'default'}>
                    {SENSITIVITY_LABELS[claim.sensitivityLevel]
                      ? t(SENSITIVITY_LABELS[claim.sensitivityLevel])
                      : claim.sensitivityLevel}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageContainer>
  );
}
