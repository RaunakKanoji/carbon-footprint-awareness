export type AgribalyseRawRow = Record<string, unknown>;

export type AgribalyseColumnMapping = {
  agribalyseId?: string;
  ciqualCode?: string;
  foodCode?: string;
  name: string;
  nameFr?: string;
  nameEn?: string;
  category?: string;
  subCategory?: string;
  groupName?: string;
  climateChangeKgCo2ePerKg: string;
  unit?: string;
};

export type NormalizedAgribalyseFoodFactor = {
  agribalyseId?: string;
  ciqualCode?: string;
  foodCode?: string;
  name: string;
  nameFr?: string;
  nameEn?: string;
  category?: string;
  subCategory?: string;
  groupName?: string;
  climateChangeKgCo2ePerKg: number;
  unit: 'kg';
  source: 'AGRIBALYSE';
  version?: string;
  rawRow: AgribalyseRawRow;
};

export type AgribalyseEstimateInput = {
  factorId: string;
  quantityKg: number;
  createActivityLog?: boolean;
  userId?: string;
  sourceContext?: 'MANUAL_FOOD_LOG' | 'BARCODE_SCAN' | 'RECEIPT' | 'MEAL';
};

export type AgribalyseEstimateResult = {
  status: 'ESTIMATED' | 'FACTOR_NOT_FOUND' | 'INVALID_QUANTITY' | 'ERROR';
  co2eKg?: number;
  quantityKg?: number;
  factor?: {
    id: string;
    name: string;
    category?: string;
    climateChangeKgCo2ePerKg: number;
    version?: string;
  };
  provider: 'AGRIBALYSE';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  message?: string;
};

export type AgribalyseMatchResult =
  | {
      status: 'MATCHED';
      confidence: 'LOW' | 'MEDIUM' | 'HIGH';
      score: number;
      factorId: string;
      mappingId?: string;
      defaultQuantityKg?: number;
    }
  | {
      status: 'NO_RELIABLE_MATCH';
      score?: number;
      message: string;
    };
