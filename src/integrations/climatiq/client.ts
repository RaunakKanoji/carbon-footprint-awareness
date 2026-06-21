import 'server-only';

type ClimatiqRequestOptions = {
  path: string;
  method?: 'GET' | 'POST';
  query?: Record<string, string | number | boolean | undefined>;
  payload?: Record<string, unknown>;
};

export class ClimatiqRequestError extends Error {
  readonly status: number;
  readonly path: string;
  readonly method: string;
  readonly response: unknown;

  constructor({
    status,
    path,
    method,
    response,
  }: {
    status: number;
    path: string;
    method: string;
    response: unknown;
  }) {
    super(`Climatiq request failed with status ${status}`);
    this.name = 'ClimatiqRequestError';
    this.status = status;
    this.path = path;
    this.method = method;
    this.response = response;
  }
}

function buildUrl(baseUrl: string, path: string, query?: ClimatiqRequestOptions['query']) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${normalizedBaseUrl}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseClimatiqResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function callClimatiq({
  path,
  method = 'GET',
  query,
  payload,
}: ClimatiqRequestOptions) {
  const baseUrl = process.env.CLIMATIQ_BASE_URL?.trim();
  const apiKey = process.env.CLIMATIQ_API_KEY?.trim().replace(/^Bearer\s+/i, '');
  const missingVariables = [
    !baseUrl ? 'CLIMATIQ_BASE_URL' : null,
    !apiKey ? 'CLIMATIQ_API_KEY' : null,
    !process.env.CLIMATIQ_DATA_VERSION ? 'CLIMATIQ_DATA_VERSION' : null,
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    throw new Error(`Missing Climatiq environment variables: ${missingVariables.join(', ')}`);
  }

  if (!baseUrl || !apiKey) {
    throw new Error('Missing Climatiq environment variables');
  }

  if (!path) {
    throw new Error('Missing Climatiq endpoint path');
  }

  const response = await fetch(buildUrl(baseUrl, path, query), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: method === 'POST' ? JSON.stringify(payload ?? {}) : undefined,
    cache: 'no-store',
  });

  const data = await parseClimatiqResponse(response);

  if (!response.ok) {
    console.error('Climatiq request failed', {
      status: response.status,
      path,
      method,
      query,
      payload,
      response: data,
    });

    throw new ClimatiqRequestError({
      status: response.status,
      path,
      method,
      response: data,
    });
  }

  return data;
}
