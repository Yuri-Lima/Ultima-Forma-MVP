import { ApproveConsentUseCase } from './approve-consent.use-case';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
import { AppError } from '@ultima-forma/shared-errors';

describe('ApproveConsentUseCase', () => {
  it('should approve consent when pending', async () => {
    const receipt = {
      id: 'receipt-id',
      consentId: 'consent-id',
      approved: true,
      receiptData: {},
      createdAt: new Date(),
    };
    const repo: ConsentRepositoryPort = {
      findConsentById: jest.fn().mockResolvedValue({
        id: 'consent-id',
        dataRequestId: 'request-id',
        status: 'pending',
      }),
      approveConsent: jest.fn().mockResolvedValue(receipt),
    } as unknown as ConsentRepositoryPort;

    const useCase = new ApproveConsentUseCase(repo);
    const result = await useCase.execute('consent-id');

    expect(result).toEqual(receipt);
    expect(repo.approveConsent).toHaveBeenCalledWith('consent-id');
  });

  it('should throw when consent not found', async () => {
    const approveConsent = jest.fn();
    const repo = {
      findConsentById: jest.fn().mockResolvedValue(null),
      approveConsent,
    } as unknown as ConsentRepositoryPort;

    const useCase = new ApproveConsentUseCase(repo);
    await expect(useCase.execute('invalid')).rejects.toThrow(AppError);
    expect(approveConsent).not.toHaveBeenCalled();
  });

  it('should throw when consent already decided', async () => {
    const repo = {
      findConsentById: jest.fn().mockResolvedValue({
        id: 'consent-id',
        status: 'approved',
      }),
    } as unknown as ConsentRepositoryPort;

    const useCase = new ApproveConsentUseCase(repo);
    await expect(useCase.execute('consent-id')).rejects.toThrow(AppError);
  });
});
