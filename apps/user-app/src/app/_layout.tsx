import '../i18n';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { NativeThemeProvider } from '@ultima-forma/shared-ui-native';

export default function RootLayout() {
  const { t } = useTranslation('user');
  return (
    <NativeThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Ultima Forma' }} />
        <Stack.Screen name="register" options={{ title: 'Cadastro' }} />
        <Stack.Screen
          name="wallet/index"
          options={{ title: 'Minha Wallet' }}
        />
        <Stack.Screen
          name="wallet/[issuerId]"
          options={{ title: 'Detalhes do Emissor' }}
        />
        <Stack.Screen
          name="auth/callback"
          options={{ title: 'Autorizacao', headerShown: false }}
        />
        <Stack.Screen
          name="consent/[requestId]/index"
          options={{ title: t('consent.dataRequest') }}
        />
        <Stack.Screen
          name="consent/[requestId]/approved"
          options={{
            title: t('consent.approved.title'),
            headerBackTitle: t('consent.back'),
          }}
        />
        <Stack.Screen
          name="consent/[requestId]/rejected"
          options={{
            title: t('consent.rejected.title'),
            headerBackTitle: t('consent.back'),
          }}
        />
      </Stack>
    </NativeThemeProvider>
  );
}
