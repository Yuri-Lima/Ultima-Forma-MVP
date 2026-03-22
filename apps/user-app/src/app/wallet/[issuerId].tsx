import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  NativeCard,
  NativeCardHeader,
  NativeCardTitle,
  NativeCardContent,
  NativeBadge,
  NativeButton,
  NativeLoadingState,
  NativeErrorState,
} from '@ultima-forma/shared-ui-native';
import { nativeSpacing, nativeFontSize, nativeColors, nativeRadius } from '@ultima-forma/shared-design-tokens';
import { useNativeTheme } from '@ultima-forma/shared-ui-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { API_BASE_URL } from '../../config';

interface WalletEntryData {
  id: string;
  fieldName: string;
  fieldValue: string | null;
  receivedAt: string | null;
}

interface IssuerInfo {
  issuerId: string;
  issuerName: string;
  partnerName: string;
  fields: string[];
  lastUpdated: string;
}

export default function IssuerDetailScreen() {
  const { colors } = useNativeTheme();
  const { issuerId, userId } = useLocalSearchParams<{
    issuerId: string;
    userId: string;
  }>();
  const [issuerInfo, setIssuerInfo] = useState<IssuerInfo | null>(null);
  const [walletEntries, setWalletEntries] = useState<WalletEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    if (!userId || !issuerId) return;
    setLoading(true);

    Promise.all([
      fetch(`${API_BASE_URL}/v1/clients/${userId}/discover`).then((r) =>
        r.json()
      ),
      fetch(
        `${API_BASE_URL}/v1/clients/${userId}/wallet?issuerId=${issuerId}`
      ).then((r) => r.json()),
    ])
      .then(([discoverData, walletData]) => {
        const info = discoverData.issuers?.find(
          (i: IssuerInfo) => i.issuerId === issuerId
        );
        setIssuerInfo(info ?? null);
        setWalletEntries(walletData.entries ?? []);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [userId, issuerId]);

  const handleRequestData = async () => {
    if (!userId || !issuerId) return;
    setRequesting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/v1/clients/${userId}/request-data/${issuerId}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error(`Erro: ${res.status}`);
      const data = await res.json();

      if (Platform.OS === 'web') {
        window.location.href = data.redirectUrl;
      } else {
        await Linking.openURL(data.redirectUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar');
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenContainer centered>
          <NativeLoadingState message="Carregando dados..." />
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

  const walletMap = new Map(
    walletEntries.map((e) => [e.fieldName, e])
  );
  const allFields = issuerInfo?.fields ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenContainer centered={false}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {issuerInfo && (
            <View style={styles.header}>
              <Text style={[styles.partnerName, { color: colors.foreground }]}>
                {issuerInfo.partnerName}
              </Text>
              <Text style={styles.issuerName}>{issuerInfo.issuerName}</Text>
            </View>
          )}

          <NativeCard>
            <NativeCardHeader>
              <NativeCardTitle>Campos Disponiveis</NativeCardTitle>
            </NativeCardHeader>
            <NativeCardContent>
              <View style={styles.fieldList}>
                {allFields.map((fieldName) => {
                  const entry = walletMap.get(fieldName);
                  const hasValue = entry?.fieldValue != null;

                  return (
                    <View key={fieldName} style={styles.fieldItem}>
                      <View style={styles.fieldLeft}>
                        <Text
                          style={[
                            styles.fieldIcon,
                            { color: hasValue ? nativeColors.success[500] : nativeColors.neutral[400] },
                          ]}
                        >
                          {hasValue ? '✓' : '🔒'}
                        </Text>
                        <View>
                          <Text
                            style={[
                              styles.fieldName,
                              { color: hasValue ? colors.foreground : nativeColors.neutral[400] },
                            ]}
                          >
                            {fieldName}
                          </Text>
                          {hasValue && (
                            <Text style={styles.fieldValue}>
                              {entry.fieldValue}
                            </Text>
                          )}
                        </View>
                      </View>
                      {hasValue && entry.receivedAt && (
                        <Text style={styles.receivedAt}>
                          {new Date(entry.receivedAt).toLocaleDateString('pt-BR')}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </NativeCardContent>
          </NativeCard>

          <View style={styles.actionArea}>
            <NativeButton
              onPress={handleRequestData}
              loading={requesting}
            >
              Solicitar Dados
            </NativeButton>
          </View>
        </ScrollView>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingVertical: nativeSpacing[4], gap: nativeSpacing[4] },
  header: { marginBottom: nativeSpacing[2] },
  partnerName: {
    fontSize: nativeFontSize['2xl'],
    fontWeight: '700',
  },
  issuerName: {
    fontSize: nativeFontSize.base,
    color: nativeColors.neutral[500],
    marginTop: nativeSpacing[1],
  },
  fieldList: { gap: nativeSpacing[3] },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: nativeSpacing[2],
    borderBottomWidth: 1,
    borderBottomColor: nativeColors.neutral[200],
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: nativeSpacing[3],
  },
  fieldIcon: { fontSize: nativeFontSize.lg },
  fieldName: {
    fontSize: nativeFontSize.base,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[600],
    marginTop: 2,
  },
  receivedAt: {
    fontSize: nativeFontSize.xs,
    color: nativeColors.neutral[400],
  },
  actionArea: {
    marginTop: nativeSpacing[4],
  },
});
