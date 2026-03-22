import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
  ActivityIndicator,
} from 'react-native';
import {
  nativeColors,
  nativeSpacing,
  nativeRadius,
  nativeFontSize,
} from '@ultima-forma/shared-design-tokens';

export interface NativeButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<string, StyleProp<ViewStyle>> = {
  default: { backgroundColor: nativeColors.primary[600] },
  destructive: { backgroundColor: nativeColors.danger[600] },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: nativeColors.neutral[300],
  },
  secondary: { backgroundColor: nativeColors.neutral[100] },
  ghost: { backgroundColor: 'transparent' },
};

const textColorMap: Record<string, string> = {
  default: '#ffffff',
  destructive: '#ffffff',
  outline: nativeColors.neutral[900],
  secondary: nativeColors.neutral[900],
  ghost: nativeColors.neutral[900],
};

export function NativeButton({
  variant = 'default',
  size = 'md',
  loading = false,
  disabled,
  style,
  children,
  ...props
}: NativeButtonProps) {
  const sizeStyle = sizeStyles[size];
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyle,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColorMap[variant]} size="small" />
      ) : (
        <Text style={[styles.text, textStyles[size], { color: textColorMap[variant] }]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: nativeRadius.md,
    flexDirection: 'row',
    gap: nativeSpacing[2],
  },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '600' },
});

const sizeStyles: Record<string, StyleProp<ViewStyle>> = {
  sm: {
    height: 32,
    paddingHorizontal: nativeSpacing[3],
    borderRadius: nativeRadius.md,
  },
  md: {
    height: 40,
    paddingHorizontal: nativeSpacing[4],
  },
  lg: {
    height: 48,
    paddingHorizontal: nativeSpacing[6],
    borderRadius: nativeRadius.md,
  },
};

const textStyles: Record<string, { fontSize: number }> = {
  sm: { fontSize: nativeFontSize.xs },
  md: { fontSize: nativeFontSize.sm },
  lg: { fontSize: nativeFontSize.base },
};
