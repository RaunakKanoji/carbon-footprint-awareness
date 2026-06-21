'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import {
  Barcode,
  BatteryCharging,
  Calendar,
  Car,
  Camera,
  CameraOff,
  Clock3,
  FileText,
  HousePlug,
  Leaf,
  Loader2,
  type LucideIcon,
  Recycle,
  Route,
  Search,
  Sparkles,
  Truck,
} from 'lucide-react';
import { z } from 'zod';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import ValidationError from '@/src/components/forms/ValidationError';
import { formatDisplayLabel } from '@/src/lib/format-label';

import type {
  EnergyFormInput,
  FoodFormInput,
  ShoppingFormInput,
  TransportFormInput,
  WasteFormInput,
} from '../schemas';
import type { RecentActivityLogItem } from './RecentActivityLogs';

type EstimateInput = {
  subType: string;
  quantity: number;
  passengers?: number;

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

  // Waste specific fields
  wasteCategory?: 'biodegradable' | 'degradable';
  wasteType?: string;
  wasteSource?: string;
  disposalMethod?: string;
  unit?: string;
  segregationStatus?: string;
  materialType?: string;
  wasteForm?: string;
};

type BaseFormProps<TInput> = {
  onSubmit: (data: TInput) => Promise<void> | void;
  isSubmitting: boolean;
  hideActions?: boolean;
  onLiveEstimateChange?: (value: number) => void;
  onEstimateInputChange?: (input: EstimateInput) => void;
  todayStr: string;
  recentActivities?: RecentActivityLogItem[];
};

type Option = {
  value: string;
  label: string;
  description?: string;
};

type FoodMode = 'search' | 'barcode' | 'recent' | 'ai';
// type TransportPurpose = 'commute' | 'errand' | 'trip' | 'delivery';
// type TripDirection = 'oneWay' | 'return';
// type TripScope = 'domestic' | 'international';

type FoodDietType = 'vegan' | 'vegetarian' | 'nonVegetarian' | 'pescetarian' | 'mixed';

type PopularFoodItem = {
  id: string;
  label: string;
  dietType: FoodDietType;
  engineSubType: string;
  openFoodFactsFriendly: boolean;
  co2ePerServingKg: number;
};

// Unused transport structures removed to resolve lint errors

// function getAllowedTransportModes(purpose: TransportPurpose, tripScope: TripScope) {
//   if (purpose === 'delivery') return DELIVERY_MODES;
//   if (purpose === 'trip') {
//     return tripScope === 'international' ? INTERNATIONAL_TRIP_MODES : DOMESTIC_TRIP_MODES;
//   }
//   return COMMUTE_AND_ERRAND_MODES;
// }

const popularFoodItems: PopularFoodItem[] = [
  {
    id: 'veg-thali',
    label: 'Vegetarian thali',
    dietType: 'vegetarian',
    engineSubType: 'vegetarianMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 1.6,
  },
  {
    id: 'paneer-meal',
    label: 'Paneer meal',
    dietType: 'vegetarian',
    engineSubType: 'vegetarianMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 2.2,
  },
  {
    id: 'dal-rice',
    label: 'Dal rice',
    dietType: 'vegetarian',
    engineSubType: 'rice',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 1.1,
  },
  {
    id: 'curd-rice',
    label: 'Curd rice',
    dietType: 'vegetarian',
    engineSubType: 'rice',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 1.4,
  },
  {
    id: 'idli-sambar',
    label: 'Idli sambar',
    dietType: 'vegetarian',
    engineSubType: 'vegetarianMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 0.9,
  },
  {
    id: 'masala-dosa',
    label: 'Masala dosa',
    dietType: 'vegetarian',
    engineSubType: 'vegetarianMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 1.2,
  },
  {
    id: 'poha',
    label: 'Poha',
    dietType: 'vegan',
    engineSubType: 'veganMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 0.7,
  },
  {
    id: 'vegan-bowl',
    label: 'Vegan grain bowl',
    dietType: 'vegan',
    engineSubType: 'veganMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 0.9,
  },
  {
    id: 'salad-bowl',
    label: 'Vegetable salad bowl',
    dietType: 'vegan',
    engineSubType: 'veganMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 0.5,
  },
  {
    id: 'chicken-biryani',
    label: 'Chicken biryani',
    dietType: 'nonVegetarian',
    engineSubType: 'chickenMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 3.2,
  },
  {
    id: 'chicken-curry-rice',
    label: 'Chicken curry with rice',
    dietType: 'nonVegetarian',
    engineSubType: 'chickenMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 3.0,
  },
  {
    id: 'fish-curry-rice',
    label: 'Fish curry with rice',
    dietType: 'pescetarian',
    engineSubType: 'fishMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 2.8,
  },
  {
    id: 'grilled-fish-meal',
    label: 'Grilled fish meal',
    dietType: 'pescetarian',
    engineSubType: 'fishMeal',
    openFoodFactsFriendly: false,
    co2ePerServingKg: 2.5,
  },
  {
    id: 'tuna-sandwich',
    label: 'Tuna sandwich',
    dietType: 'pescetarian',
    engineSubType: 'fishMeal',
    openFoodFactsFriendly: true,
    co2ePerServingKg: 1.6,
  },
  {
    id: 'beef-burger',
    label: 'Beef burger',
    dietType: 'nonVegetarian',
    engineSubType: 'beefMeal',
    openFoodFactsFriendly: true,
    co2ePerServingKg: 6.8,
  },
  {
    id: 'milk',
    label: 'Milk',
    dietType: 'vegetarian',
    engineSubType: 'milk',
    openFoodFactsFriendly: true,
    co2ePerServingKg: 0.6,
  },
  {
    id: 'chips',
    label: 'Packaged chips',
    dietType: 'mixed',
    engineSubType: 'packagedFood',
    openFoodFactsFriendly: true,
    co2ePerServingKg: 0.35,
  },
  {
    id: 'chocolate-bar',
    label: 'Chocolate bar',
    dietType: 'mixed',
    engineSubType: 'packagedFood',
    openFoodFactsFriendly: true,
    co2ePerServingKg: 0.45,
  },
  {
    id: 'instant-noodles',
    label: 'Instant noodles',
    dietType: 'mixed',
    engineSubType: 'packagedFood',
    openFoodFactsFriendly: true,
    co2ePerServingKg: 0.65,
  },
  {
    id: 'soft-drink',
    label: 'Soft drink',
    dietType: 'mixed',
    engineSubType: 'packagedFood',
    openFoodFactsFriendly: true,
    co2ePerServingKg: 0.25,
  },
];

// ─── Shopping Manual Product Form data ──────────────────────────────────────

const SHOPPING_CATEGORIES = [
  'Clothing',
  'Electronics',
  'Household',
  'Beauty',
  'Personal Care',
  'Furniture',
  'Appliances',
  'Sports',
  'Books',
  'Toys',
  'Other',
] as const;

const PRODUCT_TYPES_BY_CATEGORY: Record<string, readonly string[]> = {
  Clothing: ['T-Shirt', 'Jeans', 'Jacket', 'Shoes', 'Dress', 'Sweater'],
  Electronics: ['Smartphone', 'Laptop', 'Headphones', 'Tablet', 'Smartwatch', 'Camera'],
  Household: ['Cleaning Product', 'Kitchenware', 'Storage Box', 'Decor Item', 'Bedding', 'Towel'],
  Beauty: [
    'Skincare Product',
    'Makeup Product',
    'Perfume',
    'Haircare Product',
    'Face Wash',
    'Moisturizer',
  ],
  'Personal Care': ['Toothbrush', 'Shampoo', 'Soap', 'Deodorant', 'Razor', 'Sanitary Product'],
  Furniture: ['Chair', 'Table', 'Sofa', 'Bed', 'Wardrobe', 'Shelf'],
  Appliances: [
    'Refrigerator',
    'Washing Machine',
    'Microwave',
    'Air Conditioner',
    'Fan',
    'Mixer Grinder',
  ],
  Sports: ['Sports Shoes', 'Yoga Mat', 'Dumbbells', 'Football', 'Cricket Bat', 'Cycling Gear'],
  Books: ['Paperback Book', 'Hardcover Book', 'Notebook', 'Textbook', 'Magazine', 'Comic Book'],
  Toys: ['Plastic Toy', 'Wooden Toy', 'Board Game', 'Soft Toy', 'Puzzle', 'Remote Control Toy'],
  Other: ['General Product', 'Accessory', 'Gift Item', 'Miscellaneous Item'],
} as const;

const PURCHASE_SOURCES = [
  'Online',
  'Offline Store',
  'Mall',
  'Shop',
  'Thrift Store',
  'Gifted',
  'Other',
] as const;

const PRODUCT_CONDITIONS = [
  'New',
  'Used',
  'Refurbished',
  'Repaired',
  'Rented',
  'Borrowed',
] as const;

const MATERIALS = [
  'Cotton',
  'Polyester',
  'Leather',
  'Plastic',
  'Metal',
  'Glass',
  'Wood',
  'Paper',
  'Mixed',
  'Other',
] as const;

const SHOPPING_PACKAGING_TYPES = [
  'None',
  'Paper',
  'Plastic',
  'Cardboard',
  'Mixed',
  'Reusable',
  'Other',
] as const;

const USAGE_DURATIONS = [
  'Less than 1 month',
  '1-6 months',
  '6-12 months',
  '1-3 years',
  'More than 3 years',
] as const;

const SUSTAINABLE_ENERGY_TYPES = [
  'Solar Energy',
  'Wind Energy',
  'Hydropower',
  'Geothermal',
] as const;

const ENERGY_PERIODS = ['Daily', 'Weekly', 'Monthly'] as const;

const ENERGY_PLACES = ['Home', 'Work', 'School', 'Other'] as const;

const ENERGY_TYPE_MAPPING: Record<string, string> = {
  'Solar Energy': 'solar',
  'Wind Energy': 'wind',
  Hydropower: 'hydropower',
  Geothermal: 'geothermal',
};

const NON_SUSTAINABLE_SOURCES = [
  'Grid Electricity',
  'Diesel Generator',
  'Petrol Generator',
  'CNG Generator',
  'Natural Gas Generator',
  'LPG Generator',
  'Kerosene Generator',
  'Coal-Based Electricity',
  'Furnace Oil Generator',
  'Other Fuel-Based Energy',
] as const;

const NON_SUSTAINABLE_USAGES = [
  'Electricity Consumption',
  'Backup Power',
  'Heating',
  'Cooking',
  'Industrial Use',
  'Other',
] as const;

const NON_SUSTAINABLE_SOURCE_MAPPING: Record<string, string> = {
  'Grid Electricity': 'indiaGrid',
  'Diesel Generator': 'dieselGenerator',
  'Petrol Generator': 'petrolGenerator',
  'CNG Generator': 'cngGenerator',
  'Natural Gas Generator': 'naturalGasGenerator',
  'LPG Generator': 'lpgGenerator',
  'Kerosene Generator': 'keroseneGenerator',
  'Coal-Based Electricity': 'coalElectricity',
  'Furnace Oil Generator': 'furnaceOilGenerator',
  'Other Fuel-Based Energy': 'otherFuelEnergy',
};

const ALLOWED_UNITS_BY_SOURCE: Record<string, string[]> = {
  'Grid Electricity': ['kWh'],
  'Coal-Based Electricity': ['kWh'],
  'Diesel Generator': ['kWh', 'Litres', 'Hours'],
  'Petrol Generator': ['kWh', 'Litres', 'Hours'],
  'CNG Generator': ['kWh', 'Kilograms', 'Cubic Meters', 'Hours'],
  'Natural Gas Generator': ['kWh', 'Cubic Meters', 'Hours'],
  'LPG Generator': ['kWh', 'Kilograms', 'Litres', 'Hours'],
  'Kerosene Generator': ['kWh', 'Litres', 'Hours'],
  'Furnace Oil Generator': ['kWh', 'Litres', 'Kilograms', 'Hours'],
  'Other Fuel-Based Energy': ['kWh', 'Litres', 'Kilograms', 'Cubic Meters', 'Hours'],
};

const ALLOWED_UNITS_BY_SUST_TYPE: Record<string, string[]> = {
  'Solar Energy': ['kWh'],
  'Wind Energy': ['kWh'],
  'Hydropower': ['kWh'],
  'Geothermal': ['kWh'],
};

function formatReadableDateTime(date: Date): string {
  return (
    date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ', ' +
    date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  );
}

// const energyTypes = [
//   {
//     value: 'indiaGrid',
//     label: 'Grid electricity',
//     description: 'Electricity consumed from the local grid.',
//     quantityLabel: 'Electricity used',
//     showGridFields: true,
//     showSolarFields: false,
//   },
//   {
//     value: 'solar',
//     label: 'Solar energy',
//     description: 'Solar electricity generated or consumed.',
//     quantityLabel: 'Solar electricity',
//     showGridFields: false,
//     showSolarFields: true,
//   },
// ] as const;

const BIODEGRADABLE_MAPPING: Record<string, string> = {
  'Food Scraps': 'food_scraps',
  'Fruit and Vegetable Peels': 'fruit_vegetable_peels',
  'Garden Waste': 'garden_waste',
  'Tea or Coffee Grounds': 'tea_coffee_grounds',
  'Compostable Food Waste': 'compostable_food_waste',
  'Organic Paper Waste': 'organic_paper_waste',
  'Other Organic Waste': 'other_organic_waste',
};

const DEGRADABLE_MAPPING: Record<string, string> = {
  Paper: 'paper',
  Cardboard: 'cardboard',
  Wood: 'wood',
  'Cotton or Natural Fiber': 'natural_fiber',
  'Compostable Packaging': 'compostable_packaging',
  Bioplastic: 'bioplastic',
  'Degradable Plastic': 'degradable_plastic',
  'Mixed Degradable Material': 'mixed_degradable_material',
  Other: 'other',
};

const WASTE_SOURCES = [
  'Home',
  'Work',
  'School',
  'Restaurant',
  'Event',
  'Outdoor',
  'Other',
] as const;

const BIODEGRADABLE_WASTE_TYPES = [
  'Food Scraps',
  'Fruit and Vegetable Peels',
  'Garden Waste',
  'Tea or Coffee Grounds',
  'Compostable Food Waste',
  'Organic Paper Waste',
  'Other Organic Waste',
] as const;

const BIODEGRADABLE_DISPOSAL_METHODS = [
  'Home Composting',
  'Community Composting',
  'Municipal Composting',
  'Animal Feed',
  'Landfill',
  'Incineration',
  'Other',
] as const;

const BIODEGRADABLE_UNITS = ['Grams', 'Kilograms', 'Litres', 'Pieces', 'Bags'] as const;

const SEGREGATION_STATUSES = [
  'Segregated',
  'Mixed with Dry Waste',
  'Mixed with Wet Waste',
  'Not Sure',
] as const;

const DEGRADABLE_MATERIAL_TYPES = [
  'Paper',
  'Cardboard',
  'Wood',
  'Cotton or Natural Fiber',
  'Compostable Packaging',
  'Bioplastic',
  'Degradable Plastic',
  'Mixed Degradable Material',
  'Other',
] as const;

const DEGRADABLE_WASTE_FORMS = [
  'Packaging',
  'Container',
  'Disposable Item',
  'Paper Product',
  'Textile Item',
  'Wooden Item',
  'Bag',
  'Other',
] as const;

const DEGRADABLE_DISPOSAL_METHODS = [
  'Reused',
  'Recycled',
  'Composted',
  'Landfill',
  'Incineration',
  'Returned to Store',
  'Other',
] as const;

const DEGRADABLE_UNITS = ['Grams', 'Kilograms', 'Pieces', 'Bags', 'Boxes'] as const;

const WASTE_CONDITIONS = [
  'Clean',
  'Wet',
  'Food-Contaminated',
  'Mixed Material',
  'Not Sure',
] as const;

function toNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanNumericInput(val: string): string {
  const cleaned = val.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
}

function getQuantityMultiplier(quantity: number, unit: string) {
  if (unit === 'serving' || unit === 'meal' || unit === 'plate' || unit === 'piece') {
    return quantity;
  }

  if (unit === 'g') return quantity / 250;
  if (unit === 'kg') return quantity / 0.25;
  if (unit === 'ml') return quantity / 250;
  if (unit === 'l') return quantity / 0.25;

  return quantity;
}

function getAiMealSubType(description: string) {
  const text = description.toLowerCase();

  if (text.includes('beef') || text.includes('mutton') || text.includes('lamb')) return 'beefMeal';
  if (text.includes('chicken')) return 'chickenMeal';
  if (text.includes('fish') || text.includes('seafood') || text.includes('prawn'))
    return 'fishMeal';
  if (text.includes('rice') || text.includes('biryani')) return 'rice';
  if (text.includes('milk') || text.includes('curd') || text.includes('yogurt')) return 'milk';
  if (text.includes('vegan') || text.includes('salad')) return 'veganMeal';

  return 'vegetarianMeal';
}

function getAiMealEstimate(description: string) {
  const subType = getAiMealSubType(description);

  if (subType === 'beefMeal') return 6.8;
  if (subType === 'chickenMeal') return 3.1;
  if (subType === 'fishMeal') return 2.8;
  if (subType === 'rice') return 1.1;
  if (subType === 'milk') return 0.6;
  if (subType === 'veganMeal') return 0.8;

  return 1.5;
}

function joinNote(userNote: string, details: Record<string, string | number | undefined | null>) {
  const detailLines = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `${key}: ${value}`);

  if (detailLines.length === 0) {
    return userNote.trim() || undefined;
  }

  const detailBlock = `Details:\n${detailLines.join('\n')}`;

  return [userNote.trim(), detailBlock].filter(Boolean).join('\n\n');
}

function FieldLabel({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-text-primary">
      <span>{label}</span>
      {children}
      {helper && (
        <span className="text-xs font-medium leading-5 text-text-secondary">{helper}</span>
      )}
    </label>
  );
}

function InputField({
  label,
  helper,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  step,
  inputMode,
}: {
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'date';
  min?: string;
  step?: string;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
}) {
  return (
    <FieldLabel label={label} helper={helper}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        min={min}
        step={step}
        inputMode={inputMode}
        className="h-11 rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
      />
    </FieldLabel>
  );
}

function SelectField({
  label,
  helper,
  value,
  onChange,
  options,
}: {
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
}) {
  return (
    <FieldLabel label={label} helper={helper}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldLabel>
  );
}

function TextareaField({
  label,
  helper,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <FieldLabel label={label} helper={helper}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-none rounded-2xl border border-border-default bg-bg-base px-3 py-3 text-sm font-semibold text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
      />
    </FieldLabel>
  );
}

function SubmitRow({
  isSubmitting,
  hideActions,
  submitLabel,
  disabled = false,
}: {
  isSubmitting: boolean;
  hideActions?: boolean;
  submitLabel: string;
  disabled?: boolean;
}) {
  if (hideActions) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-end">
      <button
        type="submit"
        disabled={isSubmitting || disabled}
        className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent-primary px-5 text-sm font-black text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
      >
        {isSubmitting ? 'Logging…' : submitLabel}
      </button>
    </div>
  );
}

function FoodModeButton({
  mode,
  activeMode,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  mode: FoodMode;
  activeMode: FoodMode;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: (mode: FoodMode) => void;
}) {
  const isActive = mode === activeMode;

  return (
    <button
      type="button"
      onClick={() => onClick(mode)}
      className={`rounded-2xl border p-4 text-left transition-colors ${
        isActive
          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
          : 'border-border-default bg-bg-base text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
      }`}
    >
      <Icon className="h-5 w-5" />
      <p className="mt-3 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5">{description}</p>
    </button>
  );
}

