import { getConfig, resetConfigCache, maskSecret } from './config';

describe('getConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetConfigCache();
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NODE_ENV: 'development',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    resetConfigCache();
  });

  it('should parse valid development config', () => {
    const config = getConfig();
    expect(config.nodeEnv).toBe('development');
    expect(config.databaseUrl).toBe(
      'postgresql://test:test@localhost:5432/test'
    );
    expect(config.apiGatewayPort).toBe(3333);
    expect(config.orchestrationApiPort).toBe(3334);
    expect(config.featureFlags.partnerAuth).toBe(false);
  });

  it('should parse feature flags', () => {
    process.env['FF_PARTNER_AUTH'] = 'true';
    process.env['FF_CLAIMS_VALIDATION'] = 'yes';
    resetConfigCache();

    const config = getConfig();
    expect(config.featureFlags.partnerAuth).toBe(true);
    expect(config.featureFlags.claimsValidation).toBe(true);
    expect(config.featureFlags.walletPresentations).toBe(false);
  });

  it('should reject missing DATABASE_URL', () => {
    delete process.env['DATABASE_URL'];
    resetConfigCache();

    expect(() => getConfig()).toThrow('Invalid environment configuration');
  });

  it('should require CREDENTIAL_ENCRYPTION_KEY in production', () => {
    process.env['NODE_ENV'] = 'production';
    process.env['DATABASE_URL'] = 'postgresql://prod:prod@db.example.com:5432/prod';
    process.env['INTERNAL_API_KEY'] = 'secret-key';
    process.env['CREDENTIAL_ENCRYPTION_KEY'] = '';
    resetConfigCache();

    expect(() => getConfig()).toThrow(
      'CREDENTIAL_ENCRYPTION_KEY is required in production'
    );
  });

  it('should require INTERNAL_API_KEY in production', () => {
    process.env['NODE_ENV'] = 'production';
    process.env['DATABASE_URL'] = 'postgresql://prod:prod@db.example.com:5432/prod';
    process.env['CREDENTIAL_ENCRYPTION_KEY'] = 'some-key';
    resetConfigCache();

    expect(() => getConfig()).toThrow(
      'INTERNAL_API_KEY is required in production'
    );
  });

  it('should reject localhost DATABASE_URL in production', () => {
    process.env['NODE_ENV'] = 'production';
    process.env['DATABASE_URL'] = 'postgresql://prod:prod@localhost:5432/prod';
    process.env['CREDENTIAL_ENCRYPTION_KEY'] = 'some-key';
    process.env['INTERNAL_API_KEY'] = 'some-key';
    resetConfigCache();

    expect(() => getConfig()).toThrow(
      'DATABASE_URL must not point to localhost in production'
    );
  });

  it('should cache config after first parse', () => {
    const first = getConfig();
    const second = getConfig();
    expect(first).toBe(second);
  });
});

describe('maskSecret', () => {
  it('should mask short secrets', () => {
    expect(maskSecret('abc')).toBe('****');
  });

  it('should mask long secrets showing first and last 2 chars', () => {
    expect(maskSecret('abcdef1234')).toBe('ab****34');
  });
});
