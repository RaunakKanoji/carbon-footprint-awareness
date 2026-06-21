import { validateAgribalyseQuantityKg, validateClimateChangeFactor } from './validators';

export function calculateAgribalyseCo2eKg(input: {
  quantityKg: number;
  climateChangeKgCo2ePerKg: number;
}) {
  if (!validateAgribalyseQuantityKg(input.quantityKg)) {
    throw new Error('quantityKg must be positive and less than or equal to 1000');
  }
  if (!validateClimateChangeFactor(input.climateChangeKgCo2ePerKg)) {
    throw new Error('climateChangeKgCo2ePerKg must be zero or positive');
  }

  return input.quantityKg * input.climateChangeKgCo2ePerKg;
}
