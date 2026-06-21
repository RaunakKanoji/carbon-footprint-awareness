export function parsePossibleNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export function extractCo2eKgFromCarbonInterface(response: unknown): number {
  const data = response as {
    data?: { attributes?: Record<string, unknown> };
    attributes?: Record<string, unknown>;
    carbon_kg?: unknown;
    carbonKg?: unknown;
    co2eKg?: unknown;
  };

  const primaryValue = parsePossibleNumber(data?.data?.attributes?.carbon_kg);

  if (primaryValue !== null) {
    return primaryValue;
  }

  const fallbackValues = [
    data?.data?.attributes?.carbon_kg,
    data?.data?.attributes?.carbonKg,
    data?.attributes?.carbon_kg,
    data?.carbon_kg,
    data?.carbonKg,
    data?.co2eKg,
  ];

  for (const value of fallbackValues) {
    const parsed = parsePossibleNumber(value);
    if (parsed !== null) return parsed;
  }

  throw new Error(
    `Could not extract carbon_kg from Carbon Interface response: ${JSON.stringify(response)}`,
  );
}
