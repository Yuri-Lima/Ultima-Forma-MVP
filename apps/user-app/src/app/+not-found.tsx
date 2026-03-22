import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { NativeErrorState } from '@ultima-forma/shared-ui-native';
import { useNativeTheme } from '@ultima-forma/shared-ui-native';
import { ScreenContainer } from './components/ScreenContainer';

export default function NotFoundScreen() {
  const { t } = useTranslation('user');
  const router = useRouter();
  const { colors } = useNativeTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenContainer>
        <NativeErrorState
          title={t('notFound.title')}
          message={t('notFound.message')}
          retryLabel={t('notFound.goHome')}
          onRetry={() => router.replace('/')}
        />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
