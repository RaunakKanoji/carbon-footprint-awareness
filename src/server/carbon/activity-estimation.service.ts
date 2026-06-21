import 'server-only';

import type {
  ActivityCategory,
  CalculationProvider,
  CarbonEstimateConfidence,
  Prisma,
} from '@/src/generated/prisma';
import { logger } from '@/src/lib/logger';
import { calculateCo2e, getEmissionFactorInfo } from '@/src/server/carbon/carbon-engine.service';

import { estimateElectricity, estimateVehicleByType, estimateFreight } from './carbon.service';
import {
  estimateElectricityWithClimatiq,
  estimateProductWeightWithClimatiq,
  estimateSpendWithClimatiq,
  estimateTransportWithClimatiq,
} from './climatiq.service';

export type ActivityEstimateInput = {
  category: 'TRANSPORT' | 'FOOD' | 'ENERGY' | 'SHOPPING' | 'WASTE';
  subType: string;
  quantity: number;
  unit?: string;
  passengers?: number;
  region?: string;

  // Shopping-specific details
  productName?: string | null;
  shoppingCategory?: string;
  productType?: string;
  brand?: string | null;
  purchaseSource?: string;
  condition?: string;
  material?: string;
  price?: number;
  currency?: string;
  packaging?: string;
  expectedUsageDuration?: string;
  weight?: number;

  // Energy-specific details
  energyName?: string | null;
  energyCategory?: 'sustainable' | 'non-sustainable';
  energyType?: string;
  energySource?: string;
  usageType?: string;
  units?: number;
  unitType?: string;
  unitsKwh?: number;
  period?: string;
  place?: string;
  members?: number | null;
  generatorCapacity?: number | null;
  generatorCapacityUnit?: 'kW' | 'kVA' | null;
  runtimeHours?: number | null;
  loadPercentage?: number | null;
  fuelQuantity?: number | null;
  source?: string;

  // Waste-specific details
  wasteCategory?: 'biodegradable' | 'degradable';
  wasteType?: string;
  wasteSource?: string;
  disposalMethod?: string;
  segregationStatus?: string;
  materialType?: string;
  wasteForm?: string;
};

const BASE_CATEGORY_FACTORS: Record<string, number> = {
  Clothing: 8.0,
  Electronics: 120.0,
  Household: 6.0,
  Beauty: 4.0,
  'Personal Care': 2.0,
  Furniture: 45.0,
  Appliances: 80.0,
  Sports: 15.0,
  Books: 2.5,
  Toys: 5.0,
  Other: 5.0,
};

const MATERIAL_FACTORS: Record<string, number> = {
  Cotton: 7.0,
  Polyester: 9.0,
  Leather: 25.0,
  Plastic: 8.0,
  Metal: 12.0,
  Glass: 4.0,
  Wood: 3.5,
  Paper: 2.0,
  Mixed: 6.0,
  Other: 5.0,
};

const CONDITION_ADJUSTMENTS: Record<string, number> = {
  New: 1.0,
  Used: 0.1,
  Refurbished: 0.25,
  Repaired: 0.05,
  Rented: 0.15,
  Borrowed: 0.05,
};

const PACKAGING_ADJUSTMENTS: Record<string, number> = {
  None: 0.9,
  Paper: 1.0,
  Plastic: 1.15,
  Cardboard: 1.0,
  Mixed: 1.1,
  Reusable: 0.95,
  Other: 1.05,
};

export type CarbonEstimateResult = {
  co2eKg: number;
  unit: string;
  quantity: number;
  category: ActivityEstimateInput['category'];
  subType: string;
  provider: CalculationProvider;
  confidence: CarbonEstimateConfidence;
  fallbackUsed: boolean;
  method: string;
  explanation: string;
  sourceLabel: string;
  emissionFactorUsed?: number;
  providerReferenceId?: string;
  providerSource?: string;
  rawInput: Record<string, unknown>;
  rawResponse?: unknown;
};

const ZERO_CARBON_TRANSPORT = new Set(['walking', 'bicycle']);

