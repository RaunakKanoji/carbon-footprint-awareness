export type AppEmissionMappingKey =
  | 'transport.car.average'
  | 'transport.bus.local'
  | 'transport.train.local'
  | 'electricity.grid.india'
  | 'fuel.petrol'
  | 'fuel.diesel'
  | 'shopping.clothing.spend'
  | 'product.steel.weight'
  | 'food.generic.meal';

export const PLACEHOLDER_CLIMATIQ_ACTIVITY_ID = 'REPLACE_WITH_VERIFIED_CLIMATIQ_ACTIVITY_ID';

export const DEFAULT_CLIMATIQ_MAPPINGS: Record<
  AppEmissionMappingKey,
  {
    label: string;
    appCategory: string;
    appActivityType: string;
    activityId: string;
    region?: string;
    dataVersion?: string;
    unitType: 'Distance' | 'Energy' | 'Money' | 'Weight' | 'Volume';
  }
> = {
  'transport.car.average': {
    label: 'Average car travel',
    appCategory: 'TRANSPORT',
    appActivityType: 'car',
    activityId: PLACEHOLDER_CLIMATIQ_ACTIVITY_ID,
    region: 'IN',
    unitType: 'Distance',
  },
  'transport.bus.local': {
    label: 'Local bus travel',
    appCategory: 'TRANSPORT',
    appActivityType: 'bus',
    activityId: PLACEHOLDER_CLIMATIQ_ACTIVITY_ID,
    region: 'IN',
    unitType: 'Distance',
  },
  'transport.train.local': {
    label: 'Local train travel',
    appCategory: 'TRANSPORT',
    appActivityType: 'train',
    activityId: PLACEHOLDER_CLIMATIQ_ACTIVITY_ID,
    region: 'IN',
    unitType: 'Distance',
  },
  'electricity.grid.india': {
    label: 'Grid electricity India',
    appCategory: 'ELECTRICITY',
    appActivityType: 'grid_electricity',
    activityId: PLACEHOLDER_CLIMATIQ_ACTIVITY_ID,
    region: 'IN',
    unitType: 'Energy',
  },
  'fuel.petrol': {
    label: 'Petrol fuel use',
    appCategory: 'FUEL',
    appActivityType: 'petrol',
    activityId: PLACEHOLDER_CLIMATIQ_ACTIVITY_ID,
    region: 'IN',
    unitType: 'Volume',
  },
  'fuel.diesel': {
    label: 'Diesel fuel use',
    appCategory: 'FUEL',
    appActivityType: 'diesel',
    activityId: PLACEHOLDER_CLIMATIQ_ACTIVITY_ID,
    region: 'IN',
    unitType: 'Volume',
  },
  'shopping.clothing.spend': {
    label: 'Clothing spend',
    appCategory: 'SHOPPING',
    appActivityType: 'clothing',
    activityId: PLACEHOLDER_CLIMATIQ_ACTIVITY_ID,
    region: 'IN',
    unitType: 'Money',
  },
  'product.steel.weight': {
    label: 'Steel product by weight',
    appCategory: 'PRODUCT',
    appActivityType: 'steel',
    activityId: PLACEHOLDER_CLIMATIQ_ACTIVITY_ID,
    region: 'IN',
    unitType: 'Weight',
  },
  'food.generic.meal': {
    label: 'Generic meal',
    appCategory: 'FOOD',
    appActivityType: 'meal',
    activityId: PLACEHOLDER_CLIMATIQ_ACTIVITY_ID,
    region: 'IN',
    unitType: 'Weight',
  },
};

export function isPlaceholderClimatiqActivityId(activityId: string | null | undefined) {
  return !activityId || activityId === PLACEHOLDER_CLIMATIQ_ACTIVITY_ID;
}
