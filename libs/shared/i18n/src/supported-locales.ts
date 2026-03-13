/**
 * Supported locales for the Ultima Forma MVP.
 * pt-BR is the default and fallback language.
 */
export const SUPPORTED_LOCALES = ['pt-BR', 'en', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
};
