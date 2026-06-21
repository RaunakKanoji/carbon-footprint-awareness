import { z } from 'zod';

export const transportSchema = z.object({
  subType: z.string().min(1, 'Transport type is required'),
  distanceKm: z
    .number({ message: 'Distance is required' })
    .nonnegative('Distance cannot be negative'),
  passengers: z
    .number({ message: 'Passengers count is required' })
    .int('Passengers must be a whole number')
    .min(1, 'Passengers must be at least 1'),
  occurredAt: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
});

export const foodSchema = z.object({
  subType: z.string().min(1, 'Meal type is required'),
  meals: z
    .number({ message: 'Meals count is required' })
    .nonnegative('Meals count cannot be negative'),
  occurredAt: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
});

export const energySchema = z
  .object({
    energyName: z.string().optional().nullable(),
    occurredAt: z.string().min(1, 'Date and time is required'),
    energyCategory: z.enum(['sustainable', 'non-sustainable']),

    // Sustainable energy fields
    energyType: z.enum(['Solar Energy', 'Wind Energy', 'Hydropower', 'Geothermal']).optional(),

    // Non-sustainable energy fields
    energySource: z.enum([
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
    ]).optional(),
    usageType: z.enum([
      'Electricity Consumption',
      'Backup Power',
      'Heating',
      'Cooking',
      'Industrial Use',
      'Other',
    ]).optional(),

    // Units and other inputs
    units: z.coerce.number().positive('Energy units must be greater than 0'),
    unitType: z.enum(['kWh', 'Litres', 'Kilograms', 'Cubic Meters', 'Hours']),
    period: z.enum(['Daily', 'Weekly', 'Monthly']),
    place: z.enum(['Home', 'Work', 'School', 'Other']),
    members: z.coerce.number().int().min(1).optional().nullable(),

    // Generator specific fields
    generatorCapacity: z.coerce.number().positive('Capacity must be greater than 0').optional().nullable(),
    generatorCapacityUnit: z.enum(['kW', 'kVA']).optional().nullable(),
    runtimeHours: z.coerce.number().positive('Runtime hours must be greater than 0').optional().nullable(),
    loadPercentage: z.coerce.number().min(0, 'Load percentage cannot be negative').max(100, 'Load percentage cannot exceed 100').optional().nullable(),
    fuelQuantity: z.coerce.number().positive('Fuel quantity must be greater than 0').optional().nullable(),

    note: z.string().optional().nullable(),

    // Legacy fields compatibility (keep optional/nullable for safety)
    subType: z.string().optional(),
    kWh: z.coerce.number().optional(),
    source: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const requiresMembers =
      data.place === 'Work' || data.place === 'School' || data.place === 'Other';

    if (requiresMembers && (data.members === null || data.members === undefined || data.members < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['members'],
        message: 'Number of members is required for this place',
      });
    }

    if (data.energyCategory === 'sustainable') {
      if (!data.energyType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['energyType'],
          message: 'Energy type is required',
        });
      }
    } else {
      if (!data.energySource) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['energySource'],
          message: 'Energy source is required',
        });
      }
      if (!data.usageType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['usageType'],
          message: 'Usage type is required',
        });
      }
    }
  });

