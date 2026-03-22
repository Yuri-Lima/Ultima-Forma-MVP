import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { nativeColors } from '@ultima-forma/shared-design-tokens';

type NativeTheme = 'light' | 'dark';

interface NativeThemeColors {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  danger: string;
  success: string;
}

interface NativeThemeContextValue {
  theme: NativeTheme;
  colors: NativeThemeColors;
}

const lightColors: NativeThemeColors = {
  background: '#ffffff',
  foreground: nativeColors.neutral[900],
  muted: nativeColors.neutral[100],
  mutedForeground: nativeColors.neutral[500],
  border: nativeColors.neutral[200],
  card: '#ffffff',
  cardForeground: nativeColors.neutral[900],
  primary: nativeColors.primary[600],
  primaryForeground: '#ffffff',
  danger: nativeColors.danger[600],
  success: nativeColors.success[600],
};

const darkColors: NativeThemeColors = {
  background: nativeColors.neutral[950],
  foreground: nativeColors.neutral[50],
  muted: nativeColors.neutral[800],
  mutedForeground: nativeColors.neutral[400],
  border: nativeColors.neutral[700],
  card: nativeColors.neutral[900],
  cardForeground: nativeColors.neutral[50],
  primary: nativeColors.primary[400],
  primaryForeground: '#ffffff',
  danger: nativeColors.danger[400],
  success: nativeColors.success[400],
};

const NativeThemeContext = createContext<NativeThemeContextValue>({
  theme: 'light',
  colors: lightColors,
});

export interface NativeThemeProviderProps {
  children: React.ReactNode;
}

export function NativeThemeProvider({ children }: NativeThemeProviderProps) {
  const colorScheme = useColorScheme();
  const theme: NativeTheme = colorScheme === 'dark' ? 'dark' : 'light';

  const value = useMemo(
    () => ({
      theme,
      colors: theme === 'dark' ? darkColors : lightColors,
    }),
    [theme]
  );

  return (
    <NativeThemeContext.Provider value={value}>
      {children}
    </NativeThemeContext.Provider>
  );
}

export function useNativeTheme() {
  return useContext(NativeThemeContext);
}
