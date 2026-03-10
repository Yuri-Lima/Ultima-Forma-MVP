import { RejectConsentUseCase } from './reject-consent.use-case';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import { AppError } from '@ultima-forma/shared-errors';

describe('RejectConsentUseCase', () => {
  it('should reject consent when pending', async () => {
    const receipt = {
      id: 'receipt-id',
      consentId: 'consent-id',
      approved: false,
      receiptData: {},
      createdAt: new Date(),
    };
    const repo: ConsentRepositoryPort = {
      findConsentById: jest.fn().mockResolvedValue({
        id: 'consent-id',
        dataRequestId: 'request-id',
        status: 'pending',
      }),
      rejectConsent: jest.fn().mockResolvedValue(receipt),
    } as unknown as ConsentRepositoryPort;

    const useCase = new RejectConsentUseCase(repo);
    const result = await useCase.execute('consent-id');

    expect(result.approved).toBe(false);
    expect(repo.rejectConsent).toHaveBeenCalledWith('consent-id');
  });

  it('should throw when consent not found', async () => {
    const repo = {
      findConsentById: jest.fn().mockResolvedValue(null),
    } as unknown as ConsentRepositoryPort;

    const useCase = new RejectConsentUseCase(repo);
    await expect(useCase.execute('invalid')).rejects.toThrow(AppError);
  });
});
