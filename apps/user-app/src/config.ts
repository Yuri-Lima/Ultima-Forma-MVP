declare const process: { env?: Record<string, string> } | undefined;

export const API_BASE_URL =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3333';

export const PRIVACY_POLICY_URL =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_PRIVACY_POLICY_URL) ||
  'https://ultimaforma.io/privacy';
