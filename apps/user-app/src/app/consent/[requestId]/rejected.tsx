import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  NativeCard,
  NativeCardHeader,
  NativeCardTitle,
  NativeCardContent,
  NativeButton,
} from '@ultima-forma/shared-ui-native';
import { nativeFontSize, nativeColors, nativeSpacing } from '@ultima-forma/shared-design-tokens';
import { useNativeTheme } from '@ultima-forma/shared-ui-native';
import { ScreenContainer } from '../../components/ScreenContainer';

export default function RejectedScreen() {
  const { t } = useTranslation('user');
  const router = useRouter();
  const { colors } = useNativeTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenContainer>
        <NativeCard>
          <NativeCardHeader>
            <Text style={styles.icon}>✕</Text>
            <NativeCardTitle>{t('consent.rejected.titleFull')}</NativeCardTitle>
            <Text style={styles.subtitle}>{t('consent.rejected.subtitleSuccess')}</Text>
          </NativeCardHeader>
          <NativeCardContent>
            <NativeButton variant="default" onPress={() => router.replace('/')}>
              {t('consent.backToHome')}
            </NativeButton>
          </NativeCardContent>
        </NativeCard>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icon: {
    fontSize: 64,
    color: nativeColors.danger[500],
    marginBottom: nativeSpacing[6],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: nativeFontSize.base,
    color: nativeColors.neutral[500],
    textAlign: 'center',
    marginTop: nativeSpacing[2],
  },
});