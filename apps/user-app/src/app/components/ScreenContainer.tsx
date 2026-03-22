import { View } from 'react-native';
import { Platform } from 'react-native';
import { nativeSpacing } from '@ultima-forma/shared-design-tokens';

type ScreenContainerProps = {
  children: React.ReactNode;
  centered?: boolean;
};

export function ScreenContainer({
  children,
  centered = true,
}: ScreenContainerProps) {
  return (
    <View
      style={[
        { flex: 1, paddingHorizontal: nativeSpacing[4] },
        centered && { alignItems: 'center', justifyContent: 'center' },
        Platform.OS === 'web' && {
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
        },
      ]}
    >
      {children}
    </View>
  );
}
