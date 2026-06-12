'use client';

import { useClerk } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Icons from 'lucide-react';

import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import PageHeader from '@/components/app/page-header';
import { OnboardingInput, onboardingSchema } from '@/lib/validations/onboarding';
import { useAuth } from '@/src/hooks/useAuth';

import { fetchProfileAndBudget, updateProfile } from './actions';

type TabType = 'general' | 'transit' | 'lifestyle' | 'achievements';

interface CompletedChallenge {
  id: string;
  title: string;
  badgeName: string;
  points: number;
  completedAt: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { openUserProfile } = useClerk();

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [completedChallenges, setCompletedChallenges] = useState<CompletedChallenge[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, []);

  const formatDate = (dateStr?: string | null) => {
    if (!isMounted || !dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
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

  // Load baseline profile on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const data = await fetchProfileAndBudget();
        reset(data);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setErrorMsg('Could not load profile preferences. Please refresh the page.');
      } finally {
        setLoadingData(false);
      }
    }
    loadData();

    // Fetch challenges to calculate points and badges
    async function fetchChallenges() {
      try {
        const res = await fetch('/api/challenge');
        const data = await res.json();
        if (data.success) {
          setCompletedChallenges(data.completedChallenges || []);
        }
      } catch (err) {
        console.error('Failed to fetch challenges in profile page:', err);
      }
    }
    fetchChallenges();
  }, [reset]);

  // Watch inputs for live baseline carbon footprint calculations
  const watchedDiet = useWatch({ control, name: 'dietType' }) || 'omnivore';
  const watchedCommuteMode = useWatch({ control, name: 'commuteMode' }) || 'car';
  const watchedCommuteDistance = useWatch({ control, name: 'commuteDistance' }) ?? 0;
  const watchedKwh = useWatch({ control, name: 'monthlyKwh' }) ?? 0;
  const watchedBudget = useWatch({ control, name: 'monthlyBudgetKg' }) ?? 500;

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
  const commuteScore = Math.round(monthlyDistance * commuteFactor);
  const electricityScore = Math.round((Number(watchedKwh) || 0) * 0.4);

  const calculatedBaseline = Math.round(dietFactor + commuteScore + electricityScore);
  const budgetTarget = Number(watchedBudget) || 500;
  const percentOfBudget =
    budgetTarget > 0 ? Math.round((calculatedBaseline / budgetTarget) * 100) : 0;

  const handleFormSubmit = async (data: OnboardingInput) => {
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const response = await updateProfile(data);
      if (response.success) {
        setSuccessMsg('Profile updated successfully! Carbon metrics recalculated.');
        reset(data); // clears isDirty state
      } else {
        setErrorMsg('Failed to update baseline details.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg((err as Error).message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setLoadingData(true);
    fetchProfileAndBudget()
      .then((data) => {
        reset(data);
        setSuccessMsg(null);
        setErrorMsg(null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingData(false));
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <Icons.Loader className="w-8 h-8 text-accent-primary animate-spin" />
          <p className="text-sm text-text-secondary font-medium animate-pulse">
            Loading your sustainability profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12 animate-fade-in">
      <PageHeader
        title="User Profile"
        description="Review and customize the parameters that define your carbon calculations and target budgets."
        badge="Account Settings"
      />

      {/* Success and Error Message Banners */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium animate-slide-in">
          <div className="flex items-center gap-3">
            <Icons.CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="p-1 rounded-full hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-all cursor-pointer"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium animate-slide-in">
          <div className="flex items-center gap-3">
            <Icons.AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="p-1 rounded-full hover:bg-red-500/20 text-red-700 dark:text-red-400 transition-all cursor-pointer"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Clerk Identity & Baseline Stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* Clerk Profile Card */}
          <div className="bg-bg-surface border border-border-default rounded-2xl shadow-md overflow-hidden">
            {/* Banner Background */}
            <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-500 relative" />

            <div className="p-6 pt-0 relative flex flex-col items-center text-center">
              {/* Floating Avatar */}
              <div className="relative -mt-12 mb-4">
                {user?.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'User Avatar'}
                    className="w-24 h-24 rounded-full border-4 border-bg-surface shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-accent-primary-dim border-4 border-bg-surface flex items-center justify-center text-accent-primary shadow-lg">
                    <Icons.User className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-bg-surface rounded-full" />
              </div>

              <h3 className="font-bold text-text-primary text-lg">
                {user?.fullName || user?.username || 'Eco Citizen'}
              </h3>
              <p className="text-xs text-text-secondary font-medium">
                {user?.primaryEmailAddress?.emailAddress || 'active session user'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-accent-primary-dim text-accent-primary border border-accent-primary/20">
                  Carbon Tracker
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
                {completedChallenges.length > 0 && (
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                    <Icons.Award className="w-3 h-3 text-amber-500" />
                    <span>
                      {100 + completedChallenges.reduce((sum, c) => sum + c.points, 0)} pts
                    </span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => openUserProfile()}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-bg-base hover:bg-bg-elevated text-text-primary border border-border-default rounded-xl transition-all cursor-pointer"
              >
                <Icons.ExternalLink className="w-3.5 h-3.5 text-text-secondary" />
                <span>Manage Clerk Account</span>
              </button>
            </div>
          </div>

          {/* Dynamic Baseline Carbon Footprint Dashboard Card */}
          <div className="bg-bg-surface border border-border-default rounded-2xl shadow-md p-6 space-y-6">
            <div>
              <h4 className="font-bold text-text-primary flex items-center gap-2">
                <Icons.Compass className="w-5 h-5 text-accent-primary" />
                <span>Footprint Summary</span>
              </h4>
              <p className="text-xs text-text-secondary">
                Real-time calculations based on your parameters.
              </p>
            </div>

            {/* Huge Footprint Number */}
            <div className="bg-bg-base border border-border-default rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Icons.Leaf className="w-12 h-12 text-accent-primary" />
              </div>
              <span className="text-4xl font-black text-text-primary">{calculatedBaseline}</span>
              <span className="text-xs text-text-secondary mt-1 font-semibold uppercase tracking-wider">
                kg CO₂e / month
              </span>
            </div>

            {/* Target Comparison Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text-secondary">Target Limit</span>
                <span className="text-text-primary">{budgetTarget} kg CO₂e</span>
              </div>
              <div className="h-2 w-full bg-bg-base rounded-full overflow-hidden border border-border-subtle">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentOfBudget <= 80
                      ? 'bg-emerald-500'
                      : percentOfBudget <= 100
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${percentOfBudget}%` }}
                />
              </div>
              <p className="text-[11px] font-medium text-text-secondary">
                Currently utilizing{' '}
                <span className="font-bold text-text-primary">{percentOfBudget}%</span> of your
                monthly limit.
              </p>
            </div>

            {/* Segment Breakdown */}
            <div className="space-y-3 pt-2 border-t border-border-subtle">
              <h5 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Emissions Breakdown
              </h5>

              {/* Diet */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Icons.Soup className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-text-secondary font-medium">
                    Diet Style ({watchedDiet})
                  </span>
                </div>
                <span className="font-bold text-text-primary">{dietFactor} kg</span>
              </div>

              {/* Commute */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Icons.Car className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-text-secondary font-medium">
                    Commuting ({watchedCommuteMode})
                  </span>
                </div>
                <span className="font-bold text-text-primary">{commuteScore} kg</span>
              </div>

              {/* Electricity */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Icons.Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-text-secondary font-medium">
                    Electricity ({watchedKwh} kWh)
                  </span>
                </div>
                <span className="font-bold text-text-primary">{electricityScore} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings Form Tabs */}
        <div className="lg:col-span-2">
          <div className="bg-bg-surface border border-border-default rounded-2xl shadow-md overflow-hidden flex flex-col h-full">
            {/* Tabs Selector Navigation Bar */}
            <div className="flex border-b border-border-default bg-bg-base/40">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'general'
                    ? 'border-accent-primary text-accent-primary bg-bg-surface'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                }`}
              >
                <Icons.MapPin className="w-4 h-4" />
                <span>General & Location</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transit')}
                className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'transit'
                    ? 'border-accent-primary text-accent-primary bg-bg-surface'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                }`}
              >
                <Icons.Zap className="w-4 h-4" />
                <span>Transit & Energy</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('lifestyle')}
                className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'lifestyle'
                    ? 'border-accent-primary text-accent-primary bg-bg-surface'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                }`}
              >
                <Icons.TrendingDown className="w-4 h-4" />
                <span>Lifestyle & Budget</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('achievements')}
                className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'achievements'
                    ? 'border-accent-primary text-accent-primary bg-bg-surface'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                }`}
              >
                <Icons.Award className="w-4 h-4" />
                <span>Achievements</span>
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col">
              <div className="p-6 flex-1 space-y-6">
                {/* General Tab */}
                {activeTab === 'general' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h4 className="text-base font-bold text-text-primary">
                        General & Geographical Context
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Customize your general name reference and household structure.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                          Profile Reference Name
                        </label>
                        <input
                          type="text"
                          {...register('name')}
                          placeholder="Your display name"
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
                          placeholder="e.g. Mumbai"
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
                          <p className="text-xs text-red-600 font-medium">
                            {errors.country.message}
                          </p>
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
                          placeholder="Count of members"
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

                {/* Transit & Utilities Tab */}
                {activeTab === 'transit' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h4 className="text-base font-bold text-text-primary">
                        Transit Patterns & Power Utilities
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Describe your transit habits and home electricity logs.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Commute Mode */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                          Primary Commuting Vehicle
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
                          <p className="text-xs text-red-600 font-medium">
                            {errors.commuteMode.message}
                          </p>
                        )}
                      </div>

                      {/* Commute Distance */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                          One-Way Daily Travel (km)
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register('commuteDistance', { valueAsNumber: true })}
                          placeholder="e.g. 10"
                          className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                        />
                        {errors.commuteDistance && (
                          <p className="text-xs text-red-600 font-medium">
                            {errors.commuteDistance.message}
                          </p>
                        )}
                      </div>

                      {/* Electricity usage */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                          Monthly Power consumption (kWh)
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register('monthlyKwh', { valueAsNumber: true })}
                          placeholder="e.g. 150"
                          className="w-full px-4 py-2.5 text-sm bg-bg-base border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                        />
                        {errors.monthlyKwh && (
                          <p className="text-xs text-red-600 font-medium">
                            {errors.monthlyKwh.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lifestyle & Budget Tab */}
                {activeTab === 'lifestyle' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h4 className="text-base font-bold text-text-primary">
                        Lifestyle Habits & Reduction Budgets
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Control your dietary style and target reduction metrics.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Diet Type */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                          Diet Style
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
                          <p className="text-xs text-red-600 font-medium">
                            {errors.dietType.message}
                          </p>
                        )}
                      </div>

                      {/* Carbon Budget */}
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
                    </div>
                  </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h4 className="text-base font-bold text-text-primary">
                        Achievements & Badges
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Track your unlocked eco-badges and total point achievements.
                      </p>
                    </div>

                    {completedChallenges.length === 0 ? (
                      <div className="text-center py-12 border border-border-default border-dashed rounded-xl max-w-md mx-auto px-4 space-y-3">
                        <Icons.Award className="w-10 h-10 text-text-muted mx-auto animate-pulse" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-text-primary animate-pulse">
                            No Badges Yet
                          </p>
                          <p className="text-xs text-text-muted">
                            Pledge to active challenges in the challenges page to unlock badges
                            here.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {completedChallenges.map((challenge) => (
                          <div
                            key={challenge.id}
                            className="bg-bg-base border border-amber-500/20 rounded-xl p-4 flex items-center gap-3.5"
                          >
                            <div className="h-11 w-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                              <Icons.Award className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="space-y-0.5">
                              <h5 className="font-extrabold text-xs text-text-primary">
                                {challenge.title}
                              </h5>
                              <p className="text-[10px] text-text-muted font-medium">
                                Badge:{' '}
                                <strong className="text-amber-600 font-bold">
                                  {challenge.badgeName}
                                </strong>
                              </p>
                              <p className="text-[10px] text-text-muted">
                                Completed: {formatDate(challenge.completedAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Form Footer */}
              {activeTab !== 'achievements' && (
                <div className="p-4 bg-bg-base/40 border-t border-border-default flex items-center justify-between gap-3 shrink-0">
                  <div className="text-xs font-medium text-text-secondary">
                    {isDirty ? (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 animate-pulse">
                        <Icons.Info className="w-3.5 h-3.5" />
                        Unsaved changes pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Icons.ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        All changes synchronized
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2.5">
                    {isDirty && (
                      <button
                        type="button"
                        onClick={handleDiscard}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-border-default hover:bg-bg-elevated text-text-primary transition-all cursor-pointer"
                      >
                        Discard
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !isDirty}
                      className="px-5 py-2 text-xs font-bold rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Icons.Loader className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Icons.Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
