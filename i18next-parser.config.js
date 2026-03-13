/** @type {import('i18next-parser').UserConfig} */
module.exports = {
  locales: ['pt-BR', 'en', 'es'],
  output: 'libs/shared/i18n/src/locales/$LOCALE/$NAMESPACE.json',
  input: [
    'apps/ops-console/src/**/*.{ts,tsx}',
    'apps/partner-portal/src/**/*.{ts,tsx}',
    'apps/user-app/src/**/*.{ts,tsx}',
  ],
  defaultNamespace: 'common',
  keySeparator: '.',
  namespaceSeparator: ':',
  keepRemoved: false,
  sort: true,
  failOnWarnings: false,
  failOnUpdate: false,
  customValueTemplate: null,
  contextSeparator: '_',
  defaultContext: undefined,
};