const CALIBRATED_INTERNAL_FACTORS: Record<string, { factor: number; unit: string }> = {
  'TRANSPORT:petrolCar': { factor: 0.192, unit: 'km' },
  'TRANSPORT:dieselCar': { factor: 0.171, unit: 'km' },
  'TRANSPORT:motorcycle': { factor: 0.103, unit: 'km' },
  'TRANSPORT:bus': { factor: 0.105, unit: 'km' },
  'TRANSPORT:metro': { factor: 0.035, unit: 'km' },
  'TRANSPORT:train': { factor: 0.041, unit: 'km' },
  'TRANSPORT:domesticFlight': { factor: 0.255, unit: 'km' },
  'TRANSPORT:internationalFlight': { factor: 0.195, unit: 'km' },
  'TRANSPORT:deliveryVan': { factor: 0.25, unit: 'km' },
  'TRANSPORT:deliveryTruck': { factor: 0.9, unit: 'km' },
  'TRANSPORT:ferry': { factor: 0.12, unit: 'km' },
  'TRANSPORT:ship': { factor: 0.15, unit: 'km' },
  'TRANSPORT:electricCar': { factor: 0.05, unit: 'km' },
  'TRANSPORT:hybridCar': { factor: 0.11, unit: 'km' },
  'TRANSPORT:cngCar': { factor: 0.14, unit: 'km' },
  'TRANSPORT:hydrogenCar': { factor: 0.03, unit: 'km' },
  'FOOD:veganMeal': { factor: 0.7, unit: 'meal' },
  'FOOD:vegetarianMeal': { factor: 1.2, unit: 'meal' },
  'FOOD:chickenMeal': { factor: 2.5, unit: 'meal' },
  'FOOD:beefMeal': { factor: 7, unit: 'meal' },
  'FOOD:fishMeal': { factor: 3, unit: 'meal' },
  'FOOD:rice': { factor: 2.7, unit: 'kg' },
  'FOOD:milk': { factor: 1.4, unit: 'l' },
  'FOOD:packagedFood': { factor: 2.5, unit: 'kg' },
  'ENERGY:indiaGrid': { factor: 0.71, unit: 'kWh' },
  'SHOPPING:clothingItem': { factor: 8, unit: 'item' },
  'SHOPPING:electronicsItem': { factor: 120, unit: 'item' },
  'SHOPPING:onlineOrder': { factor: 3.5, unit: 'item' },
  'SHOPPING:householdItem': { factor: 6, unit: 'item' },
  'WASTE:landfillWaste': { factor: 0.45, unit: 'kg' },
  'WASTE:recycling': { factor: 0.1, unit: 'kg' },
  'WASTE:composting': { factor: 0.05, unit: 'kg' },
  'WASTE:plasticWaste': { factor: 0.35, unit: 'kg' },
  'WASTE:paperWaste': { factor: 0.09, unit: 'kg' },
  'WASTE:foodWaste': { factor: 0.58, unit: 'kg' },
};

const CARBONSUTRA_VEHICLE_TYPES: Record<string, string> = {
  petrolCar: 'Small Petrol Car',
  dieselCar: 'Small Diesel Car',
  bus: 'Local Bus',
  metro: 'Metro',
  train: 'National Rail',
};

function sourceLabel(provider: CalculationProvider) {
  const labels: Record<CalculationProvider, string> = {
    CARBONSUTRA: 'CarbonSutra',
    CLIMATIQ: 'Climatiq',
    AGRIBALYSE: 'Agribalyse',
    OPEN_FOOD_FACTS: 'Open Food Facts',
    CARBON_INTERFACE: 'Carbon Interface',
    MANUAL: 'Manual estimate',
    INTERNAL: 'Carbon Compass estimate',
  };
  return labels[provider];
}

function warnProviderFailure(provider: string, input: ActivityEstimateInput, error: unknown) {
  logger.warn('Carbon provider failed; trying the next fallback', {
    provider,
    category: input.category,
    subType: input.subType,
    error: error instanceof Error ? error.message : String(error),
  });
}

