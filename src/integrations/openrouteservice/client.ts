import 'server-only';

type OrsRequestOptions = {
  path: string;
  method?: 'GET' | 'POST';
  query?: Record<string, string | number | boolean | undefined>;
  payload?: Record<string, unknown>;
};

export class OpenRouteServiceRequestError extends Error {
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
    super(`OpenRouteService request failed with status ${status}`);
    this.name = 'OpenRouteServiceRequestError';
    this.status = status;
    this.path = path;
    this.method = method;
    this.response = response;
  }
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: OrsRequestOptions['query']
) {
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

async function parseOrsResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function callOpenRouteService({
  path,
  method = 'GET',
  query,
  payload,
}: OrsRequestOptions) {
  const baseUrl = process.env.OPENROUTESERVICE_BASE_URL?.trim();
  const apiKey = process.env.OPENROUTESERVICE_API_KEY?.trim();

  const missingVariables = [
    !baseUrl ? 'OPENROUTESERVICE_BASE_URL' : null,
    !apiKey ? 'OPENROUTESERVICE_API_KEY' : null,
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    throw new Error(`Missing OpenRouteService environment variables: ${missingVariables.join(', ')}`);
  }

  if (!baseUrl || !apiKey) {
    throw new Error('Missing OpenRouteService environment variables');
  }

  if (!path) {
    throw new Error('Missing OpenRouteService endpoint path');
  }

  const url = buildUrl(baseUrl, path, query);

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: method === 'POST' ? JSON.stringify(payload ?? {}) : undefined,
    cache: 'no-store',
  });

  const data = await parseOrsResponse(response);

  if (!response.ok) {
    console.error('OpenRouteService request failed', {
      status: response.status,
      path,
      method,
      query,
      payload,
      response: data,
    });

    throw new OpenRouteServiceRequestError({
      status: response.status,
      path,
      method,
      response: data,
    });
  }

  return data;
}
