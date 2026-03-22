import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  nativeColors,
  nativeSpacing,
  nativeFontSize,
} from '@ultima-forma/shared-design-tokens';
import { NativeSpinner } from '../components/spinner';

export interface NativeLoadingStateProps {
  message?: string;
}

export function NativeLoadingState({ message = 'Loading...' }: NativeLoadingStateProps) {
  return (
    <View style={styles.container}>
      <NativeSpinner size="lg" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: nativeSpacing[10],
    gap: nativeSpacing[3],
  },
  message: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[500],
  },
});