function baseResult(
  input: ActivityEstimateInput,
  values: Pick<
    CarbonEstimateResult,
    'co2eKg' | 'provider' | 'confidence' | 'fallbackUsed' | 'method' | 'explanation'
  > &
    Partial<CarbonEstimateResult>,
): CarbonEstimateResult {
  return {
    unit: input.unit ?? defaultUnit(input.category),
    quantity: input.quantity,
    category: input.category,
    subType: input.subType,
    sourceLabel: sourceLabel(values.provider),
    rawInput: {
      ...input,
      unit: input.unit ?? defaultUnit(input.category),
    },
    ...values,
  };
}

function defaultUnit(category: ActivityEstimateInput['category']) {
  if (category === 'TRANSPORT') return 'km';
  if (category === 'FOOD') return 'meal';
  if (category === 'ENERGY') return 'kWh';
  if (category === 'SHOPPING') return 'item';
  return 'kg';
}

async function estimateInternal(input: ActivityEstimateInput): Promise<CarbonEstimateResult> {
  const passengers = Math.max(1, input.passengers ?? 1);
  const effectiveQuantity =
    input.category === 'TRANSPORT' ? input.quantity / passengers : input.quantity;

  if (input.category === 'SHOPPING' && input.shoppingCategory) {
    const baseCategoryFactor = BASE_CATEGORY_FACTORS[input.shoppingCategory] ?? 5.0;
    const materialFactor = input.material ? (MATERIAL_FACTORS[input.material] ?? 6.0) : 6.0;
    const factor = baseCategoryFactor * (materialFactor / 6.0);

    const conditionAdj = input.condition ? (CONDITION_ADJUSTMENTS[input.condition] ?? 1.0) : 1.0;
    const packagingAdj = input.packaging ? (PACKAGING_ADJUSTMENTS[input.packaging] ?? 1.0) : 1.0;

    const co2eKg = Number((factor * effectiveQuantity * conditionAdj * packagingAdj).toFixed(3));

    return baseResult(input, {
      unit: 'item',
      co2eKg,
      provider: 'INTERNAL',
      confidence: 'MEDIUM',
      fallbackUsed: true,
      method: 'shopping_fallback_formula',
      explanation: `This is an estimated category/material-based footprint (${input.shoppingCategory} / ${input.material || 'Mixed'} material, ${input.condition || 'New'} condition, ${input.packaging || 'Standard'} packaging).`,
      emissionFactorUsed: factor,
      providerSource: 'Carbon Compass custom shopping fallback formula',
    });
  }

  if (input.category === 'SHOPPING' && input.subType === 'shipment') {
    const mode = input.material || 'Road';
    const distance = input.quantity;
    const weight = input.weight || 1.0;
    let factor = 0.05; // Road fallback
    if (mode.toLowerCase() === 'air') factor = 0.50;
    else if (mode.toLowerCase() === 'rail') factor = 0.02;
    else if (mode.toLowerCase() === 'sea') factor = 0.01;
    const co2eKg = Number((weight * distance * factor).toFixed(3));

    return baseResult(input, {
      unit: 'kg',
      co2eKg,
      provider: 'INTERNAL',
      confidence: 'LOW',
      fallbackUsed: true,
      method: 'freight_fallback_formula',
      explanation: `Estimated shipment emissions using fallback factor for ${mode} (${factor} kg/km/kg).`,
      emissionFactorUsed: factor,
      providerSource: 'Carbon Compass custom shipment fallback formula',
    });
  }

  if (input.category === 'WASTE' && input.wasteCategory) {
    let weightInKg = input.quantity;
    if (input.unit === 'Grams') {
      weightInKg = input.quantity / 1000;
    } else if (input.unit === 'Pieces') {
      weightInKg = input.quantity * 0.2;
    } else if (input.unit === 'Bags') {
      weightInKg = input.quantity * 5.0;
    } else if (input.unit === 'Boxes') {
      weightInKg = input.quantity * 10.0;
    }

    if (input.wasteCategory === 'biodegradable') {
      const typeFactors: Record<string, number> = {
        'food_scraps': 0.58,
        'fruit_vegetable_peels': 0.40,
        'garden_waste': 0.15,
        'tea_coffee_grounds': 0.30,
        'compostable_food_waste': 0.50,
        'organic_paper_waste': 0.20,
        'other_organic_waste': 0.40,
      };
      const sub = input.subType || 'other_organic_waste';
      const factor = typeFactors[sub] ?? 0.40;

      const disposalAdjustments: Record<string, number> = {
        'Home Composting': 0.1,
        'Community Composting': 0.15,
        'Municipal Composting': 0.2,
        'Animal Feed': 0.05,
        'Landfill': 1.0,
        'Incineration': 0.5,
        'Other': 0.5,
      };
      const disp = input.disposalMethod || 'Other';
      const dispAdj = disposalAdjustments[disp] ?? 0.5;

      const co2eKg = Number((factor * weightInKg * dispAdj).toFixed(3));

      return baseResult(input, {
        unit: input.unit ?? 'Kilograms',
        co2eKg,
        provider: 'INTERNAL',
        confidence: 'MEDIUM',
        fallbackUsed: true,
        method: 'biodegradable_waste_fallback',
        explanation: 'This is an estimated organic waste footprint based on disposal method.',
        emissionFactorUsed: factor,
        providerSource: 'Carbon Compass custom biodegradable waste fallback formula',
      });
    } else {
      const typeFactors: Record<string, number> = {
        'paper': 0.45,
        'cardboard': 0.50,
        'wood': 0.30,
        'natural_fiber': 0.60,
        'compostable_packaging': 0.40,
        'bioplastic': 0.80,
        'degradable_plastic': 0.90,
        'mixed_degradable_material': 0.70,
        'other': 0.50,
      };
      const sub = input.subType || 'other';
      const factor = typeFactors[sub] ?? 0.50;

      const disposalAdjustments: Record<string, number> = {
        'Reused': 0.05,
        'Recycled': 0.15,
        'Composted': 0.20,
        'Landfill': 1.0,
        'Incineration': 0.8,
        'Returned to Store': 0.10,
        'Other': 0.50,
      };
      const disp = input.disposalMethod || 'Other';
      const dispAdj = disposalAdjustments[disp] ?? 0.50;

      const conditionAdjustments: Record<string, number> = {
        'Clean': 0.9,
        'Wet': 1.1,
        'Food-Contaminated': 1.3,
        'Mixed Material': 1.2,
        'Not Sure': 1.0,
      };
      const cond = input.condition || 'Not Sure';
      const condAdj = conditionAdjustments[cond] ?? 1.0;

      const co2eKg = Number((factor * weightInKg * dispAdj * condAdj).toFixed(3));

      return baseResult(input, {
        unit: input.unit ?? 'Kilograms',
        co2eKg,
        provider: 'INTERNAL',
        confidence: 'MEDIUM',
        fallbackUsed: true,
        method: 'degradable_waste_fallback',
        explanation: 'This is an estimated material-based waste footprint.',
        emissionFactorUsed: factor,
        providerSource: 'Carbon Compass custom degradable waste fallback formula',
      });
    }
  }

  if (input.category === 'ENERGY') {
    if (input.energyCategory === 'sustainable' || input.source === 'sustainable') {
      const renewableFactors: Record<string, number> = {
        'Solar Energy': 0.048,
        'Wind Energy': 0.012,
        'Hydropower': 0.024,
        'Geothermal': 0.038,
      };
      const energyType = input.energyType ?? 'Solar Energy';
      const factor = renewableFactors[energyType] ?? 0.048;
      const units = input.units ?? input.quantity;
      const co2eKg = Number((units * factor).toFixed(3));

      return baseResult(input, {
        unit: input.unitType ?? 'kWh',
        co2eKg,
        provider: 'INTERNAL',
        confidence: 'MEDIUM',
        fallbackUsed: true,
        method: 'sustainable_energy_fallback',
        explanation: `Estimated using renewable energy fallback factor (${factor} kg CO2e/kWh for ${energyType}).`,
        emissionFactorUsed: factor,
        providerSource: 'Carbon Compass custom renewable energy fallback dataset',
      });
    } else {
      const energySource = input.energySource ?? 'Grid Electricity';
      const units = input.units ?? input.quantity;
      const unitType = input.unitType ?? 'kWh';

      // Define default emission factors per source and unit
      // All factors in kg CO2e per unit (kWh, Litre, kg, m3, Hour)
      const nonSustainableFactors: Record<string, Record<string, number>> = {
        'Grid Electricity': { kWh: 0.71 },
        'Coal-Based Electricity': { kWh: 0.95 },
        'Diesel Generator': { kWh: 0.85, Litres: 2.68, Hours: 0.85 },
        'Petrol Generator': { kWh: 0.80, Litres: 2.31, Hours: 0.80 },
        'CNG Generator': { kWh: 0.45, Kilograms: 2.75, 'Cubic Meters': 1.90, Hours: 0.45 },
        'Natural Gas Generator': { kWh: 0.40, 'Cubic Meters': 1.90, Hours: 0.40 },
        'LPG Generator': { kWh: 0.55, Kilograms: 3.0, Litres: 1.6, Hours: 0.55 },
        'Kerosene Generator': { kWh: 0.75, Litres: 2.5, Hours: 0.75 },
        'Furnace Oil Generator': { kWh: 0.90, Litres: 3.0, Kilograms: 3.2, Hours: 0.90 },
        'Other Fuel-Based Energy': { kWh: 0.70, Litres: 2.5, Kilograms: 2.8, 'Cubic Meters': 2.0, Hours: 0.70 },
      };

      const sourceFactors = nonSustainableFactors[energySource] || { kWh: 0.71 };
      const factor = sourceFactors[unitType] ?? sourceFactors['kWh'] ?? 0.71;

      let co2eKg = 0;
      let method = 'non_sustainable_energy_fallback';
      let explanation = '';

      const isGenerator = [
        'Diesel Generator',
        'Petrol Generator',
        'CNG Generator',
        'Natural Gas Generator',
        'LPG Generator',
        'Kerosene Generator',
        'Furnace Oil Generator',
        'Other Fuel-Based Energy',
      ].includes(energySource);

      if (isGenerator && unitType === 'Hours') {
        const capacity = input.generatorCapacity ?? 10; // default 10 kW
        const load = (input.loadPercentage ?? 50) / 100; // default 50%
        const runtime = units; // quantity represents runtime hours
        const generatedKwh = capacity * load * runtime;
        co2eKg = generatedKwh * factor;
        method = 'non_sustainable_generator_hours';
        explanation = `Estimated from generator runtime (${runtime} hrs at ${capacity} ${input.generatorCapacityUnit || 'kW'} capacity and ${input.loadPercentage ?? 50}% load) producing ~${generatedKwh.toFixed(1)} kWh, using factor ${factor} kg CO2e/kWh.`;
      } else if (isGenerator && ['Litres', 'Kilograms', 'Cubic Meters'].includes(unitType) && input.fuelQuantity !== null && input.fuelQuantity !== undefined) {
        const fuelQty = input.fuelQuantity;
        co2eKg = fuelQty * factor;
        method = 'non_sustainable_generator_fuel_quantity';
        explanation = `Estimated from fuel quantity consumed (${fuelQty} ${unitType}) using factor ${factor} kg CO2e/${unitType === 'Litres' ? 'litre' : unitType === 'Kilograms' ? 'kg' : 'm³'}.`;
      } else {
        co2eKg = units * factor;
        method = 'non_sustainable_energy_direct';
        explanation = `Estimated from ${units} ${unitType} of ${energySource} using factor ${factor} kg CO2e per ${unitType}.`;
      }

      co2eKg = Number(co2eKg.toFixed(3));

      return baseResult(input, {
        unit: unitType,
        co2eKg,
        provider: 'INTERNAL',
        confidence: 'MEDIUM',
        fallbackUsed: true,
        method,
        explanation: `${explanation} This is an estimated category-based footprint.`,
        emissionFactorUsed: factor,
        providerSource: 'Carbon Compass custom non-sustainable energy fallback dataset',
      });
    }
  }

  const calibrated = CALIBRATED_INTERNAL_FACTORS[`${input.category}:${input.subType}`];
  let factor = await getEmissionFactorInfo(input.category, input.subType);
  let co2eKg: number;

  try {
    co2eKg = await calculateCo2e(input.category, input.subType, effectiveQuantity);
  } catch (error) {
    if (!calibrated) throw error;
    factor = null;
    co2eKg = effectiveQuantity * calibrated.factor;
  }

  return baseResult(input, {
    unit: input.unit ?? factor?.unit ?? calibrated?.unit ?? defaultUnit(input.category),
    co2eKg: Number(co2eKg.toFixed(3)),
    provider: 'INTERNAL',
    confidence: 'MEDIUM',
    fallbackUsed: true,
    method: `${input.category.toLowerCase()}_internal_factor`,
    explanation: `Estimated using the Carbon Compass fallback factor for ${input.subType}.`,
    emissionFactorUsed: factor?.factor ?? calibrated?.factor,
    providerReferenceId: factor?.id,
    providerSource: 'Carbon Compass internal emission-factor dataset',
  });
}

