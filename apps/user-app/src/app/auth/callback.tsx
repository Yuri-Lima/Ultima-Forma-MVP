import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  NativeCard,
  NativeCardHeader,
  NativeCardTitle,
  NativeCardContent,
} from '@ultima-forma/shared-ui-native';
import { nativeSpacing, nativeFontSize, nativeColors } from '@ultima-forma/shared-design-tokens';
import { useNativeTheme } from '@ultima-forma/shared-ui-native';
import { ScreenContainer } from '../components/ScreenContainer';

export default function AuthCallbackScreen() {
  const { colors } = useNativeTheme();
  const router = useRouter();
  const { success, userId } = useLocalSearchParams<{
    success: string;
    userId: string;
  }>();
  const [countdown, setCountdown] = useState(3);

  const isSuccess = success === 'true';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown !== 0) return;
    if (userId) {
      router.replace({ pathname: '/wallet', params: { userId } });
    } else {
      router.replace('/');
    }
  }, [countdown, userId, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenContainer>
        <NativeCard>
          <NativeCardHeader>
            <Text style={styles.icon}>{isSuccess ? '✅' : '❌'}</Text>
            <NativeCardTitle>
              {isSuccess
                ? 'Dados recebidos com sucesso!'
                : 'Autorizacao cancelada'}
            </NativeCardTitle>
          </NativeCardHeader>
          <NativeCardContent>
            <Text style={styles.message}>
              {isSuccess
                ? 'Os dados do emissor foram transferidos para sua wallet.'
                : 'Nenhum dado foi transferido.'}
            </Text>
            <Text style={styles.redirect}>
              Redirecionando em {countdown}s...
            </Text>
          </NativeCardContent>
        </NativeCard>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: nativeSpacing[2],
  },
  message: {
    fontSize: nativeFontSize.base,
    color: nativeColors.neutral[500],
    textAlign: 'center',
    marginTop: nativeSpacing[2],
  },
  redirect: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[400],
    textAlign: 'center',
    marginTop: nativeSpacing[4],
  },
});
