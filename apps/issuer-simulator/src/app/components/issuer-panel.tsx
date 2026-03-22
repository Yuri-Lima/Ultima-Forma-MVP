import { useState } from 'react';
import {
  Flex,
  Card,
  TextField,
  Button,
  Text,
  Badge,
  Callout,
} from '@radix-ui/themes';
import type { IssuerConfig } from '../lib/issuers';
import { DynamicFields } from './dynamic-fields';
import { ingestData } from '../lib/api';

interface SubmissionLog {
  id: string;
  status: string;
  createdAt: string;
  cpf: string;
}

export function IssuerPanel({ issuer }: { issuer: IssuerConfig }) {
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [extraFields, setExtraFields] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<SubmissionLog[]>([]);

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async () => {
    if (!cpf || !phone) return;
    setSending(true);
    setError(null);

    try {
      const validExtra = extraFields.filter((f) => f.trim().length > 0);
      const result = await ingestData(issuer.id, {
        cpf,
        phone,
        extraFields: validExtra,
      });
      setLogs((prev) => [
        { id: result.id, status: result.status, createdAt: result.createdAt, cpf },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setSending(false);
    }
  };

  return (
    <Flex direction="column" gap="4" style={{ maxWidth: 560 }}>
      <Card>
        <Flex direction="column" gap="4" p="4">
          <Flex direction="column" gap="1">
            <Flex align="center" gap="2">
              <Badge variant="surface" color="blue" size="2">
                Partner ID
              </Badge>
              <Text size="1" className="font-mono" color="gray">
                {issuer.partnerId}
              </Text>
            </Flex>
            <Text size="4" weight="bold">
              {issuer.partnerName}
            </Text>
            <Text size="2" color="gray">
              Emissor: {issuer.name}
            </Text>
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="medium">
              CPF *
            </Text>
            <TextField.Root
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              size="2"
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="medium">
              Numero Celular *
            </Text>
            <TextField.Root
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              size="2"
            />
          </Flex>

          <DynamicFields fields={extraFields} onChange={setExtraFields} />

          {error && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <Button
            onClick={handleSubmit}
            disabled={sending || !cpf || !phone}
            size="3"
          >
            {sending ? 'Enviando...' : 'Enviar para Ultima Forma'}
          </Button>
        </Flex>
      </Card>

      {logs.length > 0 && (
        <Card>
          <Flex direction="column" gap="2" p="4">
            <Text size="2" weight="medium">
              Envios Realizados
            </Text>
            {logs.map((log) => (
              <Flex
                key={log.id}
                align="center"
                gap="3"
                className="animate-pulse-new"
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'var(--green-3)',
                }}
              >
                <Badge color="green" variant="soft" size="1">
                  {log.status}
                </Badge>
                <Text size="1" className="font-mono">
                  {log.cpf}
                </Text>
                <Text size="1" color="gray" style={{ marginLeft: 'auto' }}>
                  {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Card>
      )}
    </Flex>
  );
}
