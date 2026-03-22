import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import {
  nativeColors,
  nativeSpacing,
  nativeRadius,
  nativeFontSize,
} from '@ultima-forma/shared-design-tokens';

export interface NativeBadgeProps {
  variant?: 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline';
  children: React.ReactNode;
}

const variantBg: Record<string, ViewStyle> = {
  default: { backgroundColor: nativeColors.primary[100] },
  secondary: { backgroundColor: nativeColors.neutral[100] },
  success: { backgroundColor: nativeColors.success[100] },
  danger: { backgroundColor: nativeColors.danger[100] },
  warning: { backgroundColor: nativeColors.warning[100] },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: nativeColors.neutral[300] },
};

const variantText: Record<string, TextStyle> = {
  default: { color: nativeColors.primary[800] },
  secondary: { color: nativeColors.neutral[600] },
  success: { color: nativeColors.success[800] },
  danger: { color: nativeColors.danger[800] },
  warning: { color: nativeColors.warning[800] },
  outline: { color: nativeColors.neutral[900] },
};

export function NativeBadge({ variant = 'default', children }: NativeBadgeProps) {
  return (
    <View style={[styles.badge, variantBg[variant]]}>
      <Text style={[styles.text, variantText[variant]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: nativeSpacing[2.5],
    paddingVertical: nativeSpacing[0.5],
    borderRadius: nativeRadius.full,
  },
  text: {
    fontSize: nativeFontSize.xs,
    fontWeight: '600',
  },
});
