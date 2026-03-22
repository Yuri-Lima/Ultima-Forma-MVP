const API_BASE =
  import.meta.env['VITE_API_URL'] ?? 'http://localhost:3333';

interface PartnerCredentials {
  partnerId: string;
  clientSecret: string;
}

let storedCredentials: PartnerCredentials | null = null;

export function setCredentials(creds: PartnerCredentials) {
  storedCredentials = creds;
  sessionStorage.setItem('uf-partner-creds', JSON.stringify(creds));
}

export function getCredentials(): PartnerCredentials | null {
  if (storedCredentials) return storedCredentials;
  const raw = sessionStorage.getItem('uf-partner-creds');
  if (raw) {
    storedCredentials = JSON.parse(raw);
    return storedCredentials;
  }
  return null;
}

export function clearCredentials() {
  storedCredentials = null;
  sessionStorage.removeItem('uf-partner-creds');
}

export function isAuthenticated(): boolean {
  return getCredentials() !== null;
}

export function withPartnerId(path: string): string {
  const creds = getCredentials();
  if (!creds) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}partnerId=${creds.partnerId}`;
}

async function computeHmac(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Returns ISO 8601 timestamp with sub-ms fractional seconds to avoid REPLAY_DETECTED when multiple requests fire in the same millisecond. */
function getUniqueTimestamp(): string {
  const base = new Date().toISOString();
  const frac = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return base.replace(/(\.\d{3})Z$/, (_, ms) => ms + frac + 'Z');
}

export async function signedFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const creds = getCredentials();
  if (!creds) throw new Error('Not authenticated');

  const timestamp = getUniqueTimestamp();
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? String(options.body) : '';
  const pathWithoutQuery = path.split('?')[0];
  const payload = method + pathWithoutQuery + body + timestamp;
  const signature = await computeHmac(creds.clientSecret, payload);

  const headers = new Headers(options.headers);
  headers.set('x-partner-id', creds.partnerId);
  headers.set('x-timestamp', timestamp);
  headers.set('x-signature', signature);
  headers.set('Content-Type', 'application/json');

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}
