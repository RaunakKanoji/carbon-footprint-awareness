import { AGRIBALYSE_COLUMN_ALIASES, AGRIBALYSE_PROVIDER, AGRIBALYSE_UNIT } from './constants';
import type {
  AgribalyseColumnMapping,
  AgribalyseRawRow,
  NormalizedAgribalyseFoodFactor,
} from './types';

type MappingKey = keyof AgribalyseColumnMapping;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function parseLocalizedNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const cleaned = value.trim().replace(',', '.');
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function detectColumnMapping(headers: string[]): Partial<AgribalyseColumnMapping> {
  const normalizedHeaders = new Map(headers.map((header) => [normalizeHeader(header), header]));
  const mapping: Partial<AgribalyseColumnMapping> = {};

  for (const [key, aliases] of Object.entries(AGRIBALYSE_COLUMN_ALIASES) as Array<[
    MappingKey,
    readonly string[],
  ]>) {
    for (const alias of aliases) {
      const header = normalizedHeaders.get(normalizeHeader(alias));
      if (header) {
        mapping[key] = header;
        break;
      }
    }
  }

  return mapping;
}

export function validateColumnMapping(mapping: Partial<AgribalyseColumnMapping>) {
  const missing = ['name', 'climateChangeKgCo2ePerKg'].filter(
    (key) => !mapping[key as keyof AgribalyseColumnMapping],
  );

  return { valid: missing.length === 0, missing };
}

export function mapRawRowToNormalizedFactor(input: {
  row: AgribalyseRawRow;
  mapping: AgribalyseColumnMapping;
  version?: string;
}): NormalizedAgribalyseFoodFactor | null {
  const name = optionalString(input.row[input.mapping.name]);
  const climate = parseLocalizedNumber(input.row[input.mapping.climateChangeKgCo2ePerKg]);

  if (!name || climate === null || climate < 0) return null;

  return {
    agribalyseId: input.mapping.agribalyseId
      ? optionalString(input.row[input.mapping.agribalyseId])
      : undefined,
    ciqualCode: input.mapping.ciqualCode
      ? optionalString(input.row[input.mapping.ciqualCode])
      : undefined,
    foodCode: input.mapping.foodCode ? optionalString(input.row[input.mapping.foodCode]) : undefined,
    name,
    nameFr: input.mapping.nameFr ? optionalString(input.row[input.mapping.nameFr]) : undefined,
    nameEn: input.mapping.nameEn ? optionalString(input.row[input.mapping.nameEn]) : undefined,
    category: input.mapping.category
      ? optionalString(input.row[input.mapping.category])
      : undefined,
    subCategory: input.mapping.subCategory
      ? optionalString(input.row[input.mapping.subCategory])
      : undefined,
    groupName: input.mapping.groupName
      ? optionalString(input.row[input.mapping.groupName])
      : undefined,
    climateChangeKgCo2ePerKg: climate,
    unit: AGRIBALYSE_UNIT,
    source: AGRIBALYSE_PROVIDER,
    version: input.version,
    rawRow: input.row,
  };
}