export const shoppingSchema = z.object({
  productName: z.string().optional().nullable(),
  occurredAt: z.string().min(1, 'Date and time is required'),
  shoppingCategory: z.string().min(1, 'Shopping category is required'),
  productType: z.string().min(1, 'Product type is required'),
  brand: z.string().optional().nullable(),
  purchaseSource: z.string().min(1, 'Purchase source is required'),
  condition: z.string().min(1, 'Condition is required'),
  material: z.string().min(1, 'Material is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  currency: z.string().optional(),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  packaging: z.string().min(1, 'Packaging is required'),
  expectedUsageDuration: z.string().min(1, 'Expected usage duration is required'),
  note: z.string().optional().nullable(),
  subType: z.string().min(1, 'Product type is required'), // for compatibility
  weight: z.coerce.number().optional(),
});

export const wasteSchema = z
  .object({
    wasteName: z.string().optional().nullable(),
    occurredAt: z.string().min(1, 'Date and time is required'),
    wasteCategory: z.enum(['biodegradable', 'degradable']),

    // Biodegradable fields
    wasteType: z
      .enum([
        'Food Scraps',
        'Fruit and Vegetable Peels',
        'Garden Waste',
        'Tea or Coffee Grounds',
        'Compostable Food Waste',
        'Organic Paper Waste',
        'Other Organic Waste',
      ])
      .optional(),
    wasteSource: z.enum([
      'Home',
      'Work',
      'School',
      'Restaurant',
      'Event',
      'Outdoor',
      'Other',
    ]),
    disposalMethod: z.enum([
      // Biodegradable disposal methods
      'Home Composting',
      'Community Composting',
      'Municipal Composting',
      'Animal Feed',
      'Landfill',
      'Incineration',
      // Degradable disposal methods
      'Reused',
      'Recycled',
      'Composted',
      'Returned to Store',
      'Other',
    ]),
    quantity: z.coerce.number().positive('Waste quantity must be greater than 0'),
    unit: z.enum(['Grams', 'Kilograms', 'Litres', 'Pieces', 'Bags', 'Boxes']),
    segregationStatus: z
      .enum([
        'Segregated',
        'Mixed with Dry Waste',
        'Mixed with Wet Waste',
        'Not Sure',
      ])
      .optional(),
    members: z.coerce.number().int().min(1).optional().nullable(),
    note: z.string().optional().nullable(),

    // Degradable fields
    materialType: z
      .enum([
        'Paper',
        'Cardboard',
        'Wood',
        'Cotton or Natural Fiber',
        'Compostable Packaging',
        'Bioplastic',
        'Degradable Plastic',
        'Mixed Degradable Material',
        'Other',
      ])
      .optional(),
    wasteForm: z
      .enum([
        'Packaging',
        'Container',
        'Disposable Item',
        'Paper Product',
        'Textile Item',
        'Wooden Item',
        'Bag',
        'Other',
      ])
      .optional(),
    condition: z
      .enum([
        'Clean',
        'Wet',
        'Food-Contaminated',
        'Mixed Material',
        'Not Sure',
      ])
      .optional(),

    // Legacy fields for compatibility
    subType: z.string().optional(),
    weight: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    const requiresMembers =
      data.wasteSource === 'Work' ||
      data.wasteSource === 'School' ||
      data.wasteSource === 'Restaurant' ||
      data.wasteSource === 'Event' ||
      data.wasteSource === 'Other';

    if (requiresMembers && (data.members === null || data.members === undefined || data.members < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['members'],
        message: 'Number of members is required for this waste source',
      });
    }

    if (data.wasteCategory === 'biodegradable') {
      if (!data.wasteType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['wasteType'],
          message: 'Waste type is required',
        });
      }
      if (!data.segregationStatus) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['segregationStatus'],
          message: 'Segregation status is required',
        });
      }
      const allowedUnits = ['Grams', 'Kilograms', 'Litres', 'Pieces', 'Bags'];
      if (!allowedUnits.includes(data.unit)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['unit'],
          message: 'Invalid unit selected for biodegradable waste',
        });
      }
      const allowedMethods = [
        'Home Composting',
        'Community Composting',
        'Municipal Composting',
        'Animal Feed',
        'Landfill',
        'Incineration',
        'Other',
      ];
      if (!allowedMethods.includes(data.disposalMethod)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['disposalMethod'],
          message: 'Invalid disposal method selected for biodegradable waste',
        });
      }
    } else {
      if (!data.materialType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['materialType'],
          message: 'Material type is required',
        });
      }
      if (!data.wasteForm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['wasteForm'],
          message: 'Product / Waste Form is required',
        });
      }
      if (!data.condition) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['condition'],
          message: 'Condition is required',
        });
      }
      const allowedUnits = ['Grams', 'Kilograms', 'Pieces', 'Bags', 'Boxes'];
      if (!allowedUnits.includes(data.unit)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['unit'],
          message: 'Invalid unit selected for degradable waste',
        });
      }
      const allowedMethods = [
        'Reused',
        'Recycled',
        'Composted',
        'Landfill',
        'Incineration',
        'Returned to Store',
        'Other',
      ];
      if (!allowedMethods.includes(data.disposalMethod)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['disposalMethod'],
          message: 'Invalid disposal method selected for degradable waste',
        });
      }
    }
  });

export type TransportFormInput = z.infer<typeof transportSchema>;
export type FoodFormInput = z.infer<typeof foodSchema>;
export type EnergyFormInput = z.infer<typeof energySchema>;
export type ShoppingFormInput = z.infer<typeof shoppingSchema>;
export type WasteFormInput = z.infer<typeof wasteSchema>;
