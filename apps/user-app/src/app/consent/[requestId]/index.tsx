import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { API_BASE_URL } from '../../../config';

interface DataRequestResponse {
  request: {
    id: string;
    status: string;
    purpose: string;
    expiresAt: string;
  };
  consumerName: string;
  items: { id: string; claim: string }[];
  consentId: string;
}

export default function ConsentScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const [data, setData] = useState<DataRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    fetch(`${API_BASE_URL}/v1/data-requests/${requestId}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Solicitação não encontrada' : 'Erro ao carregar');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro'))
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleApprove = async () => {
    if (!data?.consentId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/v1/consents/${data.consentId}/approve`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Erro ao aprovar');
      router.replace(`/consent/${requestId}/approved`);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível aprovar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!data?.consentId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/v1/consents/${data.consentId}/reject`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Erro ao rejeitar');
      router.replace(`/consent/${requestId}/rejected`);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível rejeitar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando solicitação...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.center, Platform.OS === 'web' && styles.centerWeb]}>
        <Text style={styles.errorText}>{error ?? 'Solicitação não encontrada'}</Text>
        {Platform.OS === 'web' && (
          <Text style={styles.errorHint}>
            Se o api-gateway está rodando, reinicie-o para habilitar CORS.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.pageWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, styles.contentWithButtons]}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.title}>Solicitação de Dados</Text>
        <Text style={styles.consumer}>{data.consumerName}</Text>
        <Text style={styles.label}>solicita acesso aos seguintes dados:</Text>

        <View style={styles.purposeBox}>
          <Text style={styles.purposeLabel}>Finalidade</Text>
          <Text style={styles.purpose}>{data.request.purpose}</Text>
        </View>

        <Text style={styles.claimsLabel}>Dados solicitados:</Text>
        {data.items.map((item) => (
          <View key={item.id} style={styles.claimRow}>
            <Text style={styles.claim}>• {item.claim}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.buttonsWrapper}>
        <TouchableOpacity
          style={[styles.button, styles.approveButton]}
          onPress={handleApprove}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Aprovar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={handleReject}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Rejeitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  content: { padding: 24 },
  contentWithButtons: { paddingBottom: 24 },
  buttonsWrapper: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  centerWeb: {
    minHeight: Dimensions.get('window').height,
  },
  loadingText: { marginTop: 12, color: '#666' },
  errorText: { color: '#c00', textAlign: 'center' },
  errorHint: { marginTop: 16, fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  consumer: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  label: { fontSize: 16, color: '#666', marginBottom: 16 },
  purposeBox: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  purposeLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  purpose: { fontSize: 16 },
  claimsLabel: { fontSize: 16, fontWeight: '500', marginBottom: 12 },
  claimRow: { marginBottom: 8 },
  claim: { fontSize: 16, color: '#333' },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: { backgroundColor: '#22c55e' },
  rejectButton: { backgroundColor: '#ef4444' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
