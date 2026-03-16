import { createHmac, randomBytes } from 'node:crypto';
import { ValidatePartnerSignatureUseCase } from './validate-partner-signature.use-case';
import type {
  PartnerRepositoryPort,
  PartnerSecurityRepositoryPort,
} from '@ultima-forma/domain-partner';

const TEST_SECRET = randomBytes(32).toString('hex');

function makeSignature(
  secret: string,
  method: string,
  path: string,
  body: string,
  timestamp: string
): string {
  return createHmac('sha256', secret)
    .update(method + path + body + timestamp)
    .digest('hex');
}

function createMocks() {
  const mockSecurityRepo: jest.Mocked<PartnerSecurityRepositoryPort> = {
    findActiveCredentialSecret: jest.fn(),
    isNonceUsed: jest.fn(),
    storeNonce: jest.fn(),
    recordApiUsage: jest.fn(),
    cleanExpiredNonces: jest.fn(),
  };

  const mockPartnerRepo: jest.Mocked<PartnerRepositoryPort> = {
    findPartnerById: jest.fn(),
    findIssuerById: jest.fn(),
    findConsumerById: jest.fn(),
    createIssuer: jest.fn(),
    createConsumer: jest.fn(),
    updateIssuer: jest.fn(),
    updateConsumer: jest.fn(),
    rotateIntegrationCredential: jest.fn(),
  };

  return { mockSecurityRepo, mockPartnerRepo };
}

