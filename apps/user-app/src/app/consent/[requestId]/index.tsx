import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  Linking,
} from 'react-native';
import { API_BASE_URL, PRIVACY_POLICY_URL } from '../../../config';
import {
  NativeButton,
  NativeBadge,
  NativeCard,
  NativeCardHeader,
  NativeCardTitle,
  NativeCardContent,
  NativeLoadingState,
  NativeErrorState,
} from '@ultima-forma/shared-ui-native';
import {
  nativeColors,
  nativeSpacing,
  nativeFontSize,
  nativeRadius,
} from '@ultima-forma/shared-design-tokens';

const TOTAL_STEPS = 5;

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

type Decision = 'approved' | 'rejected' | null;

const CLAIM_SENSITIVITY: Record<string, 'danger' | 'warning' | 'secondary'> = {
  email: 'warning',
  phone: 'warning',
  address: 'danger',
  ssn: 'danger',
  birthdate: 'warning',
  name: 'secondary',
  nationality: 'secondary',
};

function getSensitivity(claim: string): 'danger' | 'warning' | 'secondary' {
  const lower = claim.toLowerCase();
  for (const [keyword, level] of Object.entries(CLAIM_SENSITIVITY)) {
    if (lower.includes(keyword)) return level;
  }
  return 'secondary';
}

function getSensitivityLabel(
  variant: 'danger' | 'warning' | 'secondary',
  t: (key: string) => string
): string {
  switch (variant) {
    case 'danger':
      return t('consent.wizard.sensitivityHigh');
    case 'warning':
      return t('consent.wizard.sensitivityMedium');
    default:
      return t('consent.wizard.sensitivityLow');
  }
}

function formatExpirationDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ─── Step Progress Dots ──────────────────────────────────────────────── */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < current && styles.dotCompleted,
            i === current && styles.dotActive,
            i > current && styles.dotPending,
          ]}
        />
      ))}
    </View>
  );
}

/* ─── Step 1: Requester Identification ────────────────────────────────── */

function StepRequester({
  data,
  t,
}: {
  data: DataRequestResponse;
  t: (key: string) => string;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{t('consent.wizard.step1Title')}</Text>
      <Text style={styles.stepDescription}>{t('consent.wizard.step1Subtitle')}</Text>

      <NativeCard>
        <NativeCardHeader>
          <NativeCardTitle>{data.consumerName}</NativeCardTitle>
        </NativeCardHeader>
        <NativeCardContent>
          <View style={styles.trustRow}>
            <Text style={styles.trustLabel}>{t('consent.wizard.trustLevel')}</Text>
            <NativeBadge variant="success">
              {t('consent.wizard.trustVerified')}
            </NativeBadge>
          </View>
          <View style={styles.trustRow}>
            <Text style={styles.trustLabel}>{t('consent.wizard.issuer')}</Text>
            <Text style={styles.trustValue}>
              {t('consent.wizard.issuerPlaceholder')}
            </Text>
          </View>
          <View style={styles.trustRow}>
            <Text style={styles.trustLabel}>{t('consent.wizard.requestStatus')}</Text>
            <NativeBadge variant="default">{data.request.status}</NativeBadge>
          </View>
        </NativeCardContent>
      </NativeCard>
    </View>
  );
}

/* ─── Step 2: Purpose & Claims ────────────────────────────────────────── */

function StepClaims({
  data,
  t,
}: {
  data: DataRequestResponse;
  t: (key: string) => string;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{t('consent.wizard.step2Title')}</Text>
      <Text style={styles.stepDescription}>{t('consent.wizard.step2Subtitle')}</Text>

      <NativeCard>
        <NativeCardHeader>
          <NativeCardTitle>{t('consent.purpose')}</NativeCardTitle>
        </NativeCardHeader>
        <NativeCardContent>
          <Text style={styles.purposeText}>{data.request.purpose}</Text>
        </NativeCardContent>
      </NativeCard>

      <Text style={styles.sectionLabel}>{t('consent.claimsLabel')}</Text>

      {data.items.map((item) => {
        const sensitivity = getSensitivity(item.claim);
        return (
          <NativeCard key={item.id}>
            <NativeCardContent>
              <View style={styles.claimRow}>
                <Text style={styles.claimText}>{item.claim}</Text>
                <NativeBadge variant={sensitivity}>
                  {getSensitivityLabel(sensitivity, t)}
                </NativeBadge>
              </View>
            </NativeCardContent>
          </NativeCard>
        );
      })}
    </View>
  );
}

