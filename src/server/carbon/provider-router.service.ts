import 'server-only';

import {
  estimateElectricityWithClimatiq,
  estimateFuelWithClimatiq,
  estimateProductWeightWithClimatiq,
  estimateSpendWithClimatiq,
  estimateTransportWithClimatiq,
} from './climatiq.service';

export type CarbonEstimateInput =
  | {
      provider: 'CLIMATIQ';
      category: 'TRANSPORT';
      mappingKey: string;
      distanceValue: number;
      distanceUnit: 'm' | 'km' | 'mi';
    }
  | {
      provider: 'CLIMATIQ';
      category: 'ELECTRICITY';
      mappingKey: string;
      energyValue: number;
      energyUnit: 'Wh' | 'kWh' | 'MWh';
    }
  | {
      provider: 'CLIMATIQ';
      category: 'FUEL';
      mappingKey: string;
      volumeValue?: number;
      volumeUnit?: string;
      energyValue?: number;
      energyUnit?: 'Wh' | 'kWh' | 'MWh' | 'MJ' | 'GJ';
      weightValue?: number;
      weightUnit?: 'g' | 'kg' | 't' | 'lb';
    }
  | {
      provider: 'CLIMATIQ';
      category: 'SHOPPING';
      mappingKey: string;
      moneyValue: number;
      moneyUnit: string;
      spentYear?: number;
    }
  | {
      provider: 'CLIMATIQ';
      category: 'PRODUCT';
      mappingKey: string;
      weightValue: number;
      weightUnit: 'g' | 'kg' | 't' | 'lb';
    }
  | {
      provider: 'CARBONSUTRA' | 'CARBON_INTERFACE';
      category: string;
      [key: string]: unknown;
    };

export async function estimateCarbon(input: CarbonEstimateInput) {
  if (input.provider === 'CLIMATIQ' && input.category === 'TRANSPORT') {
    return estimateTransportWithClimatiq(input);
  }

  if (input.provider === 'CLIMATIQ' && input.category === 'ELECTRICITY') {
    return estimateElectricityWithClimatiq(input);
  }

  if (input.provider === 'CLIMATIQ' && input.category === 'FUEL') {
    return estimateFuelWithClimatiq(input);
  }

  if (input.provider === 'CLIMATIQ' && input.category === 'SHOPPING') {
    return estimateSpendWithClimatiq(input);
  }

  if (input.provider === 'CLIMATIQ' && input.category === 'PRODUCT') {
    return estimateProductWeightWithClimatiq(input);
  }

  throw new Error(`Unsupported carbon provider: ${input.provider}`);
}
