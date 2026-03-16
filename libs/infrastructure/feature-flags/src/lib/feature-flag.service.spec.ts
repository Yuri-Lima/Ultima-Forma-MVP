import { FeatureFlagService, FeatureFlag } from './feature-flag.service';
import { resetConfigCache } from '@ultima-forma/shared-config';

describe('FeatureFlagService', () => {
  const originalEnv = process.env;
  let service: FeatureFlagService;

  beforeEach(() => {
    resetConfigCache();
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NODE_ENV: 'development',
    };
    service = new FeatureFlagService();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetConfigCache();
  });

  it('should return false for disabled flags', () => {
    expect(service.isEnabled(FeatureFlag.PARTNER_AUTH)).toBe(false);
    expect(service.isEnabled(FeatureFlag.CLAIMS_VALIDATION)).toBe(false);
    expect(service.isEnabled(FeatureFlag.WALLET_PRESENTATIONS)).toBe(false);
  });

  it('should return true when flag is enabled via env var', () => {
    process.env['FF_PARTNER_AUTH'] = 'true';
    resetConfigCache();

    expect(service.isEnabled(FeatureFlag.PARTNER_AUTH)).toBe(true);
  });

  it('should return all flags', () => {
    process.env['FF_CLAIMS_VALIDATION'] = 'true';
    resetConfigCache();

    const all = service.allFlags();
    expect(all).toEqual({
      partnerAuth: false,
      claimsValidation: true,
      walletPresentations: false,
    });
  });
});
