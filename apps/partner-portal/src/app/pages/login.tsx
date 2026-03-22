import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import {
  Flex,
  Container,
  Card,
  TextField,
  Button,
  Text,
  Callout,
} from '@radix-ui/themes';
import { useAuth } from '../lib/auth-context';

export function LoginPage() {
  const { t } = useTranslation('partner');
  const { login, isAuthenticated } = useAuth();
  const [partnerId, setPartnerId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId.trim() || !clientSecret.trim()) {
      setError(t('login.validationError'));
      return;
    }
    setError('');
    login(partnerId.trim(), clientSecret.trim());
  };

  return (
    <Flex
      justify="center"
      align="center"
      style={{ minHeight: '100vh' }}
      className="bg-background p-4"
    >
      <Container size="2">
        <Card size="3">
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4" p="6">
              <Flex direction="column" gap="1">
                <Text size="6" weight="bold">
                  {t('login.title')}
                </Text>
                <Text size="2" color="gray">
                  {t('login.description')}
                </Text>
              </Flex>

              <Flex direction="column" gap="3">
                <Flex direction="column" gap="2">
                  <Text as="label" size="2" weight="medium">
                    {t('login.partnerId')}
                  </Text>
                  <TextField.Root
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    placeholder={t('login.partnerIdPlaceholder')}
                    size="3"
                    variant="surface"
                  />
                </Flex>
                <Flex direction="column" gap="2">
                  <Text as="label" size="2" weight="medium">
                    {t('login.clientSecret')}
                  </Text>
                  <TextField.Root
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder={t('login.clientSecretPlaceholder')}
                    size="3"
                    variant="surface"
                  />
                </Flex>
              </Flex>

              {error && (
                <Callout.Root color="red" variant="soft" size="1">
                  {error}
                </Callout.Root>
              )}

              <Button type="submit" size="3" className="w-full" mt="2">
                {t('login.submit')}
              </Button>
            </Flex>
          </form>
        </Card>
      </Container>
    </Flex>
  );
}
