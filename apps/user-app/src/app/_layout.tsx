import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Ultima Forma' }} />
      <Stack.Screen
        name="consent/[requestId]/index"
        options={{ title: 'Solicitação de Dados' }}
      />
      <Stack.Screen
        name="consent/[requestId]/approved"
        options={{ title: 'Aprovado', headerBackTitle: 'Voltar' }}
      />
      <Stack.Screen
        name="consent/[requestId]/rejected"
        options={{ title: 'Rejeitado', headerBackTitle: 'Voltar' }}
      />
    </Stack>
  );
}
