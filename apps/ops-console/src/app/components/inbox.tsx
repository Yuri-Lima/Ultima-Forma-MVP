import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Flex,
  Card,
  Badge,
  Text,
  Button,
} from '@radix-ui/themes';
import {
  PageContainer,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@ultima-forma/shared-ui';

interface SubmissionItem {
  id: string;
  issuerId: string;
  issuerName: string;
  partnerName: string;
  cpf: string;
  phone: string;
  extraFields: string[];
  status: string;
  createdAt: string;
}

interface InboxProps {
  apiBase: string;
  apiKey?: string;
}

export function Inbox({ apiBase, apiKey }: InboxProps) {
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const fetchData = useCallback(() => {
    const headers: Record<string, string> = {};
    if (apiKey) headers['X-API-Key'] = apiKey;

    fetch(`${apiBase}/internal/profile-submissions?limit=50`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: { items: SubmissionItem[] }) => {
        const incoming = data.items ?? [];

        if (!isFirstLoadRef.current) {
          const freshIds = new Set<string>();
          for (const item of incoming) {
            if (!seenIdsRef.current.has(item.id)) {
              freshIds.add(item.id);
            }
          }
          if (freshIds.size > 0) {
            setNewIds((prev) => new Set([...prev, ...freshIds]));
            setTimeout(() => {
              setNewIds((prev) => {
                const next = new Set(prev);
                freshIds.forEach((id) => next.delete(id));
                return next;
              });
            }, 5000);
          }
        }

        isFirstLoadRef.current = false;
        for (const item of incoming) {
          seenIdsRef.current.add(item.id);
        }

        setItems(incoming);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      })
      .finally(() => setLoading(false));
  }, [apiBase, apiKey]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const maskCpf = (cpf: string) => {
    if (cpf.length >= 11) {
      return `***.***.${cpf.slice(-6, -3)}-${cpf.slice(-2)}`;
    }
    return cpf;
  };

  if (loading && items.length === 0) {
    return (
      <PageContainer title="Inbox - Dados Recebidos">
        <LoadingState message="Carregando..." />
      </PageContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <PageContainer title="Inbox - Dados Recebidos">
        <ErrorState message={error} onRetry={fetchData} retryLabel="Tentar novamente" />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Inbox - Dados Recebidos">
      <Flex align="center" gap="3" mb="4">
        <Text size="2" color="gray">
          {items.length} submissao(oes) recebida(s)
        </Text>
        <Badge variant="soft" color="green" size="1">
          Polling a cada 3s
        </Badge>
      </Flex>

      {items.length === 0 ? (
        <EmptyState title="Nenhum dado recebido ainda" />
      ) : (
        <div className="relative ml-4 border-l-2 border-[var(--gray-6)] pl-6">
          {items.map((item) => {
            const isNew = newIds.has(item.id);
            return (
              <div key={item.id} className="relative mb-4 last:mb-0">
                <div
                  className="absolute -left-[31px] top-3 h-3 w-3 rounded-full border-2 border-[var(--accent-8)] bg-[var(--color-background)]"
                  aria-hidden
                  style={isNew ? { borderColor: 'var(--green-9)', background: 'var(--green-9)' } : undefined}
                />
                <Card
                  style={
                    isNew
                      ? {
                          borderLeft: '3px solid var(--green-9)',
                          animation: 'pulse-new 1.5s ease-in-out 3',
                        }
                      : undefined
                  }
                >
                  <Flex direction="column" gap="3" p="4">
                    <Flex wrap="wrap" align="center" gap="3">
                      {isNew && (
                        <Badge color="green" variant="solid" size="1">
                          NOVO
                        </Badge>
                      )}
                      <Badge color="blue" variant="soft" size="1">
                        {item.partnerName}
                      </Badge>
                      <Text size="2" weight="medium">
                        {item.issuerName}
                      </Text>
                      <Text size="1" color="gray" style={{ marginLeft: 'auto' }}>
                        {new Date(item.createdAt).toLocaleString('pt-BR')}
                      </Text>
                    </Flex>

                    <Flex gap="4" wrap="wrap">
                      <Flex direction="column" gap="1">
                        <Text size="1" color="gray">CPF</Text>
                        <Text size="2" className="font-mono">{maskCpf(item.cpf)}</Text>
                      </Flex>
                      <Flex direction="column" gap="1">
                        <Text size="1" color="gray">Celular</Text>
                        <Text size="2" className="font-mono">{item.phone}</Text>
                      </Flex>
                    </Flex>

                    {item.extraFields.length > 0 && (
                      <Flex gap="2" wrap="wrap">
                        <Text size="1" color="gray">Campos extras:</Text>
                        {item.extraFields.map((f) => (
                          <Badge key={f} variant="outline" size="1">
                            {f}
                          </Badge>
                        ))}
                      </Flex>
                    )}

                    <Badge variant="soft" color="green" size="1" style={{ alignSelf: 'flex-start' }}>
                      {item.status}
                    </Badge>
                  </Flex>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
