import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  NativeCard,
  NativeCardHeader,
  NativeCardTitle,
  NativeCardContent,
  NativeBadge,
  NativeLoadingState,
  NativeErrorState,
} from '@ultima-forma/shared-ui-native';
import { nativeSpacing, nativeFontSize, nativeColors } from '@ultima-forma/shared-design-tokens';
import { useNativeTheme } from '@ultima-forma/shared-ui-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { API_BASE_URL } from '../../config';

interface IssuerInfo {
  issuerId: string;
  issuerName: string;
  partnerName: string;
  fields: string[];
  lastUpdated: string;
}

export default function WalletScreen() {
  const { colors } = useNativeTheme();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const [issuers, setIssuers] = useState<IssuerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/v1/clients/${userId}/discover`)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setIssuers(data.issuers ?? []);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenContainer centered>
          <NativeLoadingState message="Buscando seus dados..." />
        </ScreenContainer>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenContainer centered>
          <NativeErrorState title="Erro" message={error} />
        </ScreenContainer>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenContainer centered={false}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Minha Wallet
          </Text>

          {issuers.length === 0 ? (
            <NativeCard>
              <NativeCardContent>
                <Text style={styles.emptyText}>
                  Nenhuma instituicao encontrada com seus dados.
                </Text>
              </NativeCardContent>
            </NativeCard>
          ) : (
            <>
              <Text style={styles.found}>
                Encontramos seus dados em {issuers.length} instituicao(oes)
              </Text>

              {issuers.map((issuer) => (
                <TouchableOpacity
                  key={issuer.issuerId}
                  onPress={() =>
                    router.push({
                      pathname: '/wallet/[issuerId]',
                      params: { issuerId: issuer.issuerId, userId: userId ?? '' },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <NativeCard>
                    <NativeCardHeader>
                      <NativeCardTitle>{issuer.partnerName}</NativeCardTitle>
                      <Text style={styles.issuerName}>{issuer.issuerName}</Text>
                    </NativeCardHeader>
                    <NativeCardContent>
                      <View style={styles.fieldRow}>
                        <NativeBadge variant="secondary">
                          {issuer.fields.length} campos
                        </NativeBadge>
                        <Text style={styles.date}>
                          Atualizado: {new Date(issuer.lastUpdated).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                    </NativeCardContent>
                  </NativeCard>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingVertical: nativeSpacing[4], gap: nativeSpacing[3] },
  title: {
    fontSize: nativeFontSize['2xl'],
    fontWeight: '700',
    marginBottom: nativeSpacing[2],
  },
  found: {
    fontSize: nativeFontSize.base,
    color: nativeColors.success[600],
    fontWeight: '600',
  },
  emptyText: {
    fontSize: nativeFontSize.base,
    color: nativeColors.neutral[500],
    textAlign: 'center',
    paddingVertical: nativeSpacing[4],
  },
  issuerName: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[500],
    marginTop: nativeSpacing[1],
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: nativeSpacing[2],
  },
  date: {
    fontSize: nativeFontSize.xs,
    color: nativeColors.neutral[400],
  },
});
