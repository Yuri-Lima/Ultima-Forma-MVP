/**
 * Locale resources for i18next and nestjs-i18n.
 * NestJS uses loadPath; React apps import these directly.
 */
import commonPtBR from './pt-BR/common.json';
import opsPtBR from './pt-BR/ops.json';
import partnerPtBR from './pt-BR/partner.json';
import userPtBR from './pt-BR/user.json';
import commonEn from './en/common.json';
import opsEn from './en/ops.json';
import partnerEn from './en/partner.json';
import userEn from './en/user.json';
import commonEs from './es/common.json';
import opsEs from './es/ops.json';
import partnerEs from './es/partner.json';
import userEs from './es/user.json';

export const resources = {
  'pt-BR': {
    common: commonPtBR,
    ops: opsPtBR,
    partner: partnerPtBR,
    user: userPtBR,
  },
  en: {
    common: commonEn,
    ops: opsEn,
    partner: partnerEn,
    user: userEn,
  },
  es: {
    common: commonEs,
    ops: opsEs,
    partner: partnerEs,
    user: userEs,
  },
} as const;

/** Base path for NestJS nestjs-i18n loadPath (relative to project root) */
export const NEST_LOAD_PATH = 'libs/shared/i18n/src/locales/{{lng}}/api.json';
