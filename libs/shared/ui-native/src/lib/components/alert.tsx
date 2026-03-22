import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import {
  nativeColors,
  nativeSpacing,
  nativeRadius,
  nativeFontSize,
} from '@ultima-forma/shared-design-tokens';

export interface NativeAlertProps {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive';
  title?: string;
  children: React.ReactNode;
}

const variantStyles: Record<string, ViewStyle> = {
  default: { backgroundColor: '#ffffff', borderColor: nativeColors.neutral[200] },
  info: { backgroundColor: nativeColors.primary[50], borderColor: nativeColors.primary[200] },
  success: { backgroundColor: nativeColors.success[50], borderColor: nativeColors.success[200] },
  warning: { backgroundColor: nativeColors.warning[50], borderColor: nativeColors.warning[200] },
  destructive: { backgroundColor: nativeColors.danger[50], borderColor: nativeColors.danger[200] },
};

const variantTextColor: Record<string, string> = {
  default: nativeColors.neutral[900],
  info: nativeColors.primary[900],
  success: nativeColors.success[900],
  warning: nativeColors.warning[900],
  destructive: nativeColors.danger[900],
};

export function NativeAlert({ variant = 'default', title, children }: NativeAlertProps) {
  return (
    <View style={[styles.alert, variantStyles[variant]]}>
      {title && (
        <Text style={[styles.title, { color: variantTextColor[variant] }]}>
          {title}
        </Text>
      )}
      <Text style={[styles.description, { color: variantTextColor[variant] }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    padding: nativeSpacing[4],
    borderRadius: nativeRadius.lg,
    borderWidth: 1,
    gap: nativeSpacing[1],
  },
  title: {
    fontSize: nativeFontSize.sm,
    fontWeight: '500',
  },
  description: {
    fontSize: nativeFontSize.sm,
  },
});
