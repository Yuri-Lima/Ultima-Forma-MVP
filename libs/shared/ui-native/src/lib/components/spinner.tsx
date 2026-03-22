import React from 'react';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';
import { nativeColors } from '@ultima-forma/shared-design-tokens';

export interface NativeSpinnerProps extends Omit<ActivityIndicatorProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'small' as const,
  md: 'small' as const,
  lg: 'large' as const,
};

export function NativeSpinner({
  size = 'md',
  color = nativeColors.neutral[500],
  ...props
}: NativeSpinnerProps) {
  return <ActivityIndicator size={sizeMap[size]} color={color} {...props} />;
}
