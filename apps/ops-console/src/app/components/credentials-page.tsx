import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  Section,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@ultima-forma/shared-ui';

const SEED_PARTNER_ID = 'c2989a86-ca61-40f2-9d8a-e6250bde4f9d';

interface CredentialsPageProps {
  apiBase: string;
  apiKey?: string;
}

interface RotateResult {
  credentialId: string;
  secret: string;
  message?: string;
}

export function CredentialsPage({ apiBase, apiKey }: CredentialsPageProps) {
  const { t, i18n } = useTranslation(['ops', 'common']);
  const [partnerId, setPartnerId] = useState(SEED_PARTNER_ID);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RotateResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRotate = async () => {
    setRotating(true);
    setError(null);
    setResult(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept-Language': i18n.language || 'pt-BR',
      };
      if (apiKey) headers['X-API-Key'] = apiKey;

      const res = await fetch(`${apiBase}/internal/credentials/rotate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ partnerId: partnerId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      setResult({ credentialId: data.credentialId, secret: data.secret, message: data.message });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ops:credentials.error'));
    } finally {
      setRotating(false);
    }
  };

  const handleCopySecret = () => {
    if (!result?.secret) return;
    navigator.clipboard.writeText(result.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageContainer
      title={t('ops:credentials.title')}
      description={t('ops:credentials.description')}
    >
      <Section>
        <Card>
          <CardContent className="space-y-4">
            <Input
              label={t('ops:credentials.partnerId')}
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              placeholder={SEED_PARTNER_ID}
            />
            <Button
              onClick={handleRotate}
              disabled={rotating || !partnerId.trim()}
            >
              {rotating ? t('ops:credentials.rotating') : t('ops:credentials.rotate')}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>{t('common:error', 'Error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('ops:credentials.success')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="warning">
                    <AlertTitle>{t('ops:credentials.secretWarning')}</AlertTitle>
                    <AlertDescription>{result.message}</AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Credential ID
                      </span>
                      <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                        {result.credentialId}
                      </code>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Secret
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-muted px-2 py-1 text-sm font-mono break-all">
                          {result.secret}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopySecret}
                        >
                          {copied ? t('ops:credentials.copied') : t('ops:credentials.copySecret')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </Section>
    </PageContainer>
  );
}
