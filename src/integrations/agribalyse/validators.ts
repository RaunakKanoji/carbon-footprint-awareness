export function validateAgribalyseQuantityKg(quantityKg: number) {
  return Number.isFinite(quantityKg) && quantityKg > 0 && quantityKg <= 1000;
}

export function validateClimateChangeFactor(value: number) {
  return Number.isFinite(value) && value >= 0;
}
