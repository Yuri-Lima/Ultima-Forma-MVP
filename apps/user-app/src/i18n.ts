import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { resources, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@ultima-forma/shared-i18n';

const supportedLngs = SUPPORTED_LOCALES as string[];

function getDeviceLocale(): string {
  const locales = Localization.getLocales();
  const tag = locales[0]?.languageTag ?? locales[0]?.languageCode;
  if (!tag) return DEFAULT_LOCALE;
  if (tag.startsWith('pt')) return 'pt-BR';
  if (tag.startsWith('en')) return 'en';
  if (tag.startsWith('es')) return 'es';
  return DEFAULT_LOCALE;
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLocale(),
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'user',
  ns: ['common', 'user'],
  supportedLngs,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