/* ─── Step 3: Privacy & Terms ─────────────────────────────────────────── */

function StepPrivacy({
  data,
  t,
}: {
  data: DataRequestResponse;
  t: (key: string) => string;
}) {
  const handleOpenPrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL);
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{t('consent.wizard.step3Title')}</Text>
      <Text style={styles.stepDescription}>{t('consent.wizard.step3Subtitle')}</Text>

      <NativeCard>
        <NativeCardHeader>
          <NativeCardTitle>{t('consent.wizard.expiration')}</NativeCardTitle>
        </NativeCardHeader>
        <NativeCardContent>
          <View style={styles.privacyRow}>
            <Text style={styles.privacyIcon}>📅</Text>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>
                {t('consent.wizard.expiration')}
              </Text>
              <Text style={styles.privacyValue}>
                {t('consent.wizard.expiresOn', {
                  date: formatExpirationDate(data.request.expiresAt),
                })}
              </Text>
            </View>
          </View>
        </NativeCardContent>
      </NativeCard>

      <NativeCard>
        <NativeCardHeader>
          <NativeCardTitle>{t('consent.wizard.dataUsage')}</NativeCardTitle>
        </NativeCardHeader>
        <NativeCardContent>
          <Text style={styles.privacyExplanation}>
            {t('consent.wizard.dataUsageExplanation')}
          </Text>
        </NativeCardContent>
      </NativeCard>

      <TouchableOpacity
        style={styles.privacyLink}
        onPress={handleOpenPrivacyPolicy}
        activeOpacity={0.7}
      >
        <Text style={styles.privacyLinkText}>
          {t('consent.wizard.privacyPolicy')}
        </Text>
        <Text style={styles.privacyLinkArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─── Step 4: Decision ────────────────────────────────────────────────── */

function StepDecision({
  data,
  submitting,
  onApprove,
  onReject,
  t,
}: {
  data: DataRequestResponse;
  submitting: boolean;
  onApprove: () => void;
  onReject: () => void;
  t: (key: string) => string;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{t('consent.wizard.step4Title')}</Text>
      <Text style={styles.stepDescription}>{t('consent.wizard.step4Subtitle')}</Text>

      <NativeCard>
        <NativeCardHeader>
          <NativeCardTitle>{t('consent.wizard.summary')}</NativeCardTitle>
        </NativeCardHeader>
        <NativeCardContent>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t('consent.wizard.requester')}
            </Text>
            <Text style={styles.summaryValue}>{data.consumerName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('consent.purpose')}</Text>
            <Text style={styles.summaryValue}>{data.request.purpose}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t('consent.wizard.claims')}
            </Text>
            <Text style={styles.summaryValue}>
              {t('consent.wizard.claimsCount', { count: data.items.length })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t('consent.wizard.expiration')}
            </Text>
            <Text style={styles.summaryValue}>
              {formatExpirationDate(data.request.expiresAt)}
            </Text>
          </View>
        </NativeCardContent>
      </NativeCard>

      <View style={styles.decisionButtons}>
        <NativeButton
          variant="default"
          size="lg"
          onPress={onApprove}
          loading={submitting}
          disabled={submitting}
          style={styles.approveBtn}
        >
          {t('consent.approve')}
        </NativeButton>
        <NativeButton
          variant="destructive"
          size="lg"
          onPress={onReject}
          loading={submitting}
          disabled={submitting}
          style={styles.rejectBtn}
        >
          {t('consent.reject')}
        </NativeButton>
      </View>
    </View>
  );
}

/* ─── Step 5: Confirmation ────────────────────────────────────────────── */

function StepConfirmation({
  decision,
  t,
}: {
  decision: Decision;
  t: (key: string) => string;
}) {
  const isApproved = decision === 'approved';

  return (
    <View style={styles.confirmationContainer}>
      <Text style={[styles.confirmationIcon, isApproved ? styles.iconApproved : styles.iconRejected]}>
        {isApproved ? '✓' : '✕'}
      </Text>
      <Text style={styles.confirmationTitle}>
        {isApproved
          ? t('consent.approved.titleFull')
          : t('consent.rejected.titleFull')}
      </Text>
      <Text style={styles.confirmationSubtitle}>
        {isApproved
          ? t('consent.approved.subtitleSuccess')
          : t('consent.rejected.subtitleSuccess')}
      </Text>
    </View>
  );
}

