import { DEFAULT_CLIMATIQ_DATA_VERSION } from './constants';
import type {
  ClimatiqEmissionFactorSelector,
  ClimatiqEstimatePayload,
  ClimatiqParameters,
} from './types';

export function buildClimatiqEstimatePayload(input: {
  emissionFactor: ClimatiqEmissionFactorSelector;
  parameters: ClimatiqParameters;
  applyInflationAdjustment?: number;
}): ClimatiqEstimatePayload {
  return {
    emission_factor: {
      ...input.emissionFactor,
      data_version: input.emissionFactor.data_version ?? DEFAULT_CLIMATIQ_DATA_VERSION,
    },
    parameters: input.parameters,
    ...(input.applyInflationAdjustment
      ? { apply_inflation_adjustment: input.applyInflationAdjustment }
      : {}),
  };
}

export function buildTransportDistancePayload(input: {
  activityId: string;
  dataVersion?: string;
  region?: string;
  distanceValue: number;
  distanceUnit: 'm' | 'km' | 'mi';
}) {
  return buildClimatiqEstimatePayload({
    emissionFactor: {
      activity_id: input.activityId,
      data_version: input.dataVersion,
      region: input.region,
    },
    parameters: {
      distance: input.distanceValue,
      distance_unit: input.distanceUnit,
    },
  });
}

export function buildElectricityPayload(input: {
  activityId: string;
  dataVersion?: string;
  region?: string;
  energyValue: number;
  energyUnit: 'Wh' | 'kWh' | 'MWh';
}) {
  return buildClimatiqEstimatePayload({
    emissionFactor: {
      activity_id: input.activityId,
      data_version: input.dataVersion,
      region: input.region,
    },
    parameters: {
      energy: input.energyValue,
      energy_unit: input.energyUnit,
    },
  });
}

export function buildFuelPayload(input: {
  activityId: string;
  dataVersion?: string;
  region?: string;
  volumeValue?: number;
  volumeUnit?: string;
  energyValue?: number;
  energyUnit?: 'Wh' | 'kWh' | 'MWh' | 'MJ' | 'GJ';
  weightValue?: number;
  weightUnit?: 'g' | 'kg' | 't' | 'lb';
}) {
  const parameters: ClimatiqParameters = {};

  if (input.volumeValue !== undefined) {
    parameters.volume = input.volumeValue;
    parameters.volume_unit = input.volumeUnit;
  }

  if (input.energyValue !== undefined) {
    parameters.energy = input.energyValue;
    parameters.energy_unit = input.energyUnit;
  }

  if (input.weightValue !== undefined) {
    parameters.weight = input.weightValue;
    parameters.weight_unit = input.weightUnit;
  }

  return buildClimatiqEstimatePayload({
    emissionFactor: {
      activity_id: input.activityId,
      data_version: input.dataVersion,
      region: input.region,
    },
    parameters,
  });
}

export function buildSpendBasedPayload(input: {
  activityId: string;
  dataVersion?: string;
  region?: string;
  moneyValue: number;
  moneyUnit: string;
  spentYear?: number;
}) {
  return buildClimatiqEstimatePayload({
    emissionFactor: {
      activity_id: input.activityId,
      data_version: input.dataVersion,
      region: input.region,
    },
    parameters: {
      money: input.moneyValue,
      money_unit: input.moneyUnit,
    },
    applyInflationAdjustment: input.spentYear,
  });
}

export function buildProductWeightPayload(input: {
  activityId: string;
  dataVersion?: string;
  region?: string;
  weightValue: number;
  weightUnit: 'g' | 'kg' | 't' | 'lb';
}) {
  return buildClimatiqEstimatePayload({
    emissionFactor: {
      activity_id: input.activityId,
      data_version: input.dataVersion,
      region: input.region,
    },
    parameters: {
      weight: input.weightValue,
      weight_unit: input.weightUnit,
    },
  });
}
