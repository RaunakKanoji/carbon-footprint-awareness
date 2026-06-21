export type ClimatiqEndpointKey = 'search' | 'estimate' | 'batchEstimate';

export type ClimatiqEmissionFactorSelector = {
  id?: string;
  activity_id?: string;
  data_version?: string;
  region?: string;
  year?: number;
  source?: string;
  source_dataset?: string;
  source_lca_activity?: string;
};

export type ClimatiqParameters = {
  distance?: number;
  distance_unit?: 'm' | 'km' | 'mi';
  weight?: number;
  weight_unit?: 'g' | 'kg' | 't' | 'lb';
  energy?: number;
  energy_unit?: 'Wh' | 'kWh' | 'MWh' | 'MJ' | 'GJ';
  volume?: number;
  volume_unit?: string;
  money?: number;
  money_unit?: string;
  area?: number;
  area_unit?: string;
  time?: number;
  time_unit?: string;
  number?: number;
  number_unit?: string;
  passengers?: number;
  passenger_unit?: string;
  [key: string]: unknown;
};

export type ClimatiqEstimatePayload = {
  emission_factor: ClimatiqEmissionFactorSelector;
  parameters: ClimatiqParameters;
  apply_inflation_adjustment?: number;
};

export type ClimatiqBatchEstimatePayload = {
  emission_factors: ClimatiqEstimatePayload[];
};

export type ClimatiqSearchParams = {
  data_version?: string;
  query?: string;
  activity_id?: string;
  id?: string;
  category?: string;
  sector?: string;
  source?: string;
  source_dataset?: string;
  year?: number;
  region?: string;
  unit_type?: string;
  source_lca_activity?: string;
  calculation_method?: 'ar4' | 'ar5' | 'ar6';
  allowed_data_quality_flags?: string;
  access_type?: 'public' | 'private' | 'premium';
  page?: number;
  results_per_page?: number;
};

export type ClimatiqRawEstimateResponse = {
  co2e?: number | string;
  co2e_unit?: string;
  co2e_calculation_method?: string;
  co2e_calculation_origin?: string;
  emission_factor?: {
    id?: string;
    activity_id?: string;
    name?: string;
    source?: string;
    source_dataset?: string;
    year?: number;
    region?: string;
    category?: string;
    sector?: string;
    unit_type?: string;
    source_lca_activity?: string;
    data_quality_flags?: string[];
  };
  constituent_gases?: Record<string, unknown>;
  activity_data?: Record<string, unknown>;
  audit_trail?: string;
  notices?: unknown[];
};

export type NormalizedClimatiqEstimate = {
  co2eKg: number;
  provider: 'CLIMATIQ';
  endpoint: ClimatiqEndpointKey;
  payload: Record<string, unknown>;
  response: unknown;
  fromCache: boolean;
  emissionFactor?: {
    id?: string;
    activityId?: string;
    name?: string;
    source?: string;
    dataset?: string;
    region?: string;
    year?: number;
    category?: string;
    sector?: string;
    unitType?: string;
  };
};