/* ─── Main Screen ─────────────────────────────────────────────────────── */

export default function ConsentScreen() {
  const { t } = useTranslation('user');
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const [data, setData] = useState<DataRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [decision, setDecision] = useState<Decision>(null);

  useEffect(() => {
    if (!requestId) return;
    fetch(`${API_BASE_URL}/v1/data-requests/${requestId}`)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            res.status === 404
              ? t('consent.errorNotFound')
              : t('consent.errorLoad')
          );
        return res.json();
      })
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : t('common:errors.generic'))
      )
      .finally(() => setLoading(false));
  }, [requestId, t]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/v1/data-requests/${requestId}`)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            res.status === 404
              ? t('consent.errorNotFound')
              : t('consent.errorLoad')
          );
        return res.json();
      })
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : t('common:errors.generic'))
      )
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
      setDecision('approved');
      setStep(4);
    } catch (err) {
      Alert.alert(
        t('common:errors.generic'),
        err instanceof Error ? err.message : t('consent.approveFailed')
      );
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
      setDecision('rejected');
      setStep(4);
    } catch (err) {
      Alert.alert(
        t('common:errors.generic'),
        err instanceof Error ? err.message : t('consent.rejectFailed')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const isLastInteractiveStep = step === 3;
  const isConfirmation = step === 4;

  if (loading) {
    return (
      <View style={[styles.fullScreen, Platform.OS === 'web' && styles.fullScreenWeb]}>
        <NativeLoadingState message={t('consent.loading')} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.fullScreen, Platform.OS === 'web' && styles.fullScreenWeb]}>
        <NativeErrorState
          message={error ?? t('consent.errorNotFound')}
          onRetry={handleRetry}
          retryLabel={t('consent.wizard.retry')}
        />
        {Platform.OS === 'web' && (
          <Text style={styles.corsHint}>{t('consent.corsHint')}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.pageWrapper}>
      <View style={styles.header}>
        <StepIndicator current={step} total={TOTAL_STEPS} />
        <Text style={styles.stepCount}>
          {t('consent.wizard.stepOf', {
            current: step + 1,
            total: TOTAL_STEPS,
          })}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        {step === 0 && <StepRequester data={data} t={t} />}
        {step === 1 && <StepClaims data={data} t={t} />}
        {step === 2 && <StepPrivacy data={data} t={t} />}
        {step === 3 && (
          <StepDecision
            data={data}
            submitting={submitting}
            onApprove={handleApprove}
            onReject={handleReject}
            t={t}
          />
        )}
        {step === 4 && <StepConfirmation decision={decision} t={t} />}
      </ScrollView>

      {!isConfirmation && !isLastInteractiveStep && (
        <View style={styles.navigation}>
          <NativeButton
            variant="outline"
            size="md"
            onPress={goBack}
            disabled={step === 0}
            style={styles.navButton}
          >
            {t('consent.wizard.back')}
          </NativeButton>
          <NativeButton
            variant="default"
            size="md"
            onPress={goNext}
            style={styles.navButton}
          >
            {t('consent.wizard.next')}
          </NativeButton>
        </View>
      )}

      {isLastInteractiveStep && (
        <View style={styles.navigation}>
          <NativeButton
            variant="outline"
            size="md"
            onPress={goBack}
            style={styles.navButton}
          >
            {t('consent.wizard.back')}
          </NativeButton>
        </View>
      )}
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  fullScreenWeb: {
    minHeight: Dimensions.get('window').height,
  },
  pageWrapper: {
    flex: 1,
    backgroundColor: nativeColors.neutral[50],
  },

  /* Header / Progress */
  header: {
    paddingTop: nativeSpacing[6],
    paddingHorizontal: nativeSpacing[6],
    paddingBottom: nativeSpacing[3],
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: nativeColors.neutral[200],
    alignItems: 'center',
    gap: nativeSpacing[2],
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: nativeSpacing[2],
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: nativeRadius.full,
  },
  dotActive: {
    backgroundColor: nativeColors.primary[600],
    width: 24,
    borderRadius: nativeRadius.full,
  },
  dotCompleted: {
    backgroundColor: nativeColors.success[500],
  },
  dotPending: {
    backgroundColor: nativeColors.neutral[300],
  },
  stepCount: {
    fontSize: nativeFontSize.xs,
    color: nativeColors.neutral[500],
  },

  /* Scroll area */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: nativeSpacing[6],
    paddingBottom: nativeSpacing[10],
  },

  /* Step content shared */
  stepContent: {
    gap: nativeSpacing[4],
  },
  stepTitle: {
    fontSize: nativeFontSize['2xl'],
    fontWeight: '700',
    color: nativeColors.neutral[900],
  },
  stepDescription: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[500],
    marginBottom: nativeSpacing[2],
  },

  /* Step 1: Requester */
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: nativeSpacing[2],
    borderBottomWidth: 1,
    borderBottomColor: nativeColors.neutral[100],
  },
  trustLabel: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[500],
  },
  trustValue: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[700],
  },

  /* Step 2: Claims */
  purposeText: {
    fontSize: nativeFontSize.base,
    color: nativeColors.neutral[700],
    lineHeight: 24,
  },
  sectionLabel: {
    fontSize: nativeFontSize.base,
    fontWeight: '600',
    color: nativeColors.neutral[800],
    marginTop: nativeSpacing[2],
  },
  claimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: nativeSpacing[3],
  },
  claimText: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[700],
    flex: 1,
  },

  /* Step 3: Privacy */
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: nativeSpacing[3],
  },
  privacyIcon: {
    fontSize: nativeFontSize['2xl'],
  },
  privacyInfo: {
    flex: 1,
    gap: nativeSpacing[0.5],
  },
  privacyLabel: {
    fontSize: nativeFontSize.xs,
    color: nativeColors.neutral[500],
  },
  privacyValue: {
    fontSize: nativeFontSize.base,
    fontWeight: '600',
    color: nativeColors.neutral[900],
  },
  privacyExplanation: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[600],
    lineHeight: 22,
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: nativeSpacing[4],
    paddingHorizontal: nativeSpacing[4],
    backgroundColor: '#ffffff',
    borderRadius: nativeRadius.lg,
    borderWidth: 1,
    borderColor: nativeColors.neutral[200],
  },
  privacyLinkText: {
    fontSize: nativeFontSize.sm,
    fontWeight: '600',
    color: nativeColors.primary[600],
  },
  privacyLinkArrow: {
    fontSize: nativeFontSize.lg,
    color: nativeColors.primary[600],
  },

  /* Step 4: Decision */
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: nativeSpacing[2],
    borderBottomWidth: 1,
    borderBottomColor: nativeColors.neutral[100],
  },
  summaryLabel: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[500],
    flex: 1,
  },
  summaryValue: {
    fontSize: nativeFontSize.sm,
    fontWeight: '600',
    color: nativeColors.neutral[800],
    flex: 1,
    textAlign: 'right',
  },
  decisionButtons: {
    gap: nativeSpacing[3],
    marginTop: nativeSpacing[4],
  },
  approveBtn: {
    width: '100%',
  },
  rejectBtn: {
    width: '100%',
  },

  /* Step 5: Confirmation */
  confirmationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: nativeSpacing[16],
    gap: nativeSpacing[3],
  },
  confirmationIcon: {
    fontSize: 64,
    marginBottom: nativeSpacing[4],
  },
  iconApproved: {
    color: nativeColors.success[500],
  },
  iconRejected: {
    color: nativeColors.danger[500],
  },
  confirmationTitle: {
    fontSize: nativeFontSize.xl,
    fontWeight: '700',
    color: nativeColors.neutral[900],
    textAlign: 'center',
  },
  confirmationSubtitle: {
    fontSize: nativeFontSize.base,
    color: nativeColors.neutral[500],
    textAlign: 'center',
    paddingHorizontal: nativeSpacing[6],
  },

  /* Navigation bar */
  navigation: {
    flexDirection: 'row',
    padding: nativeSpacing[4],
    gap: nativeSpacing[3],
    borderTopWidth: 1,
    borderTopColor: nativeColors.neutral[200],
    backgroundColor: '#ffffff',
  },
  navButton: {
    flex: 1,
  },

  /* Error extras */
  corsHint: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[500],
    textAlign: 'center',
    paddingHorizontal: nativeSpacing[6],
    marginTop: nativeSpacing[4],
  },
});