function ActivityModeButton({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-colors ${
        active
          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
          : 'border-border-default bg-bg-base text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
      }`}
    >
      <Icon className="h-5 w-5" />
      <p className="mt-3 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5">{description}</p>
    </button>
  );
}

const MODES = ['Roadways', 'Railways', 'Waterways', 'Airways'] as const;

const getAvailableFuelTypes = (vehicleType: string) => {
  if (vehicleType === 'Walking') return ['None'];
  if (vehicleType === 'Bicycle') return ['None', 'Electric'];
  if (vehicleType === 'Motorcycle' || vehicleType === 'Car' || vehicleType === 'Bus') {
    return ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'Hydrogen'];
  }
  return ['None', 'Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'Hydrogen'];
};

const getAvailableVehicleTypes = (fuelType: string) => {
  if (fuelType === 'None') return ['Walking', 'Bicycle'];
  if (fuelType === 'Electric') return ['Bicycle', 'Motorcycle', 'Car', 'Bus'];
  if (
    fuelType === 'Petrol' ||
    fuelType === 'Diesel' ||
    fuelType === 'CNG' ||
    fuelType === 'Hybrid' ||
    fuelType === 'Hydrogen'
  ) {
    return ['Motorcycle', 'Car', 'Bus'];
  }
  return ['Walking', 'Bicycle', 'Motorcycle', 'Car', 'Bus'];
};

const VEHICLE_TYPES_BY_MODE = {
  Roadways: ['Walking', 'Bicycle', 'Motorcycle', 'Car', 'Bus'],
  Railways: ['Train', 'Metro'],
  Waterways: ['Ferry', 'Ship'],
  Airways: ['Plane'],
} as const;

const VEHICLE_MAKES = ['Ford', 'Nissan', 'Toyota', 'Honda', 'BMW', 'Mercedes'] as const;

const PASSENGER_LIMITS = {
  smallCar: 4,
  mediumCar: 5,
  bigCar: 7,
  motorcycle: 2,
  bus: 50,
  train: 300,
  metro: 300,
  ferry: 100,
  ship: 500,
  plane: 180,
  walking: 1,
  bicycle: 1,
  default: 1,
} as const;

const VEHICLE_MODELS_BY_MAKE_AND_FUEL = {
  Toyota: {
    Petrol: [
      { model: 'Corolla Petrol', passengerCategory: 'mediumCar' },
      { model: 'Camry Petrol', passengerCategory: 'mediumCar' },
    ],
    Diesel: [{ model: 'Fortuner Diesel', passengerCategory: 'bigCar' }],
    Electric: [{ model: 'bZ4X Electric', passengerCategory: 'mediumCar' }],
    Hybrid: [{ model: 'Prius Hybrid', passengerCategory: 'mediumCar' }],
    Hydrogen: [{ model: 'Mirai Hydrogen', passengerCategory: 'mediumCar' }],
  },
  Honda: {
    Petrol: [
      { model: 'City Petrol', passengerCategory: 'mediumCar' },
      { model: 'Civic Petrol', passengerCategory: 'mediumCar' },
    ],
    Diesel: [{ model: 'Amaze Diesel', passengerCategory: 'smallCar' }],
    Hybrid: [{ model: 'City eHEV Hybrid', passengerCategory: 'mediumCar' }],
    Electric: [],
    Hydrogen: [],
  },
  Ford: {
    Petrol: [{ model: 'EcoSport Petrol', passengerCategory: 'mediumCar' }],
    Diesel: [{ model: 'Endeavour Diesel', passengerCategory: 'bigCar' }],
    Electric: [],
    Hybrid: [],
    Hydrogen: [],
  },
  Nissan: {
    Petrol: [{ model: 'Magnite Petrol', passengerCategory: 'smallCar' }],
    Diesel: [],
    Electric: [{ model: 'Leaf Electric', passengerCategory: 'mediumCar' }],
    Hybrid: [],
    Hydrogen: [],
  },
  BMW: {
    Petrol: [{ model: '3 Series Petrol', passengerCategory: 'mediumCar' }],
    Diesel: [{ model: 'X5 Diesel', passengerCategory: 'bigCar' }],
    Electric: [{ model: 'i4 Electric', passengerCategory: 'mediumCar' }],
    Hybrid: [{ model: 'XM Hybrid', passengerCategory: 'bigCar' }],
    Hydrogen: [],
  },
  Mercedes: {
    Petrol: [{ model: 'C-Class Petrol', passengerCategory: 'mediumCar' }],
    Diesel: [{ model: 'GLE Diesel', passengerCategory: 'bigCar' }],
    Electric: [{ model: 'EQE Electric', passengerCategory: 'mediumCar' }],
    Hybrid: [{ model: 'E-Class Hybrid', passengerCategory: 'mediumCar' }],
    Hydrogen: [],
  },
} as const;

export function TransportForm({
  onSubmit,
  isSubmitting,
  hideActions,
  onLiveEstimateChange,
  onEstimateInputChange,
  todayStr: _todayStr,
}: BaseFormProps<TransportFormInput>) {
  // Automatic transport states
  const [tripNameAuto, setTripNameAuto] = useState('');
  const [startLocationAuto, setStartLocationAuto] = useState('');
  const [endLocationAuto, setEndLocationAuto] = useState('');
  const [mapsLinkAuto, setMapsLinkAuto] = useState('');
  const [distanceKmAuto, setDistanceKmAuto] = useState('');
  const [modeAuto] = useState<'Roadways' | 'Railways' | 'Waterways' | 'Airways'>('Roadways');
  const [fuelTypeAuto, setFuelTypeAuto] = useState<
    '' | 'None' | 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid' | 'Hydrogen'
  >('');
  const [vehicleTypeAuto, setVehicleTypeAuto] = useState('');
  const [vehicleMakeAuto, setVehicleMakeAuto] = useState('');
  const [vehicleModelAuto, setVehicleModelAuto] = useState('');
  const [passengersAuto, setPassengersAuto] = useState('1');
  const [noteAuto, setNoteAuto] = useState('');
  const [errorsAuto, setErrorsAuto] = useState<Record<string, string>>({});
  const [isCalculatingAuto, setIsCalculatingAuto] = useState(false);
  const [calculationErrorAuto, setCalculationErrorAuto] = useState('');

  const handleVehicleTypeAutoChange = (val: string) => {
    setVehicleTypeAuto(val);
    setVehicleMakeAuto('');
    setVehicleModelAuto('');
    setPassengersAuto('1');

    // If the currently selected fuel type is not valid for the new vehicle type, reset it!
    const allowedFuels = getAvailableFuelTypes(val);
    if (fuelTypeAuto !== '' && !allowedFuels.includes(fuelTypeAuto)) {
      setFuelTypeAuto('');
    }

    setErrorsAuto((prev) => ({
      ...prev,
      vehicleType: '',
      vehicleMake: '',
      vehicleModel: '',
      passengers: '',
    }));
  };

  const handleFuelTypeAutoChange = (
    val: '' | 'None' | 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid' | 'Hydrogen',
  ) => {
    setFuelTypeAuto(val);
    setVehicleMakeAuto('');
    setVehicleModelAuto('');
    setPassengersAuto('1');

    // If the currently selected vehicle type is not valid for the new fuel type, reset it!
    const allowedVehicles = getAvailableVehicleTypes(val);
    if (vehicleTypeAuto !== '' && !allowedVehicles.includes(vehicleTypeAuto)) {
      setVehicleTypeAuto('');
    }

    setErrorsAuto((prev) => ({
      ...prev,
      fuelType: '',
      vehicleMake: '',
      vehicleModel: '',
      passengers: '',
    }));
  };

  const availableFuelTypesAuto = useMemo(() => {
    if (modeAuto !== 'Roadways') return [] as readonly string[];
    return getAvailableFuelTypes(vehicleTypeAuto) as readonly string[];
  }, [modeAuto, vehicleTypeAuto]);

  const availableVehicleTypesAuto = useMemo(() => {
    if (!modeAuto) return [] as readonly string[];
    if (modeAuto !== 'Roadways') {
      const key = modeAuto as 'Railways' | 'Waterways' | 'Airways';
      return VEHICLE_TYPES_BY_MODE[key] as readonly string[];
    }
    return getAvailableVehicleTypes(fuelTypeAuto) as readonly string[];
  }, [modeAuto, fuelTypeAuto]);

  const maxPassengersAuto = useMemo(() => {
    if (vehicleTypeAuto === 'Car') {
      if (fuelTypeAuto === 'CNG') {
        return PASSENGER_LIMITS.mediumCar; // 5
      }
      if (fuelTypeAuto === 'None' || fuelTypeAuto === '') {
        return 1;
      }
      if (!vehicleModelAuto) {
        return 1;
      }
      const makeModels =
        VEHICLE_MODELS_BY_MAKE_AND_FUEL[
          vehicleMakeAuto as keyof typeof VEHICLE_MODELS_BY_MAKE_AND_FUEL
        ];
      if (makeModels) {
        const fuelKey = fuelTypeAuto as 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'Hydrogen';
        const fuelModels = makeModels[fuelKey];
        if (fuelModels) {
          const modelInfo = (
            fuelModels as readonly { readonly model: string; readonly passengerCategory: string }[]
          ).find((m) => m.model === vehicleModelAuto);
          if (modelInfo) {
            const category = modelInfo.passengerCategory as keyof typeof PASSENGER_LIMITS;
            return PASSENGER_LIMITS[category] ?? 1;
          }
        }
      }
      return 1;
    }
    const lowerKey = vehicleTypeAuto.toLowerCase() as keyof typeof PASSENGER_LIMITS;
    return PASSENGER_LIMITS[lowerKey] ?? 1;
  }, [vehicleTypeAuto, fuelTypeAuto, vehicleMakeAuto, vehicleModelAuto]);

  const currentPassengersAuto = Math.min(Number(passengersAuto) || 1, maxPassengersAuto);

  const [transportMode, setTransportMode] = useState<'route' | 'manual'>('manual');
  const [loadTime] = useState(() => new Date());

  // Manual transport states
  const [tripName, setTripName] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [distanceKmManual, setDistanceKmManual] = useState('');
  const [modeManual, setModeManual] = useState<
    '' | 'Roadways' | 'Railways' | 'Waterways' | 'Airways'
  >('');
  const [fuelTypeManual, setFuelTypeManual] = useState<
    '' | 'None' | 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid' | 'Hydrogen'
  >('');
  const [vehicleTypeManual, setVehicleTypeManual] = useState('');
  const [vehicleMakeManual, setVehicleMakeManual] = useState('');
  const [vehicleModelManual, setVehicleModelManual] = useState('');
  const [passengersManual, setPassengersManual] = useState('1');
  const [noteManual, setNoteManual] = useState('');
  const [errorsManual, setErrorsManual] = useState<Record<string, string>>({});

  // Reset logic & dependencies
  const handleModeManualChange = (val: '' | 'Roadways' | 'Railways' | 'Waterways' | 'Airways') => {
    setModeManual(val);
    setVehicleTypeManual('');
    setFuelTypeManual('');
    setVehicleMakeManual('');
    setVehicleModelManual('');
    setPassengersManual('1');
    setErrorsManual((prev) => ({
      ...prev,
      mode: '',
      vehicleType: '',
      fuelType: '',
      vehicleMake: '',
      vehicleModel: '',
      passengers: '',
    }));
  };

  const handleVehicleTypeManualChange = (val: string) => {
    setVehicleTypeManual(val);
    setVehicleMakeManual('');
    setVehicleModelManual('');
    setPassengersManual('1');

    // If the currently selected fuel type is not valid for the new vehicle type, reset it!
    const allowedFuels = getAvailableFuelTypes(val);
    if (fuelTypeManual !== '' && !allowedFuels.includes(fuelTypeManual)) {
      setFuelTypeManual('');
    }

    setErrorsManual((prev) => ({
      ...prev,
      vehicleType: '',
      vehicleMake: '',
      vehicleModel: '',
      passengers: '',
    }));
  };

  const handleFuelTypeManualChange = (
    val: '' | 'None' | 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid' | 'Hydrogen',
  ) => {
    setFuelTypeManual(val);
    setVehicleMakeManual('');
    setVehicleModelManual('');
    setPassengersManual('1');

    // If the currently selected vehicle type is not valid for the new fuel type, reset it!
    const allowedVehicles = getAvailableVehicleTypes(val);
    if (vehicleTypeManual !== '' && !allowedVehicles.includes(vehicleTypeManual)) {
      setVehicleTypeManual('');
    }

    setErrorsManual((prev) => ({
      ...prev,
      fuelType: '',
      vehicleMake: '',
      vehicleModel: '',
      passengers: '',
    }));
  };

  const availableFuelTypes = useMemo(() => {
    if (modeManual !== 'Roadways') return [] as readonly string[];
    return getAvailableFuelTypes(vehicleTypeManual) as readonly string[];
  }, [modeManual, vehicleTypeManual]);

  const availableVehicleTypes = useMemo(() => {
    if (!modeManual) return [] as readonly string[];
    if (modeManual !== 'Roadways') {
      const key = modeManual as 'Railways' | 'Waterways' | 'Airways';
      return VEHICLE_TYPES_BY_MODE[key] as readonly string[];
    }
    return getAvailableVehicleTypes(fuelTypeManual) as readonly string[];
  }, [modeManual, fuelTypeManual]);

  const maxPassengers = useMemo(() => {
    if (vehicleTypeManual === 'Car') {
      if (fuelTypeManual === 'CNG') {
        return PASSENGER_LIMITS.mediumCar; // 5
      }
      if (fuelTypeManual === 'None' || fuelTypeManual === '') {
        return 1;
      }
      if (!vehicleModelManual) {
        return 1;
      }
      const makeModels =
        VEHICLE_MODELS_BY_MAKE_AND_FUEL[
          vehicleMakeManual as keyof typeof VEHICLE_MODELS_BY_MAKE_AND_FUEL
        ];
      if (makeModels) {
        const fuelKey = fuelTypeManual as 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'Hydrogen';
        const fuelModels = makeModels[fuelKey];
        if (fuelModels) {
          const modelInfo = (
            fuelModels as readonly { readonly model: string; readonly passengerCategory: string }[]
          ).find((m) => m.model === vehicleModelManual);
          if (modelInfo) {
            const category = modelInfo.passengerCategory as keyof typeof PASSENGER_LIMITS;
            return PASSENGER_LIMITS[category] ?? 1;
          }
        }
      }
      return 1;
    }
    const lowerKey = vehicleTypeManual.toLowerCase() as keyof typeof PASSENGER_LIMITS;
    return PASSENGER_LIMITS[lowerKey] ?? 1;
  }, [vehicleTypeManual, fuelTypeManual, vehicleMakeManual, vehicleModelManual]);

  const currentPassengersManual = Math.min(Number(passengersManual) || 1, maxPassengers);

  const selectedEngineSubTypeManual = useMemo(() => {
    if (vehicleTypeManual === 'Car') {
      if (fuelTypeManual === 'CNG') return 'cngCar';
      if (fuelTypeManual === 'Petrol') return 'petrolCar';
      if (fuelTypeManual === 'Diesel') return 'dieselCar';
      if (fuelTypeManual === 'Electric') return 'electricCar';
      if (fuelTypeManual === 'Hybrid') return 'hybridCar';
      if (fuelTypeManual === 'Hydrogen') return 'hydrogenCar';
      return 'petrolCar';
    }
    if (vehicleTypeManual === 'Plane') {
      const dist = toNumber(distanceKmManual);
      return dist <= 500 ? 'domesticFlight' : 'internationalFlight';
    }
    if (vehicleTypeManual === 'Walking') return 'walking';
    if (vehicleTypeManual === 'Bicycle') return 'bicycle';
    if (vehicleTypeManual === 'Motorcycle') return 'motorcycle';
    if (vehicleTypeManual === 'Bus') return 'bus';
    if (vehicleTypeManual === 'Train') return 'train';
    if (vehicleTypeManual === 'Metro') return 'metro';
    if (vehicleTypeManual === 'Ferry') return 'ferry';
    if (vehicleTypeManual === 'Ship') return 'ship';
    return '';
  }, [vehicleTypeManual, fuelTypeManual, distanceKmManual]);

  const vehicleModelOptions = useMemo(() => {
    if (
      !vehicleMakeManual ||
      !fuelTypeManual ||
      fuelTypeManual === 'CNG' ||
      fuelTypeManual === 'None'
    )
      return [];
    const makeData =
      VEHICLE_MODELS_BY_MAKE_AND_FUEL[
        vehicleMakeManual as keyof typeof VEHICLE_MODELS_BY_MAKE_AND_FUEL
      ];
    if (!makeData) return [];
    const fuelKey = fuelTypeManual as 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'Hydrogen';
    const models = makeData[fuelKey];
    return models || [];
  }, [vehicleMakeManual, fuelTypeManual]);

  const validateManualTrip = () => {
    const occurredDateStr = loadTime.toISOString();
    const manualTripSchema = z
      .object({
        tripName: z.string().optional(),
        occurredAt: z.string().min(1, 'Date and time is required'),
        startLocation: z.string().min(1, 'Start location is required'),
        endLocation: z.string().min(1, 'End location is required'),
        distanceKm: z.coerce.number().positive('Distance must be greater than 0'),
        mode: z.enum(['Roadways', 'Railways', 'Waterways', 'Airways']),
        fuelType: z
          .enum(['None', 'Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'Hydrogen'])
          .optional(),
        vehicleType: z.enum([
          'Walking',
          'Bicycle',
          'Motorcycle',
          'Car',
          'Bus',
          'Train',
          'Metro',
          'Ferry',
          'Ship',
          'Plane',
        ]),
        vehicleMake: z.enum(['Ford', 'Nissan', 'Toyota', 'Honda', 'BMW', 'Mercedes']).optional(),
        vehicleModel: z.string().optional(),
        passengers: z.coerce.number().int().min(1),
        note: z.string().optional(),
      })
      .superRefine((data, ctx) => {
        const requiresFuelType = data.mode === 'Roadways';

        if (requiresFuelType && !data.fuelType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['fuelType'],
            message: 'Fuel type is required for roadways',
          });
        }

        const requiresMakeAndModel =
          data.mode === 'Roadways' &&
          data.vehicleType === 'Car' &&
          data.fuelType &&
          data.fuelType !== 'CNG' &&
          data.fuelType !== 'None';

        if (requiresMakeAndModel && !data.vehicleMake) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['vehicleMake'],
            message: 'Vehicle make is required for cars',
          });
        }

        if (requiresMakeAndModel && !data.vehicleModel) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['vehicleModel'],
            message: 'Vehicle model is required for cars',
          });
        }
      });

    const parsed = manualTripSchema.safeParse({
      tripName: tripName || undefined,
      occurredAt: occurredDateStr,
      startLocation: startLocation,
      endLocation: endLocation,
      distanceKm: distanceKmManual,
      mode: modeManual || undefined,
      fuelType: fuelTypeManual || undefined,
      vehicleType: vehicleTypeManual || undefined,
      vehicleMake: vehicleMakeManual || undefined,
      vehicleModel: vehicleModelManual || undefined,
      passengers: currentPassengersManual,
      note: noteManual || undefined,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errs: Record<string, string> = {};
      for (const [key, value] of Object.entries(fieldErrors)) {
        if (value && value[0]) {
          errs[key] = value[0];
        }
      }
      setErrorsManual(errs);
      return null;
    }

    setErrorsManual({});
    return parsed.data;
  };

  const handleManualTripSubmit = () => {
    const validated = validateManualTrip();
    if (!validated) return;

    const isShared = vehicleTypeManual === 'Car' || vehicleTypeManual === 'Motorcycle';
    const subTypeForLogging = selectedEngineSubTypeManual;

    let finalMake = vehicleMakeManual;
    let finalModel = vehicleModelManual;
    if (vehicleTypeManual === 'Car' && fuelTypeManual === 'CNG') {
      finalMake = 'Default CNG';
      finalModel = 'Default CNG Car';
    }

    void onSubmit({
      subType: subTypeForLogging,
      distanceKm: validated.distanceKm,
      passengers: isShared ? currentPassengersManual : 1,
      occurredAt: validated.occurredAt,
      note: joinNote(noteManual, {
        'Transport logging mode': 'Manual',
        'Trip Name': validated.tripName || null,
        'Start Location': validated.startLocation,
        'End Location': validated.endLocation,
        Mode: validated.mode,
        'Vehicle Type': validated.vehicleType,
        'Fuel Type': validated.fuelType || null,
        'Vehicle Make': finalMake || null,
        'Vehicle Model': finalModel || null,
        Passengers: validated.passengers,
        Note: validated.note || null,
        Source: 'manual',
        'Carbon Factor Source':
          validated.vehicleType === 'Motorcycle' ? 'default_motorcycle_factor' : undefined,
      }),
    });
  };

  const selectedEngineSubTypeAuto = useMemo(() => {
    if (vehicleTypeAuto === 'Car') {
      if (fuelTypeAuto === 'CNG') return 'cngCar';
      if (fuelTypeAuto === 'Petrol') return 'petrolCar';
      if (fuelTypeAuto === 'Diesel') return 'dieselCar';
      if (fuelTypeAuto === 'Electric') return 'electricCar';
      if (fuelTypeAuto === 'Hybrid') return 'hybridCar';
      if (fuelTypeAuto === 'Hydrogen') return 'hydrogenCar';
      return 'petrolCar';
    }
    if (vehicleTypeAuto === 'Walking') return 'walking';
    if (vehicleTypeAuto === 'Bicycle') return 'bicycle';
    if (vehicleTypeAuto === 'Motorcycle') return 'motorcycle';
    if (vehicleTypeAuto === 'Bus') return 'bus';
    return '';
  }, [vehicleTypeAuto, fuelTypeAuto]);

  const quantityManual = toNumber(distanceKmManual);
  const passengerCountManual =
    vehicleTypeManual === 'Car' || vehicleTypeManual === 'Motorcycle' ? currentPassengersManual : 1;

  const currentSubType =
    transportMode === 'route' ? selectedEngineSubTypeAuto : selectedEngineSubTypeManual;
  const currentQuantity = transportMode === 'route' ? toNumber(distanceKmAuto) : quantityManual;
  const currentPassengers =
    transportMode === 'route'
      ? vehicleTypeAuto === 'Car' || vehicleTypeAuto === 'Motorcycle'
        ? currentPassengersAuto
        : 1
      : passengerCountManual;

  useEffect(() => {
    if (currentQuantity <= 0 || !currentSubType) {
      onLiveEstimateChange?.(0);
      return;
    }

    onEstimateInputChange?.({
      subType: currentSubType,
      quantity: currentQuantity,
      passengers: currentPassengers,
    });
  }, [
    onEstimateInputChange,
    onLiveEstimateChange,
    currentSubType,
    currentQuantity,
    currentPassengers,
  ]);

  const calculateRouteDistanceAuto = async () => {
    const hasLocations = startLocationAuto.trim() !== '' && endLocationAuto.trim() !== '';
    const hasLink = mapsLinkAuto.trim() !== '';

    if (!hasLocations && !hasLink) {
      setCalculationErrorAuto('Add a maps link or enter both start and end locations.');
      return;
    }

    setIsCalculatingAuto(true);
    setCalculationErrorAuto('');
    setDistanceKmAuto('');

    try {
      let finalStart = startLocationAuto.trim();
      let finalEnd = endLocationAuto.trim();

      if (hasLink) {
        const importResponse = await fetch('/api/location/import-google-maps-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: mapsLinkAuto.trim() }),
        });
        const importPayload = (await importResponse.json()) as {
          ok: boolean;
          parsed?: {
            type: string;
            originText?: string;
            destinationText?: string;
            placeText?: string;
          };
          error?: string;
        };

        if (importResponse.ok && importPayload.ok && importPayload.parsed) {
          if (importPayload.parsed.type === 'directions') {
            finalStart = importPayload.parsed.originText ?? '';
            finalEnd = importPayload.parsed.destinationText ?? '';
            setStartLocationAuto(finalStart);
            setEndLocationAuto(finalEnd);
          } else if (importPayload.parsed.type === 'place') {
            finalEnd = importPayload.parsed.placeText ?? '';
            setEndLocationAuto(finalEnd);
          }
        } else {
          throw new Error(
            'Google Maps link could not be parsed. Please check the link or use Start and End locations instead.',
          );
        }
      }

      if (!finalStart || !finalEnd) {
        throw new Error('Both start and end locations are required for distance calculation.');
      }

      const response = await fetch('/api/location/route-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: finalStart,
          destination: finalEnd,
          googleMapsUrl: hasLink ? mapsLinkAuto.trim() : undefined,
          mode: vehicleTypeAuto || 'Car',
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        distanceKm?: number;
        provider?: string;
        error?: string;
        details?: string;
      };

      if (!response.ok || !payload.ok || !payload.distanceKm) {
        throw new Error(payload.details ?? payload.error ?? 'Could not calculate distance.');
      }

      setDistanceKmAuto(String(payload.distanceKm));
      setCalculationErrorAuto('');
    } catch (error) {
      setCalculationErrorAuto(
        error instanceof Error ? error.message : 'Could not calculate distance.',
      );
    } finally {
      setIsCalculatingAuto(false);
    }
  };

  const validateAutoTrip = () => {
    const occurredDateStr = loadTime.toISOString();
    const automaticTripSchema = z
      .object({
        tripName: z.string().optional(),
        occurredAt: z.string().min(1, 'Date and time is required'),
        startLocation: z.string().optional(),
        endLocation: z.string().optional(),
        mapsLink: z.string().optional(),
        distanceKm: z.coerce.number().positive('Distance must be calculated before submitting'),
        mode: z.literal('Roadways'),
        fuelType: z.enum(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'Hydrogen']),
        vehicleType: z.enum(['Walking', 'Bicycle', 'Motorcycle', 'Car', 'Bus']),
        vehicleMake: z.enum(['Ford', 'Nissan', 'Toyota', 'Honda', 'BMW', 'Mercedes']).optional(),
        vehicleModel: z.string().optional(),
        passengers: z.coerce.number().int().min(1),
        note: z.string().optional(),
      })
      .superRefine((data, ctx) => {
        const hasLocations =
          Boolean(data.startLocation?.trim()) && Boolean(data.endLocation?.trim());
        const hasMapsLink = Boolean(data.mapsLink?.trim());

        if (!hasLocations && !hasMapsLink) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['mapsLink'],
            message: 'Add a maps link or enter both start and end locations',
          });
        }

        const requiresMakeAndModel =
          data.mode === 'Roadways' && data.vehicleType === 'Car' && data.fuelType !== 'CNG';

        if (requiresMakeAndModel && !data.vehicleMake) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['vehicleMake'],
            message: 'Vehicle make is required for cars',
          });
        }

        if (requiresMakeAndModel && !data.vehicleModel) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['vehicleModel'],
            message: 'Vehicle model is required for cars',
          });
        }
      });

    const parsed = automaticTripSchema.safeParse({
      tripName: tripNameAuto || undefined,
      occurredAt: occurredDateStr,
      startLocation: startLocationAuto || undefined,
      endLocation: endLocationAuto || undefined,
      mapsLink: mapsLinkAuto || undefined,
      distanceKm: distanceKmAuto,
      mode: modeAuto,
      fuelType: fuelTypeAuto || undefined,
      vehicleType: vehicleTypeAuto || undefined,
      vehicleMake: vehicleMakeAuto || undefined,
      vehicleModel: vehicleModelAuto || undefined,
      passengers: currentPassengersAuto,
      note: noteAuto || undefined,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errs: Record<string, string> = {};
      for (const [key, value] of Object.entries(fieldErrors)) {
        if (value && value[0]) {
          errs[key] = value[0];
        }
      }
      setErrorsAuto(errs);
      return null;
    }

    setErrorsAuto({});
    return parsed.data;
  };

  const handleAutoTripSubmit = () => {
    const validated = validateAutoTrip();
    if (!validated) return;

    const isShared = vehicleTypeAuto === 'Car' || vehicleTypeAuto === 'Motorcycle';
    const subTypeForLogging = selectedEngineSubTypeAuto;

    let finalMake = vehicleMakeAuto;
    let finalModel = vehicleModelAuto;
    if (vehicleTypeAuto === 'Car' && fuelTypeAuto === 'CNG') {
      finalMake = 'Default CNG';
      finalModel = 'Default CNG Car';
    }

    void onSubmit({
      subType: subTypeForLogging,
      distanceKm: validated.distanceKm,
      passengers: isShared ? currentPassengersAuto : 1,
      occurredAt: validated.occurredAt,
      note: joinNote(noteAuto, {
        'Transport logging mode': 'Automatic',
        'Trip Name': validated.tripName || null,
        'Start Location': validated.startLocation || null,
        'End Location': validated.endLocation || null,
        'Maps Link': validated.mapsLink || null,
        Mode: validated.mode,
        'Vehicle Type': validated.vehicleType,
        'Fuel Type': validated.fuelType,
        'Vehicle Make': finalMake || null,
        'Vehicle Model': finalModel || null,
        Passengers: validated.passengers,
        Note: validated.note || null,
        Source: 'automatic',
        'Carbon Factor Source':
          validated.vehicleType === 'Motorcycle' ? 'default_motorcycle_factor' : undefined,
      }),
    });
  };

  const showMakeAndModel =
    modeManual === 'Roadways' &&
    vehicleTypeManual === 'Car' &&
    fuelTypeManual !== '' &&
    fuelTypeManual !== 'CNG';

  const showMakeAndModelAuto =
    modeAuto === 'Roadways' &&
    vehicleTypeAuto === 'Car' &&
    fuelTypeAuto !== '' &&
    fuelTypeAuto !== 'CNG';

  const vehicleModelOptionsAuto = useMemo(() => {
    if (!vehicleMakeAuto || !fuelTypeAuto || fuelTypeAuto === 'CNG' || fuelTypeAuto === 'None')
      return [];
    const makeData =
      VEHICLE_MODELS_BY_MAKE_AND_FUEL[
        vehicleMakeAuto as keyof typeof VEHICLE_MODELS_BY_MAKE_AND_FUEL
      ];
    if (!makeData) return [];
    const fuelKey = fuelTypeAuto as 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'Hydrogen';
    const models = makeData[fuelKey];
    return models || [];
  }, [vehicleMakeAuto, fuelTypeAuto]);

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <section className="grid gap-3 grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setTransportMode('manual');
            setErrorsAuto({});
          }}
          className={`rounded-2xl border p-4 text-left transition-colors ${
            transportMode === 'manual'
              ? 'border-blue-300 bg-blue-50 text-blue-900'
              : 'border-border-default bg-bg-base text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
          }`}
        >
          <Car className="h-5 w-5" />
          <p className="mt-3 text-sm font-black">Manual Trip</p>
          <p className="mt-1 text-xs leading-5">Log travel details manually.</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setTransportMode('route');
            setErrorsManual({});
          }}
          className={`rounded-2xl border p-4 text-left transition-colors ${
            transportMode === 'route'
              ? 'border-blue-300 bg-blue-50 text-blue-900'
              : 'border-border-default bg-bg-base text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
          }`}
        >
          <Route className="h-5 w-5" />
          <p className="mt-3 text-sm font-black">Automatic Trip</p>
          <p className="mt-1 text-xs leading-5">Calculate route distance automatically.</p>
        </button>
      </section>

      {transportMode === 'route' ? (
        <form
          id="active-log-form"
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            handleAutoTripSubmit();
          }}
        >
          {/* 1. Trip Name - Full Width */}
          <div>
            <InputField
              label="Trip Name"
              placeholder="Enter your trip name"
              value={tripNameAuto}
              onChange={setTripNameAuto}
              helper="This field is optional."
            />
          </div>

          {/* 2. Date and Time - Full Width */}
          <div>
            <FieldLabel
              label="Date and Time"
              helper="This field is autofilled with the current date and time."
            >
              <input
                type="text"
                readOnly
                value={formatDateForDisplay(loadTime)}
                className="h-11 w-full rounded-2xl border border-border-default bg-bg-surface/50 px-3 text-sm font-semibold text-text-secondary outline-none cursor-not-allowed"
              />
            </FieldLabel>
          </div>

          {/* 3. Start Location & 4. End Location - Side by Side */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <TextareaField
                label="Start Location"
                placeholder="Enter your start location"
                value={startLocationAuto}
                onChange={(val) => {
                  setStartLocationAuto(val);
                  setErrorsAuto((prev) => ({ ...prev, startLocation: '' }));
                }}
                rows={3}
              />
              {errorsAuto.startLocation && <ValidationError message={errorsAuto.startLocation} />}
            </div>
            <div>
              <TextareaField
                label="End Location"
                placeholder="Enter your end location"
                value={endLocationAuto}
                onChange={(val) => {
                  setEndLocationAuto(val);
                  setErrorsAuto((prev) => ({ ...prev, endLocation: '' }));
                }}
                rows={3}
              />
              {errorsAuto.endLocation && <ValidationError message={errorsAuto.endLocation} />}
            </div>
          </div>

          {/* 5. Maps Link - Full Width */}
          <div>
            <TextareaField
              label="Maps Link"
              placeholder="Enter your trip link from Google Maps or Apple Maps"
              value={mapsLinkAuto}
              onChange={(val) => {
                setMapsLinkAuto(val);
                setErrorsAuto((prev) => ({ ...prev, mapsLink: '' }));
              }}
              rows={3}
              helper="This field is optional if Start Location and End Location are provided."
            />
            {errorsAuto.mapsLink && <ValidationError message={errorsAuto.mapsLink} />}
          </div>

          {/* Calculate Distance Button & Distance Display */}
          <div className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-blue-50/30 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={calculateRouteDistanceAuto}
                  disabled={isCalculatingAuto}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculatingAuto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Route className="h-4 w-4" />
                  )}
                  Calculate distance
                </button>
              </div>
              <p className="text-xs font-semibold text-text-secondary leading-relaxed">
                Calculates route distance from the locations or maps link.
              </p>
              {calculationErrorAuto && (
                <div className="pt-1">
                  <p
                    role="alert"
                    className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 inline-block"
                  >
                    {calculationErrorAuto}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center rounded-2xl bg-white border border-blue-50 shadow-sm px-5 py-3.5 min-w-[240px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                Calculated Distance
              </span>
              <p className="mt-1 text-2xl font-black tabular-nums text-blue-950">
                {isCalculatingAuto ? (
                  <span className="text-sm font-bold text-blue-600 animate-pulse">
                    Calculating distance...
                  </span>
                ) : distanceKmAuto ? (
                  `${toNumber(distanceKmAuto).toFixed(1)} km`
                ) : (
                  <span className="text-sm font-bold text-text-muted">Not calculated yet</span>
                )}
              </p>
            </div>
          </div>
          {errorsAuto.distanceKm && <ValidationError message={errorsAuto.distanceKm} />}

          {/* 7. Mode & 8. Fuel Type - Side by Side */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel
                label="Mode"
                helper="Only roadways is available for automatic trip calculation right now."
              >
                <select
                  value={modeAuto}
                  disabled
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-surface/50 px-3 text-sm font-semibold text-text-secondary outline-none cursor-not-allowed"
                >
                  <option value="Roadways">Roadways</option>
                  <option value="Railways" disabled>
                    Railways
                  </option>
                  <option value="Waterways" disabled>
                    Waterways
                  </option>
                  <option value="Airways" disabled>
                    Airways
                  </option>
                </select>
              </FieldLabel>
              {errorsAuto.mode && <ValidationError message={errorsAuto.mode} />}
            </div>

            {modeAuto === 'Roadways' ? (
              <div>
                <FieldLabel label="Fuel Type">
                  <select
                    value={fuelTypeAuto}
                    onChange={(event) =>
                      handleFuelTypeAutoChange(
                        event.target.value as
                          | ''
                          | 'None'
                          | 'Petrol'
                          | 'Diesel'
                          | 'CNG'
                          | 'Electric'
                          | 'Hybrid'
                          | 'Hydrogen',
                      )
                    }
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="">Select your fuel type</option>
                    {availableFuelTypesAuto.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errorsAuto.fuelType && <ValidationError message={errorsAuto.fuelType} />}
              </div>
            ) : (
              <div />
            )}
          </div>

          {/* Vehicle Type & Passengers - Side by Side */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel label="Vehicle Type">
                <select
                  value={vehicleTypeAuto}
                  onChange={(event) => handleVehicleTypeAutoChange(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="">Select your vehicle type</option>
                  {availableVehicleTypesAuto.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errorsAuto.vehicleType && <ValidationError message={errorsAuto.vehicleType} />}
            </div>

            <div>
              <InputField
                label="Passengers"
                value={passengersAuto}
                onChange={(val) => {
                  const cleaned = val.replace(/[^0-9]/g, '');
                  setPassengersAuto(cleaned);
                  setErrorsAuto((prev) => ({ ...prev, passengers: '' }));
                }}
                placeholder="Enter number of passengers"
                inputMode="numeric"
                helper={`Maximum passengers: ${maxPassengersAuto}`}
              />
              {errorsAuto.passengers && <ValidationError message={errorsAuto.passengers} />}
            </div>
          </div>

          {/* Vehicle Make & Vehicle Model - Side by Side */}
          {showMakeAndModelAuto && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel label="Vehicle Make">
                  <select
                    value={vehicleMakeAuto}
                    onChange={(event) => {
                      setVehicleMakeAuto(event.target.value);
                      setVehicleModelAuto('');
                      setErrorsAuto((prev) => ({ ...prev, vehicleMake: '', vehicleModel: '' }));
                    }}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="">Select your vehicle make</option>
                    {VEHICLE_MAKES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errorsAuto.vehicleMake && <ValidationError message={errorsAuto.vehicleMake} />}
              </div>

              <div>
                <FieldLabel
                  label="Vehicle Model"
                  helper={!vehicleMakeAuto ? 'Select make first.' : undefined}
                >
                  <select
                    value={vehicleModelAuto}
                    onChange={(event) => {
                      setVehicleModelAuto(event.target.value);
                      setErrorsAuto((prev) => ({ ...prev, vehicleModel: '' }));
                    }}
                    disabled={!vehicleMakeAuto}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Select your vehicle model</option>
                    {vehicleModelOptionsAuto.map((opt) => (
                      <option key={opt.model} value={opt.model}>
                        {opt.model}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {vehicleMakeAuto && vehicleModelOptionsAuto.length === 0 && (
                  <p className="mt-1 text-xs text-text-muted">
                    No models available for this fuel type
                  </p>
                )}
                {errorsAuto.vehicleModel && <ValidationError message={errorsAuto.vehicleModel} />}
              </div>
            </div>
          )}

          {/* 13. Note - Full Width */}
          <div>
            <TextareaField
              label="Note"
              placeholder="Add a note about this trip"
              value={noteAuto}
              onChange={setNoteAuto}
              rows={3}
              helper="This field is optional."
            />
          </div>

          <SubmitRow
            isSubmitting={isSubmitting}
            hideActions={hideActions}
            submitLabel="Log travel"
            disabled={toNumber(distanceKmAuto) <= 0 || !modeAuto || !vehicleTypeAuto}
          />
        </form>
      ) : (
        <form
          id="active-log-form"
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            handleManualTripSubmit();
          }}
        >
          {/* 1. Trip Name - Full Width */}
          <div>
            <InputField
              label="Trip Name"
              placeholder="Enter your trip name"
              value={tripName}
              onChange={setTripName}
              helper="This field is optional."
            />
          </div>

          {/* 2. Date and Time - Full Width */}
          <div>
            <FieldLabel
              label="Date and Time"
              helper="This field is autofilled with the current date and time."
            >
              <input
                type="text"
                readOnly
                value={formatDateForDisplay(loadTime)}
                className="h-11 w-full rounded-2xl border border-border-default bg-bg-surface/50 px-3 text-sm font-semibold text-text-secondary outline-none cursor-not-allowed"
              />
            </FieldLabel>
          </div>

          {/* 3. Start Location & 4. End Location - Side by Side */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <TextareaField
                label="Start Location"
                placeholder="Enter your start location"
                value={startLocation}
                onChange={(val) => {
                  setStartLocation(val);
                  setErrorsManual((prev) => ({ ...prev, startLocation: '' }));
                }}
                rows={3}
              />
              {errorsManual.startLocation && (
                <ValidationError message={errorsManual.startLocation} />
              )}
            </div>
            <div>
              <TextareaField
                label="End Location"
                placeholder="Enter your end location"
                value={endLocation}
                onChange={(val) => {
                  setEndLocation(val);
                  setErrorsManual((prev) => ({ ...prev, endLocation: '' }));
                }}
                rows={3}
              />
              {errorsManual.endLocation && <ValidationError message={errorsManual.endLocation} />}
            </div>
          </div>

          {/* 5. Distance & 6. Mode - Side by Side */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <InputField
                label="Distance"
                placeholder="Enter your trip distance"
                value={distanceKmManual}
                onChange={(val) => {
                  setDistanceKmManual(val);
                  setErrorsManual((prev) => ({ ...prev, distanceKm: '' }));
                }}
                type="number"
                min="0"
                step="0.1"
              />
              {errorsManual.distanceKm && <ValidationError message={errorsManual.distanceKm} />}
            </div>
            <div>
              <FieldLabel label="Mode">
                <select
                  value={modeManual}
                  onChange={(event) =>
                    handleModeManualChange(
                      event.target.value as '' | 'Roadways' | 'Railways' | 'Waterways' | 'Airways',
                    )
                  }
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="">Select your mode</option>
                  {MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errorsManual.mode && <ValidationError message={errorsManual.mode} />}
            </div>
          </div>

          {/* Vehicle Type & Passengers - Side by Side */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel
                label="Vehicle Type"
                helper={!modeManual ? 'Select mode first to enable vehicle types.' : undefined}
              >
                <select
                  value={vehicleTypeManual}
                  onChange={(event) => handleVehicleTypeManualChange(event.target.value)}
                  disabled={!modeManual}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select your vehicle type</option>
                  {availableVehicleTypes.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errorsManual.vehicleType && <ValidationError message={errorsManual.vehicleType} />}
            </div>

            {modeManual === 'Roadways' ? (
              <div>
                <FieldLabel label="Fuel Type">
                  <select
                    value={fuelTypeManual}
                    onChange={(event) =>
                      handleFuelTypeManualChange(
                        event.target.value as
                          | ''
                          | 'None'
                          | 'Petrol'
                          | 'Diesel'
                          | 'CNG'
                          | 'Electric'
                          | 'Hybrid'
                          | 'Hydrogen',
                      )
                    }
                    disabled={!vehicleTypeManual}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Select your fuel type</option>
                    {availableFuelTypes.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errorsManual.fuelType && <ValidationError message={errorsManual.fuelType} />}
              </div>
            ) : (
              <div>
                <InputField
                  label="Passengers"
                  value={passengersManual}
                  onChange={(val) => {
                    const cleaned = val.replace(/[^0-9]/g, '');
                    setPassengersManual(cleaned);
                    setErrorsManual((prev) => ({ ...prev, passengers: '' }));
                  }}
                  placeholder="Enter number of passengers"
                  inputMode="numeric"
                  helper={`Maximum passengers: ${maxPassengers}`}
                />
                {errorsManual.passengers && <ValidationError message={errorsManual.passengers} />}
              </div>
            )}
          </div>

          {modeManual === 'Roadways' && (
            <div>
              <InputField
                label="Passengers"
                value={passengersManual}
                onChange={(val) => {
                  const cleaned = val.replace(/[^0-9]/g, '');
                  setPassengersManual(cleaned);
                  setErrorsManual((prev) => ({ ...prev, passengers: '' }));
                }}
                placeholder="Enter number of passengers"
                inputMode="numeric"
                helper={`Maximum passengers: ${maxPassengers}`}
              />
              {errorsManual.passengers && <ValidationError message={errorsManual.passengers} />}
            </div>
          )}

          {/* 9. Vehicle Make & 10. Vehicle Model - Side by Side */}
          {showMakeAndModel ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel label="Vehicle Make">
                  <select
                    value={vehicleMakeManual}
                    onChange={(event) => {
                      setVehicleMakeManual(event.target.value);
                      setVehicleModelManual('');
                      setErrorsManual((prev) => ({ ...prev, vehicleMake: '', vehicleModel: '' }));
                    }}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="">Select your vehicle make</option>
                    {VEHICLE_MAKES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errorsManual.vehicleMake && <ValidationError message={errorsManual.vehicleMake} />}
              </div>

              <div>
                <FieldLabel
                  label="Vehicle Model"
                  helper={!vehicleMakeManual ? 'Select make first.' : undefined}
                >
                  <select
                    value={vehicleModelManual}
                    onChange={(event) => {
                      setVehicleModelManual(event.target.value);
                      setErrorsManual((prev) => ({ ...prev, vehicleModel: '' }));
                    }}
                    disabled={!vehicleMakeManual}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Select your vehicle model</option>
                    {vehicleModelOptions.map((opt) => (
                      <option key={opt.model} value={opt.model}>
                        {opt.model}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {vehicleMakeManual && vehicleModelOptions.length === 0 && (
                  <p className="mt-1 text-xs text-text-muted">
                    No models available for this fuel type
                  </p>
                )}
                {errorsManual.vehicleModel && (
                  <ValidationError message={errorsManual.vehicleModel} />
                )}
              </div>
            </div>
          ) : null}

          {/* 12. Note - Full Width */}
          <div>
            <TextareaField
              label="Note"
              placeholder="Add a note about this trip"
              value={noteManual}
              onChange={setNoteManual}
              rows={3}
              helper="This field is optional."
            />
          </div>

          <SubmitRow
            isSubmitting={isSubmitting}
            hideActions={hideActions}
            submitLabel="Log travel"
            disabled={toNumber(distanceKmManual) <= 0 || !modeManual || !vehicleTypeManual}
          />
        </form>
      )}
    </div>
  );
}

const FOOD_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink'] as const;

const DIET_TYPES = [
  'Vegan',
  'Vegetarian',
  'Non-Vegetarian',
  'Pescatarian',
  'Packaged Foods',
] as const;

const FOOD_ITEMS_BY_DIET = {
  Vegan: ['Vegan Buddha Bowl', 'Lentil Curry', 'Tofu Stir Fry'],
  Vegetarian: ['Paneer Rice Bowl', 'Vegetable Biryani', 'Cheese Sandwich'],
  'Non-Vegetarian': ['Chicken Curry', 'Egg Rice Bowl', 'Mutton Biryani'],
  Pescatarian: ['Grilled Fish Meal', 'Tuna Sandwich', 'Prawn Rice Bowl'],
  'Packaged Foods': ['Packaged Chips', 'Instant Noodles', 'Packaged Juice'],
} as const;

const SOURCES = [
  'Homecooked',
  'Dineout',
  'Takeaway',
  'Delivery',
  'Cafeteria',
  'Food stalls (Street food)',
  'Other',
] as const;

const PACKAGING_TYPES = [
  'None',
  'Reusable',
  'Paper',
  'Plastic',
  'Aluminium',
  'Glass',
  'Mixed',
] as const;

const SERVING_UNITS = ['Plates', 'Pieces', 'Grams', 'Kilograms', 'Milliliters', 'Litres'] as const;

const FOOD_ITEM_METADATA: Record<string, { engineSubType: string; co2ePerServingKg: number }> = {
  'Vegan Buddha Bowl': { engineSubType: 'veganMeal', co2ePerServingKg: 0.9 },
  'Lentil Curry': { engineSubType: 'veganMeal', co2ePerServingKg: 0.7 },
  'Tofu Stir Fry': { engineSubType: 'veganMeal', co2ePerServingKg: 0.8 },
  'Paneer Rice Bowl': { engineSubType: 'vegetarianMeal', co2ePerServingKg: 2.2 },
  'Vegetable Biryani': { engineSubType: 'rice', co2ePerServingKg: 1.2 },
  'Cheese Sandwich': { engineSubType: 'vegetarianMeal', co2ePerServingKg: 1.5 },
  'Chicken Curry': { engineSubType: 'chickenMeal', co2ePerServingKg: 3.2 },
  'Egg Rice Bowl': { engineSubType: 'vegetarianMeal', co2ePerServingKg: 1.4 },
  'Mutton Biryani': { engineSubType: 'beefMeal', co2ePerServingKg: 5.5 },
  'Grilled Fish Meal': { engineSubType: 'fishMeal', co2ePerServingKg: 2.5 },
  'Tuna Sandwich': { engineSubType: 'fishMeal', co2ePerServingKg: 1.6 },
  'Prawn Rice Bowl': { engineSubType: 'fishMeal', co2ePerServingKg: 2.8 },
  'Packaged Chips': { engineSubType: 'packagedFood', co2ePerServingKg: 0.4 },
  'Instant Noodles': { engineSubType: 'packagedFood', co2ePerServingKg: 0.6 },
  'Packaged Juice': { engineSubType: 'packagedFood', co2ePerServingKg: 0.3 },
};

function mapServingToInternalUnit(servings: string) {
  switch (servings) {
    case 'Plates':
      return 'plate';
    case 'Pieces':
      return 'piece';
    case 'Grams':
      return 'g';
    case 'Kilograms':
      return 'kg';
    case 'Milliliters':
      return 'ml';
    case 'Litres':
      return 'l';
    default:
      return 'serving';
  }
}

function formatDateForDisplay(date: Date) {
  const day = date.getDate();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

function extractDetail(note: string | null, key: string): string | null {
  if (!note) return null;
  const lines = note.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().startsWith(`${key.toLowerCase()}:`)) {
      return line.substring(key.length + 1).trim();
    }
  }
  return null;
}

function isValidFoodName(name: string): boolean {
  if (!name) return false;
  if (name.includes('\n') || name.includes('\r')) return false;
  const lower = name.toLowerCase();
  if (
    lower.startsWith('input mode:') ||
    lower.startsWith('food logging mode:') ||
    lower.startsWith('food name:') ||
    lower.startsWith('food type:') ||
    lower.startsWith('meal type:') ||
    lower.startsWith('meal source:') ||
    lower.startsWith('source:') ||
    lower.startsWith('packaging:') ||
    lower.startsWith('quantity:') ||
    lower.startsWith('servings:') ||
    lower.startsWith('serving:') ||
    lower.startsWith('details:') ||
    lower.startsWith('pre-recorded estimate:') ||
    lower.startsWith('barcode:')
  ) {
    return false;
  }
  if (
    lower.includes('product scan: product_log') ||
    lower.trim() === 'packaged food' ||
    lower.trim() === 'packagedfood'
  ) {
    return false;
  }
  return true;
}

function mapInternalUnitToServings(unit: string) {
  const lower = unit.toLowerCase();
  if (lower === 'plate') return 'Plates';
  if (lower === 'piece') return 'Pieces';
  if (lower === 'g') return 'Grams';
  if (lower === 'kg') return 'Kilograms';
  if (lower === 'ml') return 'Milliliters';
  if (lower === 'l') return 'Litres';
  return 'Plates';
}

const FALLBACK_RECENT_FOODS = [
  'Paneer Rice Bowl',
  'Chicken Curry',
  'Vegetable Biryani',
  'Packaged Chips',
  'Tofu Stir Fry',
] as const;

function mapOpenFoodFactsToFood(product: any) {
  const name = product.productName || 'Unknown Product';
  const pkgText = (product.packaging || '').toLowerCase();
  let packaging = 'Mixed';
  if (pkgText.includes('glass')) {
    packaging = 'Glass';
  } else if (pkgText.includes('paper') || pkgText.includes('cardboard')) {
    packaging = 'Paper';
  } else if (pkgText.includes('plastic') || pkgText.includes('bag')) {
    packaging = 'Plastic';
  } else if (pkgText.includes('aluminium') || pkgText.includes('metal')) {
    packaging = 'Aluminium';
  } else if (pkgText.includes('none') || pkgText.includes('no packaging')) {
    packaging = 'None';
  }

  return {
    productName: name,
    packaging,
  };
}

export function FoodForm({
  onSubmit,
  isSubmitting,
  hideActions,
  onLiveEstimateChange,
  onEstimateInputChange,
  recentActivities,
}: BaseFormProps<FoodFormInput>) {
  const [foodMode, setFoodMode] = useState<FoodMode>('search');

  // Original states for other modes
  const [mealType, setMealType] = useState('');
  const [dietType, setDietType] = useState<FoodDietType | ''>('');
  const [foodItemId, setFoodItemId] = useState('');
  const [note, setNote] = useState('');

  // New Search Form states
  const [foodName, setFoodName] = useState('');
  const [loadTime] = useState(() => new Date());
  const [foodType, setFoodType] = useState('');
  const [dietTypeSearch, setDietTypeSearch] = useState('');
  const [foodItemSearch, setFoodItemSearch] = useState('');
  const [sourceSearch, setSourceSearch] = useState('');
  const [packagingSearch, setPackagingSearch] = useState('');
  const [quantitySearch, setQuantitySearch] = useState('1');
  const [servingsSearch, setServingsSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // New Barcode Form states
  const [foodNameScan, setFoodNameScan] = useState('');
  const [foodTypeScan, setFoodTypeScan] = useState('');
  const [barcodeScan, setBarcodeScan] = useState('');
  const [sourceScan, setSourceScan] = useState('');
  const [packagingScan, setPackagingScan] = useState('');
  const [quantityScan, setQuantityScan] = useState('1');
  const [servingsScan, setServingsScan] = useState('');
  const [errorsScan, setErrorsScan] = useState<Record<string, string>>({});

  // Food helpers states for Scan (Barcode) mode
  const [productLinkScan, setProductLinkScan] = useState('');
  const [isFetchingLinkScan, setIsFetchingLinkScan] = useState(false);
  const [isLookingUpBarcodeScan, setIsLookingUpBarcodeScan] = useState(false);
  const [lookupErrorScan, setLookupErrorScan] = useState<string | null>(null);

  // Camera Barcode Scanner states
  const [showCameraScan, setShowCameraScan] = useState(false);
  const [cameraErrorScan, setCameraErrorScan] = useState<string | null>(null);
  const [scannerInstance, setScannerInstance] = useState<any>(null);

  // New Recent Food Form states
  const [foodNameRecent, setFoodNameRecent] = useState('');
  const [foodTypeRecent, setFoodTypeRecent] = useState('');
  const [recentFoodSelect, setRecentFoodSelect] = useState('');
  const [sourceRecent, setSourceRecent] = useState('');
  const [packagingRecent, setPackagingRecent] = useState('');
  const [quantityRecent, setQuantityRecent] = useState('1');
  const [servingsRecent, setServingsRecent] = useState('');
  const [errorsRecent, setErrorsRecent] = useState<Record<string, string>>({});

  // New Ask AI Form states
  const [foodNameAi, setFoodNameAi] = useState('');
  const [foodTypeAi, setFoodTypeAi] = useState('');
  const [dietTypeAi, setDietTypeAi] = useState('');
  const [foodDescriptionAi, setFoodDescriptionAi] = useState('');
  const [sourceAi, setSourceAi] = useState('');
  const [packagingAi, setPackagingAi] = useState('');
  const [quantityAi, setQuantityAi] = useState('1');
  const [servingsAi, setServingsAi] = useState('');
  const [errorsAi, setErrorsAi] = useState<Record<string, string>>({});

  const foodTypeOptions = useMemo(
    () => [
      { value: '', label: 'Select your food type' },
      ...FOOD_TYPES.map((t) => ({ value: t, label: t })),
    ],
    [],
  );

  const foodTypeScanOptions = useMemo(
    () => [
      { value: '', label: 'Select your food type' },
      ...FOOD_TYPES.map((t) => ({ value: t, label: t })),
    ],
    [],
  );

  const dietTypeOptions = useMemo(
    () => [
      { value: '', label: 'Select your diet type' },
      ...DIET_TYPES.map((t) => ({ value: t, label: t })),
    ],
    [],
  );

  const sourceOptions = useMemo(
    () => [
      { value: '', label: 'Select your source' },
      ...SOURCES.map((s) => ({ value: s, label: s })),
    ],
    [],
  );

  const packagingOptions = useMemo(
    () => [
      { value: '', label: 'Select your packaging' },
      ...PACKAGING_TYPES.map((p) => ({ value: p, label: p })),
    ],
    [],
  );

  const servingsOptions = useMemo(
    () => [
      { value: '', label: 'Select your servings' },
      ...SERVING_UNITS.map((u) => ({ value: u, label: u })),
    ],
    [],
  );

  const foodItemOptions = useMemo(() => {
    if (!dietTypeSearch) return [];
    return FOOD_ITEMS_BY_DIET[dietTypeSearch as keyof typeof FOOD_ITEMS_BY_DIET] || [];
  }, [dietTypeSearch]);

  const filteredFoodItems = useMemo(() => {
    if (!dietType) return [];
    return popularFoodItems.filter((item) => item.dietType === dietType);
  }, [dietType]);

  const selectedFoodItem = filteredFoodItems.find((item) => item.id === foodItemId);

  const recentFoodOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: {
      label: string;
      subType: string;
      note: string | null;
      co2eKg: number;
      quantity: number;
      unit: string;
    }[] = [];

    if (recentActivities && recentActivities.length > 0) {
      const foodLogs = recentActivities.filter((act) => act.category.toUpperCase() === 'FOOD');

      for (const log of foodLogs) {
        const logNote = log.note ?? null;
        let name = extractDetail(logNote, 'Food item');
        if (!name || !isValidFoodName(name)) {
          name = extractDetail(logNote, 'Food Name');
        }
        if ((!name || !isValidFoodName(name)) && logNote && !logNote.includes('Details:')) {
          const trimmed = logNote.trim();
          if (isValidFoodName(trimmed)) {
            name = trimmed;
          } else {
            name = null;
          }
        }
        if (!name || !isValidFoodName(name)) {
          name = formatDisplayLabel(log.subType);
        }

        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push({
            label: name,
            subType: log.subType,
            note: logNote,
            co2eKg: log.co2eKg,
            quantity: log.quantity,
            unit: log.unit ?? 'serving',
          });
        }
      }
    }

    if (list.length === 0) {
      const fallbacksMap: Record<string, { subType: string; co2ePerServing: number }> = {
        'Paneer Rice Bowl': { subType: 'vegetarianMeal', co2ePerServing: 2.2 },
        'Chicken Curry': { subType: 'chickenMeal', co2ePerServing: 3.2 },
        'Vegetable Biryani': { subType: 'rice', co2ePerServing: 1.2 },
        'Packaged Chips': { subType: 'packagedFood', co2ePerServing: 0.4 },
        'Tofu Stir Fry': { subType: 'veganMeal', co2ePerServing: 0.8 },
      };

      for (const item of FALLBACK_RECENT_FOODS) {
        const metadata = fallbacksMap[item] || { subType: 'vegetarianMeal', co2ePerServing: 1.5 };
        list.push({
          label: item,
          subType: metadata.subType,
          note: null,
          co2eKg: metadata.co2ePerServing,
          quantity: 1,
          unit: 'serving',
        });
      }
    }

    return list;
  }, [recentActivities]);

  const recentSelectOptions = useMemo(() => {
    if (recentFoodOptions.length === 0) {
      return [{ value: '', label: 'No recent foods found' }];
    }
    return [
      { value: '', label: 'Select your recent food' },
      ...recentFoodOptions.map((item) => ({
        value: item.label,
        label: item.label,
      })),
    ];
  }, [recentFoodOptions]);

  const selectedFoodItemMetadata = FOOD_ITEM_METADATA[foodItemSearch];
  const selectedRecentFoodMatch = recentFoodOptions.find((x) => x.label === recentFoodSelect);

  const selectedEngineSubType =
    foodMode === 'search'
      ? (selectedFoodItemMetadata?.engineSubType ?? '')
      : foodMode === 'barcode'
        ? 'packagedFood'
        : foodMode === 'recent'
          ? (selectedRecentFoodMatch?.subType ?? 'vegetarianMeal')
          : getAiMealSubType(foodDescriptionAi);

  const amount =
    foodMode === 'search'
      ? quantitySearch
      : foodMode === 'barcode'
        ? quantityScan
        : foodMode === 'recent'
          ? quantityRecent
          : quantityAi;

  const quantityUnit =
    foodMode === 'search'
      ? mapServingToInternalUnit(servingsSearch)
      : foodMode === 'barcode'
        ? mapServingToInternalUnit(servingsScan)
        : foodMode === 'recent'
          ? mapServingToInternalUnit(servingsRecent)
          : mapServingToInternalUnit(servingsAi);

  const quantityMultiplier = getQuantityMultiplier(Number(amount) || 0, quantityUnit);

  const baseEstimate =
    foodMode === 'search'
      ? (selectedFoodItemMetadata?.co2ePerServingKg ?? 0)
      : foodMode === 'barcode'
        ? 0.55
        : foodMode === 'recent'
          ? (selectedRecentFoodMatch?.co2eKg ?? 1.5)
          : getAiMealEstimate(foodDescriptionAi);

  const estimatedFoodKg = Math.max(0, baseEstimate * quantityMultiplier);

  const canSubmitFood =
    quantityMultiplier > 0 &&
    selectedEngineSubType.trim().length > 0 &&
    !(foodMode === 'search' && (!mealType.trim() || !dietType || !selectedFoodItem));

  useEffect(() => {
    if (!selectedEngineSubType || quantityMultiplier <= 0) {
      onLiveEstimateChange?.(0);
      return;
    }

    onEstimateInputChange?.({
      subType: selectedEngineSubType,
      quantity: quantityMultiplier,
    });

    onLiveEstimateChange?.(estimatedFoodKg);
  }, [
    estimatedFoodKg,
    onEstimateInputChange,
    onLiveEstimateChange,
    quantityMultiplier,
    selectedEngineSubType,
  ]);

  function handleDietTypeChange(value: string) {
    setDietTypeSearch(value);
    setFoodItemSearch('');
    setErrors((prev) => ({ ...prev, dietType: '', foodItem: '' }));
  }

  function handleFoodTypeChange(value: string) {
    setFoodType(value);
    setErrors((prev) => ({ ...prev, foodType: '' }));
  }

  const validateSearchForm = () => {
    const errs: Record<string, string> = {};
    if (!foodType) errs.foodType = 'Food Type is required.';
    if (!dietTypeSearch) errs.dietType = 'Diet Type is required.';
    if (!foodItemSearch) errs.foodItem = 'Food Item is required.';
    if (!sourceSearch) errs.source = 'Source is required.';
    if (!packagingSearch) errs.packaging = 'Packaging is required.';
    if (!servingsSearch) errs.servings = 'Servings is required.';
    if (!quantitySearch || Number(quantitySearch) < 1)
      errs.quantity = 'Quantity must be at least 1.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateScanForm = () => {
    const errs: Record<string, string> = {};
    if (!foodTypeScan) errs.foodType = 'Food Type is required.';
    if (!barcodeScan) {
      errs.barcode = 'Barcode is required.';
    } else if (!/^\d+$/.test(barcodeScan)) {
      errs.barcode = 'Barcode must contain numbers only.';
    }
    if (!sourceScan) errs.source = 'Source is required.';
    if (!packagingScan) errs.packaging = 'Packaging is required.';
    if (!servingsScan) errs.servings = 'Servings is required.';
    if (!quantityScan || Number(quantityScan) < 1) errs.quantity = 'Quantity must be at least 1.';

    setErrorsScan(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRecentForm = () => {
    const errs: Record<string, string> = {};
    if (!foodTypeRecent) errs.foodType = 'Food Type is required.';
    if (!recentFoodSelect) errs.recentFood = 'Recent Food is required.';
    if (!sourceRecent) errs.source = 'Source is required.';
    if (!packagingRecent) errs.packaging = 'Packaging is required.';
    if (!servingsRecent) errs.servings = 'Servings is required.';
    if (!quantityRecent || Number(quantityRecent) < 1)
      errs.quantity = 'Quantity must be at least 1.';

    setErrorsRecent(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAiForm = () => {
    const errs: Record<string, string> = {};
    if (!foodTypeAi) errs.foodType = 'Food Type is required.';
    if (!dietTypeAi) errs.dietType = 'Diet Type is required.';
    if (!foodDescriptionAi) {
      errs.foodDescription = 'Describe your food item is required.';
    } else if (foodDescriptionAi.trim().length < 5) {
      errs.foodDescription = 'Describe your food item in a little more detail.';
    }
    if (!sourceAi) errs.source = 'Source is required.';
    if (!packagingAi) errs.packaging = 'Packaging is required.';
    if (!servingsAi) errs.servings = 'Servings is required.';
    if (!quantityAi || Number(quantityAi) < 1) errs.quantity = 'Quantity must be at least 1.';

    setErrorsAi(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRecentFoodChange = (label: string) => {
    setRecentFoodSelect(label);
    setErrorsRecent((prev) => ({ ...prev, recentFood: '' }));

    const matched = recentFoodOptions.find((x) => x.label === label);
    if (matched && matched.note) {
      const extractedFoodName = extractDetail(matched.note, 'Food Name');
      if (extractedFoodName) setFoodNameRecent(extractedFoodName);

      const extractedFoodType =
        extractDetail(matched.note, 'Food type') || extractDetail(matched.note, 'Meal type');
      if (extractedFoodType) setFoodTypeRecent(extractedFoodType);

      const extractedSource =
        extractDetail(matched.note, 'Source') || extractDetail(matched.note, 'Meal source');
      if (extractedSource) setSourceRecent(extractedSource);

      const extractedPackaging = extractDetail(matched.note, 'Packaging');
      if (extractedPackaging) setPackagingRecent(extractedPackaging);

      const extractedQuantity = extractDetail(matched.note, 'Quantity');
      if (extractedQuantity) {
        const parsedQty = parseInt(extractedQuantity, 10);
        if (!isNaN(parsedQty)) setQuantityRecent(String(parsedQty));
      }

      const extractedServings =
        extractDetail(matched.note, 'Servings') || extractDetail(matched.note, 'Serving');
      if (extractedServings) {
        const mappedServings = mapInternalUnitToServings(extractedServings);
        setServingsRecent(mappedServings);
      }
    }
  };

  const handleFoodLinkScrape = async () => {
    if (!productLinkScan.trim()) {
      setLookupErrorScan('Please enter a product link.');
      return;
    }
    setIsFetchingLinkScan(true);
    setLookupErrorScan(null);
    try {
      const res = await fetch('/api/products/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productLinkScan.trim() }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setLookupErrorScan(result.error || 'Failed to fetch product details.');
        return;
      }

      const data = result.data;
      if (data) {
        if (data.title) setFoodNameScan(data.title);
        setSourceScan('Delivery');
        setPackagingScan('Mixed');
        setFoodTypeScan('Snack');
        setServingsScan('Plates');
        setQuantityScan('1');
      }
    } catch (err) {
      setLookupErrorScan('An unexpected error occurred while fetching product details.');
    } finally {
      setIsFetchingLinkScan(false);
    }
  };

  const handleFoodBarcodeLookupWithCode = async (codeToLookup: string) => {
    const trimmed = codeToLookup.trim();
    if (!trimmed) {
      setLookupErrorScan('Please enter a barcode.');
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      setLookupErrorScan('Barcode must contain numbers only.');
      return;
    }
    setIsLookingUpBarcodeScan(true);
    setLookupErrorScan(null);
    try {
      const res = await fetch(`/api/products/barcode/${trimmed}`);
      const result = await res.json();
      if (!res.ok || result.success === false) {
        setLookupErrorScan(result.error || 'Barcode lookup failed.');
        return;
      }

      const product = result.product;
      if (!product || !product.found) {
        setLookupErrorScan('Product not found. You can still enter details manually below.');
        return;
      }

      const mapped = mapOpenFoodFactsToFood(product);
      setFoodNameScan(mapped.productName);
      setPackagingScan(mapped.packaging);
      setSourceScan('Other');
      setFoodTypeScan('Snack');
      setServingsScan('Plates');
      setQuantityScan('1');
      setBarcodeScan(trimmed);
    } catch (err) {
      setLookupErrorScan('An unexpected error occurred during barcode lookup.');
    } finally {
      setIsLookingUpBarcodeScan(false);
    }
  };

  const handleFoodBarcodeLookup = async () => {
    await handleFoodBarcodeLookupWithCode(barcodeScan);
  };

  // Camera Barcode Scanner effects and controls
  useEffect(() => {
    if (foodMode !== 'barcode' && scannerInstance) {
      void scannerInstance.stop().catch((err: unknown) => {
        console.error("Failed to stop scanner on tab change", err);
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCameraScan(false);
      setScannerInstance(null);
    }
    return () => {
      if (scannerInstance) {
        void scannerInstance.stop().catch((err: unknown) => {
          console.error("Failed to stop scanner on unmount", err);
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodMode]);

  const startCameraScanner = async () => {
    try {
      setCameraErrorScan(null);
      setShowCameraScan(true);
      
      setTimeout(async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          const html5QrCode = new Html5Qrcode('barcode-scanner-viewport');
          setScannerInstance(html5QrCode);

          const config = {
            fps: 10,
            qrbox: (width: number, height: number) => {
              const w = Math.min(width * 0.8, 320);
              const h = Math.min(height * 0.4, 160);
              return { width: w, height: h };
            },
            aspectRatio: 1.0,
          };

          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              setBarcodeScan(decodedText);
              setErrorsScan((prev) => ({ ...prev, barcode: '' }));
              
              html5QrCode.stop().then(() => {
                setShowCameraScan(false);
                setScannerInstance(null);
                void handleFoodBarcodeLookupWithCode(decodedText);
              }).catch((err) => {
                console.error("Failed to stop scanner after success", err);
                setShowCameraScan(false);
                setScannerInstance(null);
              });
            },
            () => {}
          );
        } catch (err: any) {
          console.error("Error inside scanner initialization timeout:", err);
          setCameraErrorScan(err?.message || "Failed to start camera scanner.");
          setShowCameraScan(false);
        }
      }, 300);

    } catch (err: any) {
      console.error("Error starting camera scanner:", err);
      setCameraErrorScan(err?.message || "Failed to access camera.");
      setShowCameraScan(false);
    }
  };

  const stopCameraScanner = async () => {
    if (scannerInstance) {
      try {
        await scannerInstance.stop();
      } catch (err) {
        console.error("Failed to stop camera scanner on click", err);
      }
      setScannerInstance(null);
    }
    setShowCameraScan(false);
  };

  function handleFoodModeChange(nextMode: FoodMode) {
    setFoodMode(nextMode);

    if (nextMode === 'search') {
      setMealType('');
      setDietType('');
      setFoodItemId('');

      // Reset search errors and state values
      setFoodName('');
      setFoodType('');
      setDietTypeSearch('');
      setFoodItemSearch('');
      setSourceSearch('');
      setPackagingSearch('');
      setQuantitySearch('1');
      setServingsSearch('');
      setErrors({});
    } else if (nextMode === 'barcode') {
      setMealType('');
      setDietType('');
      setFoodItemId('');

      // Reset barcode errors and state values
      setFoodNameScan('');
      setFoodTypeScan('');
      setBarcodeScan('');
      setSourceScan('');
      setPackagingScan('');
      setQuantityScan('1');
      setServingsScan('');
      setErrorsScan({});

      // Reset helper states
      setProductLinkScan('');
      setLookupErrorScan(null);
    } else if (nextMode === 'recent') {
      setMealType('');
      setDietType('');
      setFoodItemId('');

      // Reset recent form errors and state values
      setFoodNameRecent('');
      setFoodTypeRecent('');
      setRecentFoodSelect('');
      setSourceRecent('');
      setPackagingRecent('');
      setQuantityRecent('1');
      setServingsRecent('');
      setErrorsRecent({});
    } else if (nextMode === 'ai') {
      setMealType('');
      setDietType('');
      setFoodItemId('');

      // Reset Ask AI errors and state values
      setFoodNameAi('');
      setFoodTypeAi('');
      setDietTypeAi('');
      setFoodDescriptionAi('');
      setSourceAi('');
      setPackagingAi('');
      setQuantityAi('1');
      setServingsAi('');
      setErrorsAi({});
    }
  }

  return (
    <form
      id="active-log-form"
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();

        if (foodMode === 'search') {
          if (!validateSearchForm()) return;

          void onSubmit({
            subType: selectedEngineSubType,
            meals: quantityMultiplier,
            occurredAt: loadTime.toISOString(),
            note: joinNote(note, {
              'Food logging mode': 'Search',
              'Food Name': foodName || null,
              'Food type': foodType,
              'Diet type': dietTypeSearch,
              'Food item': foodItemSearch,
              Source: sourceSearch,
              Packaging: packagingSearch,
              Quantity: quantitySearch,
              Servings: servingsSearch,
              'Pre-recorded estimate': `${estimatedFoodKg.toFixed(2)} kg CO₂e`,
            }),
          });
        } else if (foodMode === 'barcode') {
          if (!validateScanForm()) return;

          void onSubmit({
            subType: selectedEngineSubType,
            meals: quantityMultiplier,
            occurredAt: loadTime.toISOString(),
            note: joinNote(note, {
              'Food logging mode': 'Barcode',
              'Food Name': foodNameScan || null,
              'Food type': foodTypeScan,
              Barcode: barcodeScan,
              Source: sourceScan,
              Packaging: packagingScan,
              Quantity: quantityScan,
              Servings: servingsScan,
              'Pre-recorded estimate': `${estimatedFoodKg.toFixed(2)} kg CO₂e`,
            }),
          });
        } else if (foodMode === 'recent') {
          if (!validateRecentForm()) return;

          void onSubmit({
            subType: selectedEngineSubType,
            meals: quantityMultiplier,
            occurredAt: loadTime.toISOString(),
            note: joinNote(note, {
              'Food logging mode': 'Recent',
              'Food Name': foodNameRecent || null,
              'Food type': foodTypeRecent,
              'Recent Food': recentFoodSelect,
              Source: sourceRecent,
              Packaging: packagingRecent,
              Quantity: quantityRecent,
              Servings: servingsRecent,
              'Pre-recorded estimate': `${estimatedFoodKg.toFixed(2)} kg CO₂e`,
            }),
          });
        } else if (foodMode === 'ai') {
          if (!validateAiForm()) return;

          void onSubmit({
            subType: selectedEngineSubType,
            meals: quantityMultiplier,
            occurredAt: loadTime.toISOString(),
            note: joinNote(note, {
              'Food logging mode': 'AI Meal',
              'Food Name': foodNameAi || null,
              'Food type': foodTypeAi,
              'Diet type': dietTypeAi,
              'Food description': foodDescriptionAi,
              Source: sourceAi,
              Packaging: packagingAi,
              Quantity: quantityAi,
              Servings: servingsAi,
              'Pre-recorded estimate': `${estimatedFoodKg.toFixed(2)} kg CO₂e`,
            }),
          });
        }
      }}
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FoodModeButton
          mode="search"
          activeMode={foodMode}
          icon={Search}
          title="Search Food"
          description="Find a food item."
          onClick={handleFoodModeChange}
        />

        <FoodModeButton
          mode="barcode"
          activeMode={foodMode}
          icon={Barcode}
          title="Scan Food"
          description="Packaged food."
          onClick={handleFoodModeChange}
        />

        <FoodModeButton
          mode="ai"
          activeMode={foodMode}
          icon={Sparkles}
          title="Ask AI"
          description="Describe the meal."
          onClick={handleFoodModeChange}
        />

        <FoodModeButton
          mode="recent"
          activeMode={foodMode}
          icon={Clock3}
          title="Recent"
          description="Repeat a meal."
          onClick={handleFoodModeChange}
        />
      </section>

      <section className="space-y-5">
        {foodMode === 'search' && (
          <>
            {/* 1. Food Name - Full Width */}
            <div>
              <InputField
                label="Food Name"
                placeholder="Enter your food name"
                value={foodName}
                onChange={setFoodName}
                helper="This field is optional."
              />
            </div>

            {/* 2. Date and Time - Full Width */}
            <div>
              <FieldLabel
                label="Date and Time"
                helper="This field is autofilled with the current date and time."
              >
                <input
                  type="text"
                  readOnly
                  value={formatDateForDisplay(loadTime)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-surface/50 px-3 text-sm font-semibold text-text-secondary outline-none cursor-not-allowed"
                />
              </FieldLabel>
            </div>

            {/* 3. Food Type & 4. Diet Type - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <SelectField
                  label="Food Type"
                  value={foodType}
                  onChange={handleFoodTypeChange}
                  options={foodTypeOptions}
                />
                {errors.foodType && <ValidationError message={errors.foodType} />}
              </div>

              <div>
                <FieldLabel label="Diet Type">
                  <select
                    value={dietTypeSearch}
                    onChange={(event) => handleDietTypeChange(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    {dietTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errors.dietType && <ValidationError message={errors.dietType} />}
              </div>
            </div>

            {/* 5. Food Item - Full Width */}
            <div>
              <FieldLabel
                label="Food Item"
                helper={
                  dietTypeSearch
                    ? 'Only foods matching the selected diet type are shown.'
                    : 'Food items will appear after diet type is selected.'
                }
              >
                <select
                  value={foodItemSearch}
                  onChange={(event) => {
                    setFoodItemSearch(event.target.value);
                    setErrors((prev) => ({ ...prev, foodItem: '' }));
                  }}
                  disabled={!dietTypeSearch}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select your food item</option>
                  {foodItemOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.foodItem && <ValidationError message={errors.foodItem} />}
            </div>

            {/* 6. Source & 7. Packaging - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <SelectField
                  label="Source"
                  value={sourceSearch}
                  onChange={(val) => {
                    setSourceSearch(val);
                    setErrors((prev) => ({ ...prev, source: '' }));
                  }}
                  options={sourceOptions}
                />
                {errors.source && <ValidationError message={errors.source} />}
              </div>

              <div>
                <SelectField
                  label="Packaging"
                  value={packagingSearch}
                  onChange={(val) => {
                    setPackagingSearch(val);
                    setErrors((prev) => ({ ...prev, packaging: '' }));
                  }}
                  options={packagingOptions}
                />
                {errors.packaging && <ValidationError message={errors.packaging} />}
              </div>
            </div>

            {/* 8. Quantity & 9. Servings - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <InputField
                  label="Quantity"
                  value={quantitySearch}
                  onChange={(val) => {
                    const cleaned = val.replace(/[^0-9]/g, '');
                    setQuantitySearch(cleaned);
                    setErrors((prev) => ({ ...prev, quantity: '' }));
                  }}
                  placeholder="Enter quantity"
                  inputMode="numeric"
                />
                {errors.quantity && <ValidationError message={errors.quantity} />}
              </div>

              <div>
                <SelectField
                  label="Servings"
                  value={servingsSearch}
                  onChange={(val) => {
                    setServingsSearch(val);
                    setErrors((prev) => ({ ...prev, servings: '' }));
                  }}
                  options={servingsOptions}
                />
                {errors.servings && <ValidationError message={errors.servings} />}
              </div>
            </div>
          </>
        )}

        {foodMode === 'barcode' && (
          <>
            {/* Helper Grid for Scan Food */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* 1. Product Link Scraper */}
              <div className="rounded-2xl border border-border-default bg-bg-surface/30 p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text-primary mb-1">Product Link Scraper</h4>
                  <p className="text-xs text-text-secondary mb-3">Paste e-commerce link to extract food name.</p>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Paste URL..."
                    value={productLinkScan}
                    onChange={(e) => setProductLinkScan(e.target.value)}
                    className="flex-1 h-10 min-w-0 rounded-xl border border-border-default bg-bg-base px-3 text-xs font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary placeholder:text-text-muted"
                  />
                  <button
                    type="button"
                    onClick={handleFoodLinkScrape}
                    disabled={isFetchingLinkScan || !productLinkScan}
                    className="h-10 px-3 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 shrink-0"
                  >
                    {isFetchingLinkScan ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* 2. Barcode Lookup */}
              <div className="rounded-2xl border border-border-default bg-bg-surface/30 p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text-primary mb-1">Barcode Lookup</h4>
                  <p className="text-xs text-text-secondary mb-3">Lookup barcode from Open Food Facts database.</p>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="e.g. 8901030752538"
                    value={barcodeScan}
                    onChange={(e) => setBarcodeScan(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    className="flex-1 h-10 min-w-0 rounded-xl border border-border-default bg-bg-base px-3 text-xs font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary placeholder:text-text-muted"
                  />
                  <button
                    type="button"
                    onClick={showCameraScan ? stopCameraScanner : startCameraScanner}
                    className={`h-10 w-10 rounded-xl border border-border-default transition-colors flex items-center justify-center shrink-0 ${showCameraScan ? 'bg-status-error/10 hover:bg-status-error/20 text-status-error border-status-error/30' : 'bg-bg-base hover:bg-bg-surface text-text-primary'}`}
                    title={showCameraScan ? "Stop scanner" : "Scan using camera"}
                  >
                    {showCameraScan ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleFoodBarcodeLookup}
                    disabled={isLookingUpBarcodeScan || !barcodeScan}
                    className="h-10 px-3 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 shrink-0"
                  >
                    {isLookingUpBarcodeScan ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Barcode className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {showCameraScan && (
              <div className="rounded-2xl border border-border-default bg-bg-surface p-4 flex flex-col items-center gap-3 relative overflow-hidden ring-2 ring-accent-primary/20 transition-all">
                <div className="w-full flex justify-between items-center mb-1">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Camera Barcode Scanner</h4>
                    <p className="text-xs text-text-secondary">Position the barcode inside the target box.</p>
                  </div>
                  <button
                    type="button"
                    onClick={stopCameraScanner}
                    className="flex h-8 px-3 items-center justify-center rounded-xl bg-status-error/10 hover:bg-status-error/20 text-status-error text-xs font-bold transition-colors"
                  >
                    Cancel Scan
                  </button>
                </div>
                
                <div 
                  id="barcode-scanner-viewport" 
                  className="w-full max-w-md aspect-video rounded-xl overflow-hidden bg-black relative border border-border-default"
                />

                <div className="text-xs text-text-secondary flex items-center gap-1.5 mt-1">
                  <span className="h-2 w-2 rounded-full bg-accent-primary animate-pulse" />
                  <span>Scanning active... Please align your product barcode.</span>
                </div>
              </div>
            )}

            {cameraErrorScan && (
              <div className="rounded-xl bg-status-error/10 p-3 text-xs font-semibold text-status-error flex justify-between items-center">
                <span>{cameraErrorScan}</span>
                <button 
                  type="button" 
                  onClick={() => setCameraErrorScan(null)}
                  className="text-xs underline hover:text-status-error/80 ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {lookupErrorScan && (
              <div className="rounded-xl bg-status-error/10 p-3 text-xs font-semibold text-status-error">
                {lookupErrorScan}
              </div>
            )}

            <div className="border-t border-border-default pt-5" />

            {/* 1. Food Name - Full Width */}
            <div>
              <InputField
                label="Food Name"
                placeholder="Enter your food name"
                value={foodNameScan}
                onChange={setFoodNameScan}
                helper="This field is optional."
              />
            </div>

            {/* 2. Date and Time - Full Width */}
            <div>
              <FieldLabel
                label="Date and Time"
                helper="This field is autofilled with the current date and time."
              >
                <input
                  type="text"
                  readOnly
                  value={formatDateForDisplay(loadTime)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-surface/50 px-3 text-sm font-semibold text-text-secondary outline-none cursor-not-allowed"
                />
              </FieldLabel>
            </div>

            {/* 3. Food Type & 4. Barcode - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <SelectField
                  label="Food Type"
                  value={foodTypeScan}
                  onChange={(val) => {
                    setFoodTypeScan(val);
                    setErrorsScan((prev) => ({ ...prev, foodType: '' }));
                  }}
                  options={foodTypeScanOptions}
                />
                {errorsScan.foodType && <ValidationError message={errorsScan.foodType} />}
              </div>

              <div>
                <InputField
                  label="Barcode"
                  placeholder="Enter your product barcode"
                  value={barcodeScan}
                  onChange={(val) => {
                    // Only allow numeric digits to be typed
                    const cleaned = val.replace(/[^\d]/g, '');
                    setBarcodeScan(cleaned);
                    setErrorsScan((prev) => ({ ...prev, barcode: '' }));
                  }}
                  inputMode="numeric"
                />
                {errorsScan.barcode && <ValidationError message={errorsScan.barcode} />}
              </div>
            </div>

            {/* 5. Source & 6. Packaging - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <SelectField
                  label="Source"
                  value={sourceScan}
                  onChange={(val) => {
                    setSourceScan(val);
                    setErrorsScan((prev) => ({ ...prev, source: '' }));
                  }}
                  options={sourceOptions}
                />
                {errorsScan.source && <ValidationError message={errorsScan.source} />}
              </div>

              <div>
                <SelectField
                  label="Packaging"
                  value={packagingScan}
                  onChange={(val) => {
                    setPackagingScan(val);
                    setErrorsScan((prev) => ({ ...prev, packaging: '' }));
                  }}
                  options={packagingOptions}
                />
                {errorsScan.packaging && <ValidationError message={errorsScan.packaging} />}
              </div>
            </div>

            {/* 7. Quantity & 8. Servings - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <InputField
                  label="Quantity"
                  value={quantityScan}
                  onChange={(val) => {
                    const cleaned = val.replace(/[^0-9]/g, '');
                    setQuantityScan(cleaned);
                    setErrorsScan((prev) => ({ ...prev, quantity: '' }));
                  }}
                  placeholder="Enter quantity"
                  inputMode="numeric"
                />
                {errorsScan.quantity && <ValidationError message={errorsScan.quantity} />}
              </div>

              <div>
                <SelectField
                  label="Servings"
                  value={servingsScan}
                  onChange={(val) => {
                    setServingsScan(val);
                    setErrorsScan((prev) => ({ ...prev, servings: '' }));
                  }}
                  options={servingsOptions}
                />
                {errorsScan.servings && <ValidationError message={errorsScan.servings} />}
              </div>
            </div>
          </>
        )}

        {foodMode === 'recent' && (
          <>
            {/* 1. Food Name - Full Width */}
            <div>
              <InputField
                label="Food Name"
                placeholder="Enter your food name"
                value={foodNameRecent}
                onChange={setFoodNameRecent}
                helper="This field is optional."
              />
            </div>

            {/* 2. Date and Time - Full Width */}
            <div>
              <FieldLabel
                label="Date and Time"
                helper="This field is autofilled with the current date and time."
              >
                <input
                  type="text"
                  readOnly
                  value={formatDateForDisplay(loadTime)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-surface/50 px-3 text-sm font-semibold text-text-secondary outline-none cursor-not-allowed"
                />
              </FieldLabel>
            </div>

            {/* 3. Food Type & 4. Recent Food - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <SelectField
                  label="Food Type"
                  value={foodTypeRecent}
                  onChange={(val) => {
                    setFoodTypeRecent(val);
                    setErrorsRecent((prev) => ({ ...prev, foodType: '' }));
                  }}
                  options={foodTypeOptions}
                />
                {errorsRecent.foodType && <ValidationError message={errorsRecent.foodType} />}
              </div>

              <div>
                <SelectField
                  label="Recent Food"
                  value={recentFoodSelect}
                  onChange={(val) => {
                    handleRecentFoodChange(val);
                  }}
                  options={recentSelectOptions}
                />
                {errorsRecent.recentFood && <ValidationError message={errorsRecent.recentFood} />}
              </div>
            </div>

            {/* 5. Source & 6. Packaging - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <SelectField
                  label="Source"
                  value={sourceRecent}
                  onChange={(val) => {
                    setSourceRecent(val);
                    setErrorsRecent((prev) => ({ ...prev, source: '' }));
                  }}
                  options={sourceOptions}
                />
                {errorsRecent.source && <ValidationError message={errorsRecent.source} />}
              </div>

              <div>
                <SelectField
                  label="Packaging"
                  value={packagingRecent}
                  onChange={(val) => {
                    setPackagingRecent(val);
                    setErrorsRecent((prev) => ({ ...prev, packaging: '' }));
                  }}
                  options={packagingOptions}
                />
                {errorsRecent.packaging && <ValidationError message={errorsRecent.packaging} />}
              </div>
            </div>

            {/* 7. Quantity & 8. Servings - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <InputField
                  label="Quantity"
                  value={quantityRecent}
                  onChange={(val) => {
                    const cleaned = val.replace(/[^0-9]/g, '');
                    setQuantityRecent(cleaned);
                    setErrorsRecent((prev) => ({ ...prev, quantity: '' }));
                  }}
                  placeholder="Enter quantity"
                  inputMode="numeric"
                />
                {errorsRecent.quantity && <ValidationError message={errorsRecent.quantity} />}
              </div>

              <div>
                <SelectField
                  label="Servings"
                  value={servingsRecent}
                  onChange={(val) => {
                    setServingsRecent(val);
                    setErrorsRecent((prev) => ({ ...prev, servings: '' }));
                  }}
                  options={servingsOptions}
                />
                {errorsRecent.servings && <ValidationError message={errorsRecent.servings} />}
              </div>
            </div>
          </>
        )}

        {foodMode === 'ai' && (
          <>
            {/* 1. Food Name - Full Width */}
            <div>
              <InputField
                label="Food Name"
                placeholder="Enter your food name"
                value={foodNameAi}
                onChange={setFoodNameAi}
                helper="This field is optional."
              />
            </div>

            {/* 2. Date and Time - Full Width */}
            <div>
              <FieldLabel
                label="Date and Time"
                helper="This field is autofilled with the current date and time."
              >
                <input
                  type="text"
                  readOnly
                  value={formatDateForDisplay(loadTime)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-surface/50 px-3 text-sm font-semibold text-text-secondary outline-none cursor-not-allowed"
                />
              </FieldLabel>
            </div>

            {/* 3. Food Type & 4. Diet Type - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <SelectField
                  label="Food Type"
                  value={foodTypeAi}
                  onChange={(val) => {
                    setFoodTypeAi(val);
                    setErrorsAi((prev) => ({ ...prev, foodType: '' }));
                  }}
                  options={foodTypeOptions}
                />
                {errorsAi.foodType && <ValidationError message={errorsAi.foodType} />}
              </div>

              <div>
                <SelectField
                  label="Diet Type"
                  value={dietTypeAi}
                  onChange={(val) => {
                    setDietTypeAi(val);
                    setErrorsAi((prev) => ({ ...prev, dietType: '' }));
                  }}
                  options={dietTypeOptions}
                />
                {errorsAi.dietType && <ValidationError message={errorsAi.dietType} />}
              </div>
            </div>

            {/* 5. Describe your food item - Full Width */}
            <div>
              <TextareaField
                label="Describe your food item"
                helper="Example: Breakfast with 2 idlis, coconut chutney, and one cup of tea."
                placeholder="Describe your food item"
                value={foodDescriptionAi}
                onChange={(val) => {
                  setFoodDescriptionAi(val);
                  setErrorsAi((prev) => ({ ...prev, foodDescription: '' }));
                }}
                rows={5}
              />
              {errorsAi.foodDescription && <ValidationError message={errorsAi.foodDescription} />}
            </div>

            {/* 6. Source & 7. Packaging - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <SelectField
                  label="Source"
                  value={sourceAi}
                  onChange={(val) => {
                    setSourceAi(val);
                    setErrorsAi((prev) => ({ ...prev, source: '' }));
                  }}
                  options={sourceOptions}
                />
                {errorsAi.source && <ValidationError message={errorsAi.source} />}
              </div>

              <div>
                <SelectField
                  label="Packaging"
                  value={packagingAi}
                  onChange={(val) => {
                    setPackagingAi(val);
                    setErrorsAi((prev) => ({ ...prev, packaging: '' }));
                  }}
                  options={packagingOptions}
                />
                {errorsAi.packaging && <ValidationError message={errorsAi.packaging} />}
              </div>
            </div>

            {/* 8. Quantity & 9. Servings - Side by Side */}
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <InputField
                  label="Quantity"
                  value={quantityAi}
                  onChange={(val) => {
                    const cleaned = val.replace(/[^0-9]/g, '');
                    setQuantityAi(cleaned);
                    setErrorsAi((prev) => ({ ...prev, quantity: '' }));
                  }}
                  placeholder="Enter quantity"
                  inputMode="numeric"
                />
                {errorsAi.quantity && <ValidationError message={errorsAi.quantity} />}
              </div>

              <div>
                <SelectField
                  label="Servings"
                  value={servingsAi}
                  onChange={(val) => {
                    setServingsAi(val);
                    setErrorsAi((prev) => ({ ...prev, servings: '' }));
                  }}
                  options={servingsOptions}
                />
                {errorsAi.servings && <ValidationError message={errorsAi.servings} />}
              </div>
            </div>
          </>
        )}
      </section>

      <TextareaField
        label="Notes"
        helper="Optional."
        value={note}
        onChange={setNote}
        placeholder="Add restaurant name, brand, barcode, ingredients, or anything useful."
      />

      <SubmitRow
        isSubmitting={isSubmitting}
        hideActions={hideActions}
        submitLabel="Log food"
        disabled={foodMode === 'search' ? false : !canSubmitFood}
      />
    </form>
  );
}

const POPULAR_PRODUCTS = [
  {
    id: 'smartphone',
    name: 'Smartphone',
    category: 'Electronics',
    productType: 'Smartphone',
    brand: 'Generic Brand',
    condition: 'New',
    material: 'Plastic',
    packaging: 'Cardboard',
    expectedUsageDuration: '1-3 years',
    price: 30000,
  },
  {
    id: 'laptop',
    name: 'Laptop',
    category: 'Electronics',
    productType: 'Laptop',
    brand: 'Generic Brand',
    condition: 'New',
    material: 'Metal',
    packaging: 'Cardboard',
    expectedUsageDuration: '1-3 years',
    price: 60000,
  },
  {
    id: 'tshirt',
    name: 'Cotton T-Shirt',
    category: 'Clothing',
    productType: 'T-Shirt',
    brand: 'Generic Brand',
    condition: 'New',
    material: 'Cotton',
    packaging: 'Paper',
    expectedUsageDuration: '6-12 months',
    price: 1000,
  },
  {
    id: 'jeans',
    name: 'Denim Jeans',
    category: 'Clothing',
    productType: 'Jeans',
    brand: 'Generic Brand',
    condition: 'New',
    material: 'Cotton',
    packaging: 'None',
    expectedUsageDuration: '1-3 years',
    price: 2500,
  },
  {
    id: 'shoes',
    name: 'Leather Shoes',
    category: 'Clothing',
    productType: 'Shoes',
    brand: 'Generic Brand',
    condition: 'New',
    material: 'Leather',
    packaging: 'Cardboard',
    expectedUsageDuration: '1-3 years',
    price: 4000,
  },
  {
    id: 'toothbrush',
    name: 'Eco Toothbrush',
    category: 'Personal Care',
    productType: 'Toothbrush',
    brand: 'Generic Brand',
    condition: 'New',
    material: 'Wood',
    packaging: 'Paper',
    expectedUsageDuration: 'Less than 1 month',
    price: 150,
  },
  {
    id: 'book',
    name: 'Paperback Novel',
    category: 'Books',
    productType: 'Paperback Book',
    brand: 'Generic Brand',
    condition: 'New',
    material: 'Paper',
    packaging: 'None',
    expectedUsageDuration: 'More than 3 years',
    price: 400,
  },
] as const;

function mapOpenFoodFactsToShopping(product: any) {
  const name = product.productName || '';
  const brand = product.brand || '';
  const categories = product.categories || [];
  const categoryTags = product.categoryTags || [];
  const text = `${name} ${categories.join(' ')} ${categoryTags.join(' ')}`.toLowerCase();

  let shoppingCategory = 'Other';
  let productType = 'General Product';
  let material = 'Mixed';
  let packaging = 'Mixed';

  if (
    text.includes('shampoo') ||
    text.includes('soap') ||
    text.includes('toothpaste') ||
    text.includes('toothbrush') ||
    text.includes('deodorant')
  ) {
    shoppingCategory = 'Personal Care';
    if (text.includes('toothbrush')) productType = 'Toothbrush';
    else if (text.includes('shampoo')) productType = 'Shampoo';
    else if (text.includes('soap')) productType = 'Soap';
    else if (text.includes('deodorant')) productType = 'Deodorant';
    else productType = 'Toothbrush';
  } else if (
    text.includes('cream') ||
    text.includes('makeup') ||
    text.includes('skincare') ||
    text.includes('perfume') ||
    text.includes('moisturizer')
  ) {
    shoppingCategory = 'Beauty';
    if (text.includes('perfume')) productType = 'Perfume';
    else if (text.includes('cream') || text.includes('moisturizer')) productType = 'Moisturizer';
    else if (text.includes('makeup')) productType = 'Makeup Product';
    else productType = 'Skincare Product';
  } else if (
    text.includes('beverage') ||
    text.includes('food') ||
    text.includes('snack') ||
    text.includes('drink') ||
    text.includes('water') ||
    text.includes('soda') ||
    text.includes('juice') ||
    text.includes('chocolate') ||
    text.includes('biscuit') ||
    text.includes('cookie') ||
    text.includes('cereal') ||
    text.includes('milk') ||
    text.includes('yogurt') ||
    text.includes('cheese')
  ) {
    shoppingCategory = 'Other';
    productType = 'General Product';
  }

  if (text.includes('plastic')) {
    material = 'Plastic';
  } else if (text.includes('metal') || text.includes('aluminum')) {
    material = 'Metal';
  } else if (text.includes('glass')) {
    material = 'Glass';
  } else if (text.includes('paper') || text.includes('cardboard')) {
    material = 'Paper';
  } else if (text.includes('wood') || text.includes('bamboo')) {
    material = 'Wood';
  }

  const pkgText = (product.packaging || '').toLowerCase();
  if (
    pkgText.includes('plastic') ||
    pkgText.includes('bottle') ||
    pkgText.includes('sachet') ||
    pkgText.includes('wrapper')
  ) {
    packaging = 'Plastic';
  } else if (pkgText.includes('paper') || pkgText.includes('bag')) {
    packaging = 'Paper';
  } else if (pkgText.includes('cardboard') || pkgText.includes('box')) {
    packaging = 'Cardboard';
  } else if (pkgText.includes('none') || pkgText.includes('no packaging')) {
    packaging = 'None';
  }

  return {
    productName: name,
    brand,
    shoppingCategory,
    productType,
    material,
    packaging,
  };
}

export function ShoppingForm({
  onSubmit,
  isSubmitting,
  hideActions,
  onLiveEstimateChange,
  onEstimateInputChange,
  todayStr: _todayStr,
}: BaseFormProps<ShoppingFormInput>) {
  // ── State ──────────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<'product' | 'receipt' | 'shipment'>('product');

  // Product Logging States
  const [productName, setProductName] = useState('');
  const [loadTime] = useState(() => new Date());
  const [shoppingCategory, setShoppingCategory] = useState('');
  const [productType, setProductType] = useState('');
  const [brand, setBrand] = useState('');
  const [purchaseSource, setPurchaseSource] = useState('');
  const [purchaseCondition, setPurchaseCondition] = useState('');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [packaging, setPackaging] = useState('');
  const [expectedUsageDuration, setExpectedUsageDuration] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Product helper states
  const [productLink, setProductLink] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Receipt States
  const [receiptFilename, setReceiptFilename] = useState('');
  const [receiptType, setReceiptType] = useState('SHOPPING');
  const [receiptCategory, setReceiptCategory] = useState('SHOPPING');
  const [receiptSubType, setReceiptSubType] = useState('General Product');
  const [receiptQuantity, setReceiptQuantity] = useState('1');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [receiptIsSubmitting, setReceiptIsSubmitting] = useState(false);
  const [receiptMessage, setReceiptMessage] = useState<string | null>(null);
  const [receiptActivityId, setReceiptActivityId] = useState<string | null>(null);

  // Shipment States
  const [shipmentWeight, setShipmentWeight] = useState('1');
  const [shipmentDistance, setShipmentDistance] = useState('100');
  const [shipmentMode, setShipmentMode] = useState<'Air' | 'Road' | 'Rail' | 'Sea'>('Road');
  const [shipmentNotes, setShipmentNotes] = useState('');

  // ── Derived ────────────────────────────────────────────────────────────────

  const productTypeOptions = useMemo(
    () => (shoppingCategory ? (PRODUCT_TYPES_BY_CATEGORY[shoppingCategory] ?? []) : []),
    [shoppingCategory],
  );

  // ── Live Estimate ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'product') {
      if (shoppingCategory && productType && Number(quantity) > 0) {
        onEstimateInputChange?.({
          subType: productType,
          quantity: Number(quantity) || 1,
          shoppingCategory,
          productName: productName || null,
          productType,
          brand: brand || null,
          purchaseSource,
          condition: purchaseCondition,
          material,
          price: price ? Number(price) : 0,
          currency: 'INR',
          packaging,
          expectedUsageDuration,
        });
      } else {
        onLiveEstimateChange?.(0);
      }
    } else if (activeTab === 'shipment') {
      const dist = Number(shipmentDistance);
      const w = Number(shipmentWeight);
      if (dist > 0 && w > 0) {
        onEstimateInputChange?.({
          subType: 'shipment',
          quantity: dist,
          weight: w,
          material: shipmentMode,
        });
      } else {
        onLiveEstimateChange?.(0);
      }
    } else {
      onLiveEstimateChange?.(0);
    }
  }, [
    activeTab,
    quantity,
    shoppingCategory,
    productName,
    productType,
    brand,
    purchaseSource,
    purchaseCondition,
    material,
    price,
    packaging,
    expectedUsageDuration,
    shipmentWeight,
    shipmentDistance,
    shipmentMode,
    onEstimateInputChange,
    onLiveEstimateChange,
  ]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCategoryChange = (val: string) => {
    setShoppingCategory(val);
    setProductType('');
    setErrors((prev) => ({ ...prev, shoppingCategory: '', productType: '' }));
  };

  const handleProductTypeChange = (val: string) => {
    setProductType(val);
    setErrors((prev) => ({ ...prev, productType: '' }));
  };



  const handlePopularProductChange = (productId: string) => {
    const prod = POPULAR_PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;

    setProductName(prod.name);
    setShoppingCategory(prod.category);
    setProductType(prod.productType);
    setBrand(prod.brand || '');
    setPurchaseCondition(prod.condition);
    setMaterial(prod.material);
    setPackaging(prod.packaging);
    setExpectedUsageDuration(prod.expectedUsageDuration);
    if (prod.price !== undefined) {
      setPrice(String(prod.price));
    }
    setErrors({});
  };

  const handleFetchProductLink = async () => {
    if (!productLink.trim()) {
      setLookupError('Please enter a product link.');
      return;
    }
    setIsFetchingLink(true);
    setLookupError(null);
    try {
      const res = await fetch('/api/products/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productLink.trim() }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setLookupError(result.error || 'Failed to fetch product details.');
        return;
      }

      const data = result.data;
      if (data) {
        if (data.title) setProductName(data.title);
        if (data.brand) setBrand(data.brand);
        if (data.price !== null && data.price !== undefined) {
          setPrice(String(data.price));
        }
        if (data.inferredCategory) {
          setShoppingCategory(data.inferredCategory);
          if (data.inferredProductType) {
            setProductType(data.inferredProductType);
          } else {
            setProductType('');
          }
        }
        if (data.inferredMaterial) {
          setMaterial(data.inferredMaterial);
        }
        if (!data.inferredCategory) {
          setShoppingCategory('Other');
          setProductType('General Product');
        }
        setPurchaseSource('Online');
        setPurchaseCondition('New');
        setPackaging('Mixed');
        setExpectedUsageDuration('1-3 years');
      }
    } catch (err) {
      setLookupError('An unexpected error occurred while fetching product details.');
    } finally {
      setIsFetchingLink(false);
    }
  };

  const handleBarcodeLookup = async () => {
    if (!barcode.trim()) {
      setLookupError('Please enter a barcode.');
      return;
    }
    if (!/^\d+$/.test(barcode.trim())) {
      setLookupError('Barcode must contain numbers only.');
      return;
    }
    setIsLookingUpBarcode(true);
    setLookupError(null);
    try {
      const res = await fetch(`/api/products/barcode/${barcode.trim()}`);
      const result = await res.json();
      if (!res.ok || result.success === false) {
        setLookupError(result.error || 'Barcode lookup failed.');
        return;
      }

      const product = result.product;
      if (!product || !product.found) {
        setLookupError('Product not found. You can still enter details manually below.');
        return;
      }

      const mapped = mapOpenFoodFactsToShopping(product);
      setProductName(mapped.productName);
      setBrand(mapped.brand);
      setShoppingCategory(mapped.shoppingCategory);
      setProductType(mapped.productType);
      setMaterial(mapped.material);
      setPackaging(mapped.packaging);
      setPurchaseSource('Offline Store');
      setPurchaseCondition('New');
      setExpectedUsageDuration('Less than 1 month');
      setPrice('');
    } catch (err) {
      setLookupError('An unexpected error occurred during barcode lookup.');
    } finally {
      setIsLookingUpBarcode(false);
    }
  };

  const handleSaveReceipt = async (event: React.FormEvent) => {
    event.preventDefault();
    setReceiptIsSubmitting(true);
    setReceiptMessage(null);
    setReceiptActivityId(null);
    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptType,
          filename: receiptFilename || 'receipt.png',
          category: receiptCategory,
          subType: receiptSubType,
          quantity: Number(receiptQuantity) || 1,
          notes: receiptNotes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setReceiptMessage(data.error || 'Could not save receipt.');
        return;
      }
      setReceiptActivityId(data.activityId);
      setReceiptMessage(`Saved! Estimated ${data.estimate.co2eKg.toFixed(2)} kg CO₂e.`);
      onLiveEstimateChange?.(data.estimate.co2eKg);
    } catch (err) {
      setReceiptMessage('An unexpected error occurred while saving receipt.');
    } finally {
      setReceiptIsSubmitting(false);
    }
  };

  const handleShipmentSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const w = Number(shipmentWeight);
    const dist = Number(shipmentDistance);
    if (isNaN(w) || w <= 0 || isNaN(dist) || dist <= 0) {
      setErrors({ shipment: 'Weight and distance must be greater than 0.' });
      return;
    }

    void onSubmit({
      productName: 'Shipment Tracking',
      occurredAt: loadTime.toISOString(),
      shoppingCategory: 'Other',
      productType: 'shipment',
      brand: null,
      purchaseSource: 'Online',
      condition: 'New',
      material: shipmentMode,
      price: 0,
      currency: 'INR',
      quantity: dist,
      packaging: 'None',
      expectedUsageDuration: 'Less than 1 month',
      weight: w,
      note: joinNote(shipmentNotes, {
        'Package Weight': `${w} kg`,
        'Distance': `${dist} km`,
        'Transport Mode': shipmentMode,
      }),
      subType: 'shipment',
    });
  };

  // ── Validation & Submit ────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!shoppingCategory) {
      newErrors.shoppingCategory = 'Shopping category is required.';
    }
    if (!productType) {
      newErrors.productType = 'Product type is required.';
    }
    if (!purchaseSource) {
      newErrors.purchaseSource = 'Purchase source is required.';
    }
    if (!purchaseCondition) {
      newErrors.condition = 'Condition is required.';
    }
    if (!material) {
      newErrors.material = 'Material is required.';
    }
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = 'Price must be 0 or more.';
    }
    if (!quantity || Number(quantity) < 1) {
      newErrors.quantity = 'Quantity must be at least 1.';
    }
    if (!packaging) {
      newErrors.packaging = 'Packaging is required.';
    }
    if (!expectedUsageDuration) {
      newErrors.expectedUsageDuration = 'Expected usage duration is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) return;

    void onSubmit({
      productName: productName || null,
      occurredAt: loadTime.toISOString(),
      shoppingCategory: shoppingCategory,
      productType: productType,
      brand: brand || null,
      purchaseSource: purchaseSource,
      condition: purchaseCondition,
      material: material,
      price: Number(price),
      currency: 'INR',
      quantity: Number(quantity) || 1,
      packaging: packaging,
      expectedUsageDuration: expectedUsageDuration,
      note: joinNote(note, {
        'Product name': productName || undefined,
        'Shopping category': shoppingCategory,
        'Product type': productType,
        Brand: brand || undefined,
        'Purchase source': purchaseSource,
        Condition: purchaseCondition,
        Material: material,
        Price: `${price} INR`,
        Packaging: packaging,
        'Expected usage': expectedUsageDuration,
      }),
      subType: productType, // compatibility mapping
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Category Sub-Navigation Tabs */}
      <section className="grid gap-3 sm:grid-cols-3">
        <ActivityModeButton
          active={activeTab === 'product'}
          icon={Leaf}
          title="Product Logging"
          description="Log purchase details."
          onClick={() => {
            setActiveTab('product');
            setLookupError(null);
          }}
        />
        <ActivityModeButton
          active={activeTab === 'receipt'}
          icon={FileText}
          title="Receipt Upload"
          description="Extract items from a receipt."
          onClick={() => {
            setActiveTab('receipt');
            setLookupError(null);
          }}
        />
        <ActivityModeButton
          active={activeTab === 'shipment'}
          icon={Truck}
          title="Shipment Details"
          description="Estimate freight emissions."
          onClick={() => {
            setActiveTab('shipment');
            setLookupError(null);
          }}
        />
      </section>

      {activeTab === 'receipt' && (
        <form id="active-log-form" className="space-y-6" onSubmit={handleSaveReceipt}>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-bg-surface/50 p-6 text-center">
            <FileText className="h-10 w-10 text-text-muted mb-2" />
            <h3 className="text-sm font-black text-text-primary mb-1">Receipt File</h3>
            <p className="text-xs text-text-secondary max-w-sm mb-4">
              Select a receipt file to simulate OCR extraction.
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => setReceiptFilename(event.target.files?.[0]?.name ?? '')}
              className="text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-accent-primary-dim file:text-accent-primary hover:file:bg-accent-primary-dim/80 cursor-pointer"
            />
            {receiptFilename && (
              <p className="mt-2 text-xs font-semibold text-accent-primary">
                Selected: {receiptFilename}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Receipt Type"
              value={receiptType}
              onChange={setReceiptType}
              options={['FOOD', 'GROCERY', 'ELECTRICITY_BILL', 'FUEL', 'SHOPPING', 'TRAVEL', 'HOTEL'].map((val) => ({
                value: val,
                label: val,
              }))}
            />

            <FieldLabel label="Category" helper="Receipt category is preset.">
              <select
                disabled
                value={receiptCategory}
                className="h-11 w-full rounded-2xl border border-border-default bg-bg-elevated px-3 text-sm font-semibold text-text-muted outline-none cursor-not-allowed"
              >
                <option value="SHOPPING">SHOPPING</option>
              </select>
            </FieldLabel>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Product Type (SubType)"
              placeholder="e.g. packagedFood, T-Shirt, etc."
              value={receiptSubType}
              onChange={setReceiptSubType}
            />

            <InputField
              label="Quantity"
              type="number"
              min="0.001"
              step="any"
              value={receiptQuantity}
              onChange={setReceiptQuantity}
            />
          </div>

          <TextareaField
            label="Notes"
            placeholder="Add any extra detail from receipt..."
            value={receiptNotes}
            onChange={setReceiptNotes}
          />

          {receiptMessage && (
            <div className="rounded-xl bg-accent-primary-dim/35 p-4 text-sm font-semibold text-accent-primary">
              <p>{receiptMessage}</p>
              {receiptActivityId && (
                <Link
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#10B981] hover:underline"
                  href={`/activity/${receiptActivityId}`}
                >
                  View saved activity &rarr;
                </Link>
              )}
            </div>
          )}

          {!hideActions && (
            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <button
                type="submit"
                disabled={receiptIsSubmitting}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent-primary px-5 text-sm font-black text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50"
              >
                {receiptIsSubmitting ? 'Saving...' : 'Estimate and Save'}
              </button>
            </div>
          )}
        </form>
      )}

      {activeTab === 'shipment' && (
        <form id="active-log-form" className="space-y-6" onSubmit={handleShipmentSubmit}>
          <div className="grid gap-4 md:grid-cols-3">
            <InputField
              label="Package Weight (kg)"
              placeholder="e.g. 1.5"
              type="number"
              min="0.01"
              step="any"
              value={shipmentWeight}
              onChange={(val) => {
                setShipmentWeight(cleanNumericInput(val));
                setErrors({});
              }}
            />

            <InputField
              label="Shipment Distance (km)"
              placeholder="e.g. 150"
              type="number"
              min="1"
              step="any"
              value={shipmentDistance}
              onChange={(val) => {
                setShipmentDistance(cleanNumericInput(val));
                setErrors({});
              }}
            />

            <SelectField
              label="Transport Mode"
              value={shipmentMode}
              onChange={(val) => setShipmentMode(val as any)}
              options={[
                { value: 'Road', label: 'Road (Truck/Courier)' },
                { value: 'Air', label: 'Air (Express/Flight)' },
                { value: 'Rail', label: 'Rail (Train)' },
                { value: 'Sea', label: 'Sea (Cargo Ship)' },
              ]}
            />
          </div>

          <TextareaField
            label="Shipment Notes"
            placeholder="Enter courier name, tracking ID, or notes..."
            value={shipmentNotes}
            onChange={setShipmentNotes}
          />

          {errors.shipment && (
            <div className="rounded-xl bg-status-error/10 p-3 text-xs font-semibold text-status-error">
              {errors.shipment}
            </div>
          )}

          {!hideActions && (
            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent-primary px-5 text-sm font-black text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Logging...' : 'Log Shipment'}
              </button>
            </div>
          )}
        </form>
      )}

      {activeTab === 'product' && (
        <div className="space-y-6">
          {/* Helper Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* 1. Popular Products */}
            <div className="rounded-2xl border border-border-default bg-bg-surface/30 p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-text-primary mb-1">Popular Product Templates</h4>
                <p className="text-xs text-text-secondary mb-3">Choose a template to pre-fill details.</p>
              </div>
              <select
                defaultValue=""
                onChange={(e) => handlePopularProductChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-border-default bg-bg-base px-3 text-xs font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
              >
                <option value="" disabled>Choose template</option>
                {POPULAR_PRODUCTS.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({prod.category})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Product Link Scraper */}
            <div className="rounded-2xl border border-border-default bg-bg-surface/30 p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-text-primary mb-1">Product Link Scraper</h4>
                <p className="text-xs text-text-secondary mb-3">Paste Amazon/e-commerce link.</p>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Paste URL..."
                  value={productLink}
                  onChange={(e) => setProductLink(e.target.value)}
                  className="flex-1 h-10 min-w-0 rounded-xl border border-border-default bg-bg-base px-3 text-xs font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={handleFetchProductLink}
                  disabled={isFetchingLink || !productLink}
                  className="h-10 px-3 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 shrink-0"
                >
                  {isFetchingLink ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* 3. Barcode Lookup */}
            <div className="rounded-2xl border border-border-default bg-bg-surface/30 p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-text-primary mb-1">Barcode Lookup</h4>
                <p className="text-xs text-text-secondary mb-3">Enter numeric product barcode.</p>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="e.g. 8901030752538"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  className="flex-1 h-10 min-w-0 rounded-xl border border-border-default bg-bg-base px-3 text-xs font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={handleBarcodeLookup}
                  disabled={isLookingUpBarcode || !barcode}
                  className="h-10 px-3 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 shrink-0"
                >
                  {isLookingUpBarcode ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Barcode className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {lookupError && (
            <div className="rounded-xl bg-status-error/10 p-3 text-xs font-semibold text-status-error">
              {lookupError}
            </div>
          )}

          <form id="active-log-form" className="space-y-6 border-t border-border-default pt-6" onSubmit={handleSubmit}>
            {/* Row 1: Product Name */}
            <section className="grid gap-4 md:grid-cols-1">
              <InputField
                label="Product Name"
                value={productName}
                onChange={setProductName}
                placeholder="Enter your product name"
                helper="Optional."
              />
            </section>

            {/* Row 2: Date & Time */}
            <section className="grid gap-4 md:grid-cols-1">
              <FieldLabel label="Date & Time" helper="Auto-filled at form load.">
                <div className="flex h-11 items-center gap-2 rounded-2xl border border-border-default bg-bg-elevated/60 px-3 text-sm font-semibold text-text-secondary">
                  <Calendar className="h-4 w-4 shrink-0 text-text-muted" />
                  <span>{formatReadableDateTime(loadTime)}</span>
                </div>
              </FieldLabel>
            </section>

            {/* Row 3: Shopping Category + Product Type */}
            <section className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <FieldLabel label="Shopping Category">
                  <select
                    value={shoppingCategory}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="" disabled>
                      Select your shopping category
                    </option>
                    {SHOPPING_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errors.shoppingCategory && <ValidationError message={errors.shoppingCategory} />}
              </div>

              <div className="grid gap-1.5">
                <FieldLabel label="Product Type">
                  <select
                    value={productType}
                    onChange={(event) => handleProductTypeChange(event.target.value)}
                    disabled={!shoppingCategory}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {shoppingCategory ? 'Select your product type' : 'Select a category first'}
                    </option>
                    {productTypeOptions.length > 0
                      ? productTypeOptions.map((pt) => (
                          <option key={pt} value={pt}>
                            {pt}
                          </option>
                        ))
                      : shoppingCategory && (
                          <option value="" disabled>
                            No product types available for this category
                          </option>
                        )}
                  </select>
                </FieldLabel>
                {errors.productType && <ValidationError message={errors.productType} />}
              </div>
            </section>

            {/* Row 4: Brand + Purchase Source */}
            <section className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Brand"
                value={brand}
                onChange={setBrand}
                placeholder="Enter brand name"
                helper="Optional."
              />

              <div className="grid gap-1.5">
                <FieldLabel label="Purchase Source">
                  <select
                    value={purchaseSource}
                    onChange={(event) => {
                      setPurchaseSource(event.target.value);
                      setErrors((prev) => ({ ...prev, purchaseSource: '' }));
                    }}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="" disabled>
                      Select purchase source
                    </option>
                    {PURCHASE_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errors.purchaseSource && <ValidationError message={errors.purchaseSource} />}
              </div>
            </section>

            {/* Row 5: Condition + Material */}
            <section className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <FieldLabel label="Condition">
                  <select
                    value={purchaseCondition}
                    onChange={(event) => {
                      setPurchaseCondition(event.target.value);
                      setErrors((prev) => ({ ...prev, condition: '' }));
                    }}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="" disabled>
                      Select condition
                    </option>
                    {PRODUCT_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errors.condition && <ValidationError message={errors.condition} />}
              </div>

              <div className="grid gap-1.5">
                <FieldLabel label="Material">
                  <select
                    value={material}
                    onChange={(event) => {
                      setMaterial(event.target.value);
                      setErrors((prev) => ({ ...prev, material: '' }));
                    }}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="" disabled>
                      Select material
                    </option>
                    {MATERIALS.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errors.material && <ValidationError message={errors.material} />}
              </div>
            </section>

            {/* Row 6: Price + Quantity */}
            <section className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <InputField
                  label="Price"
                  value={price}
                  onChange={(val) => {
                    setPrice(cleanNumericInput(val));
                    setErrors((prev) => ({ ...prev, price: '' }));
                  }}
                  placeholder="Enter product price"
                  inputMode="decimal"
                />
                {errors.price && <ValidationError message={errors.price} />}
              </div>

              <div className="grid gap-1.5">
                <InputField
                  label="Quantity"
                  value={quantity}
                  onChange={(val) => {
                    const cleaned = val.replace(/[^0-9]/g, '');
                    setQuantity(cleaned);
                    setErrors((prev) => ({ ...prev, quantity: '' }));
                  }}
                  placeholder="Enter quantity"
                  inputMode="numeric"
                />
                {errors.quantity && <ValidationError message={errors.quantity} />}
              </div>
            </section>

            {/* Row 7: Packaging + Expected Usage Duration */}
            <section className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <FieldLabel label="Packaging">
                  <select
                    value={packaging}
                    onChange={(event) => {
                      setPackaging(event.target.value);
                      setErrors((prev) => ({ ...prev, packaging: '' }));
                    }}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="" disabled>
                      Select packaging
                    </option>
                    {SHOPPING_PACKAGING_TYPES.map((pkg) => (
                      <option key={pkg} value={pkg}>
                        {pkg}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errors.packaging && <ValidationError message={errors.packaging} />}
              </div>

              <div className="grid gap-1.5">
                <FieldLabel label="Expected Usage Duration">
                  <select
                    value={expectedUsageDuration}
                    onChange={(event) => {
                      setExpectedUsageDuration(event.target.value);
                      setErrors((prev) => ({ ...prev, expectedUsageDuration: '' }));
                    }}
                    className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="" disabled>
                      Select usage duration
                    </option>
                    {USAGE_DURATIONS.map((dur) => (
                      <option key={dur} value={dur}>
                        {dur}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                {errors.expectedUsageDuration && (
                  <ValidationError message={errors.expectedUsageDuration} />
                )}
              </div>
            </section>

            {/* Note */}
            <TextareaField
              label="Note"
              helper="Optional."
              value={note}
              onChange={setNote}
              placeholder="Add a note"
            />

            {!hideActions && (
              <SubmitRow
                isSubmitting={isSubmitting}
                hideActions={hideActions}
                submitLabel="Log purchase"
              />
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export function EnergyForm({
  onSubmit,
  isSubmitting,
  hideActions,
  onLiveEstimateChange,
  onEstimateInputChange,
  todayStr: _todayStr,
}: BaseFormProps<EnergyFormInput>) {
  const [energyCategory, setEnergyCategory] = useState<'sustainable' | 'non-sustainable'>(
    'sustainable',
  );
  const [loadTime] = useState(() => new Date());

  // Sustainable states
  const [sustName, setSustName] = useState('');
  const [sustType, setSustType] = useState('');
  const [sustUsageType, setSustUsageType] = useState('');
  const [sustUnits, setSustUnits] = useState('');
  const [sustUnitType, setSustUnitType] = useState('');
  const [sustPeriod, setSustPeriod] = useState('');
  const [sustPlace, setSustPlace] = useState('');
  const [sustMembers, setSustMembers] = useState('');

  // Non-Sustainable states
  const [nsName, setNsName] = useState('');
  const [nsSource, setNsSource] = useState('');
  const [nsUsageType, setNsUsageType] = useState('');
  const [nsUnits, setNsUnits] = useState('');
  const [nsUnitType, setNsUnitType] = useState('');
  const [nsPeriod, setNsPeriod] = useState('');
  const [nsPlace, setNsPlace] = useState('');
  const [nsMembers, setNsMembers] = useState('');

  // Generator specific
  const [generatorCapacity, setGeneratorCapacity] = useState('');
  const [generatorCapacityUnit, setGeneratorCapacityUnit] = useState<'kW' | 'kVA'>('kW');
  const [runtimeHours, setRuntimeHours] = useState('');
  const [loadPercentage, setLoadPercentage] = useState('');
  const [fuelQuantity, setFuelQuantity] = useState('');

  // Shared note & errors
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isGeneratorSource = (source: string) => {
    return [
      'Diesel Generator',
      'Petrol Generator',
      'CNG Generator',
      'Natural Gas Generator',
      'LPG Generator',
      'Kerosene Generator',
      'Furnace Oil Generator',
      'Other Fuel-Based Energy',
    ].includes(source);
  };

  const showFuelQuantity =
    isGeneratorSource(nsSource) && ['Litres', 'Kilograms', 'Cubic Meters'].includes(nsUnitType);
  const sustRequiresMembers =
    sustPlace === 'Work' || sustPlace === 'School' || sustPlace === 'Other';
  const nsRequiresMembers = nsPlace === 'Work' || nsPlace === 'School' || nsPlace === 'Other';

  useEffect(() => {
    if (energyCategory === 'sustainable') {
      const units = Number(sustUnits);
      if (sustType && units > 0 && sustUnitType) {
        onEstimateInputChange?.({
          subType: ENERGY_TYPE_MAPPING[sustType] || 'solar',
          quantity: units,
          energyCategory: 'sustainable',
          source: 'sustainable',
          energyType: sustType,
          usageType: sustUsageType,
          units,
          unitType: sustUnitType,
          period: sustPeriod,
          place: sustPlace,
          members: sustRequiresMembers ? Number(sustMembers) : null,
        });
      } else {
        onLiveEstimateChange?.(0);
      }
    } else {
      const units = Number(nsUnits);
      if (nsSource && units > 0 && nsUnitType) {
        onEstimateInputChange?.({
          subType: NON_SUSTAINABLE_SOURCE_MAPPING[nsSource] || 'indiaGrid',
          quantity: units,
          energyCategory: 'non-sustainable',
          source: 'non-sustainable',
          energySource: nsSource,
          usageType: nsUsageType,
          units,
          unitType: nsUnitType,
          period: nsPeriod,
          place: nsPlace,
          members: nsRequiresMembers ? Number(nsMembers) : null,
          generatorCapacity:
            isGeneratorSource(nsSource) && generatorCapacity ? Number(generatorCapacity) : null,
          generatorCapacityUnit: isGeneratorSource(nsSource) ? generatorCapacityUnit : null,
          runtimeHours: isGeneratorSource(nsSource) && runtimeHours ? Number(runtimeHours) : null,
          loadPercentage:
            isGeneratorSource(nsSource) && loadPercentage ? Number(loadPercentage) : null,
          fuelQuantity: showFuelQuantity && fuelQuantity ? Number(fuelQuantity) : null,
        });
      } else {
        onLiveEstimateChange?.(0);
      }
    }
  }, [
    energyCategory,
    sustType,
    sustUsageType,
    sustUnits,
    sustUnitType,
    sustPeriod,
    sustPlace,
    sustMembers,
    sustRequiresMembers,
    nsSource,
    nsUsageType,
    nsUnits,
    nsUnitType,
    nsPeriod,
    nsPlace,
    nsMembers,
    nsRequiresMembers,
    generatorCapacity,
    generatorCapacityUnit,
    runtimeHours,
    loadPercentage,
    fuelQuantity,
    showFuelQuantity,
    onEstimateInputChange,
    onLiveEstimateChange,
  ]);

  const handleSustPlaceChange = (val: string) => {
    setSustPlace(val);
    if (val === 'Home') {
      setSustMembers('');
    }
    setErrors((prev) => ({ ...prev, sustPlace: '', sustMembers: '' }));
  };

  const handleSustTypeChange = (val: string) => {
    setSustType(val);
    const allowed = ALLOWED_UNITS_BY_SUST_TYPE[val] || ['kWh'];
    if (!allowed.includes(sustUnitType)) {
      setSustUnitType(allowed[0] || 'kWh');
    }
    setErrors((prev) => ({ ...prev, sustType: '', sustUnitType: '' }));
  };

  const handleNsPlaceChange = (val: string) => {
    setNsPlace(val);
    if (val === 'Home') {
      setNsMembers('');
    }
    setErrors((prev) => ({ ...prev, nsPlace: '', nsMembers: '' }));
  };

  const handleNsSourceChange = (val: string) => {
    setNsSource(val);
    const allowed = ALLOWED_UNITS_BY_SOURCE[val] || ['kWh'];
    if (!allowed.includes(nsUnitType)) {
      setNsUnitType(allowed[0] || 'kWh');
    }
    setErrors((prev) => ({ ...prev, nsSource: '', nsUnitType: '' }));
  };

  const validateSustainable = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!sustType) {
      newErrors.sustType = 'Energy type is required.';
    }
    if (!sustUsageType) {
      newErrors.sustUsageType = 'Usage type is required.';
    }
    const units = Number(sustUnits);
    if (sustUnits === '' || isNaN(units)) {
      newErrors.sustUnits = 'Energy units must be a number.';
    } else if (units <= 0) {
      newErrors.sustUnits = 'Energy units must be greater than 0.';
    }
    if (!sustUnitType) {
      newErrors.sustUnitType = 'Unit type is required.';
    }
    if (!sustPeriod) {
      newErrors.sustPeriod = 'Usage period is required.';
    }
    if (!sustPlace) {
      newErrors.sustPlace = 'Usage place is required.';
    }
    if (sustRequiresMembers) {
      const mbrs = parseInt(sustMembers, 10);
      if (sustMembers === '') {
        newErrors.sustMembers = 'Number of members is required for this place.';
      } else if (isNaN(mbrs) || mbrs < 1) {
        newErrors.sustMembers = 'Members must be at least 1.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNonSustainable = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nsSource) {
      newErrors.nsSource = 'Energy source is required.';
    }
    if (!nsUsageType) {
      newErrors.nsUsageType = 'Usage type is required.';
    }
    const units = Number(nsUnits);
    if (nsUnits === '' || isNaN(units)) {
      newErrors.nsUnits = 'Energy units must be a number.';
    } else if (units <= 0) {
      newErrors.nsUnits = 'Energy units must be greater than 0.';
    }
    if (!nsUnitType) {
      newErrors.nsUnitType = 'Unit type is required.';
    }
    if (!nsPeriod) {
      newErrors.nsPeriod = 'Usage period is required.';
    }
    if (!nsPlace) {
      newErrors.nsPlace = 'Usage place is required.';
    }
    if (nsRequiresMembers) {
      const mbrs = parseInt(nsMembers, 10);
      if (nsMembers === '') {
        newErrors.nsMembers = 'Number of members is required for this place.';
      } else if (isNaN(mbrs) || mbrs < 1) {
        newErrors.nsMembers = 'Members must be at least 1.';
      }
    }

    // Generator checks
    if (isGeneratorSource(nsSource)) {
      if (generatorCapacity !== '') {
        const cap = Number(generatorCapacity);
        if (isNaN(cap) || cap <= 0) {
          newErrors.generatorCapacity = 'Generator capacity must be greater than 0.';
        }
      }
      if (runtimeHours !== '') {
        const hours = Number(runtimeHours);
        if (isNaN(hours) || hours <= 0) {
          newErrors.runtimeHours = 'Runtime hours must be greater than 0.';
        }
      }
      if (loadPercentage !== '') {
        const pct = Number(loadPercentage);
        if (isNaN(pct) || pct < 0 || pct > 100) {
          newErrors.loadPercentage = 'Load percentage must be between 0 and 100.';
        }
      }
      if (showFuelQuantity && fuelQuantity !== '') {
        const qty = Number(fuelQuantity);
        if (isNaN(qty) || qty <= 0) {
          newErrors.fuelQuantity = 'Fuel quantity must be greater than 0.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (energyCategory === 'sustainable') {
      if (!validateSustainable()) return;

      void onSubmit({
        energyCategory: 'sustainable',
        energyName: sustName || null,
        occurredAt: loadTime.toISOString(),
        energyType: sustType as 'Solar Energy' | 'Wind Energy' | 'Hydropower' | 'Geothermal',
        usageType: sustUsageType as
          | 'Electricity Consumption'
          | 'Backup Power'
          | 'Heating'
          | 'Cooking'
          | 'Industrial Use'
          | 'Other',
        units: Number(sustUnits),
        unitType: sustUnitType as 'kWh' | 'Litres' | 'Kilograms' | 'Cubic Meters' | 'Hours',
        period: sustPeriod as 'Daily' | 'Weekly' | 'Monthly',
        place: sustPlace as 'Home' | 'Work' | 'School' | 'Other',
        members: sustRequiresMembers ? Number(sustMembers) : null,
        note: joinNote(note, {
          'Energy Name': sustName || undefined,
          'Energy Type': sustType,
          'Usage Type': sustUsageType,
          Units: `${sustUnits} ${sustUnitType}`,
          Period: sustPeriod,
          Place: sustPlace,
          Members: sustRequiresMembers ? sustMembers : undefined,
        }),
        subType: ENERGY_TYPE_MAPPING[sustType] || 'solar', // compatibility
        kWh: Number(sustUnits), // compatibility
        source: 'sustainable', // compatibility
      });
    } else {
      if (!validateNonSustainable()) return;

      void onSubmit({
        energyCategory: 'non-sustainable',
        energyName: nsName || null,
        occurredAt: loadTime.toISOString(),
        energySource: nsSource as
          | 'Grid Electricity'
          | 'Diesel Generator'
          | 'Petrol Generator'
          | 'CNG Generator'
          | 'Natural Gas Generator'
          | 'LPG Generator'
          | 'Kerosene Generator'
          | 'Coal-Based Electricity'
          | 'Furnace Oil Generator'
          | 'Other Fuel-Based Energy',
        usageType: nsUsageType as
          | 'Electricity Consumption'
          | 'Backup Power'
          | 'Heating'
          | 'Cooking'
          | 'Industrial Use'
          | 'Other',
        units: Number(nsUnits),
        unitType: nsUnitType as 'kWh' | 'Litres' | 'Kilograms' | 'Cubic Meters' | 'Hours',
        period: nsPeriod as 'Daily' | 'Weekly' | 'Monthly',
        place: nsPlace as 'Home' | 'Work' | 'School' | 'Other',
        members: nsRequiresMembers ? Number(nsMembers) : null,
        generatorCapacity:
          isGeneratorSource(nsSource) && generatorCapacity ? Number(generatorCapacity) : null,
        generatorCapacityUnit: isGeneratorSource(nsSource) ? generatorCapacityUnit : null,
        runtimeHours: isGeneratorSource(nsSource) && runtimeHours ? Number(runtimeHours) : null,
        loadPercentage:
          isGeneratorSource(nsSource) && loadPercentage ? Number(loadPercentage) : null,
        fuelQuantity: showFuelQuantity && fuelQuantity ? Number(fuelQuantity) : null,
        note: joinNote(note, {
          'Energy Name': nsName || undefined,
          'Energy Source': nsSource,
          'Usage Type': nsUsageType,
          Units: `${nsUnits} ${nsUnitType}`,
          Period: nsPeriod,
          Place: nsPlace,
          Members: nsRequiresMembers ? nsMembers : undefined,
          'Generator Capacity':
            isGeneratorSource(nsSource) && generatorCapacity
              ? `${generatorCapacity} ${generatorCapacityUnit}`
              : undefined,
          'Runtime Hours':
            isGeneratorSource(nsSource) && runtimeHours ? `${runtimeHours} hrs` : undefined,
          'Load Percentage':
            isGeneratorSource(nsSource) && loadPercentage ? `${loadPercentage}%` : undefined,
          'Fuel Quantity': showFuelQuantity && fuelQuantity ? `${fuelQuantity}` : undefined,
        }),
        subType: NON_SUSTAINABLE_SOURCE_MAPPING[nsSource] || 'indiaGrid', // compatibility
        kWh: Number(nsUnits), // compatibility
        source: 'non-sustainable', // compatibility
      });
    }
  };

  return (
    <form id="active-log-form" className="space-y-6" onSubmit={handleSubmit}>
      <section className="grid gap-3 sm:grid-cols-2">
        <ActivityModeButton
          active={energyCategory === 'sustainable'}
          icon={BatteryCharging}
          title="Sustainable Energy"
          description="Log renewable solar, wind, hydro, or geothermal energy."
          onClick={() => {
            setEnergyCategory('sustainable');
            setErrors({});
          }}
        />
        <ActivityModeButton
          active={energyCategory === 'non-sustainable'}
          icon={HousePlug}
          title="Non-Sustainable Energy"
          description="Log fossil-fuel-based, grid-based, or backup energy."
          onClick={() => {
            setEnergyCategory('non-sustainable');
            setErrors({});
          }}
        />
      </section>

      {energyCategory === 'sustainable' ? (
        <>
          {/* Row 1: Energy Name */}
          <section className="grid gap-4 md:grid-cols-1">
            <InputField
              label="Energy Name"
              value={sustName}
              onChange={setSustName}
              placeholder="Enter your energy name"
              helper="Optional."
            />
          </section>

          {/* Row 2: Date & Time */}
          <section className="grid gap-4 md:grid-cols-1">
            <FieldLabel label="Date & Time" helper="Auto-filled at form load.">
              <div className="flex h-11 items-center gap-2 rounded-2xl border border-border-default bg-bg-elevated/60 px-3 text-sm font-semibold text-text-secondary">
                <Calendar className="h-4 w-4 shrink-0 text-text-muted" />
                <span>{formatReadableDateTime(loadTime)}</span>
              </div>
            </FieldLabel>
          </section>

          {/* Row 3: Energy + Usage */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel label="Energy">
                <select
                  value={sustType}
                  onChange={(event) => handleSustTypeChange(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select your energy type
                  </option>
                  {SUSTAINABLE_ENERGY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.sustType && <ValidationError message={errors.sustType} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Usage">
                <select
                  value={sustUsageType}
                  onChange={(event) => {
                    setSustUsageType(event.target.value);
                    setErrors((prev) => ({ ...prev, sustUsageType: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select usage type
                  </option>
                  {NON_SUSTAINABLE_USAGES.map((usage) => (
                    <option key={usage} value={usage}>
                      {usage}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.sustUsageType && <ValidationError message={errors.sustUsageType} />}
            </div>
          </section>

          {/* Row 4: Period + Place */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel label="Period">
                <select
                  value={sustPeriod}
                  onChange={(event) => {
                    setSustPeriod(event.target.value);
                    setErrors((prev) => ({ ...prev, sustPeriod: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select your usage period
                  </option>
                  {ENERGY_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.sustPeriod && <ValidationError message={errors.sustPeriod} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Place">
                <select
                  value={sustPlace}
                  onChange={(event) => handleSustPlaceChange(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select your usage place
                  </option>
                  {ENERGY_PLACES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.sustPlace && <ValidationError message={errors.sustPlace} />}
            </div>
          </section>

          {/* Row 5: Units + Unit Type */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <InputField
                label="Units"
                helper={sustUnitType ? `Unit: ${sustUnitType}` : undefined}
                value={sustUnits}
                onChange={(val) => {
                  setSustUnits(cleanNumericInput(val));
                  setErrors((prev) => ({ ...prev, sustUnits: '' }));
                }}
                placeholder="Enter usage amount"
                inputMode="decimal"
              />
              {errors.sustUnits && <ValidationError message={errors.sustUnits} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Unit Type">
                <select
                  value={sustUnitType}
                  onChange={(event) => {
                    setSustUnitType(event.target.value);
                    setErrors((prev) => ({ ...prev, sustUnitType: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select unit type
                  </option>
                  {(ALLOWED_UNITS_BY_SUST_TYPE[sustType] || []).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.sustUnitType && <ValidationError message={errors.sustUnitType} />}
            </div>
          </section>

          {/* Row 5: Members (conditional) */}
          {sustRequiresMembers && (
            <section className="grid gap-4 md:grid-cols-1">
              <div className="grid gap-1.5">
                <InputField
                  label="Members"
                  value={sustMembers}
                  onChange={(val) => {
                    setSustMembers(val);
                    setErrors((prev) => ({ ...prev, sustMembers: '' }));
                  }}
                  placeholder="Enter the number of members"
                  type="number"
                  min="1"
                  step="1"
                />
                {errors.sustMembers && <ValidationError message={errors.sustMembers} />}
              </div>
            </section>
          )}

          {/* Notes */}
          <TextareaField
            label="Note"
            helper="Optional."
            value={note}
            onChange={setNote}
            placeholder="Add a note"
          />
        </>
      ) : (
        <>
          {/* Row 1: Energy Name */}
          <section className="grid gap-4 md:grid-cols-1">
            <InputField
              label="Energy Name"
              value={nsName}
              onChange={setNsName}
              placeholder="Enter your energy name"
              helper="Optional."
            />
          </section>

          {/* Row 2: Date & Time */}
          <section className="grid gap-4 md:grid-cols-1">
            <FieldLabel label="Date & Time" helper="Auto-filled at form load.">
              <div className="flex h-11 items-center gap-2 rounded-2xl border border-border-default bg-bg-elevated/60 px-3 text-sm font-semibold text-text-secondary">
                <Calendar className="h-4 w-4 shrink-0 text-text-muted" />
                <span>{formatReadableDateTime(loadTime)}</span>
              </div>
            </FieldLabel>
          </section>

          {/* Row 3: Energy + Usage */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel label="Energy">
                <select
                  value={nsSource}
                  onChange={(event) => handleNsSourceChange(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select your energy type
                  </option>
                  {NON_SUSTAINABLE_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.nsSource && <ValidationError message={errors.nsSource} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Usage">
                <select
                  value={nsUsageType}
                  onChange={(event) => {
                    setNsUsageType(event.target.value);
                    setErrors((prev) => ({ ...prev, nsUsageType: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select usage type
                  </option>
                  {NON_SUSTAINABLE_USAGES.map((usage) => (
                    <option key={usage} value={usage}>
                      {usage}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.nsUsageType && <ValidationError message={errors.nsUsageType} />}
            </div>
          </section>

          {/* Row 4: Period + Place */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel label="Period">
                <select
                  value={nsPeriod}
                  onChange={(event) => {
                    setNsPeriod(event.target.value);
                    setErrors((prev) => ({ ...prev, nsPeriod: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select your usage period
                  </option>
                  {ENERGY_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.nsPeriod && <ValidationError message={errors.nsPeriod} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Place">
                <select
                  value={nsPlace}
                  onChange={(event) => handleNsPlaceChange(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select your usage place
                  </option>
                  {ENERGY_PLACES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.nsPlace && <ValidationError message={errors.nsPlace} />}
            </div>
          </section>

          {/* Row 5: Units + Unit Type */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <InputField
                label="Units"
                helper={nsUnitType ? `Unit: ${nsUnitType}` : undefined}
                value={nsUnits}
                onChange={(val) => {
                  setNsUnits(cleanNumericInput(val));
                  setErrors((prev) => ({ ...prev, nsUnits: '' }));
                }}
                placeholder="Enter usage amount"
                inputMode="decimal"
              />
              {errors.nsUnits && <ValidationError message={errors.nsUnits} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Unit Type">
                <select
                  value={nsUnitType}
                  onChange={(event) => {
                    setNsUnitType(event.target.value);
                    setErrors((prev) => ({ ...prev, nsUnitType: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select unit type
                  </option>
                  {(ALLOWED_UNITS_BY_SOURCE[nsSource] || []).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.nsUnitType && <ValidationError message={errors.nsUnitType} />}
            </div>
          </section>

          {/* Row 6: Members (conditional) */}
          {nsRequiresMembers && (
            <section className="grid gap-4 md:grid-cols-1">
              <div className="grid gap-1.5">
                <InputField
                  label="Members"
                  value={nsMembers}
                  onChange={(val) => {
                    setNsMembers(val);
                    setErrors((prev) => ({ ...prev, nsMembers: '' }));
                  }}
                  placeholder="Enter the number of members"
                  type="number"
                  min="1"
                  step="1"
                />
                {errors.nsMembers && <ValidationError message={errors.nsMembers} />}
              </div>
            </section>
          )}

          {/* Generator capacity & capacity unit (conditional) */}
          {isGeneratorSource(nsSource) && (
            <>
              <section className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <InputField
                    label="Generator Capacity"
                    value={generatorCapacity}
                    onChange={(val) => {
                      setGeneratorCapacity(cleanNumericInput(val));
                      setErrors((prev) => ({ ...prev, generatorCapacity: '' }));
                    }}
                    placeholder="Enter generator capacity"
                    inputMode="decimal"
                  />
                  {errors.generatorCapacity && (
                    <ValidationError message={errors.generatorCapacity} />
                  )}
                </div>

                <div className="grid gap-1.5">
                  <FieldLabel label="Generator Capacity Unit">
                    <select
                      value={generatorCapacityUnit}
                      onChange={(event) =>
                        setGeneratorCapacityUnit(event.target.value as 'kW' | 'kVA')
                      }
                      className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                    >
                      <option value="kW">kW</option>
                      <option value="kVA">kVA</option>
                    </select>
                  </FieldLabel>
                </div>
              </section>

              {/* Runtime Hours + Load Percentage (conditional) */}
              <section className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <InputField
                    label="Runtime Hours"
                    value={runtimeHours}
                    onChange={(val) => {
                      setRuntimeHours(cleanNumericInput(val));
                      setErrors((prev) => ({ ...prev, runtimeHours: '' }));
                    }}
                    placeholder="Enter runtime hours"
                    inputMode="decimal"
                  />
                  {errors.runtimeHours && <ValidationError message={errors.runtimeHours} />}
                </div>

                <div className="grid gap-1.5">
                  <InputField
                    label="Load Percentage"
                    value={loadPercentage}
                    onChange={(val) => {
                      setLoadPercentage(cleanNumericInput(val));
                      setErrors((prev) => ({ ...prev, loadPercentage: '' }));
                    }}
                    placeholder="Enter average load percentage"
                    inputMode="decimal"
                  />
                  {errors.loadPercentage && <ValidationError message={errors.loadPercentage} />}
                </div>
              </section>

              {/* Fuel Quantity (conditional on unitType) */}
              {showFuelQuantity && (
                <section className="grid gap-4 md:grid-cols-1">
                  <div className="grid gap-1.5">
                    <InputField
                      label="Fuel Quantity"
                      value={fuelQuantity}
                      onChange={(val) => {
                        setFuelQuantity(cleanNumericInput(val));
                        setErrors((prev) => ({ ...prev, fuelQuantity: '' }));
                      }}
                      placeholder="Enter fuel quantity"
                      inputMode="decimal"
                    />
                    {errors.fuelQuantity && <ValidationError message={errors.fuelQuantity} />}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Notes */}
          <TextareaField
            label="Note"
            helper="Optional."
            value={note}
            onChange={setNote}
            placeholder="Add a note"
          />
        </>
      )}

      <SubmitRow isSubmitting={isSubmitting} hideActions={hideActions} submitLabel="Log energy" />
    </form>
  );
}

export function WasteForm({
  onSubmit,
  isSubmitting,
  hideActions,
  onLiveEstimateChange,
  onEstimateInputChange,
  todayStr: _todayStr,
}: BaseFormProps<WasteFormInput>) {
  const [wasteCategory, setWasteCategory] = useState<'biodegradable' | 'degradable'>(
    'biodegradable',
  );
  const [loadTime] = useState(() => new Date());

  // Biodegradable states
  const [bioName, setBioName] = useState('');
  const [bioType, setBioType] = useState('');
  const [bioSource, setBioSource] = useState('');
  const [bioDisposal, setBioDisposal] = useState('');
  const [bioQuantity, setBioQuantity] = useState('');
  const [bioUnit, setBioUnit] = useState('');
  const [bioSegregation, setBioSegregation] = useState('');
  const [bioMembers, setBioMembers] = useState('');

  // Degradable states
  const [degName, setDegName] = useState('');
  const [degMaterial, setDegMaterial] = useState('');
  const [degForm, setDegForm] = useState('');
  const [degSource, setDegSource] = useState('');
  const [degDisposal, setDegDisposal] = useState('');
  const [degQuantity, setDegQuantity] = useState('');
  const [degUnit, setDegUnit] = useState('');
  const [degCondition, setDegCondition] = useState('');
  const [degMembers, setDegMembers] = useState('');

  // Shared note and errors
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bioRequiresMembers = ['Work', 'School', 'Restaurant', 'Event', 'Other'].includes(bioSource);

  const degRequiresMembers = ['Work', 'School', 'Restaurant', 'Event', 'Other'].includes(degSource);

  const handleBioSourceChange = (val: string) => {
    setBioSource(val);
    if (val === 'Home' || val === 'Outdoor') {
      setBioMembers('');
    }
    setErrors((prev) => ({ ...prev, bioSource: '', bioMembers: '' }));
  };

  const handleDegSourceChange = (val: string) => {
    setDegSource(val);
    if (val === 'Home' || val === 'Outdoor') {
      setDegMembers('');
    }
    setErrors((prev) => ({ ...prev, degSource: '', degMembers: '' }));
  };

  useEffect(() => {
    if (wasteCategory === 'biodegradable') {
      const quantity = Number(bioQuantity);
      if (bioType && quantity > 0 && bioUnit) {
        onEstimateInputChange?.({
          subType: BIODEGRADABLE_MAPPING[bioType] || 'other_organic_waste',
          quantity,
          wasteCategory: 'biodegradable',
          wasteType: bioType,
          wasteSource: bioSource,
          disposalMethod: bioDisposal,
          unit: bioUnit,
          segregationStatus: bioSegregation,
          members: bioRequiresMembers ? Number(bioMembers) : null,
        });
      } else {
        onLiveEstimateChange?.(0);
      }
    } else {
      const quantity = Number(degQuantity);
      if (degMaterial && quantity > 0 && degUnit) {
        onEstimateInputChange?.({
          subType: DEGRADABLE_MAPPING[degMaterial] || 'other',
          quantity,
          wasteCategory: 'degradable',
          materialType: degMaterial,
          wasteForm: degForm,
          wasteSource: degSource,
          disposalMethod: degDisposal,
          unit: degUnit,
          condition: degCondition,
          members: degRequiresMembers ? Number(degMembers) : null,
        });
      } else {
        onLiveEstimateChange?.(0);
      }
    }
  }, [
    wasteCategory,
    bioType,
    bioSource,
    bioDisposal,
    bioQuantity,
    bioUnit,
    bioSegregation,
    bioMembers,
    bioRequiresMembers,
    degMaterial,
    degForm,
    degSource,
    degDisposal,
    degQuantity,
    degUnit,
    degCondition,
    degMembers,
    degRequiresMembers,
    onEstimateInputChange,
    onLiveEstimateChange,
  ]);

  const validateBiodegradable = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bioType) {
      newErrors.bioType = 'Waste type is required.';
    }
    if (!bioSource) {
      newErrors.bioSource = 'Waste source is required.';
    }
    if (!bioDisposal) {
      newErrors.bioDisposal = 'Disposal method is required.';
    }
    const qty = Number(bioQuantity);
    if (bioQuantity === '' || isNaN(qty)) {
      newErrors.bioQuantity = 'Waste quantity must be a number.';
    } else if (qty <= 0) {
      newErrors.bioQuantity = 'Waste quantity must be greater than 0.';
    }
    if (!bioUnit) {
      newErrors.bioUnit = 'Unit is required.';
    }
    if (!bioSegregation) {
      newErrors.bioSegregation = 'Segregation status is required.';
    }
    if (bioRequiresMembers) {
      const mbrs = parseInt(bioMembers, 10);
      if (bioMembers === '') {
        newErrors.bioMembers = 'Number of members is required for this waste source.';
      } else if (isNaN(mbrs) || mbrs < 1) {
        newErrors.bioMembers = 'Members must be at least 1.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDegradable = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!degMaterial) {
      newErrors.degMaterial = 'Material type is required.';
    }
    if (!degForm) {
      newErrors.degForm = 'Product / Waste Form is required.';
    }
    if (!degSource) {
      newErrors.degSource = 'Waste source is required.';
    }
    if (!degDisposal) {
      newErrors.degDisposal = 'Disposal method is required.';
    }
    const qty = Number(degQuantity);
    if (degQuantity === '' || isNaN(qty)) {
      newErrors.degQuantity = 'Waste quantity must be a number.';
    } else if (qty <= 0) {
      newErrors.degQuantity = 'Waste quantity must be greater than 0.';
    }
    if (!degUnit) {
      newErrors.degUnit = 'Unit is required.';
    }
    if (!degCondition) {
      newErrors.degCondition = 'Condition is required.';
    }
    if (degRequiresMembers) {
      const mbrs = parseInt(degMembers, 10);
      if (degMembers === '') {
        newErrors.degMembers = 'Number of members is required for this waste source.';
      } else if (isNaN(mbrs) || mbrs < 1) {
        newErrors.degMembers = 'Members must be at least 1.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (wasteCategory === 'biodegradable') {
      if (!validateBiodegradable()) return;

      void onSubmit({
        wasteCategory: 'biodegradable',
        wasteName: bioName || null,
        occurredAt: loadTime.toISOString(),
        wasteType: bioType as WasteFormInput['wasteType'],
        wasteSource: bioSource as WasteFormInput['wasteSource'],
        disposalMethod: bioDisposal as WasteFormInput['disposalMethod'],
        quantity: Number(bioQuantity),
        unit: bioUnit as WasteFormInput['unit'],
        segregationStatus: bioSegregation as WasteFormInput['segregationStatus'],
        members: bioRequiresMembers ? Number(bioMembers) : null,
        note: joinNote(note, {
          'Waste Name': bioName || undefined,
          'Waste Type': bioType,
          'Waste Source': bioSource,
          'Disposal Method': bioDisposal,
          Quantity: `${bioQuantity} ${bioUnit}`,
          'Segregation Status': bioSegregation,
          Members: bioRequiresMembers ? bioMembers : undefined,
        }),
        subType: BIODEGRADABLE_MAPPING[bioType] || 'other_organic_waste',
        weight: Number(bioQuantity),
      });
    } else {
      if (!validateDegradable()) return;

      void onSubmit({
        wasteCategory: 'degradable',
        wasteName: degName || null,
        occurredAt: loadTime.toISOString(),
        materialType: degMaterial as WasteFormInput['materialType'],
        wasteForm: degForm as WasteFormInput['wasteForm'],
        wasteSource: degSource as WasteFormInput['wasteSource'],
        disposalMethod: degDisposal as WasteFormInput['disposalMethod'],
        quantity: Number(degQuantity),
        unit: degUnit as WasteFormInput['unit'],
        condition: degCondition as WasteFormInput['condition'],
        members: degRequiresMembers ? Number(degMembers) : null,
        note: joinNote(note, {
          'Waste Name': degName || undefined,
          'Material Type': degMaterial,
          'Product / Waste Form': degForm,
          'Waste Source': degSource,
          'Disposal Method': degDisposal,
          Quantity: `${degQuantity} ${degUnit}`,
          Condition: degCondition,
          Members: degRequiresMembers ? degMembers : undefined,
        }),
        subType: DEGRADABLE_MAPPING[degMaterial] || 'other',
        weight: Number(degQuantity),
      });
    }
  };

  return (
    <form id="active-log-form" className="space-y-6" onSubmit={handleSubmit}>
      <section className="grid gap-3 sm:grid-cols-2">
        <ActivityModeButton
          active={wasteCategory === 'biodegradable'}
          icon={Leaf}
          title="Biodegradable Waste"
          description="Log organic kitchen, food scraps, or garden waste."
          onClick={() => {
            setWasteCategory('biodegradable');
            setErrors({});
          }}
        />
        <ActivityModeButton
          active={wasteCategory === 'degradable'}
          icon={Recycle}
          title="Degradable Waste"
          description="Log paper, cardboard, textiles, or degradable plastic."
          onClick={() => {
            setWasteCategory('degradable');
            setErrors({});
          }}
        />
      </section>

      {wasteCategory === 'biodegradable' ? (
        <>
          {/* Row 1: Waste Name */}
          <section className="grid gap-4 md:grid-cols-1">
            <InputField
              label="Waste Name"
              value={bioName}
              onChange={setBioName}
              placeholder="Enter your waste name"
              helper="Optional."
            />
          </section>

          {/* Row 2: Date & Time */}
          <section className="grid gap-4 md:grid-cols-1">
            <FieldLabel label="Date & Time" helper="Auto-filled at form load.">
              <div className="flex h-11 items-center gap-2 rounded-2xl border border-border-default bg-bg-elevated/60 px-3 text-sm font-semibold text-text-secondary">
                <Calendar className="h-4 w-4 shrink-0 text-text-muted" />
                <span>{formatReadableDateTime(loadTime)}</span>
              </div>
            </FieldLabel>
          </section>

          {/* Row 3: Waste Type + Waste Source */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel label="Waste Type">
                <select
                  value={bioType}
                  onChange={(event) => {
                    setBioType(event.target.value);
                    setErrors((prev) => ({ ...prev, bioType: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select waste type
                  </option>
                  {BIODEGRADABLE_WASTE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.bioType && <ValidationError message={errors.bioType} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Waste Source">
                <select
                  value={bioSource}
                  onChange={(event) => handleBioSourceChange(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select waste source
                  </option>
                  {WASTE_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.bioSource && <ValidationError message={errors.bioSource} />}
            </div>
          </section>

          {/* Row 4: Disposal Method + Quantity */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel label="Disposal Method">
                <select
                  value={bioDisposal}
                  onChange={(event) => {
                    setBioDisposal(event.target.value);
                    setErrors((prev) => ({ ...prev, bioDisposal: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select disposal method
                  </option>
                  {BIODEGRADABLE_DISPOSAL_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.bioDisposal && <ValidationError message={errors.bioDisposal} />}
            </div>

            <div className="grid gap-1.5">
              <InputField
                label="Weight"
                value={bioQuantity}
                onChange={(val) => {
                  setBioQuantity(cleanNumericInput(val));
                  setErrors((prev) => ({ ...prev, bioQuantity: '' }));
                }}
                placeholder="Enter waste weight"
                inputMode="decimal"
              />
              {errors.bioQuantity && <ValidationError message={errors.bioQuantity} />}
            </div>
          </section>

          {/* Row 5: Unit + Segregation Status */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel label="Unit">
                <select
                  value={bioUnit}
                  onChange={(event) => {
                    setBioUnit(event.target.value);
                    setErrors((prev) => ({ ...prev, bioUnit: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select unit
                  </option>
                  {BIODEGRADABLE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.bioUnit && <ValidationError message={errors.bioUnit} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Segregation Status">
                <select
                  value={bioSegregation}
                  onChange={(event) => {
                    setBioSegregation(event.target.value);
                    setErrors((prev) => ({ ...prev, bioSegregation: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select segregation status
                  </option>
                  {SEGREGATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.bioSegregation && <ValidationError message={errors.bioSegregation} />}
            </div>
          </section>

          {/* Row 6: Members (conditional) */}
          {bioRequiresMembers && (
            <section className="grid gap-4 md:grid-cols-1">
              <div className="grid gap-1.5">
                <InputField
                  label="Members"
                  value={bioMembers}
                  onChange={(val) => {
                    setBioMembers(val);
                    setErrors((prev) => ({ ...prev, bioMembers: '' }));
                  }}
                  placeholder="Enter the number of members"
                  type="number"
                  min="1"
                  step="1"
                />
                {errors.bioMembers && <ValidationError message={errors.bioMembers} />}
              </div>
            </section>
          )}

          {/* Note */}
          <TextareaField
            label="Note"
            helper="Optional."
            value={note}
            onChange={setNote}
            placeholder="Add a note"
          />
        </>
      ) : (
        <>
          {/* Row 1: Waste Name */}
          <section className="grid gap-4 md:grid-cols-1">
            <InputField
              label="Waste Name"
              value={degName}
              onChange={setDegName}
              placeholder="Enter your waste name"
              helper="Optional."
            />
          </section>

          {/* Row 2: Date & Time */}
          <section className="grid gap-4 md:grid-cols-1">
            <FieldLabel label="Date & Time" helper="Auto-filled at form load.">
              <div className="flex h-11 items-center gap-2 rounded-2xl border border-border-default bg-bg-elevated/60 px-3 text-sm font-semibold text-text-secondary">
                <Calendar className="h-4 w-4 shrink-0 text-text-muted" />
                <span>{formatReadableDateTime(loadTime)}</span>
              </div>
            </FieldLabel>
          </section>

          {/* Row 3: Material Type + Product / Waste Form */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel label="Material Type">
                <select
                  value={degMaterial}
                  onChange={(event) => {
                    setDegMaterial(event.target.value);
                    setErrors((prev) => ({ ...prev, degMaterial: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select material type
                  </option>
                  {DEGRADABLE_MATERIAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.degMaterial && <ValidationError message={errors.degMaterial} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Product / Waste Form">
                <select
                  value={degForm}
                  onChange={(event) => {
                    setDegForm(event.target.value);
                    setErrors((prev) => ({ ...prev, degForm: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select waste form
                  </option>
                  {DEGRADABLE_WASTE_FORMS.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.degForm && <ValidationError message={errors.degForm} />}
            </div>
          </section>

          {/* Row 4: Waste Source + Disposal Method */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel label="Waste Source">
                <select
                  value={degSource}
                  onChange={(event) => handleDegSourceChange(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select waste source
                  </option>
                  {WASTE_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.degSource && <ValidationError message={errors.degSource} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Disposal Method">
                <select
                  value={degDisposal}
                  onChange={(event) => {
                    setDegDisposal(event.target.value);
                    setErrors((prev) => ({ ...prev, degDisposal: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select disposal method
                  </option>
                  {DEGRADABLE_DISPOSAL_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.degDisposal && <ValidationError message={errors.degDisposal} />}
            </div>
          </section>

          {/* Row 5: Quantity + Unit */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <InputField
                label="Weight"
                value={degQuantity}
                onChange={(val) => {
                  setDegQuantity(cleanNumericInput(val));
                  setErrors((prev) => ({ ...prev, degQuantity: '' }));
                }}
                placeholder="Enter waste weight"
                inputMode="decimal"
              />
              {errors.degQuantity && <ValidationError message={errors.degQuantity} />}
            </div>

            <div className="grid gap-1.5">
              <FieldLabel label="Unit">
                <select
                  value={degUnit}
                  onChange={(event) => {
                    setDegUnit(event.target.value);
                    setErrors((prev) => ({ ...prev, degUnit: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select unit
                  </option>
                  {DEGRADABLE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.degUnit && <ValidationError message={errors.degUnit} />}
            </div>
          </section>

          {/* Row 6: Condition + Members (conditional) */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel label="Condition">
                <select
                  value={degCondition}
                  onChange={(event) => {
                    setDegCondition(event.target.value);
                    setErrors((prev) => ({ ...prev, degCondition: '' }));
                  }}
                  className="h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                >
                  <option value="" disabled>
                    Select condition
                  </option>
                  {WASTE_CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              {errors.degCondition && <ValidationError message={errors.degCondition} />}
            </div>

            {degRequiresMembers ? (
              <div className="grid gap-1.5">
                <InputField
                  label="Members"
                  value={degMembers}
                  onChange={(val) => {
                    setDegMembers(val);
                    setErrors((prev) => ({ ...prev, degMembers: '' }));
                  }}
                  placeholder="Enter the number of members"
                  type="number"
                  min="1"
                  step="1"
                />
                {errors.degMembers && <ValidationError message={errors.degMembers} />}
              </div>
            ) : (
              <div />
            )}
          </section>

          {/* Note */}
          <TextareaField
            label="Note"
            helper="Optional."
            value={note}
            onChange={setNote}
            placeholder="Add a note"
          />
        </>
      )}

      <SubmitRow isSubmitting={isSubmitting} hideActions={hideActions} submitLabel="Log waste" />
    </form>
  );
}
