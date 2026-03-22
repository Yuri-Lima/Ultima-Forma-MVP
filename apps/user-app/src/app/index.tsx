import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  NativeCard,
  NativeCardHeader,
  NativeCardTitle,
  NativeCardContent,
  NativeButton,
} from '@ultima-forma/shared-ui-native';
import { nativeSpacing, nativeFontSize, nativeColors } from '@ultima-forma/shared-design-tokens';
import { useNativeTheme } from '@ultima-forma/shared-ui-native';
import { ScreenContainer } from './components/ScreenContainer';

export default function HomeScreen() {
  const { colors } = useNativeTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenContainer>
        <NativeCard>
          <NativeCardHeader>
            <NativeCardTitle>Ultima Forma</NativeCardTitle>
            <Text style={styles.subtitle}>
              Sua identidade digital, seus dados, seu controle.
            </Text>
          </NativeCardHeader>
          <NativeCardContent>
            <View style={styles.buttons}>
              <NativeButton onPress={() => router.push('/register')}>
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
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: nativeFontSize.base,
    color: nativeColors.neutral[500],
    textAlign: 'center',
    marginTop: nativeSpacing[2],
  },
  buttons: {
    gap: nativeSpacing[3],
    marginTop: nativeSpacing[4],
  },
});
