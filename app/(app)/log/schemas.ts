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

export const energySchema = z.object({
  subType: z.string().min(1, 'Energy source is required'),
  kWh: z
    .number({ message: 'Electricity usage is required' })
    .nonnegative('Electricity usage cannot be negative'),
  occurredAt: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
});

export const shoppingSchema = z.object({
  subType: z.string().min(1, 'Product type is required'),
  quantity: z
    .number({ message: 'Quantity is required' })
    .nonnegative('Quantity cannot be negative'),
  occurredAt: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
});

export const wasteSchema = z.object({
  subType: z.string().min(1, 'Waste type is required'),
  weight: z.number({ message: 'Weight is required' }).nonnegative('Weight cannot be negative'),
  occurredAt: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
});

export type TransportFormInput = z.infer<typeof transportSchema>;
export type FoodFormInput = z.infer<typeof foodSchema>;
export type EnergyFormInput = z.infer<typeof energySchema>;
export type ShoppingFormInput = z.infer<typeof shoppingSchema>;
export type WasteFormInput = z.infer<typeof wasteSchema>;
