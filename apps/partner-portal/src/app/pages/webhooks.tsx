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
  Button,
  Input,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
  LoadingState,
  ErrorState,
  EmptyState,
  useToast,
} from '@ultima-forma/shared-ui';
import { signedFetch, withPartnerId, getCredentials } from '../lib/api';

interface Webhook {
  id: string;
  url: string;
  eventTypes: string[];
  active: boolean;
  createdAt: string;
}

export function WebhooksPage() {
  const { t } = useTranslation('partner');
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchWebhooks = () => {
    setLoading(true);
    setError(null);
    signedFetch(withPartnerId('/v1/partner/webhooks'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setWebhooks(data.items ?? data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!newUrl.trim()) return;
    const creds = getCredentials();
    if (!creds) return;
    setSaving(true);
    try {
      const res = await signedFetch(withPartnerId('/v1/partner/webhooks'), {
        method: 'POST',
        body: JSON.stringify({
          partnerId: creds.partnerId,
          url: newUrl.trim(),
          eventTypes: newEvents.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({ title: t('webhooks.created'), variant: 'success' });
      setShowCreate(false);
      setNewUrl('');
      setNewEvents('');
      fetchWebhooks();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('webhooks.createFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (id: string) => {
    try {
      await signedFetch(withPartnerId(`/v1/partner/webhooks/${id}/test`), { method: 'POST' });
    } catch {
      // best-effort
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  if (loading) return <LoadingState />;
  if (error && webhooks.length === 0) return <ErrorState message={error} onRetry={fetchWebhooks} />;

  return (
    <PageContainer
      title={t('webhooks.title')}
      description={t('webhooks.description')}
      actions={
        <Modal open={showCreate} onOpenChange={setShowCreate}>
          <ModalTrigger asChild>
            <Button>{t('webhooks.create')}</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{t('webhooks.createTitle')}</ModalTitle>
              <ModalDescription>
                {t('webhooks.createDescription')}
              </ModalDescription>
            </ModalHeader>
            <div className="space-y-4 py-4">
              <Input
                label={t('webhooks.url')}
                placeholder={t('webhooks.placeholderUrl')}
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <Input
                label={t('webhooks.eventTypes')}
                placeholder={t('webhooks.placeholderEvents')}
                value={newEvents}
                onChange={(e) => setNewEvents(e.target.value)}
              />
            </div>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="outline">{t('common:cancel')}</Button>
              </ModalClose>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? t('common:saving') : t('common:save')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      }
    >
      {webhooks.length === 0 ? (
        <EmptyState
          title={t('webhooks.empty')}
          description={t('webhooks.emptyDescription')}
          action={
            <Button onClick={() => setShowCreate(true)}>
              {t('webhooks.create')}
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('webhooks.url')}</TableHead>
              <TableHead>{t('webhooks.events')}</TableHead>
              <TableHead>{t('webhooks.statusLabel')}</TableHead>
              <TableHead>{t('webhooks.created')}</TableHead>
              <TableHead>{t('webhooks.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((wh) => (
              <TableRow key={wh.id}>
                <TableCell className="font-mono text-xs max-w-64 truncate">{wh.url}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {wh.eventTypes.map((ev) => (
                      <Badge key={ev} variant="secondary" className="text-xs">
                        {ev}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={wh.active ? 'success' : 'secondary'}>
                    {wh.active ? t('webhooks.statusActive') : t('webhooks.statusInactive')}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(wh.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleTest(wh.id)}>
                    {t('webhooks.test')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageContainer>
  );
}
