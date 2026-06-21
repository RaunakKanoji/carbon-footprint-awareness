import 'server-only';

type CarbonInterfaceRequestOptions = {
  path: string;
  method?: 'GET' | 'POST';
  payload?: Record<string, unknown>;
};

export class CarbonInterfaceRequestError extends Error {
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
    super(`Carbon Interface request failed with status ${status}`);
    this.name = 'CarbonInterfaceRequestError';
    this.status = status;
    this.path = path;
    this.method = method;
    this.response = response;
  }
}

function buildCarbonInterfaceUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

async function parseCarbonInterfaceResponse(response: Response) {
  const responseText = await response.text();
  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

export async function callCarbonInterface({
  path,
  method = 'GET',
  payload,
}: CarbonInterfaceRequestOptions) {
  const baseUrl = process.env.CARBON_INTERFACE_BASE_URL?.trim();
  const apiKey = process.env.CARBON_INTERFACE_API_KEY?.trim().replace(/^Bearer\s+/i, '');
  const missingVariables = [
    !baseUrl ? 'CARBON_INTERFACE_BASE_URL' : null,
    !apiKey ? 'CARBON_INTERFACE_API_KEY' : null,
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing Carbon Interface environment variables: ${missingVariables.join(', ')}`,
    );
  }

  if (!baseUrl || !apiKey) {
    throw new Error('Missing Carbon Interface environment variables');
  }

  if (!path) {
    throw new Error('Missing Carbon Interface endpoint path');
  }

  const response = await fetch(buildCarbonInterfaceUrl(baseUrl, path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: method === 'POST' ? JSON.stringify(payload ?? {}) : undefined,
    cache: 'no-store',
  });

  const data = await parseCarbonInterfaceResponse(response);

  if (!response.ok) {
    console.error('Carbon Interface request failed', {
      status: response.status,
      path,
      method,
      payload,
      response: data,
    });

    throw new CarbonInterfaceRequestError({
      status: response.status,
      path,
      method,
      response: data,
    });
  }

  return data;
}
