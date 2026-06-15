'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as Icons from 'lucide-react';

import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { routes } from '@/lib/routes';
import { OnboardingInput, onboardingSchema } from '@/lib/validations/onboarding';
import { useAuth } from '@/src/hooks/useAuth';

import { submitOnboarding } from './actions';

export default function OnboardingClient() {
  const { user, dbUser, isLoaded } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      city: '',
      state: '',
      country: 'India',
      householdSize: 1,
      dietType: 'omnivore',
      commuteMode: 'car',
      commuteDistance: 0,
      monthlyKwh: 0,
      monthlyBudgetKg: 500,
    },
  });

  // Prefill profile values if they already exist in database or Clerk
  useEffect(() => {
    if (isLoaded && dbUser) {
      if (dbUser.name) {
        setValue('name', dbUser.name);
      } else if (user?.fullName) {
        setValue('name', user.fullName);
      }
      if (dbUser.profile) {
        const p = dbUser.profile;
        if (p.city) setValue('city', p.city);
        if (p.state) setValue('state', p.state);
        if (p.country) setValue('country', p.country);
        if (p.householdSize) setValue('householdSize', p.householdSize);
        if (p.dietType)
          setValue('dietType', p.dietType.toLowerCase() as OnboardingInput['dietType']);
        if (p.commuteMode)
          setValue('commuteMode', p.commuteMode.toLowerCase() as OnboardingInput['commuteMode']);
        if (p.commuteDistanceKm) setValue('commuteDistance', p.commuteDistanceKm);
        if (p.electricityUsageKwh) setValue('monthlyKwh', p.electricityUsageKwh);
      }
    }
  }, [isLoaded, dbUser, user, setValue]);

  // Watch fields to calculate dynamic baseline estimation
  const watchedDiet = useWatch({ control, name: 'dietType' }) || 'omnivore';
  const watchedCommuteMode = useWatch({ control, name: 'commuteMode' }) || 'car';
  const watchedCommuteDistance = useWatch({ control, name: 'commuteDistance' }) ?? 0;
  const watchedKwh = useWatch({ control, name: 'monthlyKwh' }) ?? 0;

  // Basic client-side math matching calculateBaselineFootprint
  let dietFactor = 105;
  if (watchedDiet === 'vegan') dietFactor = 45;
  else if (watchedDiet === 'vegetarian') dietFactor = 60;
  else if (watchedDiet === 'pescatarian') dietFactor = 75;
  else if (watchedDiet === 'omnivore') dietFactor = 105;
  else if (watchedDiet === 'mixed') dietFactor = 90;
  else if (watchedDiet === 'heavy-meat') dietFactor = 135;

  let commuteFactor = 0;
  if (watchedCommuteMode === 'car') commuteFactor = 0.2;
  else if (watchedCommuteMode === 'motorcycle') commuteFactor = 0.1;
  else if (watchedCommuteMode === 'public-transit') commuteFactor = 0.05;
  else if (watchedCommuteMode === 'metro') commuteFactor = 0.03;

  const monthlyDistance = (Number(watchedCommuteDistance) || 0) * 2 * 22;
  const commuteScore = monthlyDistance * commuteFactor;
  const electricityScore = (Number(watchedKwh) || 0) * 0.4;

  const calculatedBaseline = Math.round(dietFactor + commuteScore + electricityScore);
  const labelClassName = 'text-xs font-bold text-text-secondary uppercase tracking-wider block';
  const fieldClassName =
    'w-full rounded-xl border border-border-default bg-bg-base px-3.5 py-2.5 text-sm text-text-primary transition-colors placeholder:text-text-muted focus-visible:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50';
  const selectFieldClassName = `${fieldClassName} cursor-pointer`;
  const errorClassName = 'text-xs font-medium text-red-600';
  const secondaryButtonClassName =
    'inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border-default px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated focus-visible:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25';
  const primaryButtonClassName =
    'inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50';

  // Enforce step-by-step field validation before advancing
  const nextStep = async () => {
    let fieldsToValidate: Array<keyof OnboardingInput> = [];
    if (step === 1) {
      fieldsToValidate = ['name', 'city', 'state', 'country', 'householdSize'];
    } else if (step === 2) {
      fieldsToValidate = ['commuteMode', 'commuteDistance', 'monthlyKwh'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: OnboardingInput) => {
    if (step < 3) {
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await submitOnboarding(data);
      if (response.success) {
        // Redirect to dashboard on completion with hard reload to refresh database profile context
        window.location.replace(routes.dashboard);
      } else {
        setErrorMsg('Failed to process onboarding profile.');
      }
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setErrorMsg(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 h-full flex flex-col min-h-0 justify-center">
      {/* Step Indicators */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-primary font-bold text-white">
              <Icons.Leaf className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Establish Your Baseline</h1>
              <p className="text-xs leading-normal text-text-secondary">
                Configure your profile to estimate your baseline carbon footprint.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-accent-primary bg-accent-primary-dim px-2.5 py-0.5 rounded-full shrink-0">
            Step {step} of 3
          </span>
        </div>

        {/* Wizard Progress Line */}
        <div className="relative mt-3 h-1 bg-border-subtle rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-accent-primary transition-[width] duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-bg-surface border border-border-default rounded-2xl shadow-lg overflow-hidden flex-1 flex flex-col min-h-0">
        {/* Welcome Prefill Banner */}
        {step === 1 && user && (
          <div className="py-2.5 px-4 bg-accent-primary-dim border-b border-border-subtle flex items-center gap-3 shrink-0">
            <div className="p-1.5 bg-bg-surface rounded-lg border border-border-default">
              <Icons.User className="w-4.5 h-4.5 text-accent-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary">Prefilling details for</p>
              <h4 className="text-xs font-bold text-text-primary leading-tight">
                {user.fullName || user.username}
              </h4>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto p-5"
        >
          {errorMsg && (
            <div
              aria-live="polite"
              className="flex shrink-0 animate-slide-in items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-600"
            >
              <Icons.AlertTriangle className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: General & Location */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in flex-1">
              <div className="border-b border-border-subtle pb-2">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Icons.MapPin className="w-4.5 h-4.5 text-accent-primary" aria-hidden="true" />
                  <span>General & Location</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  Where do you live, and what is your household size?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="onboarding-name" className={labelClassName}>
                    Full Name (Optional)
                  </label>
                  <input
                    id="onboarding-name"
                    type="text"
                    autoComplete="name"
                    {...register('name')}
                    placeholder="Enter your name…"
                    className={fieldClassName}
                  />
                  {errors.name && <p className={errorClassName}>{errors.name.message}</p>}
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-city" className={labelClassName}>
                    City
                  </label>
                  <input
                    id="onboarding-city"
                    type="text"
                    autoComplete="address-level2"
                    {...register('city')}
                    placeholder="Pune…"
                    className={fieldClassName}
                  />
                  {errors.city && <p className={errorClassName}>{errors.city.message}</p>}
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-state" className={labelClassName}>
                    State / Region
                  </label>
                  <input
                    id="onboarding-state"
                    type="text"
                    autoComplete="address-level1"
                    {...register('state')}
                    placeholder="Maharashtra…"
                    className={fieldClassName}
                  />
                  {errors.state && <p className={errorClassName}>{errors.state.message}</p>}
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-country" className={labelClassName}>
                    Country
                  </label>
                  <input
                    id="onboarding-country"
                    type="text"
                    autoComplete="country-name"
                    {...register('country')}
                    placeholder="India…"
                    className={fieldClassName}
                  />
                  {errors.country && <p className={errorClassName}>{errors.country.message}</p>}
                </div>

                {/* Household Size */}
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-household-size" className={labelClassName}>
                    Household Size
                  </label>
                  <input
                    id="onboarding-household-size"
                    type="number"
                    inputMode="numeric"
                    autoComplete="off"
                    {...register('householdSize', { valueAsNumber: true })}
                    placeholder="Number of members…"
                    className={fieldClassName}
                  />
                  {errors.householdSize && (
                    <p className={errorClassName}>{errors.householdSize.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Commute & Energy */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in flex-1">
              <div className="border-b border-border-subtle pb-2">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Icons.Zap className="w-4.5 h-4.5 text-accent-primary" aria-hidden="true" />
                  <span>Commute & Energy</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  Tell us about your transit habits and utility grids.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Commute Mode */}
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-commute-mode" className={labelClassName}>
                    Primary Commute Mode
                  </label>
                  <select
                    id="onboarding-commute-mode"
                    autoComplete="off"
                    {...register('commuteMode')}
                    className={selectFieldClassName}
                  >
                    <option value="car">Car (Petrol/Diesel)</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="public-transit">Public Transit (Bus/Train)</option>
                    <option value="metro">Metro</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="walking">Walking</option>
                    <option value="remote">Remote / None</option>
                  </select>
                  {errors.commuteMode && (
                    <p className={errorClassName}>{errors.commuteMode.message}</p>
                  )}
                </div>

                {/* Commute Distance */}
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-commute-distance" className={labelClassName}>
                    One-Way Daily Distance (km)
                  </label>
                  <input
                    id="onboarding-commute-distance"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    autoComplete="off"
                    {...register('commuteDistance', { valueAsNumber: true })}
                    placeholder="12…"
                    className={fieldClassName}
                  />
                  {errors.commuteDistance && (
                    <p className={errorClassName}>{errors.commuteDistance.message}</p>
                  )}
                </div>

                {/* Electricity Usage */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="onboarding-monthly-kwh" className={labelClassName}>
                    Monthly Electricity Consumption (kWh)
                  </label>
                  <input
                    id="onboarding-monthly-kwh"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    autoComplete="off"
                    {...register('monthlyKwh', { valueAsNumber: true })}
                    placeholder="Check your bill for kWh…"
                    className={fieldClassName}
                  />
                  {errors.monthlyKwh && (
                    <p className={errorClassName}>{errors.monthlyKwh.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Lifestyle & Budget */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in flex-1">
              <div className="border-b border-border-subtle pb-2">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Icons.TrendingDown
                    className="w-4.5 h-4.5 text-accent-primary"
                    aria-hidden="true"
                  />
                  <span>Lifestyle & Budget</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  Set up your dietary rules and monthly emission limits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Diet Type */}
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-diet-type" className={labelClassName}>
                    Diet Type
                  </label>
                  <select
                    id="onboarding-diet-type"
                    autoComplete="off"
                    {...register('dietType')}
                    className={selectFieldClassName}
                  >
                    <option value="vegan">Vegan</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="omnivore">Omnivore (Balanced Meat/Veg)</option>
                    <option value="mixed">Mixed (Balanced Meat/Veg)</option>
                    <option value="heavy-meat">Heavy Meat Consumer</option>
                  </select>
                  {errors.dietType && <p className={errorClassName}>{errors.dietType.message}</p>}
                </div>

                {/* Budget Target */}
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-monthly-budget" className={labelClassName}>
                    Monthly Budget Target (kg CO₂e)
                  </label>
                  <input
                    id="onboarding-monthly-budget"
                    type="number"
                    inputMode="decimal"
                    autoComplete="off"
                    {...register('monthlyBudgetKg', { valueAsNumber: true })}
                    placeholder="Recommended: 500…"
                    className={fieldClassName}
                  />
                  {errors.monthlyBudgetKg && (
                    <p className={errorClassName}>{errors.monthlyBudgetKg.message}</p>
                  )}
                </div>

                {/* Estimated Footprint Box */}
                {calculatedBaseline !== null && (
                  <div className="sm:col-span-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3 mt-1 shrink-0">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                        <Icons.Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Estimated Baseline Footprint</span>
                      </h4>
                      <p className="max-w-sm text-xs leading-normal text-emerald-600 dark:text-emerald-400">
                        Starting monthly footprint estimation based on your commuting, dietary and
                        energy metrics.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                        {calculatedBaseline}
                      </span>
                      <span className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        kg CO₂e / month
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle shrink-0 mt-auto">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className={secondaryButtonClassName}>
                <Icons.ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                key="btn-continue"
                type="button"
                onClick={nextStep}
                className={primaryButtonClassName}
              >
                <span>Continue</span>
                <Icons.ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                key="btn-submit"
                type="submit"
                disabled={isSubmitting || step < 3}
                className={primaryButtonClassName}
              >
                {isSubmitting ? (
                  <>
                    <Icons.Loader className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    <span>Saving Profile…</span>
                  </>
                ) : (
                  <>
                    <Icons.CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Complete & Save</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
