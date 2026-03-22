import { useState, useEffect } from 'react';
import {
  Flex,
  Card,
  TextField,
  Button,
  Text,
  Badge,
  Callout,
} from '@radix-ui/themes';
import { ISSUERS } from '../lib/issuers';
import { pushDataToWallet, GATEWAY_URL } from '../lib/api';

export function FakeLoginPage() {
  const params = new URLSearchParams(window.location.search);
  const requestToken = params.get('requestToken') ?? '';
  const callbackUrl = params.get('callbackUrl') ?? '';
  const issuerId = params.get('issuerId') ?? '';
  const userId = params.get('userId') ?? '';

  const issuer = ISSUERS.find((i) => i.id === issuerId);
  const [username, setUsername] = useState('usuario@demo.com');
  const [password, setPassword] = useState('••••••••');
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState<{
    cpf: string;
    phone: string;
    extraFields: string[];
  } | null>(null);

  useEffect(() => {
    if (!issuerId || !userId) return;

    fetch(`${GATEWAY_URL}/v1/clients/${userId}/discover`)
      .then((res) => res.json())
      .then((data) => {
        const match = data.issuers?.find(
          (i: { issuerId: string }) => i.issuerId === issuerId
        );
        if (match) {
          setSubmissionData({
            cpf: '(valor do emissor)',
            phone: '(valor do emissor)',
            extraFields: match.fields.filter(
              (f: string) => f !== 'cpf' && f !== 'phone'
            ),
          });
        }
      })
      .catch(() => {});
  }, [issuerId, userId]);

  const handleAuthorize = async () => {
    setAuthorizing(true);
    setError(null);

    try {
      const fieldsToSend: { name: string; value: string }[] = [
        { name: 'cpf', value: '123.456.789-00' },
        { name: 'phone', value: '(11) 99999-0000' },
      ];

      if (submissionData?.extraFields) {
        for (const field of submissionData.extraFields) {
          fieldsToSend.push({
            name: field,
            value: `valor_${field}_demo`,
          });
        }
      }

      await pushDataToWallet(userId, requestToken, fieldsToSend);

      const separator = callbackUrl.includes('?') ? '&' : '?';
      window.location.href = `${callbackUrl}${separator}success=true&userId=${userId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autorizar');
      setAuthorizing(false);
    }
  };

  if (!issuer) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
        <Card style={{ maxWidth: 400, width: '100%' }}>
          <Flex direction="column" gap="3" p="5" align="center">
            <Text color="red" size="3">
              Emissor nao encontrado
            </Text>
          </Flex>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: '100vh', background: 'var(--gray-2)' }}
    >
      <Card style={{ maxWidth: 420, width: '100%' }}>
        <Flex direction="column" gap="4" p="5">
          <Flex direction="column" align="center" gap="2">
            <Badge variant="surface" color="blue" size="2">
              {issuer.partnerName}
            </Badge>
            <Text size="5" weight="bold" align="center">
              Login - {issuer.name}
            </Text>
            <Text size="2" color="gray" align="center">
              Ultima Forma solicita acesso aos seus dados
            </Text>
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="medium">
              Email
            </Text>
            <TextField.Root
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="2"
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="medium">
              Senha
            </Text>
            <TextField.Root
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              size="2"
            />
          </Flex>

          {submissionData && (
            <Card variant="surface">
              <Flex direction="column" gap="2" p="3">
                <Text size="2" weight="medium">
                  Dados que serao compartilhados:
                </Text>
                <Flex gap="2" wrap="wrap">
                  <Badge variant="soft" size="1">cpf</Badge>
                  <Badge variant="soft" size="1">phone</Badge>
                  {submissionData.extraFields.map((f) => (
                    <Badge key={f} variant="soft" size="1">
                      {f}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
            </Card>
          )}

          {error && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <Button
            onClick={handleAuthorize}
            disabled={authorizing}
            size="3"
            color="green"
          >
            {authorizing
              ? 'Autorizando...'
              : 'Autorizar e Compartilhar Dados'}
          </Button>

          <Button
            variant="ghost"
            color="gray"
            size="2"
            onClick={() => {
              const separator = callbackUrl.includes('?') ? '&' : '?';
              window.location.href = `${callbackUrl}${separator}success=false`;
            }}
          >
            Cancelar
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}
