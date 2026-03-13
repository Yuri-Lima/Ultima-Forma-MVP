import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, LOCALE_NAMES } from '@ultima-forma/shared-i18n';
import type { SupportedLocale } from '@ultima-forma/shared-i18n';

export function App() {
  const { t, i18n } = useTranslation(['partner', 'common']);
  return (
    <div style={{ padding: 48, fontFamily: 'system-ui, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 24,
        }}
      >
        <label htmlFor="locale-select" style={{ marginRight: 8 }}>
          {t('common:language')}:
        </label>
        <select
          id="locale-select"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value as SupportedLocale)}
          style={{
            padding: '0.35rem 0.5rem',
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
          aria-label={t('common:selectLanguage')}
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {LOCALE_NAMES[locale]}
            </option>
          ))}
        </select>
      </div>
      <h1 style={{ marginBottom: 16 }}>{t('title')}</h1>
      <p style={{ color: '#666', maxWidth: 480 }}>{t('subtitle')}</p>
    </div>
  );
}

export default App;