async function tryCarbonSutra(input: ActivityEstimateInput): Promise<CarbonEstimateResult | null> {
  if (input.category === 'TRANSPORT') {
    const vehicleType = CARBONSUTRA_VEHICLE_TYPES[input.subType];
    if (!vehicleType) return null;
    const passengers = Math.max(1, input.passengers ?? 1);
    const estimate = await estimateVehicleByType({
      vehicleType,
      distanceValue: input.quantity / passengers,
      distanceUnit: 'km',
      fuelType:
        input.subType === 'petrolCar'
          ? 'Petrol'
          : input.subType === 'dieselCar'
            ? 'Diesel'
            : 'Unknown',
    });
    return baseResult(input, {
      co2eKg: estimate.co2eKg,
      provider: 'CARBONSUTRA',
      confidence: 'HIGH',
      fallbackUsed: false,
      method: 'transport_distance_vehicle_type',
      explanation: 'Estimated from travel distance and vehicle type using CarbonSutra.',
      providerSource: estimate.endpoint,
      rawResponse: estimate.response,
    });
  }

  if (input.category === 'ENERGY' && input.subType !== 'solar') {
    const estimate = await estimateElectricity({
      countryName: input.region || 'India',
      electricityValue: input.quantity,
      electricityUnit: 'kWh',
    });
    return baseResult(input, {
      co2eKg: estimate.co2eKg,
      provider: 'CARBONSUTRA',
      confidence: 'HIGH',
      fallbackUsed: false,
      method: 'electricity_kwh_region_factor',
      explanation: 'Estimated from electricity use and grid region using CarbonSutra.',
      providerSource: estimate.endpoint,
      rawResponse: estimate.response,
    });
  }

  if (input.category === 'SHOPPING' && input.subType === 'shipment') {
    const mode = input.material || 'Road';
    const distance = input.quantity;
    const weight = input.weight || 1.0;
    const estimate = await estimateFreight({
      transportMode: mode,
      distanceValue: distance,
      freightWeightKg: weight,
    });
    return baseResult(input, {
      unit: 'kg',
      co2eKg: estimate.co2eKg,
      provider: 'CARBONSUTRA',
      confidence: 'HIGH',
      fallbackUsed: false,
      method: 'freight_weight_distance_mode',
      explanation: `Estimated shipment emissions for ${weight} kg package over ${distance} km via ${mode} using CarbonSutra.`,
      providerSource: estimate.endpoint,
      rawResponse: estimate.response,
    });
  }

  return null;
}

