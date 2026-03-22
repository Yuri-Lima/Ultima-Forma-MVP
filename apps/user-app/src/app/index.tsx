import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  NativeCard,
  NativeCardHeader,
  NativeCardTitle,
  NativeCardContent,
} from '@ultima-forma/shared-ui-native';
import { nativeSpacing, nativeFontSize, nativeColors } from '@ultima-forma/shared-design-tokens';
import { useNativeTheme } from '@ultima-forma/shared-ui-native';
import { ScreenContainer } from './components/ScreenContainer';

export default function HomeScreen() {
  const { t } = useTranslation('user');
  const { colors } = useNativeTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenContainer>
        <NativeCard>
          <NativeCardHeader>
            <NativeCardTitle>{t('home.title')}</NativeCardTitle>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
            {t('home.description') ? (
              <Text style={styles.description}>{t('home.description')}</Text>
            ) : null}
          </NativeCardHeader>
          <NativeCardContent />
        </NativeCard>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: nativeFontSize.base,
    color: nativeColors.neutral[500],
    textAlign: 'center',
    marginTop: nativeSpacing[2],
  },
  description: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[500],
    textAlign: 'center',
    marginTop: nativeSpacing[3],
  },
});
