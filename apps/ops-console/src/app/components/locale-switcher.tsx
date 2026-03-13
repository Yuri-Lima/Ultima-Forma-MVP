import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, LOCALE_NAMES } from '@ultima-forma/shared-i18n';
import type { SupportedLocale } from '@ultima-forma/shared-i18n';

const switcherStyles: React.CSSProperties = {
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const selectStyles: React.CSSProperties = {
  padding: '0.35rem 0.5rem',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.3)',
  backgroundColor: 'rgba(0,0,0,0.2)',
  color: '#eee',
  fontSize: 14,
  cursor: 'pointer',
};

export function LocaleSwitcher() {
  const { t, i18n } = useTranslation('common');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value as SupportedLocale);
  };

  return (
    <div style={switcherStyles}>
      <label htmlFor="locale-select" style={{ fontSize: 14, color: '#aaa' }}>
        {t('language')}:
      </label>
      <select
        id="locale-select"
        value={i18n.language}
        onChange={handleChange}
        style={selectStyles}
        aria-label={t('selectLanguage')}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {LOCALE_NAMES[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
