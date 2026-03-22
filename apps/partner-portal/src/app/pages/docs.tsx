import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  Section,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@ultima-forma/shared-ui';
import { useAuth } from '../lib/auth-context';
import {
  API_ENDPOINTS,
  generateCurl,
  generateNode,
  generatePython,
  type EndpointDef,
} from '../lib/snippet-generator';

function CodeBlock({ code, language }: { code: string; language: string }) {
  const { t } = useTranslation('partner');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-neutral-700 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-600 transition-colors"
      >
        {copied ? t('docs.copied') : t('docs.copy')}
      </button>
      <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function EndpointSection({ endpoint }: { endpoint: EndpointDef }) {
  const { t } = useTranslation('partner');
  const { partnerId } = useAuth();
  const pid = partnerId ?? 'YOUR_PARTNER_ID';

  const methodColor: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    GET: 'success',
    POST: 'default',
    PATCH: 'warning',
    DELETE: 'danger',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Badge variant={methodColor[endpoint.method] ?? 'default'}>
            {endpoint.method}
          </Badge>
          <CardTitle className="text-sm font-mono">{endpoint.path}</CardTitle>
          {endpoint.auth && (
            <Badge variant="outline" className="text-xs">{t('docs.authBadge')}</Badge>
          )}
        </div>
        <CardDescription>{endpoint.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="curl">
          <TabsList>
            <TabsTrigger value="curl">{t('docs.tabCurl')}</TabsTrigger>
            <TabsTrigger value="node">{t('docs.tabNode')}</TabsTrigger>
            <TabsTrigger value="python">{t('docs.tabPython')}</TabsTrigger>
          </TabsList>
          <TabsContent value="curl">
            <CodeBlock code={generateCurl(endpoint, pid)} language="bash" />
          </TabsContent>
          <TabsContent value="node">
            <CodeBlock code={generateNode(endpoint, pid)} language="javascript" />
          </TabsContent>
          <TabsContent value="python">
            <CodeBlock code={generatePython(endpoint, pid)} language="python" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function DocsPage() {
  const { t } = useTranslation('partner');

  return (
    <PageContainer
      title={t('docs.title')}
      description={t('docs.description')}
    >
      <Section title={t('docs.hmacTitle')}>
        <Alert variant="info">
          <AlertTitle>{t('docs.hmacHeading')}</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              <p>{t('docs.hmacDescription')}</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code className="bg-muted px-1 rounded">x-partner-id</code> — {t('docs.headerPartnerId')}</li>
                <li><code className="bg-muted px-1 rounded">x-timestamp</code> — {t('docs.headerTimestamp')}</li>
                <li><code className="bg-muted px-1 rounded">x-signature</code> — {t('docs.headerSignature')}</li>
              </ul>
              <p className="text-sm mt-2">{t('docs.hmacFormula')}</p>
              <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto">
{`payload = METHOD + PATH + BODY + TIMESTAMP
signature = HMAC-SHA256(clientSecret, payload)`}
              </pre>
            </div>
          </AlertDescription>
        </Alert>
      </Section>

      <Section title={t('docs.endpointsTitle')}>
        <div className="space-y-4">
          {API_ENDPOINTS.map((ep) => (
            <EndpointSection key={`${ep.method}-${ep.path}`} endpoint={ep} />
          ))}
        </div>
      </Section>
    </PageContainer>
  );
}
