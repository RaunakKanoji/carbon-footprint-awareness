import { zodResolver } from '@hookform/resolvers/zod';
import * as Icons from 'lucide-react';

import React, { useEffect } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
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
  clothingitem: 8.0,
  electronicsitem: 120.0,
  onlineorder: 3.5,
  landfillwaste: 0.45,
  recycling: 0.1,
  composting: 0.05,
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
  clothingItem: 'Clothing Item',
  electronicsItem: 'Electronics Item',
  onlineOrder: 'Online Order',
  landfillWaste: 'General Landfill Waste',
  recycling: 'Recycling',
  composting: 'Composting',
};

const getSubTypeOptions = (category: ActivityCategory) => {
  return ActivitySubTypes[category].map((sub) => ({
    value: sub,
    label: subTypeLabels[sub] || sub,
  }));
};

const dateInputClassName =
  'w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:border-accent-primary focus-visible:ring-2 focus-visible:ring-accent-primary/25 focus-visible:ring-offset-1 focus-visible:ring-offset-bg-surface';

interface FormBaseProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>;
  isSubmitting: boolean;
  hideActions?: boolean;
  onLiveEstimateChange: (estimate: number) => void;
  todayStr: string;
}

// 1. TRANSPORT FORM
export function TransportForm({
  onSubmit,
  isSubmitting,
  hideActions = false,
  onLiveEstimateChange,
  todayStr,
}: FormBaseProps<TransportFormInput>) {
  const {
    register,
    handleSubmit,
    control,
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

  const subType = useWatch({ control, name: 'subType' });
  const distanceKm = useWatch({ control, name: 'distanceKm' });
  const passengers = useWatch({ control, name: 'passengers' });

  useEffect(() => {
    const factor = clientFactors[(subType || '').toLowerCase()] ?? 0;
    const dist = Number(distanceKm) || 0;
    const pass = Number(passengers) || 1;
    const estimate = Math.round((dist / pass) * factor * 10) / 10;
    onLiveEstimateChange(estimate);
  }, [subType, distanceKm, passengers, onLiveEstimateChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className={dateInputClassName}
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
          textareaClassName="resize-none h-16"
          error={errors.note?.message}
          {...register('note')}
        />
      </div>

      {!hideActions && (
        <div className="mt-auto flex items-center justify-end gap-3 border-t border-border-subtle pt-3">
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
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-border-default px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
          >
            Clear Fields
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Icons.Loader className="w-4 h-4 animate-spin" />
                <span>Saving Log…</span>
              </>
            ) : (
              <>
                <Icons.PlusCircle className="w-4 h-4" />
                <span>Log Transport</span>
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}

// 2. FOOD FORM
export function FoodForm({
  onSubmit,
  isSubmitting,
  hideActions = false,
  onLiveEstimateChange,
  todayStr,
}: FormBaseProps<FoodFormInput>) {
  const {
    register,
    handleSubmit,
    control,
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

  const subType = useWatch({ control, name: 'subType' });
  const meals = useWatch({ control, name: 'meals' });

  useEffect(() => {
    const factor = clientFactors[(subType || '').toLowerCase()] ?? 0;
    const quantity = Number(meals) || 0;
    const estimate = Math.round(quantity * factor * 10) / 10;
    onLiveEstimateChange(estimate);
  }, [subType, meals, onLiveEstimateChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className={dateInputClassName}
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
          textareaClassName="resize-none h-16"
          error={errors.note?.message}
          {...register('note')}
        />
      </div>

      {!hideActions && (
        <div className="mt-auto flex items-center justify-end gap-3 border-t border-border-subtle pt-3">
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
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-border-default px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
          >
            Clear Fields
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Icons.Loader className="w-4 h-4 animate-spin" />
                <span>Saving Log…</span>
              </>
            ) : (
              <>
                <Icons.PlusCircle className="w-4 h-4" />
                <span>Log Food</span>
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}

// 3. ENERGY FORM
export function EnergyForm({
  onSubmit,
  isSubmitting,
  hideActions = false,
  onLiveEstimateChange,
  todayStr,
}: FormBaseProps<EnergyFormInput>) {
  const {
    register,
    handleSubmit,
    control,
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

  const subType = useWatch({ control, name: 'subType' });
  const kWh = useWatch({ control, name: 'kWh' });

  useEffect(() => {
    const factor = clientFactors[(subType || '').toLowerCase()] ?? 0;
    const quantity = Number(kWh) || 0;
    const estimate = Math.round(quantity * factor * 10) / 10;
    onLiveEstimateChange(estimate);
  }, [subType, kWh, onLiveEstimateChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className={dateInputClassName}
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
          textareaClassName="resize-none h-16"
          error={errors.note?.message}
          {...register('note')}
        />
      </div>

      {!hideActions && (
        <div className="mt-auto flex items-center justify-end gap-3 border-t border-border-subtle pt-3">
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
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-border-default px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
          >
            Clear Fields
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Icons.Loader className="w-4 h-4 animate-spin" />
                <span>Saving Log…</span>
              </>
            ) : (
              <>
                <Icons.PlusCircle className="w-4 h-4" />
                <span>Log Energy</span>
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}

// 4. SHOPPING FORM
export function ShoppingForm({
  onSubmit,
  isSubmitting,
  hideActions = false,
  onLiveEstimateChange,
  todayStr,
}: FormBaseProps<ShoppingFormInput>) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ShoppingFormInput>({
    resolver: zodResolver(shoppingSchema),
    defaultValues: {
      subType: 'clothingItem',
      quantity: 0,
      occurredAt: todayStr,
      note: '',
    },
  });

  const subType = useWatch({ control, name: 'subType' });
  const quantity = useWatch({ control, name: 'quantity' });

  useEffect(() => {
    const factor = clientFactors[(subType || '').toLowerCase()] ?? 0;
    const qty = Number(quantity) || 0;
    const estimate = Math.round(qty * factor * 10) / 10;
    onLiveEstimateChange(estimate);
  }, [subType, quantity, onLiveEstimateChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className={dateInputClassName}
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
          textareaClassName="resize-none h-16"
          error={errors.note?.message}
          {...register('note')}
        />
      </div>

      {!hideActions && (
        <div className="mt-auto flex items-center justify-end gap-3 border-t border-border-subtle pt-3">
          <button
            type="button"
            onClick={() =>
              reset({
                subType: 'clothingItem',
                quantity: 0,
                occurredAt: todayStr,
                note: '',
              })
            }
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-border-default px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
          >
            Clear Fields
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Icons.Loader className="w-4 h-4 animate-spin" />
                <span>Saving Log…</span>
              </>
            ) : (
              <>
                <Icons.PlusCircle className="w-4 h-4" />
                <span>Log Shopping</span>
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}

// 5. WASTE FORM
export function WasteForm({
  onSubmit,
  isSubmitting,
  hideActions = false,
  onLiveEstimateChange,
  todayStr,
}: FormBaseProps<WasteFormInput>) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<WasteFormInput>({
    resolver: zodResolver(wasteSchema),
    defaultValues: {
      subType: 'landfillWaste',
      weight: 0,
      occurredAt: todayStr,
      note: '',
    },
  });

  const subType = useWatch({ control, name: 'subType' });
  const weight = useWatch({ control, name: 'weight' });

  useEffect(() => {
    const factor = clientFactors[(subType || '').toLowerCase()] ?? 0;
    const wt = Number(weight) || 0;
    const estimate = Math.round(wt * factor * 10) / 10;
    onLiveEstimateChange(estimate);
  }, [subType, weight, onLiveEstimateChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className={dateInputClassName}
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
          textareaClassName="resize-none h-16"
          error={errors.note?.message}
          {...register('note')}
        />
      </div>

      {!hideActions && (
        <div className="mt-auto flex items-center justify-end gap-3 border-t border-border-subtle pt-3">
          <button
            type="button"
            onClick={() =>
              reset({
                subType: 'landfillWaste',
                weight: 0,
                occurredAt: todayStr,
                note: '',
              })
            }
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-border-default px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
          >
            Clear Fields
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Icons.Loader className="w-4 h-4 animate-spin" />
                <span>Saving Log…</span>
              </>
            ) : (
              <>
                <Icons.PlusCircle className="w-4 h-4" />
                <span>Log Waste</span>
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
