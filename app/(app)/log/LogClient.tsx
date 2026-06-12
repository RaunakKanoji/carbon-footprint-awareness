'use client';

import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';

import { ActivityCategory } from '@/src/lib/activity-types';
import {
  EnergyForm,
  FoodForm,
  ShoppingForm,
  TransportForm,
  WasteForm,
} from './CategoryForms';
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
  const [activeCategory, setActiveCategory] = useState<ActivityCategory>(ActivityCategory.Transport);
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

  const handleLoggedSuccess = (co2eKg: number, subTypeLabel: string) => {
    setSuccessInfo({
      message: `Successfully recorded activity! Estimated ${subTypeLabel} emissions logged.`,
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
    setErrorInfo(err instanceof Error ? err.message : 'An error occurred while logging activity.');
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left Columns: Forms & Category Selectors */}
      <div className="lg:col-span-2 space-y-6">
        {/* Category selector grid */}
        <div className="bg-bg-surface border border-border-default/60 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3.5">
            Select Category to Log
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setLiveEstimate(0);
                    setErrorInfo(null);
                  }}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer select-none group ${
                    isActive
                      ? cat.activeColor + ' font-bold scale-[1.02] border-2 shadow-sm'
                      : 'border-border-default bg-bg-base/40 text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-1.5 transition-transform group-hover:scale-110 ${
                      isActive ? '' : 'text-text-muted'
                    }`}
                  />
                  <span className="text-[11px] tracking-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Category Form Wrapper */}
        <div className="bg-bg-surface border border-border-default/60 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          {/* Decorative side tab background blur */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none" />

          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-4 mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                    categories.find((c) => c.id === activeCategory)?.badgeColor || ''
                  }`}
                >
                  {categories.find((c) => c.id === activeCategory)?.label}
                </span>
              </div>
              <h2 className="text-sm font-bold text-text-primary mt-1.5">
                Record your {activeCategory.toLowerCase()} activities
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {categories.find((c) => c.id === activeCategory)?.description}
              </p>
            </div>

            {/* Instant estimate display */}
            <div className="p-3.5 bg-bg-elevated/60 border border-border-subtle rounded-xl flex items-center gap-3 self-start sm:self-auto min-w-[150px]">
              <div className="w-8 h-8 rounded-full bg-accent-primary-dim flex items-center justify-center text-accent-primary shrink-0 animate-pulse">
                <Icons.Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                  Live Estimate
                </p>
                <p className="text-sm font-extrabold text-text-primary mt-0.5">
                  {liveEstimate.toFixed(1)}{' '}
                  <span className="text-[10px] font-normal text-text-secondary">kg CO₂e</span>
                </p>
              </div>
            </div>
          </div>

          {/* Alert status blocks */}
          {errorInfo && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300 rounded-xl flex items-start gap-3 text-xs font-semibold mb-6 animate-slide-in">
              <Icons.AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{errorInfo}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-start gap-3 text-xs font-semibold mb-6 animate-slide-in">
              <Icons.CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">{successInfo.message}</p>
                <p className="text-[11px] opacity-90 mt-1">
                  Estimated impact: **{successInfo.co2e.toFixed(1)} kg CO₂e** saved to your monthly
                  log history.
                </p>
              </div>
            </div>
          )}

          {/* Form rendering router */}
          <div>
            {activeCategory === ActivityCategory.Transport && (
              <TransportForm
                onSubmit={handleTransportSubmit}
                isSubmitting={isPending}
                onLiveEstimateChange={setLiveEstimate}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Food && (
              <FoodForm
                onSubmit={handleFoodSubmit}
                isSubmitting={isPending}
                onLiveEstimateChange={setLiveEstimate}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Energy && (
              <EnergyForm
                onSubmit={handleEnergySubmit}
                isSubmitting={isPending}
                onLiveEstimateChange={setLiveEstimate}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Shopping && (
              <ShoppingForm
                onSubmit={handleShoppingSubmit}
                isSubmitting={isPending}
                onLiveEstimateChange={setLiveEstimate}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Waste && (
              <WasteForm
                onSubmit={handleWasteSubmit}
                isSubmitting={isPending}
                onLiveEstimateChange={setLiveEstimate}
                todayStr={todayStr}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Encouraging Guidelines card */}
      <div className="space-y-6 lg:col-span-1">
        <div className="bg-bg-surface border border-border-default/60 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Icons.Leaf className="w-5 h-5" />
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-text-primary text-xs">Why log your daily footprint?</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Tracking is the first step towards reduction. By logging your transit miles, meals, shopping and energy logs:
            </p>
          </div>

          <ul className="space-y-3 pt-1">
            <li className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
              <Icons.ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold text-text-primary">Personalized Guidance</strong>: Enables your AI Compass Coach to give highly specific tips to target high emissions.
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
              <Icons.CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold text-text-primary">Realtime Budget Meters</strong>: Dashboard remaining bars react immediately to guide your choices.
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
              <Icons.TrendingDown className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold text-text-primary">Identify Low-Hanging Fruit</strong>: Highlights category trends to replace high footprint commutes or heavy meats.
              </span>
            </li>
          </ul>

          <div className="pt-2 border-t border-border-subtle">
            <div className="p-3 bg-bg-elevated/40 border border-border-subtle rounded-xl">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Coach Quick tip
              </p>
              <p className="text-xs text-text-primary font-medium mt-1 leading-relaxed">
                Swapping one long petrol car drive for metro or rail cuts transport emissions by up to <strong className="font-bold text-emerald-500">80%</strong>!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
