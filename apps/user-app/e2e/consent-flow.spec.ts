import { test, expect } from '@playwright/test';

const API_URL = process.env['API_URL'] || 'http://localhost:3333';
const TENANT_ID = '21a30170-166d-44e3-ac09-b640768dc1c7';
const CONSUMER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

test.describe('Consent flow E2E', () => {
  test('create request, open consent, approve', async ({ page, request }) => {
    const expiresAt = new Date(Date.now() + 86400000).toISOString();

    const createRes = await request.post(`${API_URL}/v1/data-requests`, {
      data: {
        consumerId: CONSUMER_ID,
        tenantId: TENANT_ID,
        purpose: 'E2E test purpose',
        claims: ['email', 'name'],
        expiresAt,
      },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!createRes.ok()) {
      const body = await createRes.text();
      throw new Error(
        `Failed to create data request: ${createRes.status()} ${body}. ` +
          'Ensure api-gateway is running (pnpm dev:gateway) and db:seed was run.'
      );
    }

    const created = await createRes.json();
    const requestId = created.id;
    expect(requestId).toBeDefined();

    const consentUrl = `${process.env['BASE_URL'] || 'http://localhost:8081'}/consent/${requestId}`;
    await page.goto(consentUrl, { waitUntil: 'networkidle' });

    await expect(page.getByText('Solicitação de Dados')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Demo Consumer')).toBeVisible();
    await expect(page.getByText('E2E test purpose')).toBeVisible();

    await page.getByRole('button', { name: 'Aprovar' }).click();

    await expect(page.getByText('Consentimento Aprovado')).toBeVisible();
    await expect(page.getByText('Os dados foram compartilhados')).toBeVisible();
  });
});
