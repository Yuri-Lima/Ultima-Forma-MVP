import { colors } from './tokens/colors';

/** Spacing values in density-independent pixels for React Native */
export const nativeSpacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const nativeRadius = {
  none: 0,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

export const nativeFontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const nativeLineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 48,
} as const;

export const nativeColors = colors;

/**
 * Shadow styles using boxShadow (replaces deprecated shadowColor/shadowOffset/shadowOpacity/shadowRadius).
 * boxShadow works on web and on iOS/Android with New Architecture.
 * elevation is kept for Android fallback when boxShadow is not available.
 */
export const nativeShadow = {
  sm: {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  DEFAULT: {
    boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  md: {
    boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  lg: {
    boxShadow: '0px 4px 8px -3px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
} as const;
