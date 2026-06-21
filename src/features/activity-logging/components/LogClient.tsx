'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Icons from 'lucide-react';

import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ActivityCategory } from '@/src/lib/activity-types';
import { formatDisplayLabel } from '@/src/lib/format-label';

import { logActivityAction } from '../actions';
import {
  EnergyFormInput,
  FoodFormInput,
  ShoppingFormInput,
  TransportFormInput,
  WasteFormInput,
} from '../schemas';
import { EnergyForm, FoodForm, ShoppingForm, TransportForm, WasteForm } from './CategoryForms';
import RecentActivityLogs, { type RecentActivityLogItem } from './RecentActivityLogs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';

interface LogClientProps {
  todayStr: string;
  recentActivities: RecentActivityLogItem[];
  initialCategory?: ActivityCategory;
}

type EstimateInput = {
  subType: string;
  quantity: number;
  passengers?: number;

  // Shopping-specific details
  shoppingCategory?: string;
  productType?: string;
  brand?: string | null;
  purchaseSource?: string;
  condition?: string;
  material?: string;
  price?: number;
  currency?: string;
  packaging?: string;
  expectedUsageDuration?: string;

  // Energy-specific details
  energyName?: string | null;
  energyCategory?: 'sustainable' | 'non-sustainable';
  energyType?: string;
  energySource?: string;
  usageType?: string;
  units?: number;
  unitType?: string;
  unitsKwh?: number;
  period?: string;
  place?: string;
  members?: number | null;
  generatorCapacity?: number | null;
  generatorCapacityUnit?: 'kW' | 'kVA' | null;
  runtimeHours?: number | null;
  loadPercentage?: number | null;
  fuelQuantity?: number | null;
  source?: string;

  // Waste specific fields
  wasteCategory?: 'biodegradable' | 'degradable';
  wasteType?: string;
  wasteSource?: string;
  disposalMethod?: string;
  unit?: string;
  segregationStatus?: string;
  materialType?: string;
  wasteForm?: string;
};

type EstimateMeta = {
  sourceLabel: string;
  confidence: string;
  fallbackUsed: boolean;
  explanation: string;
};

type SuccessInfo = {
  message: string;
  co2e: number;
  sourceLabel: string;
};

type CategoryConfig = {
  id: ActivityCategory;
  label: string;
  shortLabel: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
  activeColor: string;
  iconColor: string;
  badgeColor: string;
};

