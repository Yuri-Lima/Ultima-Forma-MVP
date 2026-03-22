import { AsyncWebhookDispatcher } from './async-webhook-dispatcher';
import type {
  WebhookSubscriptionRepositoryPort,
  WebhookDeliveryRepositoryPort,
} from '@ultima-forma/domain-webhook';
import type { JobRepositoryPort } from '@ultima-forma/domain-jobs';

describe('AsyncWebhookDispatcher', () => {
  const mockSubRepo: jest.Mocked<WebhookSubscriptionRepositoryPort> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByPartnerId: jest.fn(),
    findActiveByEventType: jest.fn(),
    findActiveByPartnerAndEventType: jest.fn(),
  };

  const mockDeliveryRepo: jest.Mocked<WebhookDeliveryRepositoryPort> = {
    create: jest.fn(),
    findById: jest.fn(),
    findPendingForRetry: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockJobRepo: jest.Mocked<JobRepositoryPort> = {
    enqueue: jest.fn(),
  };

  const dispatcher = new AsyncWebhookDispatcher(
    mockSubRepo,
    mockDeliveryRepo,
    mockJobRepo
  );

  beforeEach(() => jest.clearAllMocks());

  it('should create delivery and enqueue job for each active subscription', async () => {
    mockSubRepo.findActiveByPartnerAndEventType.mockResolvedValue([
      {
        id: 'sub-1',
        partnerId: 'partner-1',
        url: 'https://example.com/webhook',
        secret: 'secret',
        eventTypes: ['issuer.updated'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    mockDeliveryRepo.create.mockResolvedValue({
      id: 'delivery-1',
      subscriptionId: 'sub-1',
      eventType: 'issuer.updated',
      payload: {},
      status: 'pending',
      attempts: 0,
      lastError: null,
      nextRetryAt: null,
      succeededAt: null,
      createdAt: new Date(),
    });

    mockJobRepo.enqueue.mockResolvedValue({ jobId: 'job-1' });

    await dispatcher.dispatch('partner-1', {
      eventType: 'issuer.updated',
      aggregateType: 'issuer',
      aggregateId: 'issuer-1',
      payload: { name: 'Updated' },
      occurredAt: new Date(),
    });

    expect(mockSubRepo.findActiveByPartnerAndEventType).toHaveBeenCalledWith(
      'partner-1',
      'issuer.updated'
    );
    expect(mockDeliveryRepo.create).toHaveBeenCalledTimes(1);
    expect(mockDeliveryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionId: 'sub-1',
        eventType: 'issuer.updated',
      })
    );
    expect(mockJobRepo.enqueue).toHaveBeenCalledWith(
      'webhook.delivery',
      { deliveryId: 'delivery-1', subscriptionId: 'sub-1' },
      { maxAttempts: 5 }
    );
  });

  it('should create deliveries for multiple subscriptions', async () => {
    mockSubRepo.findActiveByPartnerAndEventType.mockResolvedValue([
      {
        id: 'sub-1',
        partnerId: 'partner-1',
        url: 'https://example.com/a',
        secret: null,
        eventTypes: ['issuer.updated'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'sub-2',
        partnerId: 'partner-1',
        url: 'https://example.com/b',
        secret: null,
        eventTypes: ['issuer.updated'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    mockDeliveryRepo.create
      .mockResolvedValueOnce({
        id: 'delivery-1',
        subscriptionId: 'sub-1',
        eventType: 'issuer.updated',
        payload: {},
        status: 'pending',
        attempts: 0,
        lastError: null,
        nextRetryAt: null,
        succeededAt: null,
        createdAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: 'delivery-2',
        subscriptionId: 'sub-2',
        eventType: 'issuer.updated',
        payload: {},
        status: 'pending',
        attempts: 0,
        lastError: null,
        nextRetryAt: null,
        succeededAt: null,
        createdAt: new Date(),
      });

    mockJobRepo.enqueue
      .mockResolvedValueOnce({ jobId: 'job-1' })
      .mockResolvedValueOnce({ jobId: 'job-2' });

    await dispatcher.dispatch('partner-1', {
      eventType: 'issuer.updated',
      aggregateType: 'issuer',
      aggregateId: 'issuer-1',
      payload: {},
      occurredAt: new Date(),
    });

    expect(mockDeliveryRepo.create).toHaveBeenCalledTimes(2);
    expect(mockJobRepo.enqueue).toHaveBeenCalledTimes(2);
  });

  it('should do nothing when no subscriptions exist', async () => {
    mockSubRepo.findActiveByPartnerAndEventType.mockResolvedValue([]);

    await dispatcher.dispatch('partner-1', {
      eventType: 'issuer.updated',
      aggregateType: 'issuer',
      aggregateId: 'issuer-1',
      payload: {},
      occurredAt: new Date(),
    });

    expect(mockDeliveryRepo.create).not.toHaveBeenCalled();
    expect(mockJobRepo.enqueue).not.toHaveBeenCalled();
  });
});
