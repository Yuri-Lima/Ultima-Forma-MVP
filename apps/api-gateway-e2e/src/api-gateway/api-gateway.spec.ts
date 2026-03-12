import axios from 'axios';

const SEED_ISSUER_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

describe('GET /health', () => {
  it('should return ok status', async () => {
    const res = await axios.get('/health');

    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
    expect(res.data.timestamp).toBeDefined();
    expect(['connected', 'disconnected']).toContain(res.data.db);
  });
});

describe('PATCH /v1/issuers/:id', () => {
  it('should update issuer name', async () => {
    const res = await axios.patch(`/v1/issuers/${SEED_ISSUER_ID}`, {
      name: 'Demo Issuer (E2E updated)',
    });

    expect(res.status).toBe(200);
    expect(res.data.name).toBe('Demo Issuer (E2E updated)');
    expect(res.data.id).toBe(SEED_ISSUER_ID);
  });
});
