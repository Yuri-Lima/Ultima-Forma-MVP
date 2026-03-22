import { WebhookHttpDeliveryService } from './webhook-http-delivery.service';

const mockFetch = jest.fn();

describe('WebhookHttpDeliveryService', () => {
  let service: WebhookHttpDeliveryService;

  beforeAll(() => {
    service = new WebhookHttpDeliveryService();
    global.fetch = mockFetch;
  });

  beforeEach(() => jest.clearAllMocks());

  it('should return success when HTTP response is ok', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    const delivery = {
      id: 'del-1',
      subscriptionId: 'sub-1',
      eventType: 'issuer.updated',
      payload: { test: true },
      status: 'pending' as const,
      attempts: 0,
      lastError: null,
      nextRetryAt: null,
      succeededAt: null,
      createdAt: new Date(),
    };

    const result = await service.deliver(
      delivery,
      'https://example.com/webhook',
      null
    );

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(delivery.payload),
      })
    );
  });

  it('should return failure when HTTP response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    const delivery = {
      id: 'del-1',
      subscriptionId: 'sub-1',
      eventType: 'issuer.updated',
      payload: {},
      status: 'pending' as const,
      attempts: 0,
      lastError: null,
      nextRetryAt: null,
      succeededAt: null,
      createdAt: new Date(),
    };

    const result = await service.deliver(
      delivery,
      'https://example.com/webhook',
      null
    );

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(500);
    expect(result.error).toContain('HTTP 500');
  });

  it('should include HMAC signature when secret is provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    const delivery = {
      id: 'del-1',
      subscriptionId: 'sub-1',
      eventType: 'issuer.updated',
      payload: { data: 'test' },
      status: 'pending' as const,
      attempts: 0,
      lastError: null,
      nextRetryAt: null,
      succeededAt: null,
      createdAt: new Date(),
    };

    await service.deliver(
      delivery,
      'https://example.com/webhook',
      'my-secret'
    );

    const call = mockFetch.mock.calls[0];
    const headers = call[1].headers as Record<string, string>;
    expect(headers['X-Webhook-Signature']).toBeDefined();
    expect(headers['X-Webhook-Signature']).toMatch(/^sha256=[a-f0-9]+$/);
  });
});
