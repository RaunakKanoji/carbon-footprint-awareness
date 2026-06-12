import { zodResolver } from '@hookform/resolvers/zod';
import * as Icons from 'lucide-react';

import React, { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FieldValues } from 'react-hook-form';

import NumberInput from '@/src/components/forms/NumberInput';
import SelectInput from '@/src/components/forms/SelectInput';
import TextareaInput from '@/src/components/forms/TextareaInput';
import { ActivityCategory, ActivitySubTypes } from '@/src/lib/activity-types';

import {
  EnergyFormInput,
  FoodFormInput,
  ShoppingFormInput,
  TransportFormInput,
  WasteFormInput,
  energySchema,
  foodSchema,
  shoppingSchema,
  transportSchema,
  wasteSchema,
} from './schemas';

// Client-side factors to keep instantaneous visual estimations accurate before submission
const clientFactors: Record<string, number> = {
  petrolcar: 0.192,
  dieselcar: 0.171,
  bus: 0.105,
  metro: 0.035,
  train: 0.041,
  bicycle: 0,
  walking: 0,
  veganmeal: 0.7,
  vegetarianmeal: 1.2,
  chickenmeal: 2.5,
  beefmeal: 7.0,
  fishmeal: 3.0,
  indiagrid: 0.71,
  solar: 0,
  tshirt: 7.0,
  jeans: 33.0,
  smartphone: 70.0,
  laptop: 250.0,
  shoes: 14.0,
  generalwaste: 0.45,
  recycledwaste: 0.1,
  foodwaste: 0.75,
};

const subTypeLabels: Record<string, string> = {
  petrolCar: 'Petrol Car',
  dieselCar: 'Diesel Car',
  bus: 'Public Bus',
  metro: 'Metro / Subway',
  train: 'Train Journey',
  bicycle: 'Bicycle (Zero Carbon)',
  walking: 'Walking (Zero Carbon)',
  veganMeal: 'Vegan Meal',
  vegetarianMeal: 'Vegetarian Meal',
  chickenMeal: 'Chicken Meal',
  beefMeal: 'Beef Meal',
  fishMeal: 'Fish / Seafood Meal',
  indiaGrid: 'Grid Electricity',
  solar: 'Solar Power (Zero Carbon)',
  tshirt: 'T-Shirt',
  jeans: 'Jeans / Denim',
  smartphone: 'Smartphone',
  laptop: 'Laptop / Computer',
  shoes: 'Shoes / Footwear',
  generalWaste: 'General Landfill Waste',
  recycledWaste: 'Recycled Waste',
  foodWaste: 'Composted/Food Waste',
};

const getSubTypeOptions = (category: ActivityCategory) => {
  return ActivitySubTypes[category].map((sub) => ({
    value: sub,
    label: subTypeLabels[sub] || sub,
  }));
};

interface FormBaseProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>;
  isSubmitting: boolean;
  onLiveEstimateChange: (estimate: number) => void;
  todayStr: string;
}

