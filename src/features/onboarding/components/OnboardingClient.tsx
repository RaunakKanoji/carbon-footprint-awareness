'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bike,
  CheckCircle2,
  Home,
  Leaf,
  Loader2,
  MapPin,
  Plug,
  Recycle,
  Target,
  User,
  Utensils,
} from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { routes } from '@/src/config/routes';
import { type OnboardingInput, onboardingSchema } from '@/src/validations/onboarding';
import { useAuth } from '@/src/hooks/useAuth';

import { completeOnboarding } from '../actions';

const fieldClassName =
  'h-10 w-full rounded-xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary transition-colors placeholder:text-text-muted focus-visible:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50';

const labelClassName = 'grid gap-2 text-sm font-bold text-text-primary';
const helperClassName = 'text-xs font-medium leading-5 text-text-secondary';
const errorClassName = 'text-xs font-semibold text-red-600';

const steps = [
  {
    id: 1,
    title: 'Profile',
    description: 'Location and household context.',
    icon: User,
  },
  {
    id: 2,
    title: 'Mobility & Energy',
    description: 'Commute and home electricity.',
    icon: Plug,
  },
  {
    id: 3,
    title: 'Lifestyle',
    description: 'Food, shopping, waste, and travel.',
    icon: Leaf,
  },
  {
    id: 4,
    title: 'Target',
    description: 'Set a practical first carbon target.',
    icon: Target,
  },
];

function mapStoredDietType(
  value: string | null | undefined,
): OnboardingInput['dietType'] | undefined {
  switch (value) {
    case 'VEGAN':
      return 'vegan';
    case 'VEGETARIAN':
      return 'vegetarian';
    case 'PESCATARIAN':
      return 'pescatarian';
    case 'MIXED':
      return 'mixed';
    case 'OTHER':
      return 'heavy-meat';
    case 'OMNIVORE':
      return 'omnivore';
    default:
      return undefined;
  }
}

function mapStoredCommuteMode(
  value: string | null | undefined,
): OnboardingInput['commuteMode'] | undefined {
  switch (value) {
    case 'MOTORBIKE':
      return 'motorcycle';
    case 'BUS':
    case 'TRAIN':
    case 'CARPOOL':
      return 'public-transit';
    case 'METRO':
      return 'metro';
    case 'WALK':
      return 'walk';
    case 'BICYCLE':
      return 'bike';
    case 'WORK_FROM_HOME':
      return 'remote';
    case 'CAR':
    case 'EV':
      return 'car';
    default:
      return undefined;
  }
}

function getStepFields(step: number): Array<keyof OnboardingInput> {
  if (step === 1) {
    return ['name', 'city', 'state', 'country', 'householdSize'];
  }

  if (step === 2) {
    return ['commuteMode', 'commuteDistance', 'monthlyKwh', 'vehicleFuelType'];
  }

  if (step === 3) {
    return ['dietType', 'mealFrequency', 'shoppingFrequency', 'wasteHabits', 'travelFrequency'];
  }

  return ['monthlyBudgetKg', 'reductionGoal'];
}

function getDietMonthlyKg(dietType: string) {
  if (dietType === 'vegan') return 45;
  if (dietType === 'vegetarian') return 60;
  if (dietType === 'pescatarian') return 75;
  if (dietType === 'mixed') return 90;
  if (dietType === 'heavy-meat') return 135;

  return 105;
}

function getCommuteFactor(commuteMode: string, fuelType: string) {
  if (commuteMode === 'car') return fuelType === 'diesel' ? 0.17 : 0.2;
  if (commuteMode === 'motorcycle') return 0.1;
  if (commuteMode === 'public-transit') return 0.05;
  if (commuteMode === 'metro') return 0.03;

  return 0;
}

function getShoppingMonthlyKg(frequency: string) {
  if (frequency === 'rarely') return 15;
  if (frequency === 'weekly') return 75;

  return 35;
}

function getWasteMonthlyKg(habit: string) {
  if (habit === 'recycle') return 10;
  if (habit === 'compost') return 8;
  if (habit === 'landfill') return 28;

  return 18;
}

