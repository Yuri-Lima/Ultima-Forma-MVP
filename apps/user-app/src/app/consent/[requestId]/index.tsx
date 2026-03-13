import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('user');
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
        if (!res.ok) throw new Error(res.status === 404 ? t('consent.errorNotFound') : t('consent.errorLoad'));
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : t('common:errors.generic')))
      .finally(() => setLoading(false));
  }, [requestId, t]);

  const handleApprove = async () => {
    if (!data?.consentId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/v1/consents/${data.consentId}/approve`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error(t('consent.approveError'));
      router.replace(`/consent/${requestId}/approved`);
    } catch (err) {
      Alert.alert(t('common:errors.generic'), err instanceof Error ? err.message : t('consent.approveFailed'));
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
      if (!res.ok) throw new Error(t('consent.rejectError'));
      router.replace(`/consent/${requestId}/rejected`);
    } catch (err) {
      Alert.alert(t('common:errors.generic'), err instanceof Error ? err.message : t('consent.rejectFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>{t('consent.loading')}</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.center, Platform.OS === 'web' && styles.centerWeb]}>
        <Text style={styles.errorText}>{error ?? t('consent.errorNotFound')}</Text>
        {Platform.OS === 'web' && (
          <Text style={styles.errorHint}>{t('consent.corsHint')}</Text>
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
        <Text style={styles.title}>{t('consent.dataRequest')}</Text>
        <Text style={styles.consumer}>{data.consumerName}</Text>
        <Text style={styles.label}>{t('consent.requestsAccess')}</Text>

        <View style={styles.purposeBox}>
          <Text style={styles.purposeLabel}>{t('consent.purpose')}</Text>
          <Text style={styles.purpose}>{data.request.purpose}</Text>
        </View>

        <Text style={styles.claimsLabel}>{t('consent.claimsLabel')}</Text>
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
          <Text style={styles.buttonText}>{t('consent.approve')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={handleReject}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{t('consent.reject')}</Text>
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
