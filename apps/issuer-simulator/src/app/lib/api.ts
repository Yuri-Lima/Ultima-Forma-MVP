const GATEWAY_URL =
  (import.meta as Record<string, Record<string, string>>).env?.['VITE_GATEWAY_URL'] ??
  'http://localhost:3333';

export async function ingestData(
  issuerId: string,
  data: { cpf: string; phone: string; extraFields: string[] }
) {
  const res = await fetch(`${GATEWAY_URL}/v1/issuers/${issuerId}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Ingest failed: ${res.status}`);
  }
  return res.json();
}

export async function getSubmissionForIssuer(
  issuerId: string,
  cpf: string
): Promise<{
  cpf: string;
  phone: string;
  extraFields: string[];
} | null> {
  const res = await fetch(
    `${GATEWAY_URL}/v1/issuers/${issuerId}/ingest?cpf=${encodeURIComponent(cpf)}`
  );
  if (!res.ok) return null;
  return res.json();
}

export async function pushDataToWallet(
  userId: string,
  requestToken: string,
  fields: { name: string; value: string }[]
) {
  const res = await fetch(
    `${GATEWAY_URL}/v1/clients/${userId}/wallet/receive`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestToken, fields }),
    }
  );
  if (!res.ok) {
    throw new Error(`Wallet receive failed: ${res.status}`);
  }
  return res.json();
}

export { GATEWAY_URL };
