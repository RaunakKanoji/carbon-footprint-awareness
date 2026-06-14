'use client';

import * as Icons from 'lucide-react';

import React, { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { formatDisplayLabel } from '@/lib/format-label';
import { ActivityCategory } from '@/src/lib/activity-types';

import { EnergyForm, FoodForm, ShoppingForm, TransportForm, WasteForm } from './CategoryForms';
import { logActivityAction } from './actions';
import {
  EnergyFormInput,
  FoodFormInput,
  ShoppingFormInput,
  TransportFormInput,
  WasteFormInput,
} from './schemas';

interface LogClientProps {
  todayStr: string;
}

export default function LogClient({ todayStr }: LogClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<ActivityCategory>(
    ActivityCategory.Transport,
  );
  const [liveEstimate, setLiveEstimate] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  // Notification banners
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    co2e: number;
  } | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const categories = [
    {
      id: ActivityCategory.Transport,
      label: 'Transport',
      description: 'Commutes, road trips, rail transit',
      icon: Icons.Car,
      activeColor: 'text-blue-500 border-blue-500 bg-blue-500/5 dark:bg-blue-500/10',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    {
      id: ActivityCategory.Food,
      label: 'Food & Meals',
      description: 'Daily dietary consumption choices',
      icon: Icons.Utensils,
      activeColor: 'text-green-500 border-green-500 bg-green-500/5 dark:bg-green-500/10',
      badgeColor: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    {
      id: ActivityCategory.Energy,
      label: 'Home Energy',
      description: 'Grid power consumption and solar utility',
      icon: Icons.Zap,
      activeColor: 'text-yellow-500 border-yellow-500 bg-yellow-500/5 dark:bg-yellow-500/10',
      badgeColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    {
      id: ActivityCategory.Shopping,
      label: 'Shopping',
      description: 'Apparel, goods, devices, and footwear',
      icon: Icons.ShoppingBag,
      activeColor: 'text-purple-500 border-purple-500 bg-purple-500/5 dark:bg-purple-500/10',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    {
      id: ActivityCategory.Waste,
      label: 'Waste',
      description: 'Recyclables, composting, and trash',
      icon: Icons.Trash2,
      activeColor: 'text-red-500 border-red-500 bg-red-500/5 dark:bg-red-500/10',
      badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20',
    },
  ];
  const isLogMessageVisible = Boolean(errorInfo || successInfo);

  const handleLoggedSuccess = (co2eKg: number, subTypeLabel: string) => {
    const readableSubTypeLabel = formatDisplayLabel(subTypeLabel);
    setSuccessInfo({
      message: `Successfully recorded activity! Estimated ${readableSubTypeLabel} emissions logged.`,
      co2e: co2eKg,
    });
    setErrorInfo(null);

    // Auto clear success banner after 8s
    setTimeout(() => {
      setSuccessInfo(null);
    }, 8000);

    // Refresh state data in Next.js Server context
    startTransition(() => {
      router.refresh();
    });
  };

  const handleLoggedFailure = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : 'An error occurred while logging activity.';
    setErrorInfo(message);
    setSuccessInfo(null);
  };

  // 1. Transport Submission
  const handleTransportSubmit = async (data: TransportFormInput) => {
    try {
      const res = await logActivityAction({
        category: 'TRANSPORT',
        subType: data.subType,
        quantity: data.distanceKm,
        occurredAt: data.occurredAt,
        note: data.note,
        passengers: data.passengers,
      });
      if (res.success) {
        handleLoggedSuccess(res.co2eKg, data.subType);
      }
    } catch (err) {
      handleLoggedFailure(err);
    }
  };

  // 2. Food Submission
  const handleFoodSubmit = async (data: FoodFormInput) => {
    try {
      const res = await logActivityAction({
        category: 'FOOD',
        subType: data.subType,
        quantity: data.meals,
        occurredAt: data.occurredAt,
        note: data.note,
      });
      if (res.success) {
        handleLoggedSuccess(res.co2eKg, data.subType);
      }
    } catch (err) {
      handleLoggedFailure(err);
    }
  };

  // 3. Energy Submission
  const handleEnergySubmit = async (data: EnergyFormInput) => {
    try {
      const res = await logActivityAction({
        category: 'ENERGY',
        subType: data.subType,
        quantity: data.kWh,
        occurredAt: data.occurredAt,
        note: data.note,
      });
      if (res.success) {
        handleLoggedSuccess(res.co2eKg, data.subType);
      }
    } catch (err) {
      handleLoggedFailure(err);
    }
  };

  // 4. Shopping Submission
  const handleShoppingSubmit = async (data: ShoppingFormInput) => {
    try {
      const res = await logActivityAction({
        category: 'SHOPPING',
        subType: data.subType,
        quantity: data.quantity,
        occurredAt: data.occurredAt,
        note: data.note,
      });
      if (res.success) {
        handleLoggedSuccess(res.co2eKg, data.subType);
      }
    } catch (err) {
      handleLoggedFailure(err);
    }
  };

  // 5. Waste Submission
  const handleWasteSubmit = async (data: WasteFormInput) => {
    try {
      const res = await logActivityAction({
        category: 'WASTE',
        subType: data.subType,
        quantity: data.weight,
        occurredAt: data.occurredAt,
        note: data.note,
      });
      if (res.success) {
        handleLoggedSuccess(res.co2eKg, data.subType);
      }
    } catch (err) {
      handleLoggedFailure(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-visible">
      {/* Left Columns: Forms & Category Selectors */}
      <div className="lg:col-span-2 flex flex-col h-full min-h-0 overflow-visible space-y-4">
        {/* Category selector grid */}
        <div className="bg-bg-surface border border-border-default/60 rounded-2xl p-3 shadow-sm shrink-0">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Select Category to Log</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setLiveEstimate(0);
                    setErrorInfo(null);
                  }}
                  className={`group flex cursor-pointer select-none flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-[background-color,border-color,box-shadow,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 ${
                    isActive
                      ? cat.activeColor + ' font-bold scale-[1.01] border-2 shadow-sm'
                      : 'border-border-default bg-bg-base/40 text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70'
                  }`}
                >
                  <Icon
                    className={`w-4.5 h-4.5 mb-1 transition-transform group-hover:scale-105 ${
                      isActive ? '' : 'text-text-muted'
                    }`}
                  />
                  <span className="text-sm font-semibold tracking-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Category Form Wrapper */}
        <div className="bg-bg-surface border border-border-default/60 rounded-2xl p-4 shadow-sm relative overflow-hidden flex-1 flex flex-col min-h-0">
          {/* Decorative side tab background blur */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none" />

          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-3 mb-4 gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${
                    categories.find((c) => c.id === activeCategory)?.badgeColor || ''
                  }`}
                >
                  {categories.find((c) => c.id === activeCategory)?.label}
                </span>
              </div>
              <h2 className="text-sm md:text-base font-bold text-text-primary mt-1">
                Record your {activeCategory.toLowerCase()} activities
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                {categories.find((c) => c.id === activeCategory)?.description}
              </p>
            </div>

            {/* Instant estimate display */}
            <div className="p-2.5 bg-bg-elevated/60 border border-border-subtle rounded-xl flex items-center gap-2.5 self-start sm:self-auto min-w-[130px]">
              <div className="w-7 h-7 rounded-full bg-accent-primary-dim flex items-center justify-center text-accent-primary shrink-0 animate-pulse">
                <Icons.Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
                  Live Estimate
                </p>
                <p className="text-sm md:text-base font-extrabold text-text-primary mt-0.5">
                  {liveEstimate.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-text-secondary">kg CO₂e</span>
                </p>
              </div>
            </div>
          </div>

          {/* Status message stays inside the form card, above the input labels. */}
          {isLogMessageVisible && (
            <div
              role={errorInfo ? 'alert' : 'status'}
              className={`mb-3 flex shrink-0 animate-slide-in items-start gap-3 rounded-xl border p-4 text-sm font-semibold ${
                errorInfo
                  ? 'border-red-500/20 bg-red-500/10 text-red-800 dark:text-red-300'
                  : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {errorInfo ? (
                <Icons.AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              ) : (
                <Icons.CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              <div className="flex-1">
                {errorInfo ? (
                  <p className="leading-relaxed">{errorInfo}</p>
                ) : (
                  <>
                    <p className="font-bold">{successInfo!.message}</p>
                    <p className="mt-1 text-xs leading-relaxed opacity-90">
                      Estimated impact:{' '}
                      <strong className="font-extrabold">
                        {successInfo!.co2e.toFixed(1)} kg CO₂e
                      </strong>{' '}
                      saved to your monthly log history.
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorInfo(null);
                  setSuccessInfo(null);
                }}
                className="shrink-0 cursor-pointer rounded-full p-1 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
                aria-label="Dismiss log message"
              >
                <Icons.X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Form rendering router */}
          <div className="min-h-0 flex-1 overflow-visible p-1">
            {activeCategory === ActivityCategory.Transport && (
              <TransportForm
                onSubmit={handleTransportSubmit}
                isSubmitting={isPending}
                hideActions={isLogMessageVisible}
                onLiveEstimateChange={setLiveEstimate}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Food && (
              <FoodForm
                onSubmit={handleFoodSubmit}
                isSubmitting={isPending}
                hideActions={isLogMessageVisible}
                onLiveEstimateChange={setLiveEstimate}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Energy && (
              <EnergyForm
                onSubmit={handleEnergySubmit}
                isSubmitting={isPending}
                hideActions={isLogMessageVisible}
                onLiveEstimateChange={setLiveEstimate}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Shopping && (
              <ShoppingForm
                onSubmit={handleShoppingSubmit}
                isSubmitting={isPending}
                hideActions={isLogMessageVisible}
                onLiveEstimateChange={setLiveEstimate}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Waste && (
              <WasteForm
                onSubmit={handleWasteSubmit}
                isSubmitting={isPending}
                hideActions={isLogMessageVisible}
                onLiveEstimateChange={setLiveEstimate}
                todayStr={todayStr}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Encouraging Guidelines card */}
      <div className="space-y-4 lg:col-span-1 flex flex-col h-full min-h-0 overflow-visible">
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border-default/60 bg-bg-surface p-4 shadow-sm lg:flex-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="shrink-0 space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Icons.Leaf className="w-4 h-4" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary">
                Why log your daily footprint?
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Tracking is the first step towards reduction. By logging your transit miles, meals,
                shopping and energy logs:
              </p>
            </div>
          </div>

          <ul className="mt-3 space-y-2.5 pt-0.5">
            <li className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
              <Icons.ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold text-text-primary">Personalized Guidance</strong>:
                Enables your AI Compass Coach to give highly specific tips to target high emissions.
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
              <Icons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold text-text-primary">Realtime Budget Meters</strong>:
                Dashboard remaining bars react immediately to guide your choices.
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
              <Icons.TrendingDown className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold text-text-primary">Identify Low-Hanging Fruit</strong>:
                Highlights category trends to replace high footprint commutes or heavy meats.
              </span>
            </li>
          </ul>

          <div className="mt-auto border-t border-border-subtle pt-3 shrink-0">
            <div className="p-2.5 bg-bg-elevated/40 border border-border-subtle rounded-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Coach Quick tip
              </p>
              <p className="text-sm text-text-primary font-medium mt-0.5 leading-normal">
                Swapping one long petrol car drive for metro or rail cuts transport emissions by up
                to <strong className="font-bold text-emerald-500">80%</strong>!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
