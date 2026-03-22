import { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  NativeCard,
  NativeCardHeader,
  NativeCardTitle,
  NativeCardContent,
  NativeButton,
  NativeInput,
} from '@ultima-forma/shared-ui-native';
import { nativeSpacing, nativeFontSize, nativeColors } from '@ultima-forma/shared-design-tokens';
import { useNativeTheme } from '@ultima-forma/shared-ui-native';
import { ScreenContainer } from './components/ScreenContainer';
import { API_BASE_URL } from '../config';

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function RegisterScreen() {
  const { colors } = useNativeTheme();
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!cpf || !phone) {
      setError('CPF e celular sao obrigatorios');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/v1/clients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, phone }),
      });

      if (!res.ok) throw new Error(`Erro: ${res.status}`);
      const data = await res.json();

      router.replace({ pathname: '/wallet', params: { userId: data.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenContainer>
        <NativeCard>
          <NativeCardHeader>
            <NativeCardTitle>Cadastro</NativeCardTitle>
            <Text style={styles.subtitle}>
              Informe seus dados para acessar sua wallet
            </Text>
          </NativeCardHeader>
          <NativeCardContent>
            <View style={styles.form}>
              <NativeInput
                label="CPF"
                value={cpf}
                onChangeText={(v) => setCpf(formatCpf(v))}
                placeholder="000.000.000-00"
                keyboardType="numeric"
              />
              <NativeInput
                label="Numero Celular"
                value={phone}
                onChangeText={(v) => setPhone(formatPhone(v))}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
              />
              {error && <Text style={styles.error}>{error}</Text>}
              <NativeButton
                onPress={handleRegister}
                loading={loading}
              >
                Cadastrar
              </NativeButton>
            </View>
          </NativeCardContent>
        </NativeCard>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  subtitle: {
    fontSize: nativeFontSize.base,
    color: nativeColors.neutral[500],
    textAlign: 'center',
    marginTop: nativeSpacing[2],
  },
  form: {
    gap: nativeSpacing[4],
    marginTop: nativeSpacing[4],
  },
  error: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.danger[500],
    textAlign: 'center',
  },
});
