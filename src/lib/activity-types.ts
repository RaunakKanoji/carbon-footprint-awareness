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
  Electricity = 'ELECTRICITY',
  Flight = 'FLIGHT',
  Fuel = 'FUEL',
  Hotel = 'HOTEL',
  Shipping = 'SHIPPING',
  Food = 'FOOD',
  Energy = 'ENERGY',
  Shopping = 'SHOPPING',
  Product = 'PRODUCT',
  Material = 'MATERIAL',
  Waste = 'WASTE',
  Recycling = 'RECYCLING',
}

export const ActivitySubTypes: Record<ActivityCategory, string[]> = {
  [ActivityCategory.Transport]: [
    'petrolCar',
    'dieselCar',
    'motorcycle',
    'bus',
    'metro',
    'train',
    'bicycle',
    'walking',
    'domesticFlight',
    'internationalFlight',
    'deliveryVan',
    'deliveryTruck',
  ],
  [ActivityCategory.Electricity]: ['electricity'],
  [ActivityCategory.Flight]: ['flight'],
  [ActivityCategory.Fuel]: ['fuel'],
  [ActivityCategory.Hotel]: ['hotelStay'],
  [ActivityCategory.Shipping]: ['freight', 'ecommerceShipment'],
  [ActivityCategory.Food]: [
    'veganMeal',
    'vegetarianMeal',
    'chickenMeal',
    'beefMeal',
    'fishMeal',
    'rice',
    'milk',
    'packagedFood',
  ],
  [ActivityCategory.Energy]: ['indiaGrid', 'solar'],
  [ActivityCategory.Shopping]: ['clothingItem', 'electronicsItem', 'onlineOrder', 'householdItem'],
  [ActivityCategory.Product]: ['steel', 'productWeight'],
  [ActivityCategory.Material]: ['steel', 'materialWeight'],
  [ActivityCategory.Waste]: [
    'landfillWaste',
    'recycling',
    'composting',
    'plasticWaste',
    'paperWaste',
    'foodWaste',
  ],
  [ActivityCategory.Recycling]: ['recycling'],
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
  [ActivityCategory.Electricity]: {
    color: 'bg-yellow-500',
    icon: faBolt,
    iconName: 'bolt',
    label: 'Electricity',
  },
  [ActivityCategory.Flight]: {
    color: 'bg-cyan-500',
    icon: faCar,
    iconName: 'car',
    label: 'Flight',
  },
  [ActivityCategory.Fuel]: {
    color: 'bg-orange-500',
    icon: faBolt,
    iconName: 'bolt',
    label: 'Fuel',
  },
  [ActivityCategory.Hotel]: {
    color: 'bg-teal-500',
    icon: faCar,
    iconName: 'car',
    label: 'Hotel',
  },
  [ActivityCategory.Shipping]: {
    color: 'bg-slate-500',
    icon: faCar,
    iconName: 'car',
    label: 'Shipping',
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
  [ActivityCategory.Product]: {
    color: 'bg-indigo-500',
    icon: faShoppingBag,
    iconName: 'shopping-bag',
    label: 'Product',
  },
  [ActivityCategory.Material]: {
    color: 'bg-slate-500',
    icon: faShoppingBag,
    iconName: 'shopping-bag',
    label: 'Material',
  },
  [ActivityCategory.Waste]: {
    color: 'bg-red-500',
    icon: faTrash,
    iconName: 'trash',
    label: 'Waste',
  },
  [ActivityCategory.Recycling]: {
    color: 'bg-green-500',
    icon: faTrash,
    iconName: 'trash',
    label: 'Recycling',
  },
};
