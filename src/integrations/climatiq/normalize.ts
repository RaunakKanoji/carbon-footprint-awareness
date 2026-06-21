export function parsePossibleNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export function normalizeClimatiqCo2eToKg(response: unknown): number {
  const data = response as { co2e?: unknown; co2e_unit?: unknown };
  const co2e = parsePossibleNumber(data?.co2e);

  if (co2e === null) {
    throw new Error(`Could not extract co2e from Climatiq response: ${JSON.stringify(response)}`);
  }

  const unit = String(data?.co2e_unit || 'kg').toLowerCase();

  if (unit === 'kg' || unit === 'kgco2e' || unit === 'kg co2e') {
    return co2e;
  }

  if (unit === 't' || unit === 'tonne' || unit === 'tonnes' || unit === 'mt') {
    return co2e * 1000;
  }

  if (unit === 'g' || unit === 'gco2e') {
    return co2e / 1000;
  }

  throw new Error(`Unsupported Climatiq co2e_unit: ${data?.co2e_unit}`);
}

export function extractClimatiqEmissionFactorMetadata(response: unknown) {
  const factor = (response as { emission_factor?: Record<string, unknown> })?.emission_factor;

  if (!factor) return undefined;

  return {
    id: typeof factor.id === 'string' ? factor.id : undefined,
    activityId: typeof factor.activity_id === 'string' ? factor.activity_id : undefined,
    name: typeof factor.name === 'string' ? factor.name : undefined,
    source: typeof factor.source === 'string' ? factor.source : undefined,
    dataset: typeof factor.source_dataset === 'string' ? factor.source_dataset : undefined,
    region: typeof factor.region === 'string' ? factor.region : undefined,
    year: typeof factor.year === 'number' ? factor.year : undefined,
    category: typeof factor.category === 'string' ? factor.category : undefined,
    sector: typeof factor.sector === 'string' ? factor.sector : undefined,
    unitType: typeof factor.unit_type === 'string' ? factor.unit_type : undefined,
  };
}
