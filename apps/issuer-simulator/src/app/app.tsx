import { Theme, Flex, Tabs, Text, Box } from '@radix-ui/themes';
import { ISSUERS } from './lib/issuers';
import { IssuerPanel } from './components/issuer-panel';
import { FakeLoginPage } from './pages/fake-login';

function SimulatorHome() {
  return (
    <Box style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <Flex direction="column" gap="4">
        <Flex direction="column" gap="1">
          <Text size="6" weight="bold">
            Issuer Simulator
          </Text>
          <Text size="2" color="gray">
            Simule o envio de dados de clientes por emissores parceiros para a
            plataforma Ultima Forma.
          </Text>
        </Flex>

        <Tabs.Root defaultValue={ISSUERS[0].id}>
          <Tabs.List>
            {ISSUERS.map((issuer) => (
              <Tabs.Trigger key={issuer.id} value={issuer.id}>
                {issuer.partnerName}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {ISSUERS.map((issuer) => (
            <Tabs.Content key={issuer.id} value={issuer.id}>
              <Box pt="4">
                <IssuerPanel issuer={issuer} />
              </Box>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Flex>
    </Box>
  );
}

export function App() {
  const isLoginPage = window.location.pathname.startsWith('/auth/login');

  return (
    <Theme
      accentColor="blue"
      grayColor="slate"
      radius="medium"
      scaling="100%"
      appearance="dark"
    >
      {isLoginPage ? <FakeLoginPage /> : <SimulatorHome />}
    </Theme>
  );
}

export default App;