function getTravelMonthlyKg(frequency: string) {
  if (frequency === 'rare') return 8;
  if (frequency === 'frequent') return 60;

  return 20;
}

function getReductionPercentage(goal: string) {
  if (goal === 'easy') return 3;
  if (goal === 'ambitious') return 15;

  return 7;
}

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
    mode: 'onChange',
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
      mealFrequency: 21,
      vehicleFuelType: 'petrol',
      shoppingFrequency: 'monthly',
      wasteHabits: 'mixed',
      travelFrequency: 'occasional',
      reductionGoal: 'balanced',
    },
  });

  useEffect(() => {
    if (!isLoaded || !dbUser) return;

    if (dbUser.name) {
      setValue('name', dbUser.name);
    } else if (user?.fullName) {
      setValue('name', user.fullName);
    }

    if (dbUser.profile) {
      const profile = dbUser.profile;

      if (profile.city) setValue('city', profile.city);
      if (profile.state) setValue('state', profile.state);
      if (profile.country) setValue('country', profile.country);
      if (profile.householdSize) setValue('householdSize', profile.householdSize);

      const dietType = mapStoredDietType(profile.dietType);
      const commuteMode = mapStoredCommuteMode(profile.commuteMode);

      if (dietType) setValue('dietType', dietType);
      if (commuteMode) setValue('commuteMode', commuteMode);

      if (profile.commuteDistanceKm) {
        setValue('commuteDistance', profile.commuteDistanceKm);
      }

      if (profile.electricityUsageKwh) {
        setValue('monthlyKwh', profile.electricityUsageKwh);
      }
    }
  }, [isLoaded, dbUser, user, setValue]);

  const watchedDiet = useWatch({ control, name: 'dietType' }) || 'omnivore';
  const watchedCommuteMode = useWatch({ control, name: 'commuteMode' }) || 'car';
  const watchedCommuteDistance = useWatch({ control, name: 'commuteDistance' }) ?? 0;
  const watchedKwh = useWatch({ control, name: 'monthlyKwh' }) ?? 0;
  const watchedFuelType = useWatch({ control, name: 'vehicleFuelType' }) || 'petrol';
  const watchedShopping = useWatch({ control, name: 'shoppingFrequency' }) || 'monthly';
  const watchedWaste = useWatch({ control, name: 'wasteHabits' }) || 'mixed';
  const watchedTravel = useWatch({ control, name: 'travelFrequency' }) || 'occasional';
  const watchedGoal = useWatch({ control, name: 'reductionGoal' }) || 'balanced';

  const baseline = useMemo(() => {
    const foodKg = getDietMonthlyKg(watchedDiet);
    const commuteKm = Number(watchedCommuteDistance) || 0;
    const monthlyDistance = commuteKm * 2 * 22;
    const commuteKg = monthlyDistance * getCommuteFactor(watchedCommuteMode, watchedFuelType);
    const electricityKg = (Number(watchedKwh) || 0) * 0.4;
    const shoppingKg = getShoppingMonthlyKg(watchedShopping);
    const wasteKg = getWasteMonthlyKg(watchedWaste);
    const travelKg = getTravelMonthlyKg(watchedTravel);

    const total = Math.max(
      1,
      Math.round(foodKg + commuteKg + electricityKg + shoppingKg + wasteKg + travelKg),
    );

    return {
      foodKg,
      commuteKg,
      electricityKg,
      shoppingKg,
      wasteKg,
      travelKg,
      total,
    };
  }, [
    watchedDiet,
    watchedCommuteDistance,
    watchedCommuteMode,
    watchedFuelType,
    watchedKwh,
    watchedShopping,
    watchedWaste,
    watchedTravel,
  ]);

  const suggestedTarget = Math.round(
    baseline.total * (1 - getReductionPercentage(watchedGoal) / 100),
  );

  const currentStep = steps.find((item) => item.id === step) ?? steps[0];
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  async function nextStep() {
    const isValid = await trigger(getStepFields(step));

    if (!isValid) return;

    setStep((current) => Math.min(steps.length, current + 1));
    setErrorMsg(null);
  }

  function prevStep() {
    setStep((current) => Math.max(1, current - 1));
    setErrorMsg(null);
  }

  async function onSubmit(data: OnboardingInput) {
    if (step < steps.length) {
      await nextStep();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await completeOnboarding(data);

      if (!response.success) {
        setErrorMsg('Failed to complete onboarding.');
        return;
      }

      window.location.replace(routes.dashboard);
    } catch (error) {
      console.error(error);
      setErrorMsg(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col justify-center px-4 py-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
          <div className="border-b border-border-subtle px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <currentStep.icon className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                    Carbon Compass Setup
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
                    {currentStep.title}
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                    {currentStep.description}
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Step {step} of {steps.length}
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full rounded-full bg-accent-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="border-b border-border-subtle bg-bg-elevated/35 px-5 py-3">
            <div className="grid gap-2 sm:grid-cols-4">
              {steps.map((item) => {
                const StepIcon = item.icon;
                const active = item.id === step;
                const done = item.id < step;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id <= step) setStep(item.id);
                    }}
                    className={`rounded-2xl border px-3 py-3 text-left transition-colors ${active
                        ? 'border-emerald-300 bg-emerald-50'
                        : done
                          ? 'border-emerald-200 bg-bg-surface'
                          : 'border-border-subtle bg-bg-surface/70 opacity-70'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${active || done
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-bg-elevated text-text-muted'
                          }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-text-primary">
                          {item.title}
                        </p>
                        <p className="truncate text-[11px] font-medium text-text-secondary">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
            {errorMsg && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <p className="leading-6">{errorMsg}</p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-black text-text-primary">Why we ask this</p>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        Location and household size help the app estimate electricity, commute, and
                        lifestyle assumptions more fairly.
                      </p>
                    </div>
                  </div>
                </div>

                {user && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 ring-1 ring-emerald-100">
                        <User className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-emerald-700">Signed in as</p>
                        <p className="text-sm font-black text-text-primary">
                          {user.fullName || user.username || user.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={`${labelClassName} sm:col-span-2`}>
                    Full name
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your name"
                      className={fieldClassName}
                      {...register('name')}
                    />
                    {errors.name && <span className={errorClassName}>{errors.name.message}</span>}
                  </label>

                  <label className={labelClassName}>
                    City
                    <input
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Mumbai"
                      className={fieldClassName}
                      {...register('city')}
                    />
                    {errors.city && <span className={errorClassName}>{errors.city.message}</span>}
                  </label>

                  <label className={labelClassName}>
                    State
                    <input
                      type="text"
                      autoComplete="address-level1"
                      placeholder="Maharashtra"
                      className={fieldClassName}
                      {...register('state')}
                    />
                    {errors.state && <span className={errorClassName}>{errors.state.message}</span>}
                  </label>

                  <label className={labelClassName}>
                    Country
                    <input
                      type="text"
                      autoComplete="country-name"
                      placeholder="India"
                      className={fieldClassName}
                      {...register('country')}
                    />
                    {errors.country && (
                      <span className={errorClassName}>{errors.country.message}</span>
                    )}
                  </label>

                  <label className={labelClassName}>
                    Household size
                    <input
                      type="number"
                      min="1"
                      className={fieldClassName}
                      {...register('householdSize', { valueAsNumber: true })}
                    />
                    <span className={helperClassName}>Used to normalize home energy impact.</span>
                    {errors.householdSize && (
                      <span className={errorClassName}>{errors.householdSize.message}</span>
                    )}
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4">
                    <div className="flex gap-3">
                      <Bike className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                      <div>
                        <p className="font-black text-text-primary">Commute estimate</p>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">
                          Daily distance is converted into monthly travel emissions using workday
                          assumptions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4">
                    <div className="flex gap-3">
                      <Plug className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                      <div>
                        <p className="font-black text-text-primary">Electricity estimate</p>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">
                          Monthly kWh helps the dashboard estimate household energy impact.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClassName}>
                    Primary commute mode
                    <select
                      className={`${fieldClassName} cursor-pointer`}
                      {...register('commuteMode')}
                    >
                      <option value="car">Car</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="public-transit">Public transit</option>
                      <option value="metro">Metro</option>
                      <option value="walk">Walk</option>
                      <option value="bike">Bike</option>
                      <option value="remote">Remote / work from home</option>
                    </select>
                    {errors.commuteMode && (
                      <span className={errorClassName}>{errors.commuteMode.message}</span>
                    )}
                  </label>

                  <label className={labelClassName}>
                    Vehicle fuel type
                    <select
                      className={`${fieldClassName} cursor-pointer`}
                      {...register('vehicleFuelType')}
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="none">Not applicable</option>
                    </select>
                    {errors.vehicleFuelType && (
                      <span className={errorClassName}>{errors.vehicleFuelType.message}</span>
                    )}
                  </label>

                  <label className={labelClassName}>
                    One-way commute distance
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="8"
                        className={`${fieldClassName} pr-12`}
                        {...register('commuteDistance', { valueAsNumber: true })}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-text-muted">
                        km
                      </span>
                    </div>
                    <span className={helperClassName}>Use 0 for remote work.</span>
                    {errors.commuteDistance && (
                      <span className={errorClassName}>{errors.commuteDistance.message}</span>
                    )}
                  </label>

                  <label className={labelClassName}>
                    Monthly electricity use
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="250"
                        className={`${fieldClassName} pr-14`}
                        {...register('monthlyKwh', { valueAsNumber: true })}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-text-muted">
                        kWh
                      </span>
                    </div>
                    {errors.monthlyKwh && (
                      <span className={errorClassName}>{errors.monthlyKwh.message}</span>
                    )}
                  </label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4">
                  <div className="flex gap-3">
                    <Utensils className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-black text-text-primary">Lifestyle signals</p>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        These are not judgment questions. They help the app recommend realistic
                        missions later.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClassName}>
                    Typical diet
                    <select
                      className={`${fieldClassName} cursor-pointer`}
                      {...register('dietType')}
                    >
                      <option value="omnivore">Omnivore</option>
                      <option value="mixed">Mixed / flexible</option>
                      <option value="heavy-meat">Heavy meat</option>
                      <option value="pescatarian">Pescatarian</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                    </select>
                    {errors.dietType && (
                      <span className={errorClassName}>{errors.dietType.message}</span>
                    )}
                  </label>

                  <label className={labelClassName}>
                    Meals per week
                    <input
                      type="number"
                      min="1"
                      max="42"
                      className={fieldClassName}
                      {...register('mealFrequency', { valueAsNumber: true })}
                    />
                    <span className={helperClassName}>Used for food-impact simulations.</span>
                    {errors.mealFrequency && (
                      <span className={errorClassName}>{errors.mealFrequency.message}</span>
                    )}
                  </label>

                  <label className={labelClassName}>
                    Shopping frequency
                    <select
                      className={`${fieldClassName} cursor-pointer`}
                      {...register('shoppingFrequency')}
                    >
                      <option value="rarely">Rarely</option>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                    {errors.shoppingFrequency && (
                      <span className={errorClassName}>{errors.shoppingFrequency.message}</span>
                    )}
                  </label>

                  <label className={labelClassName}>
                    Waste habits
                    <select
                      className={`${fieldClassName} cursor-pointer`}
                      {...register('wasteHabits')}
                    >
                      <option value="mixed">Mixed disposal</option>
                      <option value="recycle">Mostly recycle</option>
                      <option value="compost">Recycle + compost</option>
                      <option value="landfill">Mostly landfill</option>
                    </select>
                    {errors.wasteHabits && (
                      <span className={errorClassName}>{errors.wasteHabits.message}</span>
                    )}
                  </label>

                  <label className={`${labelClassName} sm:col-span-2`}>
                    Travel frequency
                    <select
                      className={`${fieldClassName} cursor-pointer`}
                      {...register('travelFrequency')}
                    >
                      <option value="rare">Rarely</option>
                      <option value="occasional">Occasional</option>
                      <option value="frequent">Frequent</option>
                    </select>
                    {errors.travelFrequency && (
                      <span className={errorClassName}>{errors.travelFrequency.message}</span>
                    )}
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex gap-3">
                    <Target className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    <div>
                      <p className="font-black text-text-primary">Your first target</p>
                      <p className="mt-1 text-sm leading-6 text-emerald-800">
                        Your estimated baseline is{' '}
                        <span className="font-black">{baseline.total} kg CO₂e/month</span>. Pick a
                        target that feels repeatable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      value: 'easy',
                      title: 'Easy',
                      detail: '3% reduction',
                    },
                    {
                      value: 'balanced',
                      title: 'Balanced',
                      detail: '7% reduction',
                    },
                    {
                      value: 'ambitious',
                      title: 'Ambitious',
                      detail: '15% reduction',
                    },
                  ].map((goal) => (
                    <label
                      key={goal.value}
                      className="cursor-pointer rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4 transition-colors has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50"
                    >
                      <input
                        type="radio"
                        value={goal.value}
                        className="sr-only"
                        {...register('reductionGoal')}
                      />
                      <p className="font-black text-text-primary">{goal.title}</p>
                      <p className="mt-1 text-xs font-semibold text-text-secondary">
                        {goal.detail}
                      </p>
                    </label>
                  ))}
                </div>

                <label className={labelClassName}>
                  Monthly carbon target
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className={`${fieldClassName} pr-20`}
                      {...register('monthlyBudgetKg', { valueAsNumber: true })}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-text-muted">
                      kg CO₂e
                    </span>
                  </div>
                  <span className={helperClassName}>
                    Suggested target from your selected goal: {suggestedTarget} kg CO₂e/month.
                  </span>
                  {errors.monthlyBudgetKg && (
                    <span className={errorClassName}>{errors.monthlyBudgetKg.message}</span>
                  )}
                </label>

                <button
                  type="button"
                  onClick={() => setValue('monthlyBudgetKg', suggestedTarget)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border-default px-4 text-sm font-black text-text-primary transition-colors hover:bg-bg-elevated"
                >
                  Use suggested target
                </button>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border-subtle pt-5">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1 || isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border-default px-4 text-sm font-black text-text-primary transition-colors hover:bg-bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-accent-primary px-5 text-sm font-black text-white transition-colors hover:bg-accent-primary/95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : step === steps.length ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {step === steps.length ? 'Finish setup' : 'Continue'}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <div className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
            <div className="bg-emerald-600 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-50/80">
                Live baseline
              </p>

              <p className="mt-4 text-4xl font-bold tracking-tight">{baseline.total}</p>

              <p className="mt-1 text-sm font-semibold text-emerald-50/90">
                kg CO₂e per month estimate
              </p>
            </div>

            <div className="space-y-3 p-5">
              {[
                {
                  label: 'Food',
                  value: baseline.foodKg,
                  icon: Utensils,
                },
                {
                  label: 'Commute',
                  value: baseline.commuteKg,
                  icon: Bike,
                },
                {
                  label: 'Energy',
                  value: baseline.electricityKg,
                  icon: Plug,
                },
                {
                  label: 'Shopping',
                  value: baseline.shoppingKg,
                  icon: Home,
                },
                {
                  label: 'Waste',
                  value: baseline.wasteKg,
                  icon: Recycle,
                },
              ].map((item) => {
                const ItemIcon = item.icon;
                const percent =
                  baseline.total > 0 ? Math.round((item.value / baseline.total) * 100) : 0;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-bg-surface text-text-secondary ring-1 ring-border-subtle">
                        <ItemIcon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3 text-xs font-black">
                          <span className="text-text-primary">{item.label}</span>
                          <span className="text-text-secondary">{Math.round(item.value)} kg</span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-elevated">
                          <div
                            className="h-full rounded-full bg-accent-primary"
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border-default bg-bg-surface p-5 shadow-sm">
            <p className="text-sm font-black text-text-primary">Why this matters</p>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              This baseline powers your dashboard, simulator, insights, and challenge
              recommendations. You can edit these values later from Profile and Settings.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