async function tryClimatiq(input: ActivityEstimateInput): Promise<CarbonEstimateResult | null> {
  let estimate;

  if (input.category === 'TRANSPORT') {
    estimate = await estimateTransportWithClimatiq({
      mappingKey: input.subType,
      distanceValue: input.quantity / Math.max(1, input.passengers ?? 1),
      distanceUnit: 'km',
    });
  } else if (input.category === 'ENERGY' && input.subType !== 'solar') {
    estimate = await estimateElectricityWithClimatiq({
      mappingKey: input.subType,
      energyValue: input.quantity,
      energyUnit: 'kWh',
    });
  } else if (input.category === 'WASTE') {
    estimate = await estimateProductWeightWithClimatiq({
      mappingKey: input.subType,
      weightValue: input.quantity,
      weightUnit: 'kg',
    });
  } else if (input.category === 'SHOPPING') {
    try {
      estimate = await estimateProductWeightWithClimatiq({
        mappingKey: input.subType,
        weightValue: input.quantity,
        weightUnit: 'kg',
      });
    } catch {
      estimate = await estimateSpendWithClimatiq({
        mappingKey: input.subType,
        moneyValue: input.quantity,
        moneyUnit: 'usd',
      });
    }
  } else {
    return null;
  }

  return baseResult(input, {
    co2eKg: estimate.co2eKg,
    provider: 'CLIMATIQ',
    confidence: 'HIGH',
    fallbackUsed: true,
    method: `${input.category.toLowerCase()}_climatiq_factor`,
    explanation: `The primary provider was unavailable or unsupported. Estimated using a mapped Climatiq factor.`,
    providerReferenceId: estimate.emissionFactor?.id,
    providerSource: estimate.emissionFactor?.source ?? estimate.endpoint,
    rawResponse: estimate.response,
  });
}

