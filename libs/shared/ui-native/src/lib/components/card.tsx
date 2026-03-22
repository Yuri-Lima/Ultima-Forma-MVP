import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  nativeColors,
  nativeSpacing,
  nativeRadius,
  nativeShadow,
  nativeFontSize,
} from '@ultima-forma/shared-design-tokens';

export interface NativeCardProps {
  children: React.ReactNode;
}

export function NativeCard({ children }: NativeCardProps) {
  return <View style={styles.card}>{children}</View>;
}

export function NativeCardHeader({ children }: NativeCardProps) {
  return <View style={styles.header}>{children}</View>;
}

export function NativeCardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function NativeCardDescription({ children }: { children: React.ReactNode }) {
  return <Text style={styles.description}>{children}</Text>;
}

export function NativeCardContent({ children }: NativeCardProps) {
  return <View style={styles.content}>{children}</View>;
}

export function NativeCardFooter({ children }: NativeCardProps) {
  return <View style={styles.footer}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: nativeRadius.lg,
    borderWidth: 1,
    borderColor: nativeColors.neutral[200],
    backgroundColor: '#ffffff',
    ...nativeShadow.sm,
  },
  header: {
    padding: nativeSpacing[6],
    gap: nativeSpacing[1.5],
  },
  title: {
    fontSize: nativeFontSize.lg,
    fontWeight: '600',
    color: nativeColors.neutral[900],
  },
  description: {
    fontSize: nativeFontSize.sm,
    color: nativeColors.neutral[500],
  },
  content: {
    paddingHorizontal: nativeSpacing[6],
    paddingBottom: nativeSpacing[6],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: nativeSpacing[6],
    paddingBottom: nativeSpacing[6],
  },
});
