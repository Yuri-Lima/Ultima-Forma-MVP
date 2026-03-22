import { useTranslation } from 'react-i18next';
import { Flex, Select, Text } from '@radix-ui/themes';
import { SUPPORTED_LOCALES, LOCALE_NAMES } from '@ultima-forma/shared-i18n';
import type { SupportedLocale } from '@ultima-forma/shared-i18n';

export function LocaleSwitcher() {
  const { t, i18n } = useTranslation('common');

  return (
    <Flex align="center" gap="2">
      <Text as="label" size="2" color="gray">
        {t('language')}:
      </Text>
      <Select.Root
        value={i18n.language}
        onValueChange={(val) => i18n.changeLanguage(val as SupportedLocale)}
      >
        <Select.Trigger size="2" variant="soft" style={{ minWidth: 160 }} aria-label={t('selectLanguage')} />
        <Select.Content>
          {SUPPORTED_LOCALES.map((locale) => (
            <Select.Item key={locale} value={locale}>
              {LOCALE_NAMES[locale]}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}