export async function estimateActivityCarbon(
  input: ActivityEstimateInput,
): Promise<CarbonEstimateResult> {
  if (!Number.isFinite(input.quantity) || input.quantity < 0) {
    throw new Error('Quantity must be a non-negative number.');
  }

  if (
    (input.category === 'TRANSPORT' && ZERO_CARBON_TRANSPORT.has(input.subType)) ||
    (input.category === 'ENERGY' && input.subType === 'solar')
  ) {
    return baseResult(input, {
      co2eKg: 0,
      provider: 'INTERNAL',
      confidence: 'HIGH',
      fallbackUsed: false,
      method: 'verified_zero_operational_emissions',
      explanation: 'This activity has zero direct operational carbon emissions.',
      emissionFactorUsed: 0,
      providerSource: 'Carbon Compass zero-emission activity rule',
    });
  }

  if (input.category === 'ENERGY') {
    const isSustainable = input.energyCategory === 'sustainable' || input.source === 'sustainable';
    const isGridKwh = (input.energySource === 'Grid Electricity' || !input.energySource) && (input.unitType === 'kWh' || !input.unitType);
    if (isSustainable || !isGridKwh) {
      return estimateInternal(input);
    }
  }

  if (input.category === 'WASTE' && input.wasteCategory) {
    return estimateInternal(input);
  }

  if (
    input.category === 'TRANSPORT' ||
    input.category === 'ENERGY' ||
    (input.category === 'SHOPPING' && input.subType === 'shipment')
  ) {
    try {
      const result = await tryCarbonSutra(input);
      if (result) return result;
    } catch (error) {
      warnProviderFailure('CARBONSUTRA', input, error);
    }
  }

  if (input.category !== 'FOOD') {
    try {
      const result = await tryClimatiq(input);
      if (result) return result;
    } catch (error) {
      warnProviderFailure('CLIMATIQ', input, error);
    }
  }

  return estimateInternal(input);
}

export function activityEstimatePersistenceData(result: CarbonEstimateResult) {
  return {
    provider: result.provider,
    confidence: result.confidence,
    fallbackUsed: result.fallbackUsed,
    factorUsed: result.emissionFactorUsed,
    calculationMethod: result.method,
    sourceEndpoint: result.providerSource,
    sourceFactorId: result.providerReferenceId,
    sourcePayload: result.rawInput as Prisma.InputJsonValue,
    sourceResponse: (result.rawResponse ?? {
      explanation: result.explanation,
      sourceLabel: result.sourceLabel,
    }) as Prisma.InputJsonValue,
  };
}

export function toActivityCategory(category: ActivityEstimateInput['category']): ActivityCategory {
  return category as ActivityCategory;
}
