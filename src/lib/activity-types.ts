import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBolt,
  faCar,
  faShoppingBag,
  faTrash,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';

export enum ActivityCategory {
  Transport = 'TRANSPORT',
  Food = 'FOOD',
  Energy = 'ENERGY',
  Shopping = 'SHOPPING',
  Waste = 'WASTE',
}

export const ActivitySubTypes: Record<ActivityCategory, string[]> = {
  [ActivityCategory.Transport]: [
    'petrolCar',
    'dieselCar',
    'bus',
    'metro',
    'train',
    'bicycle',
    'walking',
  ],
  [ActivityCategory.Food]: ['veganMeal', 'vegetarianMeal', 'chickenMeal', 'beefMeal', 'fishMeal'],
  [ActivityCategory.Energy]: ['indiaGrid', 'solar'],
  [ActivityCategory.Shopping]: ['tshirt', 'jeans', 'smartphone', 'laptop', 'shoes'],
  [ActivityCategory.Waste]: ['generalWaste', 'recycledWaste', 'foodWaste'],
};

export interface CategoryMeta {
  color: string;
  icon: IconDefinition;
  iconName: string;
  label: string;
}

export const CategoryMetaMap: Record<ActivityCategory, CategoryMeta> = {
  [ActivityCategory.Transport]: {
    color: 'bg-blue-500',
    icon: faCar,
    iconName: 'car',
    label: 'Transport',
  },
  [ActivityCategory.Food]: {
    color: 'bg-green-500',
    icon: faUtensils,
    iconName: 'utensils',
    label: 'Food',
  },
  [ActivityCategory.Energy]: {
    color: 'bg-yellow-500',
    icon: faBolt,
    iconName: 'bolt',
    label: 'Energy',
  },
  [ActivityCategory.Shopping]: {
    color: 'bg-purple-500',
    icon: faShoppingBag,
    iconName: 'shopping-bag',
    label: 'Shopping',
  },
  [ActivityCategory.Waste]: {
    color: 'bg-red-500',
    icon: faTrash,
    iconName: 'trash',
    label: 'Waste',
  },
};
