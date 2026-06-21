import 'server-only';

type OpenFoodFactsRequestOptions = {
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(
  baseUrl: string,
  path: string,
  query?: OpenFoodFactsRequestOptions['query'],
) {
  const url = new URL(`${baseUrl}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function callOpenFoodFacts({ path, query }: OpenFoodFactsRequestOptions) {
  const baseUrl =
    process.env.OPEN_FOOD_FACTS_BASE_URL || 'https://world.openfoodfacts.org';

  const userAgent = process.env.OPEN_FOOD_FACTS_USER_AGENT;

  if (!userAgent) {
    throw new Error('Missing OPEN_FOOD_FACTS_USER_AGENT environment variable');
  }

  const response = await fetch(buildUrl(baseUrl, path, query), {
    method: 'GET',
    headers: {
      'User-Agent': userAgent,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('Open Food Facts request failed', {
      status: response.status,
      path,
      query,
      response: data,
    });

    throw new Error(`Open Food Facts request failed with status ${response.status}`);
  }

  return data;
}
