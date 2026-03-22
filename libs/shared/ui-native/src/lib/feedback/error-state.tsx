import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  nativeColors,
  nativeSpacing,
  nativeFontSize,
} from '@ultima-forma/shared-design-tokens';
import { NativeButton } from '../components/button';

export interface NativeErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function NativeErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}: NativeErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <NativeButton variant="outline" onPress={onRetry} style={styles.button}>
          {retryLabel}
        </NativeButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: nativeSpacing[10],
    gap: nativeSpacing[2],
  },
  title: {
    fontSize: nativeFontSize.lg,
    fontWeight: '600',
    color: nativeColors.danger[700],
    textAlign: 'center',
  },
  message: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[500],
    textAlign: 'center',
  },
  button: {
    marginTop: nativeSpacing[4],
  },
});
