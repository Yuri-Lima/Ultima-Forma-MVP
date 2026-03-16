import { getConfig } from '@ultima-forma/shared-config';

export enum FeatureFlag {
  PARTNER_AUTH = 'PARTNER_AUTH',
  CLAIMS_VALIDATION = 'CLAIMS_VALIDATION',
  WALLET_PRESENTATIONS = 'WALLET_PRESENTATIONS',
}

const FLAG_TO_CONFIG_KEY: Record<FeatureFlag, keyof ReturnType<typeof getConfig>['featureFlags']> = {
  [FeatureFlag.PARTNER_AUTH]: 'partnerAuth',
  [FeatureFlag.CLAIMS_VALIDATION]: 'claimsValidation',
  [FeatureFlag.WALLET_PRESENTATIONS]: 'walletPresentations',
};

export class FeatureFlagService {
  isEnabled(flag: FeatureFlag): boolean {
    const config = getConfig();
    const key = FLAG_TO_CONFIG_KEY[flag];
    return config.featureFlags[key] ?? false;
  }

  allFlags(): Record<string, boolean> {
    const config = getConfig();
    return { ...config.featureFlags };
  }
}
