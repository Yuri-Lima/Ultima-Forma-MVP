import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  LoadingState,
  ErrorState,
  EmptyState,
  useToast,
} from '@ultima-forma/shared-ui';
import { signedFetch, withPartnerId, getCredentials } from '../lib/api';

interface Credential {
  id: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
}

export function CredentialsPage() {
  const { t } = useTranslation('partner');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const { toast } = useToast();

  const fetchCredentials = () => {
    setLoading(true);
    setError(null);
    signedFetch(withPartnerId('/v1/partner/credentials'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setCredentials(Array.isArray(data) ? data : data.items ?? [data]))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleRotate = async () => {
    const creds = getCredentials();
    if (!creds) return;
    setRotating(true);
    try {
      const res = await signedFetch(withPartnerId('/v1/partner/credentials/rotate'), {
        method: 'POST',
        body: JSON.stringify({ partnerId: creds.partnerId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({ title: t('credentials.rotated'), variant: 'success' });
      fetchCredentials();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('credentials.rotationFailed'));
    } finally {
      setRotating(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  if (loading) return <LoadingState />;
  if (error && credentials.length === 0) return <ErrorState message={error} onRetry={fetchCredentials} />;

  return (
    <PageContainer
      title={t('credentials.title')}
      description={t('credentials.description')}
      actions={
        <Button onClick={handleRotate} disabled={rotating} variant="outline">
          {rotating
            ? t('credentials.rotating')
            : t('credentials.rotate')}
        </Button>
      }
    >
      {credentials.length === 0 ? (
        <EmptyState
          title={t('credentials.empty')}
          description={t('credentials.emptyDescription')}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {credentials.map((cred) => (
            <Card key={cred.id}>
              <CardHeader>
                <CardTitle className="text-sm font-mono">{cred.id.slice(0, 8)}...</CardTitle>
                <CardDescription>
                  <Badge variant={cred.status === 'active' ? 'default' : 'secondary'}>
                    {t(`credentials.status.${cred.status}`)}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('credentials.created')}</span>
                  <span>{new Date(cred.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('credentials.expiresAt')}</span>
                  <span>
                    {cred.expiresAt
                      ? new Date(cred.expiresAt).toLocaleDateString()
                      : <Badge variant="secondary">{t('credentials.noExpiry')}</Badge>}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
