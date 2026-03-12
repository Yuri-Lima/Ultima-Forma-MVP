import axios from 'axios';

describe('GET /health', () => {
  it('should return ok status', async () => {
    const res = await axios.get('/health');

    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
    expect(res.data.timestamp).toBeDefined();
    expect(['connected', 'disconnected']).toContain(res.data.db);
  });
});
