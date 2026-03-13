import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@ultima-forma/shared-i18n';

const supportedLngs = SUPPORTED_LOCALES as string[];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: 'ops',
    ns: ['common', 'ops'],
    supportedLngs,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
