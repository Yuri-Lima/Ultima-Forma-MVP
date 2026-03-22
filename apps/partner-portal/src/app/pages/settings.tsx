import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, LOCALE_NAMES } from '@ultima-forma/shared-i18n';
import type { SupportedLocale } from '@ultima-forma/shared-i18n';
import {
  PageContainer,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Section,
} from '@ultima-forma/shared-ui';
import { useAuth } from '../lib/auth-context';

export function SettingsPage() {
  const { t, i18n } = useTranslation(['partner', 'common']);
  const { partnerId } = useAuth();

  return (
    <PageContainer
      title={t('settings.title')}
      description={t('settings.description')}
    >
      <div className="max-w-2xl space-y-6">
        <Section title={t('settings.profile')}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('settings.partnerId')}</span>
                <span className="font-mono">{partnerId}</span>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title={t('settings.language')}>
          <Card>
            <CardContent className="pt-6">
              <Select
                value={i18n.language}
                onValueChange={(v) => i18n.changeLanguage(v as SupportedLocale)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LOCALES.map((locale) => (
                    <SelectItem key={locale} value={locale}>
                      {LOCALE_NAMES[locale]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </Section>
      </div>
    </PageContainer>
  );
}
