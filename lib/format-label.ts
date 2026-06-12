/**
 * Converts raw database enum / camelCase / PascalCase / snake_case values
 * into human-readable, title-cased labels.
 *
 * Examples:
 *   formatDisplayLabel('ChickenMeal')      → 'Chicken Meal'
 *   formatDisplayLabel('indiaGrid')        → 'India Grid'
 *   formatDisplayLabel('PETROL_CAR')       → 'Petrol Car'
 *   formatDisplayLabel('vegetarian-meal')  → 'Vegetarian Meal'
 *   formatDisplayLabel('TRANSPORT')        → 'Transport'
 */
export function formatDisplayLabel(value: string): string {
  if (!value) return '';

  return value
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}
