import { useCallback, useEffect, useRef, useState } from 'react';

interface UseApiQueryOptions<T> {
  url: string;
  headers?: Record<string, string>;
  enabled?: boolean;
  retries?: number;
  retryDelay?: number;
  transform?: (data: unknown) => T;
}

interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  retries: number,
  retryDelay: number,
  signal: AbortSignal
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers, signal });
      if (res.ok || attempt === retries) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (signal.aborted) throw err;
      lastError = err instanceof Error ? err : new Error('Network error');
      if (attempt === retries) throw lastError;
    }
    await new Promise((r) => setTimeout(r, retryDelay * Math.pow(2, attempt)));
  }
  throw lastError ?? new Error('Fetch failed');
}

export function useApiQuery<T = unknown>({
  url,
  headers = {},
  enabled = true,
  retries = 3,
  retryDelay = 1000,
  transform,
}: UseApiQueryOptions<T>): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(() => {
    if (!enabled) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchWithRetry(url, headers, retries, retryDelay, controller.signal)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(transform ? transform(json) : json);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Request failed');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, [url, enabled, retries, retryDelay, JSON.stringify(headers)]);

  useEffect(() => {
    execute();
    return () => abortRef.current?.abort();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