function setupValidScenario(
  mockSecurityRepo: jest.Mocked<PartnerSecurityRepositoryPort>,
  mockPartnerRepo: jest.Mocked<PartnerRepositoryPort>
) {
  mockPartnerRepo.findPartnerById.mockResolvedValue({
    id: 'partner-1',
    tenantId: 'tenant-1',
    name: 'Test Partner',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  mockSecurityRepo.findActiveCredentialSecret.mockResolvedValue({
    credentialId: 'cred-1',
    secret: TEST_SECRET,
  });

  mockSecurityRepo.isNonceUsed.mockResolvedValue(false);
  mockSecurityRepo.storeNonce.mockResolvedValue(undefined);
}

describe('ValidatePartnerSignatureUseCase', () => {
  let useCase: ValidatePartnerSignatureUseCase;
  let mockSecurityRepo: jest.Mocked<PartnerSecurityRepositoryPort>;
  let mockPartnerRepo: jest.Mocked<PartnerRepositoryPort>;

  beforeEach(() => {
    const mocks = createMocks();
    mockSecurityRepo = mocks.mockSecurityRepo;
    mockPartnerRepo = mocks.mockPartnerRepo;
    useCase = new ValidatePartnerSignatureUseCase(
      mockSecurityRepo,
      mockPartnerRepo
    );
    jest.clearAllMocks();
  });

  it('should accept a valid signature', async () => {
    setupValidScenario(mockSecurityRepo, mockPartnerRepo);

    const timestamp = new Date().toISOString();
    const method = 'POST';
    const path = '/v1/data-requests';
    const body = '{"consumerId":"c1"}';
    const signature = makeSignature(TEST_SECRET, method, path, body, timestamp);

    const result = await useCase.execute({
      partnerId: 'partner-1',
      timestamp,
      signature,
      method,
      path,
      body,
      toleranceMs: 300000,
    });

    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
    expect(mockSecurityRepo.storeNonce).toHaveBeenCalled();
  });

  it('should reject when headers are missing', async () => {
    const result = await useCase.execute({
      partnerId: '',
      timestamp: '',
      signature: '',
      method: 'GET',
      path: '/v1/issuers',
      body: '',
      toleranceMs: 300000,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('MISSING_AUTH_HEADERS');
  });

  it('should reject an invalid timestamp format', async () => {
    const result = await useCase.execute({
      partnerId: 'partner-1',
      timestamp: 'not-a-date',
      signature: 'abc123',
      method: 'GET',
      path: '/v1/issuers',
      body: '',
      toleranceMs: 300000,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('INVALID_TIMESTAMP');
  });

  it('should reject an expired timestamp', async () => {
    const oldTimestamp = new Date(Date.now() - 600000).toISOString();

    const result = await useCase.execute({
      partnerId: 'partner-1',
      timestamp: oldTimestamp,
      signature: 'abc123',
      method: 'GET',
      path: '/v1/issuers',
      body: '',
      toleranceMs: 300000,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('TIMESTAMP_EXPIRED');
  });

  it('should reject when partner is not found', async () => {
    mockPartnerRepo.findPartnerById.mockResolvedValue(null);

    const timestamp = new Date().toISOString();
    const result = await useCase.execute({
      partnerId: 'unknown',
      timestamp,
      signature: 'abc123',
      method: 'GET',
      path: '/v1/issuers',
      body: '',
      toleranceMs: 300000,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('PARTNER_NOT_FOUND');
  });

  it('should reject when partner is inactive', async () => {
    mockPartnerRepo.findPartnerById.mockResolvedValue({
      id: 'partner-1',
      tenantId: 'tenant-1',
      name: 'Test Partner',
      status: 'inactive',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const timestamp = new Date().toISOString();
    const result = await useCase.execute({
      partnerId: 'partner-1',
      timestamp,
      signature: 'abc123',
      method: 'GET',
      path: '/v1/issuers',
      body: '',
      toleranceMs: 300000,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('PARTNER_INACTIVE');
  });

  it('should reject when no active credential exists', async () => {
    mockPartnerRepo.findPartnerById.mockResolvedValue({
      id: 'partner-1',
      tenantId: 'tenant-1',
      name: 'Test Partner',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockSecurityRepo.findActiveCredentialSecret.mockResolvedValue(null);

    const timestamp = new Date().toISOString();
    const result = await useCase.execute({
      partnerId: 'partner-1',
      timestamp,
      signature: 'abc123',
      method: 'GET',
      path: '/v1/issuers',
      body: '',
      toleranceMs: 300000,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('NO_ACTIVE_CREDENTIAL');
  });

  it('should reject an invalid signature', async () => {
    setupValidScenario(mockSecurityRepo, mockPartnerRepo);

    const timestamp = new Date().toISOString();
    const wrongSignature = createHmac('sha256', 'wrong-secret')
      .update('POST/v1/data-requests{}' + timestamp)
      .digest('hex');

    const result = await useCase.execute({
      partnerId: 'partner-1',
      timestamp,
      signature: wrongSignature,
      method: 'POST',
      path: '/v1/data-requests',
      body: '{}',
      toleranceMs: 300000,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('INVALID_SIGNATURE');
  });

  it('should reject a replayed request', async () => {
    setupValidScenario(mockSecurityRepo, mockPartnerRepo);
    mockSecurityRepo.isNonceUsed.mockResolvedValue(true);

    const timestamp = new Date().toISOString();
    const method = 'POST';
    const path = '/v1/data-requests';
    const body = '{}';
    const signature = makeSignature(TEST_SECRET, method, path, body, timestamp);

    const result = await useCase.execute({
      partnerId: 'partner-1',
      timestamp,
      signature,
      method,
      path,
      body,
      toleranceMs: 300000,
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('REPLAY_DETECTED');
  });

  it('should work with empty body (GET requests)', async () => {
    setupValidScenario(mockSecurityRepo, mockPartnerRepo);

    const timestamp = new Date().toISOString();
    const method = 'GET';
    const path = '/v1/data-requests/123/result';
    const body = '';
    const signature = makeSignature(TEST_SECRET, method, path, body, timestamp);

    const result = await useCase.execute({
      partnerId: 'partner-1',
      timestamp,
      signature,
      method,
      path,
      body,
      toleranceMs: 300000,
    });

    expect(result.valid).toBe(true);
  });
});