export default function LogClient({
  todayStr,
  recentActivities,
  initialCategory = ActivityCategory.Food,
}: LogClientProps) {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<ActivityCategory>(initialCategory);
  const [liveEstimate, setLiveEstimate] = useState<number>(0);
  const [estimateInput, setEstimateInput] = useState<EstimateInput | null>(null);
  const [estimateMeta, setEstimateMeta] = useState<EstimateMeta | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submissionMode, setSubmissionMode] = useState<'save' | 'saveAndAddAnother'>('save');
  const [formKey, setFormKey] = useState<number>(0);

  const categories = useMemo<CategoryConfig[]>(
    () => [
      {
        id: ActivityCategory.Food,
        label: 'Food',
        shortLabel: 'Food',
        helper: 'Track meals, dietary choices, rice, milk, and packaged food.',
        icon: Icons.Utensils,
        activeColor: 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-emerald-100',
        iconColor: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      },
      {
        id: ActivityCategory.Transport,
        label: 'Trip',
        shortLabel: 'Trip',
        helper: 'Track car rides, bus trips, metro rides, train journeys, walking, and cycling.',
        icon: Icons.Car,
        activeColor: 'border-blue-500 bg-blue-50 text-blue-800 ring-blue-100',
        iconColor: 'bg-blue-50 text-blue-700 ring-blue-100',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-100',
      },
      {
        id: ActivityCategory.Energy,
        label: 'Energy',
        shortLabel: 'Energy',
        helper: 'Track grid electricity, solar usage, and household power consumption.',
        icon: Icons.Zap,
        activeColor: 'border-amber-500 bg-amber-50 text-amber-800 ring-amber-100',
        iconColor: 'bg-amber-50 text-amber-700 ring-amber-100',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-100',
      },
      {
        id: ActivityCategory.Shopping,
        label: 'Shopping',
        shortLabel: 'Shopping',
        helper: 'Track clothing, electronics, online orders, and household purchases.',
        icon: Icons.ShoppingBag,
        activeColor: 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-indigo-100',
        iconColor: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      },
      {
        id: ActivityCategory.Waste,
        label: 'Waste',
        shortLabel: 'Waste',
        helper: 'Track landfill trash, recycling, composting, plastic, paper, and food waste.',
        icon: Icons.Trash2,
        activeColor: 'border-red-500 bg-red-50 text-red-800 ring-red-100',
        iconColor: 'bg-red-50 text-red-700 ring-red-100',
        badgeColor: 'bg-red-50 text-red-700 border-red-100',
      },
    ],
    [],
  );

  const activeCategoryConfig =
    categories.find((category) => category.id === activeCategory) ?? categories[0]!;

  const ActiveIcon = activeCategoryConfig.icon;
  const isLogMessageVisible = Boolean(errorInfo || successInfo);

  const categoryRecentLogs = useMemo(() => {
    return recentActivities
      .filter((act) => act.category.toUpperCase() === activeCategory.toUpperCase())
      .slice(0, 3);
  }, [recentActivities, activeCategory]);

  const allCategoryRecentLogs = useMemo(() => {
    return recentActivities.filter(
      (act) => act.category.toUpperCase() === activeCategory.toUpperCase(),
    );
  }, [recentActivities, activeCategory]);

  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  const activeCategoryTip = useMemo(() => {
    switch (activeCategory) {
      case ActivityCategory.Food:
        return 'Try adding more seasonal vegetables to your meals. It can reduce emissions by up to 18%.';
      case ActivityCategory.Transport:
        return 'Combining errands into a single trip or carpooling twice a week can reduce your travel emissions by up to 25%.';
      case ActivityCategory.Energy:
        return 'Unplugging electronics when not in use can lower standby energy consumption by up to 10% annually.';
      case ActivityCategory.Shopping:
        return 'Choosing refurbished electronics and high-quality clothing can save up to 40% of manufacturing emissions.';
      case ActivityCategory.Waste:
        return 'Composting organic waste prevents landfill methane release, reducing your waste footprint by up to 30%.';
      default:
        return 'Small conscious changes in your daily activities accumulate to make a significant positive impact on the planet.';
    }
  }, [activeCategory]);

  const handleEstimateInputChange = useCallback((input: EstimateInput) => {
    setEstimateInput(input);

    if (input.quantity <= 0) {
      setEstimateMeta(null);
    }
  }, []);

  useEffect(() => {
    if (!estimateInput || estimateInput.quantity <= 0) {
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/activity/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: activeCategory.toUpperCase(),
            ...estimateInput,
          }),
          signal: controller.signal,
        });

        const payload = await response.json();

        if (!response.ok || !payload.estimate) return;

        setLiveEstimate(payload.estimate.co2eKg);
        setEstimateMeta({
          sourceLabel: payload.estimate.sourceLabel,
          confidence: payload.estimate.confidence,
          fallbackUsed: payload.estimate.fallbackUsed,
          explanation: payload.estimate.explanation,
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setEstimateMeta(null);
        }
      }
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [activeCategory, estimateInput]);

  const resetEstimateState = () => {
    setLiveEstimate(0);
    setEstimateInput(null);
    setEstimateMeta(null);
    setErrorInfo(null);
    setSuccessInfo(null);
  };

  const handleLoggedSuccess = (co2eKg: number, subTypeLabel: string, sourceLabel: string) => {
    const readableSubTypeLabel = formatDisplayLabel(subTypeLabel);

    setSuccessInfo({
      message: `Successfully recorded ${readableSubTypeLabel}.`,
      co2e: co2eKg,
      sourceLabel,
    });
    setErrorInfo(null);

    window.setTimeout(() => {
      setSuccessInfo(null);
    }, 8000);

    if (submissionMode === 'save') {
      router.push('/dashboard');
    } else {
      setFormKey((prev) => prev + 1);
      setLiveEstimate(0);
      setEstimateInput(null);
      setEstimateMeta(null);
    }

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
        handleLoggedSuccess(res.co2eKg, data.subType, res.sourceLabel);
      }
    } catch (err) {
      handleLoggedFailure(err);
    }
  };

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
        handleLoggedSuccess(res.co2eKg, data.subType, res.sourceLabel);
      }
    } catch (err) {
      handleLoggedFailure(err);
    }
  };

  const handleEnergySubmit = async (data: EnergyFormInput) => {
    try {
      const res = await logActivityAction({
        category: 'ENERGY',
        subType: data.subType || 'solar',
        quantity: data.kWh ?? 0,
        occurredAt: data.occurredAt,
        note: data.note || undefined,
        energyName: data.energyName,
        energyCategory: data.energyCategory,
        energyType: data.energyType,
        energySource: data.energySource,
        usageType: data.usageType,
        units: data.units,
        unitType: data.unitType,
        period: data.period,
        place: data.place,
        members: data.members,
        generatorCapacity: data.generatorCapacity,
        generatorCapacityUnit: data.generatorCapacityUnit,
        runtimeHours: data.runtimeHours,
        loadPercentage: data.loadPercentage,
        fuelQuantity: data.fuelQuantity,
        source: data.source,
      });

      if (res.success) {
        handleLoggedSuccess(res.co2eKg, data.subType || 'solar', res.sourceLabel);
      }
    } catch (err) {
      handleLoggedFailure(err);
    }
  };

  const handleShoppingSubmit = async (data: ShoppingFormInput) => {
    try {
      const res = await logActivityAction({
        category: 'SHOPPING',
        subType: data.productType,
        quantity: data.quantity,
        occurredAt: data.occurredAt,
        note: data.note || undefined,
        shoppingCategory: data.shoppingCategory,
        productType: data.productType,
        brand: data.brand,
        purchaseSource: data.purchaseSource,
        condition: data.condition,
        material: data.material,
        price: data.price,
        currency: 'INR',
        packaging: data.packaging,
        expectedUsageDuration: data.expectedUsageDuration,
        weight: data.weight,
      });

      if (res.success) {
        handleLoggedSuccess(res.co2eKg, data.productType, res.sourceLabel);
      }
    } catch (err) {
      handleLoggedFailure(err);
    }
  };

  const handleWasteSubmit = async (data: WasteFormInput) => {
    try {
      const BIODEGRADABLE_MAPPING: Record<string, string> = {
        'Food Scraps': 'food_scraps',
        'Fruit and Vegetable Peels': 'fruit_vegetable_peels',
        'Garden Waste': 'garden_waste',
        'Tea or Coffee Grounds': 'tea_coffee_grounds',
        'Compostable Food Waste': 'compostable_food_waste',
        'Organic Paper Waste': 'organic_paper_waste',
        'Other Organic Waste': 'other_organic_waste',
      };

      const DEGRADABLE_MAPPING: Record<string, string> = {
        Paper: 'paper',
        Cardboard: 'cardboard',
        Wood: 'wood',
        'Cotton or Natural Fiber': 'natural_fiber',
        'Compostable Packaging': 'compostable_packaging',
        Bioplastic: 'bioplastic',
        'Degradable Plastic': 'degradable_plastic',
        'Mixed Degradable Material': 'mixed_degradable_material',
        Other: 'other',
      };

      const subType =
        data.wasteCategory === 'biodegradable'
          ? data.wasteType
            ? BIODEGRADABLE_MAPPING[data.wasteType]
            : 'other_organic_waste'
          : data.materialType
            ? DEGRADABLE_MAPPING[data.materialType]
            : 'other';

      const res = await logActivityAction({
        category: 'WASTE',
        subType,
        quantity: data.quantity,
        occurredAt: data.occurredAt,
        note: data.note || undefined,
        wasteCategory: data.wasteCategory,
        wasteType: data.wasteType,
        wasteSource: data.wasteSource,
        disposalMethod: data.disposalMethod,
        unit: data.unit,
        segregationStatus: data.segregationStatus,
        materialType: data.materialType,
        wasteForm: data.wasteForm,
        condition: data.condition,
        members: data.members,
      });

      if (res.success) {
        handleLoggedSuccess(
          res.co2eKg,
          data.wasteCategory === 'biodegradable'
            ? (data.wasteType ?? 'Waste')
            : (data.materialType ?? 'Waste'),
          res.sourceLabel,
        );
      }
    } catch (err) {
      handleLoggedFailure(err);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-6">
      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        aria-label="Activity categories"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setActiveCategory(category.id);
                resetEstimateState();
              }}
              className={`group relative flex min-h-[138px] flex-col justify-between overflow-hidden rounded-3xl border bg-bg-surface p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 ${
                isActive
                  ? `${category.activeColor} border-2 ring-1`
                  : 'border-border-default text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] ring-1 ${
                    isActive ? 'bg-white/70 text-current ring-current/15' : category.iconColor
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {isActive && (
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black text-current ring-1 ring-current/10">
                    Active
                  </span>
                )}
              </div>

              <h2 className="mt-8 text-xl font-black tracking-tight text-text-primary">
                {category.shortLabel}
              </h2>
            </button>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex flex-col overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
          <div className="relative overflow-hidden border-b border-border-subtle p-5">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="relative">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${activeCategoryConfig.iconColor}`}
                  >
                    <ActiveIcon className="h-6 w-6" />
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] ${activeCategoryConfig.badgeColor}`}
                    >
                      {activeCategoryConfig.label}
                    </span>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-text-primary">
                      {activeCategory === ActivityCategory.Food
                        ? 'Record Food Activity'
                        : activeCategory === ActivityCategory.Transport
                          ? 'Record Trip Activity'
                          : activeCategory === ActivityCategory.Shopping
                            ? 'Record Shopping Activity'
                            : activeCategory === ActivityCategory.Energy
                              ? 'Record Energy Activity'
                              : activeCategory === ActivityCategory.Waste
                                ? 'Record Waste Activity'
                                : `Record your ${activeCategoryConfig.shortLabel.toLowerCase()} activity`}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLogMessageVisible && (
            <div className="px-5 pt-5">
              <div
                role={errorInfo ? 'alert' : 'status'}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${
                  errorInfo
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
              >
                {errorInfo ? (
                  <Icons.AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                ) : (
                  <Icons.CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                )}

                <div className="flex-1">
                  {errorInfo ? (
                    <p className="leading-relaxed">{errorInfo}</p>
                  ) : (
                    <>
                      <p className="font-black">{successInfo!.message}</p>

                      <p className="mt-1 text-xs leading-relaxed opacity-90">
                        Estimated impact:{' '}
                        <strong className="font-extrabold">
                          {successInfo!.co2e.toFixed(1)} kg CO₂e
                        </strong>{' '}
                        saved to your log history.
                      </p>

                      <p className="mt-1 text-xs leading-relaxed opacity-90">
                        Source: {successInfo!.sourceLabel}
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
                  className="shrink-0 rounded-full p-1 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
                  aria-label="Dismiss log message"
                >
                  <Icons.X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="p-5">
            {activeCategory === ActivityCategory.Food && (
              <FoodForm
                key={formKey}
                onSubmit={handleFoodSubmit}
                isSubmitting={isPending}
                hideActions={true}
                onLiveEstimateChange={setLiveEstimate}
                onEstimateInputChange={handleEstimateInputChange}
                todayStr={todayStr}
                recentActivities={recentActivities}
              />
            )}

            {activeCategory === ActivityCategory.Transport && (
              <TransportForm
                key={formKey}
                onSubmit={handleTransportSubmit}
                isSubmitting={isPending}
                hideActions={true}
                onLiveEstimateChange={setLiveEstimate}
                onEstimateInputChange={handleEstimateInputChange}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Shopping && (
              <ShoppingForm
                key={formKey}
                onSubmit={handleShoppingSubmit}
                isSubmitting={isPending}
                hideActions={true}
                onLiveEstimateChange={setLiveEstimate}
                onEstimateInputChange={handleEstimateInputChange}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Energy && (
              <EnergyForm
                key={formKey}
                onSubmit={handleEnergySubmit}
                isSubmitting={isPending}
                hideActions={true}
                onLiveEstimateChange={setLiveEstimate}
                onEstimateInputChange={handleEstimateInputChange}
                todayStr={todayStr}
              />
            )}

            {activeCategory === ActivityCategory.Waste && (
              <WasteForm
                key={formKey}
                onSubmit={handleWasteSubmit}
                isSubmitting={isPending}
                hideActions={true}
                onLiveEstimateChange={setLiveEstimate}
                onEstimateInputChange={handleEstimateInputChange}
                todayStr={todayStr}
              />
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4 h-full">
          {/* Section 1: Live Estimate Card */}
          <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-sm">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#10B981]/5 blur-2xl" />
            
            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#10B981]/8 text-[#10B981]">
                    {activeCategory === 'FOOD' ? (
                      <Icons.Utensils className="h-5 w-5" />
                    ) : activeCategory === 'TRANSPORT' ? (
                      <Icons.Route className="h-5 w-5" />
                    ) : activeCategory === 'ENERGY' ? (
                      <Icons.Flame className="h-5 w-5" />
                    ) : activeCategory === 'SHOPPING' ? (
                      <Icons.ShoppingBag className="h-5 w-5" />
                    ) : (
                      <Icons.Trash2 className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6B7280]">
                      LIVE ESTIMATE
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-[#111827]">
                      {liveEstimate > 0 ? liveEstimate.toFixed(2) : '0.00'}
                      <span className="ml-1 text-sm font-semibold text-[#6B7280]">
                        kg CO₂e
                      </span>
                    </p>
                    <p className="text-xs font-semibold text-[#6B7280] mt-0.5">
                      {activeCategory === 'FOOD'
                        ? 'Per plate'
                        : activeCategory === 'TRANSPORT'
                          ? 'Per trip'
                          : activeCategory === 'ENERGY'
                            ? 'Per unit'
                            : activeCategory === 'SHOPPING'
                              ? estimateInput?.subType === 'shipment'
                                ? 'Per shipment'
                                : 'Per item'
                              : 'Per activity'}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200 shrink-0">
                  {estimateMeta?.confidence
                    ? (estimateMeta.confidence.toLowerCase() === 'high' ? 'High Confidence' :
                       estimateMeta.confidence.toLowerCase() === 'low' ? 'Low Confidence' : 'Medium Confidence')
                    : 'Medium Confidence'}
                </span>
              </div>
            </div>
          </div>


          {/* Section 3: Impact Equivalent Card */}
          {liveEstimate > 0 && (
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-[#6B7280] mb-3">
                This is equivalent to
              </h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10B981]/8 text-[#10B981]">
                    <Icons.Car className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">
                      Driving {(liveEstimate / 0.28).toFixed(1)} km
                    </p>
                    <p className="text-xs text-[#6B7280]">in a petrol car</p>
                  </div>
                </div>

                <div className="text-center text-[10px] font-black uppercase tracking-wider text-[#6B7280] py-0.5">or</div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10B981]/8 text-[#10B981]">
                    <Icons.Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">
                      Charging your phone {Math.round(liveEstimate / 0.021)} times
                    </p>
                    <p className="text-xs text-[#6B7280]">from empty to full</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Data sources Card */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-[#6B7280]">
                Data sources
              </h3>
              <Icons.Info className="h-3.5 w-3.5 text-[#6B7280] cursor-pointer" />
            </div>

            <div className="flex flex-wrap gap-2">
              {activeCategory === 'FOOD' ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Icons.Leaf className="h-3 w-3" />
                    Agribalyse
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Icons.Globe className="h-3 w-3" />
                    Carbon Engine
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Icons.Barcode className="h-3 w-3" />
                    Open Food Facts
                  </span>
                </>
              ) : activeCategory === 'TRANSPORT' ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Icons.Route className="h-3 w-3" />
                    OpenRouteService
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Icons.Globe className="h-3 w-3" />
                    Carbon Engine
                  </span>
                </>
              ) : activeCategory === 'SHOPPING' ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Icons.Truck className="h-3 w-3" />
                    CarbonSutra
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Icons.Globe className="h-3 w-3" />
                    Carbon Engine
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Icons.Barcode className="h-3 w-3" />
                    Open Food Facts
                  </span>
                </>
              ) : activeCategory === 'ENERGY' ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Icons.Truck className="h-3 w-3" />
                    CarbonSutra
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                    <Icons.Globe className="h-3 w-3" />
                    Carbon Engine
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/8 px-2.5 py-1 text-xs font-semibold text-[#10B981]">
                  <Icons.Globe className="h-3 w-3" />
                  Carbon Engine
                </span>
              )}
            </div>
          </div>

          {/* Section 6: Recent Category Logs Card */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-sm flex flex-col gap-4 flex-grow flex-1 min-h-[250px]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-[#6B7280]">
                Recent {activeCategory === 'FOOD' ? 'Meals' : activeCategory === 'TRANSPORT' ? 'Trips' : 'Logs'}
              </h3>
              <button
                type="button"
                onClick={() => setIsViewAllOpen(true)}
                className="text-xs font-bold text-[#10B981] hover:underline"
              >
                View all
              </button>
            </div>

            {categoryRecentLogs.length === 0 ? (
              <p className="text-xs text-[#6B7280] italic">No recent logs for this category.</p>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
                {categoryRecentLogs.map((activity) => {
                  const occurredDate = new Date(activity.occurredAt);
                  let displayDate = 'Today';
                  const today = new Date();
                  const diffDays = Math.floor((today.getTime() - occurredDate.getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays === 1) displayDate = 'Yesterday';
                  else if (diffDays > 1) {
                    displayDate = occurredDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                  }

                  return (
                    <div key={activity.id} className="flex items-center justify-between gap-2 border-b border-[#F3F4F6] pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-[#6B7280]">
                          {activeCategory === 'FOOD' ? (
                            <Icons.Utensils className="h-4.5 w-4.5" />
                          ) : activeCategory === 'TRANSPORT' ? (
                            <Icons.Car className="h-4.5 w-4.5" />
                          ) : activeCategory === 'ENERGY' ? (
                            <Icons.Zap className="h-4.5 w-4.5" />
                          ) : activeCategory === 'SHOPPING' ? (
                            <Icons.ShoppingBag className="h-4.5 w-4.5" />
                          ) : (
                            <Icons.Trash2 className="h-4.5 w-4.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#111827] truncate">
                            {activity.subType ? activity.subType.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, (c) => c.toUpperCase()) : 'Activity'}
                          </p>
                          <p className="text-xs text-[#6B7280] truncate">
                            {displayDate} • {activity.quantity} {activity.unit || 'units'}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-[#10B981]">
                          {activity.co2eKg.toFixed(2)} kg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 7: AI Tip Card */}
          <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-[#EEF2F6]/60 p-5 shadow-sm flex gap-3 shrink-0">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-indigo-500/5 blur-xl" />
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Icons.Sparkles className="h-4 w-4" />
            </div>
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">
                AI Tip
              </p>
              <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[#4F46E5]">
                {activeCategoryTip}
              </p>
            </div>
          </div>

          {/* Section 5: Save Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              form="active-log-form"
              disabled={isPending}
              onClick={() => setSubmissionMode('save')}
              className="flex w-full h-11 items-center justify-center gap-2 rounded-2xl bg-[#10B981] hover:bg-[#059669] px-5 text-sm font-black text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
            >
              <Icons.Save className="h-4 w-4" />
              {isPending && submissionMode === 'save' ? 'Saving...' : 'Save Activity'}
            </button>
            
            <button
              type="submit"
              form="active-log-form"
              disabled={isPending}
              onClick={() => setSubmissionMode('saveAndAddAnother')}
              className="flex w-full h-11 items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F8FAFC] px-5 text-sm font-black text-[#111827] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
            >
              <Icons.Plus className="h-4 w-4" />
              {isPending && submissionMode === 'saveAndAddAnother' ? 'Saving...' : 'Save & Add Another'}
            </button>
          </div>
        </aside>
      </div>

      <RecentActivityLogs activities={recentActivities} />

      <Dialog open={isViewAllOpen} onOpenChange={setIsViewAllOpen}>
        <DialogContent className="max-h-[calc(100vh-4rem)] overflow-y-auto rounded-3xl border border-border-default bg-bg-surface p-6 shadow-xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-text-primary">
              All Recent {activeCategory === 'FOOD' ? 'Meals' : activeCategory === 'TRANSPORT' ? 'Trips' : 'Logs'}
            </DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              A complete list of your recently logged {activeCategory.toLowerCase()} activities.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 divide-y divide-border-subtle max-h-[60vh] overflow-y-auto pr-1">
            {allCategoryRecentLogs.length === 0 ? (
              <p className="text-sm text-text-secondary italic text-center py-6">No recent logs found.</p>
            ) : (
              allCategoryRecentLogs.map((activity) => {
                const occurredDate = new Date(activity.occurredAt);
                const displayDate = occurredDate.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={activity.id} className="flex items-center justify-between gap-3 py-3 border-b border-[#F3F4F6] last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-[#6B7280]">
                        {activeCategory === 'FOOD' ? (
                          <Icons.Utensils className="h-5 w-5" />
                        ) : activeCategory === 'TRANSPORT' ? (
                          <Icons.Car className="h-5 w-5" />
                        ) : activeCategory === 'ENERGY' ? (
                          <Icons.Zap className="h-5 w-5" />
                        ) : activeCategory === 'SHOPPING' ? (
                          <Icons.ShoppingBag className="h-5 w-5" />
                        ) : (
                          <Icons.Trash2 className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-text-primary truncate">
                          {activity.subType
                            ? activity.subType
                                .replace(/([A-Z])/g, ' $1')
                                .trim()
                                .replace(/^\w/, (c) => c.toUpperCase())
                            : 'Activity'}
                        </p>
                        <p className="text-xs text-text-secondary truncate mt-0.5">
                          {displayDate} · {activity.quantity} {activity.unit || 'units'}
                        </p>
                        {activity.note && (
                          <p className="text-[10px] text-text-muted italic truncate mt-0.5">
                            {activity.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-[#10B981]">
                        {activity.co2eKg.toFixed(2)} kg
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsViewAllOpen(false)}
              className="rounded-xl border border-border-default bg-bg-surface px-4 py-2 text-xs font-black text-text-primary shadow-xs hover:bg-bg-elevated"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GuideItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border-subtle bg-bg-elevated/50 p-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-sm font-black text-text-primary">{title}</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
