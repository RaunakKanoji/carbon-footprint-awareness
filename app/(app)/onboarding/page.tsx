'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as Icons from 'lucide-react';

import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { routes } from '@/lib/routes';
import { OnboardingInput, onboardingSchema } from '@/lib/validations/onboarding';
import { useAuth } from '@/src/hooks/useAuth';

import { submitOnboarding } from './actions';

export default function OnboardingPage() {
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
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Step Indicators */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-primary text-white font-bold">
              <Icons.Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Establish Your Baseline</h1>
              <p className="text-xs text-text-secondary">
                Configure your profile to estimate your baseline carbon footprint.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-accent-primary bg-accent-primary-dim px-3 py-1 rounded-full">
            Step {step} of 3
          </span>
        </div>

        {/* Wizard Progress Line */}
        <div className="relative mt-8 h-1 bg-border-subtle rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-accent-primary transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-bg-surface border border-border-default rounded-2xl shadow-xl overflow-hidden">
        {/* Welcome Prefill Banner */}
        {step === 1 && user && (
          <div className="p-6 bg-accent-primary-dim border-b border-border-subtle flex items-center gap-4">
            <div className="p-2.5 bg-bg-surface rounded-xl border border-border-default">
              <Icons.User className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">Prefilling details for</p>
              <h4 className="text-sm font-bold text-text-primary">
                {user.fullName || user.username}
              </h4>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium">
              <Icons.AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: General & Location */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-border-subtle pb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Icons.MapPin className="w-5 h-5 text-accent-primary" />
                  <span>General & Location</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  Where do you live, and what is your household size?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    City
                  </label>
                  <input
                    type="text"
                    {...register('city')}
                    placeholder="e.g. Pune"
                    className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                  />
                  {errors.city && (
                    <p className="text-xs text-red-600 font-medium">{errors.city.message}</p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    State / Region
                  </label>
                  <input
                    type="text"
                    {...register('state')}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                  />
                  {errors.state && (
                    <p className="text-xs text-red-600 font-medium">{errors.state.message}</p>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Country
                  </label>
                  <input
                    type="text"
                    {...register('country')}
                    placeholder="e.g. India"
                    className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                  />
                  {errors.country && (
                    <p className="text-xs text-red-600 font-medium">{errors.country.message}</p>
                  )}
                </div>

                {/* Household Size */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Household Size
                  </label>
                  <input
                    type="number"
                    {...register('householdSize', { valueAsNumber: true })}
                    placeholder="Number of members"
                    className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                  />
                  {errors.householdSize && (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.householdSize.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Commute & Energy */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-border-subtle pb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Icons.Zap className="w-5 h-5 text-accent-primary" />
                  <span>Commute & Energy</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  Tell us about your transit habits and utility grids.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Commute Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Primary Commute Mode
                  </label>
                  <select
                    {...register('commuteMode')}
                    className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all cursor-pointer"
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
                    <p className="text-xs text-red-600 font-medium">{errors.commuteMode.message}</p>
                  )}
                </div>

                {/* Commute Distance */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    One-Way Daily Distance (km)
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('commuteDistance', { valueAsNumber: true })}
                    placeholder="e.g. 12"
                    className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                  />
                  {errors.commuteDistance && (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.commuteDistance.message}
                    </p>
                  )}
                </div>

                {/* Electricity Usage */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Monthly Electricity Consumption (kWh)
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('monthlyKwh', { valueAsNumber: true })}
                    placeholder="Check your electricity bill for kWh"
                    className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                  />
                  {errors.monthlyKwh && (
                    <p className="text-xs text-red-600 font-medium">{errors.monthlyKwh.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Lifestyle & Budget */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-border-subtle pb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Icons.TrendingDown className="w-5 h-5 text-accent-primary" />
                  <span>Lifestyle & Budget</span>
                </h3>
                <p className="text-xs text-text-secondary">
                  Set up your dietary rules and monthly emission limits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Diet Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Diet Type
                  </label>
                  <select
                    {...register('dietType')}
                    className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all cursor-pointer"
                  >
                    <option value="vegan">Vegan</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="omnivore">Omnivore (Balanced Meat/Veg)</option>
                    <option value="mixed">Mixed (Balanced Meat/Veg)</option>
                    <option value="heavy-meat">Heavy Meat Consumer</option>
                  </select>
                  {errors.dietType && (
                    <p className="text-xs text-red-600 font-medium">{errors.dietType.message}</p>
                  )}
                </div>

                {/* Budget Target */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Monthly Budget Target (kg CO₂e)
                  </label>
                  <input
                    type="number"
                    {...register('monthlyBudgetKg', { valueAsNumber: true })}
                    placeholder="Recommended: 500"
                    className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                  />
                  {errors.monthlyBudgetKg && (
                    <p className="text-xs text-red-600 font-medium">
                      {errors.monthlyBudgetKg.message}
                    </p>
                  )}
                </div>

                {/* Estimated Footprint Box */}
                {calculatedBaseline !== null && (
                  <div className="sm:col-span-2 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4 mt-2">
                    <div className="space-y-1">
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
                        <Icons.Compass className="w-4 h-4" />
                        <span>Estimated Baseline Footprint</span>
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Based on your inputs, your starting monthly greenhouse gas emissions are
                        estimated below.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                        {calculatedBaseline}
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">
                        kg CO₂e / month
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-border-default hover:bg-bg-elevated text-text-primary transition-all flex items-center gap-2 cursor-pointer"
              >
                <Icons.ArrowLeft className="w-4 h-4" />
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
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-accent-primary hover:bg-accent-primary/95 text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                key="btn-submit"
                type="submit"
                disabled={isSubmitting || step < 3}
                className="px-6 py-2.5 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Icons.Loader className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Icons.CheckCircle className="w-4 h-4" />
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