// 1. TRANSPORT FORM
export function TransportForm({
  onSubmit,
  isSubmitting,
  onLiveEstimateChange,
  todayStr,
}: FormBaseProps<TransportFormInput>) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransportFormInput>({
    resolver: zodResolver(transportSchema),
    defaultValues: {
      subType: 'petrolCar',
      distanceKm: 0,
      passengers: 1,
      occurredAt: todayStr,
      note: '',
    },
  });

  const subType = watch('subType');
  const distanceKm = watch('distanceKm');
  const passengers = watch('passengers');

  useEffect(() => {
    const factor = clientFactors[(subType || '').toLowerCase()] ?? 0;
    const dist = Number(distanceKm) || 0;
    const pass = Number(passengers) || 1;
    const estimate = Math.round((dist / pass) * factor * 10) / 10;
    onLiveEstimateChange(estimate);
  }, [subType, distanceKm, passengers, onLiveEstimateChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SelectInput
          label="Transport Type"
          options={getSubTypeOptions(ActivityCategory.Transport)}
          error={errors.subType?.message}
          {...register('subType')}
        />
        <NumberInput
          label="Distance (km)"
          placeholder="Enter kilometres"
          error={errors.distanceKm?.message}
          step="any"
          {...register('distanceKm', { valueAsNumber: true })}
        />
        <NumberInput
          label="Number of Passengers"
          placeholder="Default: 1"
          error={errors.passengers?.message}
          {...register('passengers', { valueAsNumber: true })}
        />
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Date of Activity
          </label>
          <input
            type="date"
            max={todayStr}
            className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all cursor-pointer"
            {...register('occurredAt')}
          />
          {errors.occurredAt && (
            <p className="text-xs text-state-error font-medium mt-1">{errors.occurredAt.message}</p>
          )}
        </div>
        <TextareaInput
          label="Notes / Description (Optional)"
          placeholder="e.g. Daily office commute, carpool with friends"
          className="sm:col-span-2"
          textareaClassName="resize-none h-20"
          error={errors.note?.message}
          {...register('note')}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={() =>
            reset({
              subType: 'petrolCar',
              distanceKm: 0,
              passengers: 1,
              occurredAt: todayStr,
              note: '',
            })
          }
          className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-border-default hover:bg-bg-elevated text-text-primary transition-all cursor-pointer"
        >
          Clear Fields
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-xs font-bold rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Icons.Loader className="w-4 h-4 animate-spin" />
              <span>Saving Log...</span>
            </>
          ) : (
            <>
              <Icons.PlusCircle className="w-4 h-4" />
              <span>Log Transport</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// 2. FOOD FORM
export function FoodForm({
  onSubmit,
  isSubmitting,
  onLiveEstimateChange,
  todayStr,
}: FormBaseProps<FoodFormInput>) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FoodFormInput>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      subType: 'vegetarianMeal',
      meals: 0,
      occurredAt: todayStr,
      note: '',
    },
  });

  const subType = watch('subType');
  const meals = watch('meals');

  useEffect(() => {
    const factor = clientFactors[(subType || '').toLowerCase()] ?? 0;
    const quantity = Number(meals) || 0;
    const estimate = Math.round(quantity * factor * 10) / 10;
    onLiveEstimateChange(estimate);
  }, [subType, meals, onLiveEstimateChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SelectInput
          label="Meal Type"
          options={getSubTypeOptions(ActivityCategory.Food)}
          error={errors.subType?.message}
          {...register('subType')}
        />
        <NumberInput
          label="Quantity (Meals)"
          placeholder="Number of meals"
          error={errors.meals?.message}
          step="any"
          {...register('meals', { valueAsNumber: true })}
        />
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Date of Activity
          </label>
          <input
            type="date"
            max={todayStr}
            className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all cursor-pointer"
            {...register('occurredAt')}
          />
          {errors.occurredAt && (
            <p className="text-xs text-state-error font-medium mt-1">{errors.occurredAt.message}</p>
          )}
        </div>
        <TextareaInput
          label="Notes / Description (Optional)"
          placeholder="e.g. Lunch with team, family dinner"
          className="sm:col-span-2"
          textareaClassName="resize-none h-20"
          error={errors.note?.message}
          {...register('note')}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={() =>
            reset({
              subType: 'vegetarianMeal',
              meals: 0,
              occurredAt: todayStr,
              note: '',
            })
          }
          className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-border-default hover:bg-bg-elevated text-text-primary transition-all cursor-pointer"
        >
          Clear Fields
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-xs font-bold rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Icons.Loader className="w-4 h-4 animate-spin" />
              <span>Saving Log...</span>
            </>
          ) : (
            <>
              <Icons.PlusCircle className="w-4 h-4" />
              <span>Log Food</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// 3. ENERGY FORM
export function EnergyForm({
  onSubmit,
  isSubmitting,
  onLiveEstimateChange,
  todayStr,
}: FormBaseProps<EnergyFormInput>) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<EnergyFormInput>({
    resolver: zodResolver(energySchema),
    defaultValues: {
      subType: 'indiaGrid',
      kWh: 0,
      occurredAt: todayStr,
      note: '',
    },
  });

  const subType = watch('subType');
  const kWh = watch('kWh');

  useEffect(() => {
    const factor = clientFactors[(subType || '').toLowerCase()] ?? 0;
    const quantity = Number(kWh) || 0;
    const estimate = Math.round(quantity * factor * 10) / 10;
    onLiveEstimateChange(estimate);
  }, [subType, kWh, onLiveEstimateChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SelectInput
          label="Energy Source"
          options={getSubTypeOptions(ActivityCategory.Energy)}
          error={errors.subType?.message}
          {...register('subType')}
        />
        <NumberInput
          label="Electricity Usage (kWh)"
          placeholder="Usage in kWh"
          error={errors.kWh?.message}
          step="any"
          {...register('kWh', { valueAsNumber: true })}
        />
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Date of Activity
          </label>
          <input
            type="date"
            max={todayStr}
            className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all cursor-pointer"
            {...register('occurredAt')}
          />
          {errors.occurredAt && (
            <p className="text-xs text-state-error font-medium mt-1">{errors.occurredAt.message}</p>
          )}
        </div>
        <TextareaInput
          label="Notes / Description (Optional)"
          placeholder="e.g. Monthly meter reading, solar generation offset"
          className="sm:col-span-2"
          textareaClassName="resize-none h-20"
          error={errors.note?.message}
          {...register('note')}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={() =>
            reset({
              subType: 'indiaGrid',
              kWh: 0,
              occurredAt: todayStr,
              note: '',
            })
          }
          className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-border-default hover:bg-bg-elevated text-text-primary transition-all cursor-pointer"
        >
          Clear Fields
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-xs font-bold rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Icons.Loader className="w-4 h-4 animate-spin" />
              <span>Saving Log...</span>
            </>
          ) : (
            <>
              <Icons.PlusCircle className="w-4 h-4" />
              <span>Log Energy</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// 4. SHOPPING FORM
export function ShoppingForm({
  onSubmit,
  isSubmitting,
  onLiveEstimateChange,
  todayStr,
}: FormBaseProps<ShoppingFormInput>) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ShoppingFormInput>({
    resolver: zodResolver(shoppingSchema),
    defaultValues: {
      subType: 'tshirt',
      quantity: 0,
      occurredAt: todayStr,
      note: '',
    },
  });

  const subType = watch('subType');
  const quantity = watch('quantity');

  useEffect(() => {
    const factor = clientFactors[(subType || '').toLowerCase()] ?? 0;
    const qty = Number(quantity) || 0;
    const estimate = Math.round(qty * factor * 10) / 10;
    onLiveEstimateChange(estimate);
  }, [subType, quantity, onLiveEstimateChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SelectInput
          label="Product Type"
          options={getSubTypeOptions(ActivityCategory.Shopping)}
          error={errors.subType?.message}
          {...register('subType')}
        />
        <NumberInput
          label="Quantity"
          placeholder="Number of items"
          error={errors.quantity?.message}
          step="any"
          {...register('quantity', { valueAsNumber: true })}
        />
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Date of Activity
          </label>
          <input
            type="date"
            max={todayStr}
            className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all cursor-pointer"
            {...register('occurredAt')}
          />
          {errors.occurredAt && (
            <p className="text-xs text-state-error font-medium mt-1">{errors.occurredAt.message}</p>
          )}
        </div>
        <TextareaInput
          label="Notes / Description (Optional)"
          placeholder="e.g. Cotton clothing, eco-certified smartphone"
          className="sm:col-span-2"
          textareaClassName="resize-none h-20"
          error={errors.note?.message}
          {...register('note')}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={() =>
            reset({
              subType: 'tshirt',
              quantity: 0,
              occurredAt: todayStr,
              note: '',
            })
          }
          className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-border-default hover:bg-bg-elevated text-text-primary transition-all cursor-pointer"
        >
          Clear Fields
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-xs font-bold rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Icons.Loader className="w-4 h-4 animate-spin" />
              <span>Saving Log...</span>
            </>
          ) : (
            <>
              <Icons.PlusCircle className="w-4 h-4" />
              <span>Log Shopping</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// 5. WASTE FORM
export function WasteForm({
  onSubmit,
  isSubmitting,
  onLiveEstimateChange,
  todayStr,
}: FormBaseProps<WasteFormInput>) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<WasteFormInput>({
    resolver: zodResolver(wasteSchema),
    defaultValues: {
      subType: 'generalWaste',
      weight: 0,
      occurredAt: todayStr,
      note: '',
    },
  });

  const subType = watch('subType');
  const weight = watch('weight');

  useEffect(() => {
    const factor = clientFactors[(subType || '').toLowerCase()] ?? 0;
    const wt = Number(weight) || 0;
    const estimate = Math.round(wt * factor * 10) / 10;
    onLiveEstimateChange(estimate);
  }, [subType, weight, onLiveEstimateChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SelectInput
          label="Waste Type"
          options={getSubTypeOptions(ActivityCategory.Waste)}
          error={errors.subType?.message}
          {...register('subType')}
        />
        <NumberInput
          label="Weight (kg)"
          placeholder="Weight in kilograms"
          error={errors.weight?.message}
          step="any"
          {...register('weight', { valueAsNumber: true })}
        />
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Date of Activity
          </label>
          <input
            type="date"
            max={todayStr}
            className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all cursor-pointer"
            {...register('occurredAt')}
          />
          {errors.occurredAt && (
            <p className="text-xs text-state-error font-medium mt-1">{errors.occurredAt.message}</p>
          )}
        </div>
        <TextareaInput
          label="Notes / Description (Optional)"
          placeholder="e.g. Weekly kitchen waste, recycling bag"
          className="sm:col-span-2"
          textareaClassName="resize-none h-20"
          error={errors.note?.message}
          {...register('note')}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={() =>
            reset({
              subType: 'generalWaste',
              weight: 0,
              occurredAt: todayStr,
              note: '',
            })
          }
          className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-border-default hover:bg-bg-elevated text-text-primary transition-all cursor-pointer"
        >
          Clear Fields
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-xs font-bold rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Icons.Loader className="w-4 h-4 animate-spin" />
              <span>Saving Log...</span>
            </>
          ) : (
            <>
              <Icons.PlusCircle className="w-4 h-4" />
              <span>Log Waste</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
