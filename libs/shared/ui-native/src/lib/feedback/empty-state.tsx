import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  nativeColors,
  nativeSpacing,
  nativeFontSize,
} from '@ultima-forma/shared-design-tokens';

export interface NativeEmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function NativeEmptyState({ title, description, action }: NativeEmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.action}>{action}</View>}
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
    color: nativeColors.neutral[900],
    textAlign: 'center',
  },
  description: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[500],
    textAlign: 'center',
  },
  action: {
    marginTop: nativeSpacing[4],
  },
});
