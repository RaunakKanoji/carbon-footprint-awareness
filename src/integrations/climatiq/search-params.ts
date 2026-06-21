import { DEFAULT_CLIMATIQ_DATA_VERSION } from './constants';
import type { ClimatiqSearchParams } from './types';

export function buildClimatiqSearchParams(input: ClimatiqSearchParams) {
  return {
    data_version: input.data_version ?? DEFAULT_CLIMATIQ_DATA_VERSION,
    query: input.query,
    activity_id: input.activity_id,
    id: input.id,
    category: input.category,
    sector: input.sector,
    source: input.source,
    source_dataset: input.source_dataset,
    year: input.year,
    region: input.region,
    unit_type: input.unit_type,
    source_lca_activity: input.source_lca_activity,
    calculation_method: input.calculation_method,
    allowed_data_quality_flags: input.allowed_data_quality_flags,
    access_type: input.access_type,
    page: input.page ?? 1,
    results_per_page: input.results_per_page ?? 20,
  };
}
