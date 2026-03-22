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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@ultima-forma/shared-ui';
import { signedFetch, withPartnerId } from '../lib/api';

interface DataRequest {
  id: string;
  status: string;
  consumerName: string;
  purpose: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected', 'expired'];

const statusVariant: Record<string, 'default' | 'success' | 'danger' | 'warning' | 'secondary'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  expired: 'secondary',
};

const STATUS_LABELS: Record<string, string> = {
  all: 'common:all',
  pending: 'requests.statusPending',
  approved: 'requests.statusApproved',
  rejected: 'requests.statusRejected',
  expired: 'requests.statusExpired',
};

export function RequestsPage() {
  const { t } = useTranslation('partner');
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const limit = 20;

  const fetchRequests = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
    if (statusFilter !== 'all') params.set('status', statusFilter);

    signedFetch(withPartnerId(`/v1/partner/requests?${params}`))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setRequests(data.items ?? data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, page]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchRequests} />;

  return (
    <PageContainer
      title={t('requests.title')}
      description={t('requests.description')}
    >
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('requests.filterStatus')} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {t(STATUS_LABELS[s])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title={t('requests.empty')}
          description={t('requests.emptyDescription')}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('requests.id')}</TableHead>
                <TableHead>{t('requests.status')}</TableHead>
                <TableHead>{t('requests.consumer')}</TableHead>
                <TableHead>{t('requests.purpose')}</TableHead>
                <TableHead>{t('requests.createdAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs">{req.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[req.status] ?? 'default'}>
                      {STATUS_LABELS[req.status] ? t(STATUS_LABELS[req.status]) : req.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{req.consumerName}</TableCell>
                  <TableCell className="max-w-48 truncate">{req.purpose}</TableCell>
                  <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              {t('common:previous')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t('common:page')} {page + 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={requests.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('common:next')}
            </Button>
          </div>
        </>
      )}
    </PageContainer>
  );
}
