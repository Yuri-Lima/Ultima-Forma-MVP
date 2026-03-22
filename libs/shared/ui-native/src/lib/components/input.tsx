import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import {
  nativeColors,
  nativeSpacing,
  nativeRadius,
  nativeFontSize,
} from '@ultima-forma/shared-design-tokens';

export interface NativeInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function NativeInput({ label, error, style, ...props }: NativeInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={nativeColors.neutral[400]}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: nativeSpacing[1.5] },
  label: {
    fontSize: nativeFontSize.sm,
    fontWeight: '500',
    color: nativeColors.neutral[900],
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: nativeColors.neutral[300],
    borderRadius: nativeRadius.md,
    paddingHorizontal: nativeSpacing[3],
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[900],
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: nativeColors.danger[500],
  },
  error: {
    fontSize: nativeFontSize.xs,
    color: nativeColors.danger[500],
  },
});
