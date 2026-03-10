declare const process: { env?: Record<string, string> } | undefined;

export const API_BASE_URL =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3333';
