export interface EndpointDef {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  body?: Record<string, unknown>;
}

function jsonStr(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2);
}

export function generateCurl(ep: EndpointDef, partnerId: string): string {
  const lines = [`curl -X ${ep.method} \\`, `  'http://localhost:3333${ep.path}' \\`];
  if (ep.auth) {
    lines.push(`  -H 'x-partner-id: ${partnerId}' \\`);
    lines.push(`  -H 'x-timestamp: <TIMESTAMP>' \\`);
    lines.push(`  -H 'x-signature: <HMAC_SIGNATURE>' \\`);
  }
  lines.push(`  -H 'Content-Type: application/json'`);
  if (ep.body) {
    lines[lines.length - 1] += ' \\';
    lines.push(`  -d '${jsonStr(ep.body)}'`);
  }
  return lines.join('\n');
}

export function generateNode(ep: EndpointDef, partnerId: string): string {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ep.auth) {
    headers['x-partner-id'] = partnerId;
    headers['x-timestamp'] = '<TIMESTAMP>';
    headers['x-signature'] = '<HMAC_SIGNATURE>';
  }
  const opts: Record<string, unknown> = {
    method: ep.method,
    headers,
  };
  if (ep.body) opts['body'] = 'JSON.stringify(body)';

  let code = '';
  if (ep.body) {
    code += `const body = ${jsonStr(ep.body)};\n\n`;
  }
  code += `const response = await fetch('http://localhost:3333${ep.path}', {\n`;
  code += `  method: '${ep.method}',\n`;
  code += `  headers: ${jsonStr(headers)},\n`;
  if (ep.body) code += `  body: JSON.stringify(body),\n`;
  code += `});\n\nconst data = await response.json();\nconsole.log(data);`;
  return code;
}

export function generatePython(ep: EndpointDef, partnerId: string): string {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ep.auth) {
    headers['x-partner-id'] = partnerId;
    headers['x-timestamp'] = '<TIMESTAMP>';
    headers['x-signature'] = '<HMAC_SIGNATURE>';
  }

  let code = 'import requests\n\n';
  code += `url = "http://localhost:3333${ep.path}"\n`;
  code += `headers = ${JSON.stringify(headers, null, 4).replace(/"/g, '"')}\n`;
  if (ep.body) {
    code += `payload = ${jsonStr(ep.body)}\n`;
  }
  code += `\nresponse = requests.${ep.method.toLowerCase()}(\n`;
  code += `    url,\n`;
  code += `    headers=headers,\n`;
  if (ep.body) code += `    json=payload,\n`;
  code += `)\n\nprint(response.json())`;
  return code;
}

export const API_ENDPOINTS: EndpointDef[] = [
  {
    method: 'POST',
    path: '/v1/data-requests',
    description: 'Create a new data request. Requires consumer ID, user subject, purpose, and requested claims.',
    auth: true,
    body: {
      consumerId: '<CONSUMER_ID>',
      userSubjectId: '<USER_SUBJECT_ID>',
      purpose: 'Identity verification',
      claims: ['full_name', 'date_of_birth'],
    },
  },
  {
    method: 'GET',
    path: '/v1/data-requests/:id',
    description: 'Retrieve a data request by ID. Returns request details, consumer info, and claim items.',
    auth: false,
  },
  {
    method: 'GET',
    path: '/v1/data-requests/:id/result',
    description: 'Get the result of a completed data request. Returns verified claims data.',
    auth: true,
  },
  {
    method: 'POST',
    path: '/v1/consents/:id/approve',
    description: 'Approve a consent request on behalf of the user.',
    auth: false,
  },
  {
    method: 'POST',
    path: '/v1/consents/:id/reject',
    description: 'Reject a consent request on behalf of the user.',
    auth: false,
  },
  {
    method: 'POST',
    path: '/v1/consents/:id/revoke',
    description: 'Revoke a previously granted consent.',
    auth: false,
  },
  {
    method: 'POST',
    path: '/v1/claims',
    description: 'Register a new claim definition with schema, sensitivity level, and namespace.',
    auth: true,
    body: {
      key: 'email_address',
      displayName: 'Email Address',
      namespace: 'contact',
      sensitivityLevel: 'medium',
      jsonSchema: { type: 'string', format: 'email' },
    },
  },
  {
    method: 'GET',
    path: '/v1/claims',
    description: 'List all registered claim definitions.',
    auth: true,
  },
  {
    method: 'GET',
    path: '/v1/partner/dashboard',
    description: 'Get partner dashboard summary with request and consent statistics.',
    auth: true,
  },
  {
    method: 'GET',
    path: '/v1/partner/requests',
    description: 'List data requests for the authenticated partner. Supports status filter and pagination.',
    auth: true,
  },
  {
    method: 'GET',
    path: '/v1/partner/credentials',
    description: 'Get current API credentials for the partner.',
    auth: true,
  },
  {
    method: 'POST',
    path: '/v1/partner/credentials/rotate',
    description: 'Rotate API credentials. Returns new clientId and clientSecret.',
    auth: true,
  },
  {
    method: 'GET',
    path: '/v1/partner/webhooks',
    description: 'List webhook subscriptions for the partner.',
    auth: true,
  },
  {
    method: 'POST',
    path: '/v1/partner/webhooks',
    description: 'Create a new webhook subscription.',
    auth: true,
    body: {
      url: 'https://example.com/webhook',
      eventTypes: ['consent.approved', 'consent.rejected'],
    },
  },
  {
    method: 'POST',
    path: '/v1/subjects',
    description: 'Register a new user subject in the wallet.',
    auth: true,
    body: {
      externalId: '<EXTERNAL_USER_ID>',
      tenantId: '<TENANT_ID>',
    },
  },
];
