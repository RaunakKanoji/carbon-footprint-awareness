import 'server-only';

type CarbonSutraRequestOptions = {
  path: string;
  payload: Record<string, unknown>;
};

type CarbonSutraRequestErrorOptions = {
  status: number;
  path: string;
  response: unknown;
};

export class CarbonSutraRequestError extends Error {
  readonly status: number;
  readonly path: string;
  readonly response: unknown;

  constructor({ status, path, response }: CarbonSutraRequestErrorOptions) {
    super(`CarbonSutra request failed with status ${status}`);
    this.name = 'CarbonSutraRequestError';
    this.status = status;
    this.path = path;
    this.response = response;
  }
}

function buildCarbonSutraUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

async function parseCarbonSutraResponse(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function normalizeCarbonSutraPayload({
  path,
  payload,
}: {
  path: string;
  payload: Record<string, unknown>;
}) {
  const normalizedPayload = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key.toLowerCase(), value]),
  );

  const isFreightRequest = path.includes('freight');
  const isFuelRequest = path.includes('fuel');

  if (
    'package_weight_value' in normalizedPayload &&
    !('package_weight' in normalizedPayload)
  ) {
    normalizedPayload.package_weight = normalizedPayload.package_weight_value;
  }

  if ('include_rf' in normalizedPayload && !('add_rf' in normalizedPayload)) {
    normalizedPayload.add_rf = normalizedPayload.include_rf;
  }

  if ('transport_method' in normalizedPayload && !('transport_mode' in normalizedPayload)) {
    normalizedPayload.transport_mode = normalizedPayload.transport_method;
  }

  if ('weight_value' in normalizedPayload && !('freight_weight' in normalizedPayload)) {
    normalizedPayload.freight_weight = normalizedPayload.weight_value;
  }

  if (isFuelRequest) {
    if (!('fuel_usage' in normalizedPayload)) {
      normalizedPayload.fuel_usage = 'transport';
    }

    if ('fuel_type' in normalizedPayload && !('fuel_name' in normalizedPayload)) {
      normalizedPayload.fuel_name =
        normalizedPayload.fuel_type === 'Petrol'
          ? 'Regular Petrol'
          : normalizedPayload.fuel_type;
    }
  }

  delete normalizedPayload.package_weight_value;
  delete normalizedPayload.package_weight_unit;
  delete normalizedPayload.include_rf;

  if (isFreightRequest) {
    delete normalizedPayload.transport_method;
    delete normalizedPayload.weight_value;
    delete normalizedPayload.weight_unit;
    delete normalizedPayload.distance_unit;
  }

  if (isFuelRequest) {
    delete normalizedPayload.fuel_type;
    delete normalizedPayload.fuel_unit;
    delete normalizedPayload.include_wtt;
  }

  return normalizedPayload;
}

export async function callCarbonSutra({ path, payload }: CarbonSutraRequestOptions) {
  const baseUrl = process.env.CARBONSUTRA_BASE_URL;
  const apiKey = process.env.CARBONSUTRA_API_KEY;
  const apiHost = process.env.CARBONSUTRA_API_HOST;

  if (!baseUrl || !apiKey || !apiHost) {
    throw new Error('Missing CarbonSutra environment variables');
  }

  if (!path) {
    throw new Error('Missing CarbonSutra endpoint path');
  }

  const requestPayload = normalizeCarbonSutraPayload({ path, payload });

  const response = await fetch(buildCarbonSutraUrl(baseUrl, path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': apiHost,
    },
    body: JSON.stringify(requestPayload),
    cache: 'no-store',
  });

  const data = await parseCarbonSutraResponse(response);

  if (!response.ok) {
    console.error('CarbonSutra request failed', {
      status: response.status,
      path,
      payload: requestPayload,
      response: data,
    });

    throw new CarbonSutraRequestError({
      status: response.status,
      path,
      response: data,
    });
  }

  return data;
}
