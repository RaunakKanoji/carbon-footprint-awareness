export function parsePossibleNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export function extractCo2eKg(response: unknown): number {
  const source = response as {
    [key: string]: unknown;
    data?: Record<string, unknown>;
    result?: Record<string, unknown>;
  };

  const possibleValues = [
    source?.co2eKg,
    source?.co2e_kg,
    source?.CO2E_KG,
    source?.carbon_kg,
    source?.carbonKg,
    source?.emission_kg,
    source?.emissionKg,
    source?.total_emission_kg,
    source?.totalEmissionKg,
    source?.data?.co2eKg,
    source?.data?.co2e_kg,
    source?.data?.CO2E_KG,
    source?.data?.carbon_kg,
    source?.data?.carbonKg,
    source?.data?.emission_kg,
    source?.data?.total_emission_kg,
    source?.result?.co2eKg,
    source?.result?.carbon_kg,
    source?.result?.emission_kg,
  ];

  for (const possibleValue of possibleValues) {
    const parsed = parsePossibleNumber(possibleValue);
    if (parsed !== null) return parsed;
  }

  throw new Error(`Could not extract CO2e kg from CarbonSutra response: ${JSON.stringify(response)}`);
}
