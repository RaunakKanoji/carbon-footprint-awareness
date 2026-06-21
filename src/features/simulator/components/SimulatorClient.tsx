'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Bike,
  Car,
  CheckCircle2,
  Leaf,
  Loader2,
  Package,
  Recycle,
  RotateCcw,
  ShoppingBag,
  Target,
  TreePine,
  Utensils,
  Zap,
} from 'lucide-react';

import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Skeleton } from '@/src/components/ui/skeleton';

interface SimulatorClientProps {
  initialLogs: {
    id: string;
    category: string;
    subType: string;
    quantity: number;
    unit: string;
    co2eKg: number;
    note: string | null;
    occurredAt: string;
  }[];
  profile: {
    city: string | null;
    state: string | null;
    country: string | null;
    householdSize: number | null;
    dietType: string | null;
    commuteMode: string | null;
    commuteDistanceKm: number | null;
    electricityUsageKwh: number | null;
  } | null;
  factors: {
    id: string;
    category: string;
    subType: string;
    unit: string;
    factor: number;
    region: string | null;
  }[];
}

function getProfileCommuteSubType(mode: string) {
  const normalized = mode.toUpperCase();

  if (normalized === 'BUS') return 'bus';
  if (normalized === 'METRO') return 'metro';
  if (normalized === 'TRAIN') return 'train';
  if (normalized === 'BICYCLE' || normalized === 'WALK' || normalized === 'WORK_FROM_HOME') {
    return 'bicycle';
  }

  return 'petrolCar';
}

function isZeroEmissionCommute(mode: string) {
  const normalized = mode.toUpperCase();

  return (
    normalized === 'REMOTE' ||
    normalized === 'WORK_FROM_HOME' ||
    normalized === 'WALK' ||
    normalized === 'WALKING' ||
    normalized === 'BICYCLE'
  );
}

function formatKg(value: number) {
  return `${value.toFixed(0)} kg`;
}

function StatCard({
  label,
  value,
  description,
  icon,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone: 'emerald' | 'blue' | 'amber' | 'indigo';
}) {
  const toneClassName = {
    blue: 'bg-blue-50/80 text-blue-600 ring-1 ring-blue-100/50',
    amber: 'bg-amber-50/80 text-amber-600 ring-1 ring-amber-100/50',
    indigo: 'bg-indigo-50/80 text-indigo-600 ring-1 ring-indigo-100/50',
    emerald: 'bg-emerald-50/80 text-emerald-600 ring-1 ring-emerald-100/50',
  }[tone];

  return (
    <Card className="rounded-3xl border border-border-default bg-bg-surface shadow-xs hover:shadow-sm hover:border-border-default/80 transition-all duration-200">
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
            {label}
          </p>

          <p className="text-2xl font-black tracking-tight text-text-primary">{value}</p>

          <p className="text-xs font-semibold leading-none text-text-secondary">
            {description}
          </p>
        </div>

        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneClassName}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function SliderControl({
  label,
  description,
  value,
  min = 0,
  max = 100,
  step = 1,
  valueLabel,
  disabled,
  onChange,
  isDefault,
}: {
  label: string;
  description: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  valueLabel: string;
  disabled?: boolean;
  onChange: (value: number) => void;
  isDefault: boolean;
}) {
  const badgeClasses = isDefault
    ? 'border-border-default/60 bg-bg-surface text-text-secondary'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold';

  return (
    <div className="flex flex-col gap-3.5 rounded-[20px] border border-slate-100/80 bg-slate-50/40 p-5 hover:bg-slate-50/80 hover:border-slate-200/80 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-black text-text-primary">{label}</p>
          <p className="text-xs leading-normal text-text-secondary">{description}</p>
        </div>

        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-colors duration-200 ${badgeClasses}`}>
          {valueLabel}
        </span>
      </div>

      <div className="flex items-center mt-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="premium-range-slider h-2 w-full cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  accent = 'emerald',
}: {
  icon: ReactNode;
  title: string;
  description: string;
  accent?: 'emerald' | 'blue' | 'amber' | 'indigo' | 'rose';
}) {
  const accentClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
    blue: 'bg-blue-50 text-blue-600 border border-blue-100/50',
    amber: 'bg-amber-50 text-amber-600 border border-amber-100/50',
    indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50',
    rose: 'bg-rose-50 text-rose-600 border border-rose-100/50',
  }[accent];

  return (
    <div className="flex items-start gap-4 border-b border-border-subtle px-6 py-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accentClasses}`}>
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-black tracking-tight text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function SimulatorClient({ initialLogs, profile, factors }: SimulatorClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  const [carReducePct, setCarReducePct] = useState(0);
  const [publicTransitPct, setPublicTransitPct] = useState(0);
  const [carpoolOccupancy, setCarpoolOccupancy] = useState(1);

  const [plantMealsPerWeek, setPlantMealsPerWeek] = useState(0);

  const [energyReducePct, setEnergyReducePct] = useState(0);
  const [solarPct, setSolarPct] = useState(0);

  const [shoppingReducePct, setShoppingReducePct] = useState(0);
  const [secondHandPct, setSecondHandPct] = useState(0);

  const [recyclePct, setRecyclePct] = useState(0);

  const [isCommitOpen, setIsCommitOpen] = useState(false);
  const [missionCreated, setMissionCreated] = useState(false);
  const [isCreatingMission, setIsCreatingMission] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const getFactorValue = useCallback(
    (category: string, subType: string, fallback: number) => {
      const match = factors.find((factor) => {
        return (
          factor.category.toUpperCase() === category.toUpperCase() &&
          factor.subType.toLowerCase() === subType.toLowerCase()
        );
      });

      return match ? match.factor : fallback;
    },
    [factors],
  );

  const baseline = useMemo(() => {
    const transportLogs = initialLogs.filter((log) => log.category.toUpperCase() === 'TRANSPORT');

    let transportBaseline = 0;
    let carDistance = 0;
    let transitDistance = 0;

    const applyProfileTransportFallback = () => {
      const mode = profile?.commuteMode || 'remote';
      const distanceKm = profile?.commuteDistanceKm || 0;
      const monthlyDistance = distanceKm * 2 * 22;

      if (monthlyDistance > 0 && !isZeroEmissionCommute(mode)) {
        const subType = getProfileCommuteSubType(mode);
        const factor = getFactorValue('TRANSPORT', subType, 0.192);

        transportBaseline = monthlyDistance * factor;

        const normalizedSubType = subType.toLowerCase();

        if (
          normalizedSubType === 'petrolcar' ||
          normalizedSubType === 'dieselcar' ||
          normalizedSubType === 'car' ||
          normalizedSubType === 'petrol_car' ||
          normalizedSubType === 'diesel_car'
        ) {
          carDistance = monthlyDistance;
        } else {
          transitDistance = monthlyDistance;
        }
      }
    };

    if (transportLogs.length > 0) {
      transportBaseline = transportLogs.reduce((sum, log) => sum + log.co2eKg, 0);

      transportLogs.forEach((log) => {
        const subType = log.subType.toLowerCase();

        if (
          subType === 'petrolcar' ||
          subType === 'dieselcar' ||
          subType === 'car' ||
          subType === 'petrol_car' ||
          subType === 'diesel_car'
        ) {
          carDistance += log.quantity;
        } else if (
          subType === 'bus' ||
          subType === 'metro' ||
          subType === 'train' ||
          subType === 'public-transit' ||
          subType === 'public_transit'
        ) {
          transitDistance += log.quantity;
        }
      });

      if (transportBaseline === 0) {
        applyProfileTransportFallback();
      }
    } else {
      applyProfileTransportFallback();
    }

    const foodLogs = initialLogs.filter((log) => log.category.toUpperCase() === 'FOOD');

    let foodBaseline = 0;
    let beefMeals = 0;
    let chickenMeals = 0;
    let vegetarianMeals = 0;
    let veganMeals = 0;

    if (foodLogs.length > 0) {
      foodBaseline = foodLogs.reduce((sum, log) => sum + log.co2eKg, 0);

      foodLogs.forEach((log) => {
        const subType = log.subType.toLowerCase();

        if (subType.includes('beef')) {
          beefMeals += log.quantity;
        } else if (subType.includes('chicken') || subType.includes('fish')) {
          chickenMeals += log.quantity;
        } else if (subType.includes('vegetarian')) {
          vegetarianMeals += log.quantity;
        } else if (subType.includes('vegan')) {
          veganMeals += log.quantity;
        }
      });
    } else {
      const diet = profile?.dietType || 'OMNIVORE';
      const normalizedDiet = diet.toUpperCase();

      if (normalizedDiet === 'VEGAN') {
        veganMeals = 90;
      } else if (normalizedDiet === 'VEGETARIAN') {
        vegetarianMeals = 90;
      } else if (normalizedDiet === 'PESCATARIAN') {
        vegetarianMeals = 45;
        veganMeals = 45;
      } else if (normalizedDiet === 'OMNIVORE' || normalizedDiet === 'OTHER') {
        beefMeals = 15;
        chickenMeals = 30;
        vegetarianMeals = 30;
        veganMeals = 15;
      } else {
        beefMeals = 5;
        chickenMeals = 25;
        vegetarianMeals = 40;
        veganMeals = 20;
      }

      foodBaseline =
        beefMeals * getFactorValue('FOOD', 'beefMeal', 7.0) +
        chickenMeals * getFactorValue('FOOD', 'chickenMeal', 2.5) +
        vegetarianMeals * getFactorValue('FOOD', 'vegetarianMeal', 1.2) +
        veganMeals * getFactorValue('FOOD', 'veganMeal', 0.7);
    }

    const energyLogs = initialLogs.filter((log) => log.category.toUpperCase() === 'ENERGY');

    let energyBaseline = 0;
    let electricityKwh = 0;

    if (energyLogs.length > 0) {
      energyBaseline = energyLogs.reduce((sum, log) => sum + log.co2eKg, 0);
      electricityKwh = energyLogs.reduce((sum, log) => sum + log.quantity, 0);
    } else {
      electricityKwh = profile?.electricityUsageKwh || 250;
      energyBaseline = electricityKwh * getFactorValue('ENERGY', 'indiaGrid', 0.71);
    }

    const shoppingLogs = initialLogs.filter((log) => log.category.toUpperCase() === 'SHOPPING');

    const shoppingBaseline =
      shoppingLogs.length > 0
        ? shoppingLogs.reduce((sum, log) => sum + log.co2eKg, 0)
        : 25;

    const wasteLogs = initialLogs.filter((log) => log.category.toUpperCase() === 'WASTE');

    const wasteBaseline =
      wasteLogs.length > 0 ? wasteLogs.reduce((sum, log) => sum + log.co2eKg, 0) : 12;

    return {
      transport: {
        baseline: transportBaseline,
        carDistance,
        transitDistance,
      },
      food: {
        baseline: foodBaseline,
        beefMeals,
        chickenMeals,
        vegetarianMeals,
        veganMeals,
      },
      energy: {
        baseline: energyBaseline,
        electricityKwh,
      },
      shopping: {
        baseline: shoppingBaseline,
      },
      waste: {
        baseline: wasteBaseline,
      },
      total: transportBaseline + foodBaseline + energyBaseline + shoppingBaseline + wasteBaseline,
    };
  }, [initialLogs, profile, getFactorValue]);

  const simulated = useMemo(() => {
    const carFactor = getFactorValue('TRANSPORT', 'petrolCar', 0.192);
    const busFactor = getFactorValue('TRANSPORT', 'bus', 0.105);

    const carEmissionsFromDistance = baseline.transport.carDistance * carFactor;
    const transitEmissionsFromDistance = baseline.transport.transitDistance * busFactor;

    const modeledTransportEmissions = carEmissionsFromDistance + transitEmissionsFromDistance;

    const unmodeledTransportEmissions = Math.max(
      0,
      baseline.transport.baseline - modeledTransportEmissions,
    );

    const drivingBaseline = carEmissionsFromDistance;

    const originalTransitEmissions = transitEmissionsFromDistance;
    const reducedDrivingEmissions = drivingBaseline * (carReducePct / 100);

    const shiftedTransitEmissions =
      carFactor > 0
        ? reducedDrivingEmissions * (publicTransitPct / 100) * (busFactor / carFactor)
        : 0;

    const remainingDrivingEmissions =
      (drivingBaseline - reducedDrivingEmissions) / carpoolOccupancy;

    const transport =
      unmodeledTransportEmissions +
      originalTransitEmissions +
      remainingDrivingEmissions +
      shiftedTransitEmissions;

    const beefFactor = getFactorValue('FOOD', 'beefMeal', 7.0);
    const chickenFactor = getFactorValue('FOOD', 'chickenMeal', 2.5);
    const vegFactor = getFactorValue('FOOD', 'vegetarianMeal', 1.2);
    const veganFactor = getFactorValue('FOOD', 'veganMeal', 0.7);

    const monthlyReplacedMeals = plantMealsPerWeek * 4.33;
    const animalMeals = baseline.food.beefMeals + baseline.food.chickenMeals;

    let food = baseline.food.baseline;

    if (animalMeals > 0) {
      let remainingBeef = baseline.food.beefMeals;
      let remainingChicken = baseline.food.chickenMeals;
      let addedVegan = 0;
      let mealsToReplace = monthlyReplacedMeals;

      const beefReplaced = Math.min(mealsToReplace, remainingBeef);
      remainingBeef -= beefReplaced;
      addedVegan += beefReplaced;
      mealsToReplace -= beefReplaced;

      const chickenReplaced = Math.min(mealsToReplace, remainingChicken);
      remainingChicken -= chickenReplaced;
      addedVegan += chickenReplaced;

      const modeledFood =
        remainingBeef * beefFactor +
        remainingChicken * chickenFactor +
        baseline.food.vegetarianMeals * vegFactor +
        (baseline.food.veganMeals + addedVegan) * veganFactor;

      const originalModeledFood =
        baseline.food.beefMeals * beefFactor +
        baseline.food.chickenMeals * chickenFactor +
        baseline.food.vegetarianMeals * vegFactor +
        baseline.food.veganMeals * veganFactor;

      food = Math.max(0, baseline.food.baseline - Math.max(0, originalModeledFood - modeledFood));
    } else {
      const plantSwapIntensity = Math.min(plantMealsPerWeek / 21, 1);
      food = baseline.food.baseline * (1 - plantSwapIntensity * 0.5);
    }

    const remainingKwh = baseline.energy.electricityKwh * (1 - energyReducePct / 100);
    const gridKwh = remainingKwh * (1 - solarPct / 100);
    const energy = gridKwh * getFactorValue('ENERGY', 'indiaGrid', 0.71);

    const remainingShopping = baseline.shopping.baseline * (1 - shoppingReducePct / 100);
    const shopping = remainingShopping * (1 - (secondHandPct / 100) * 0.8);

    const waste = baseline.waste.baseline * (1 - (recyclePct / 100) * 0.8);

    return {
      transport,
      food,
      energy,
      shopping,
      waste,
      total: transport + food + energy + shopping + waste,
    };
  }, [
    baseline,
    carReducePct,
    publicTransitPct,
    carpoolOccupancy,
    plantMealsPerWeek,
    energyReducePct,
    solarPct,
    shoppingReducePct,
    secondHandPct,
    recyclePct,
    getFactorValue,
  ]);

  const savings = {
    transport: Math.max(0, baseline.transport.baseline - simulated.transport),
    food: Math.max(0, baseline.food.baseline - simulated.food),
    energy: Math.max(0, baseline.energy.baseline - simulated.energy),
    shopping: Math.max(0, baseline.shopping.baseline - simulated.shopping),
    waste: Math.max(0, baseline.waste.baseline - simulated.waste),
  };

  const savingsTotal = Math.max(0, baseline.total - simulated.total);
  const pctReduction = baseline.total > 0 ? (savingsTotal / baseline.total) * 100 : 0;

  const chartData = [
    {
      name: 'Transport',
      Current: Number(baseline.transport.baseline.toFixed(1)),
      Simulated: Number(simulated.transport.toFixed(1)),
    },
    {
      name: 'Food',
      Current: Number(baseline.food.baseline.toFixed(1)),
      Simulated: Number(simulated.food.toFixed(1)),
    },
    {
      name: 'Energy',
      Current: Number(baseline.energy.baseline.toFixed(1)),
      Simulated: Number(simulated.energy.toFixed(1)),
    },
    {
      name: 'Shopping',
      Current: Number(baseline.shopping.baseline.toFixed(1)),
      Simulated: Number(simulated.shopping.toFixed(1)),
    },
    {
      name: 'Waste',
      Current: Number(baseline.waste.baseline.toFixed(1)),
      Simulated: Number(simulated.waste.toFixed(1)),
    },
  ];

  const equivalentTrees = savingsTotal / 1.8;
  const equivalentKm = savingsTotal / 0.192;
  const equivalentBottles = savingsTotal / 0.08;

  function resetParameters() {
    setCarReducePct(0);
    setPublicTransitPct(0);
    setCarpoolOccupancy(1);
    setPlantMealsPerWeek(0);
    setEnergyReducePct(0);
    setSolarPct(0);
    setShoppingReducePct(0);
    setSecondHandPct(0);
    setRecyclePct(0);
    setMissionCreated(false);
  }

  async function createMissionFromSimulation() {
    setIsCreatingMission(true);

    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Lifestyle Simulator Mission',
          description: `Apply simulated lifestyle changes and reduce approximately ${savingsTotal.toFixed(
            1,
          )} kg CO₂e per month.`,
          targetCo2eKg: Math.max(0.1, savingsTotal),
        }),
      });

      if (response.ok) {
        setMissionCreated(true);
      }
    } finally {
      setIsCreatingMission(false);
    }
  }

  if (!isMounted) {
    return (
      <div className="space-y-6">
        {/* Skeleton Top Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-3xl border border-border-default/60 bg-bg-surface p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-8 w-1/2 animate-pulse" />
                  <Skeleton className="h-3 w-3/4 animate-pulse" />
                </div>
                <Skeleton className="h-11 w-11 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton main layout */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-3xl border border-border-default/60 bg-bg-surface p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-5">
            <Skeleton className="h-[200px] rounded-3xl" />
            <Skeleton className="h-[250px] rounded-3xl" />
            <Skeleton className="h-[155px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style>{`
        /* Custom range slider styling */
        .premium-range-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          background: transparent;
        }
        .premium-range-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 9999px;
        }
        .premium-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 9999px;
          background: #10b981;
          cursor: pointer;
          margin-top: -5px;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.15s ease-in-out;
        }
        .premium-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          background: #059669;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        .premium-range-slider:disabled::-webkit-slider-runnable-track {
          background: #f8fafc;
          opacity: 0.6;
        }
        .premium-range-slider:disabled::-webkit-slider-thumb {
          background: #cbd5e1;
          cursor: not-allowed;
          border-color: #f1f5f9;
        }
        .premium-range-slider::-moz-range-track {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 9999px;
        }
        .premium-range-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 9999px;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.15s ease-in-out;
        }
        .premium-range-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          background: #059669;
        }
      `}</style>

      {/* Unified Stats Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current"
          value={formatKg(baseline.total)}
          description="Estimated monthly baseline"
          icon={<Target className="h-6 w-6" />}
          tone="indigo"
        />

        <StatCard
          label="Simulated"
          value={formatKg(simulated.total)}
          description="After selected changes"
          icon={<Leaf className="h-6 w-6" />}
          tone="emerald"
        />

        <StatCard
          label="Savings"
          value={formatKg(savingsTotal)}
          description="Potential monthly reduction"
          icon={<TreePine className="h-6 w-6" />}
          tone="emerald"
        />

        <StatCard
          label="Reduction"
          value={`${pctReduction.toFixed(1)}%`}
          description="Compared to baseline"
          icon={<CheckCircle2 className="h-6 w-6" />}
          tone="amber"
        />
      </section>

      {/* Main Dashboard Layout */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        {/* Sliders Form Column */}
        <section className="space-y-6">
          {/* Transport Category */}
          <Card className="overflow-hidden rounded-3xl border border-border-default/60 bg-bg-surface shadow-xs hover:shadow-sm hover:border-border-default/80 transition-all duration-200">
            <SectionHeader
              icon={<Car className="h-5.5 w-5.5" />}
              title="Transport"
              description="Model reduced car travel, public transit switching, and carpooling."
              accent="blue"
            />

            <CardContent className="grid gap-4 p-6 md:grid-cols-3">
              <SliderControl
                label="Reduce car travel"
                description="Avoid or shorten car trips."
                value={carReducePct}
                valueLabel={`${carReducePct}%`}
                onChange={setCarReducePct}
                isDefault={carReducePct === 0}
              />

              <SliderControl
                label="Shift to public transit"
                description="Move reduced car travel to bus or metro."
                value={publicTransitPct}
                valueLabel={`${publicTransitPct}%`}
                disabled={carReducePct === 0}
                onChange={setPublicTransitPct}
                isDefault={publicTransitPct === 0}
              />

              <SliderControl
                label="Carpool occupancy"
                description="Split remaining car emissions."
                value={carpoolOccupancy}
                min={1}
                max={5}
                valueLabel={`${carpoolOccupancy} people`}
                onChange={setCarpoolOccupancy}
                isDefault={carpoolOccupancy === 1}
              />
            </CardContent>
          </Card>

          {/* Food Category */}
          <Card className="overflow-hidden rounded-3xl border border-border-default/60 bg-bg-surface shadow-xs hover:shadow-sm hover:border-border-default/80 transition-all duration-200">
            <SectionHeader
              icon={<Utensils className="h-5.5 w-5.5" />}
              title="Food"
              description="Estimate the impact of replacing meat-heavy meals with plant-based meals."
              accent="emerald"
            />

            <CardContent className="p-6">
              <SliderControl
                label="Plant-based meals per week"
                description="Replace beef, chicken, or fish meals with lower-impact alternatives."
                value={plantMealsPerWeek}
                min={0}
                max={21}
                valueLabel={`${plantMealsPerWeek}/week`}
                onChange={setPlantMealsPerWeek}
                isDefault={plantMealsPerWeek === 0}
              />
            </CardContent>
          </Card>

          {/* Energy Category */}
          <Card className="overflow-hidden rounded-3xl border border-border-default/60 bg-bg-surface shadow-xs hover:shadow-sm hover:border-border-default/80 transition-all duration-200">
            <SectionHeader
              icon={<Zap className="h-5.5 w-5.5" />}
              title="Energy"
              description="Test electricity conservation and a cleaner electricity mix."
              accent="amber"
            />

            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <SliderControl
                label="Reduce electricity use"
                description="Lower cooling, lighting, appliance, and standby power use."
                value={energyReducePct}
                valueLabel={`${energyReducePct}%`}
                onChange={setEnergyReducePct}
                isDefault={energyReducePct === 0}
              />

              <SliderControl
                label="Solar or clean power"
                description="Shift remaining electricity away from grid emissions."
                value={solarPct}
                valueLabel={`${solarPct}%`}
                onChange={setSolarPct}
                isDefault={solarPct === 0}
              />
            </CardContent>
          </Card>

          {/* Shopping Category */}
          <Card className="overflow-hidden rounded-3xl border border-border-default/60 bg-bg-surface shadow-xs hover:shadow-sm hover:border-border-default/80 transition-all duration-200">
            <SectionHeader
              icon={<ShoppingBag className="h-5.5 w-5.5" />}
              title="Shopping"
              description="Compare lower purchase volume with second-hand choices."
              accent="indigo"
            />

            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <SliderControl
                label="Buy fewer new products"
                description="Reduce new clothing, electronics, and household purchases."
                value={shoppingReducePct}
                valueLabel={`${shoppingReducePct}%`}
                onChange={setShoppingReducePct}
                isDefault={shoppingReducePct === 0}
              />

              <SliderControl
                label="Choose second-hand"
                description="Use pre-owned options for remaining purchases."
                value={secondHandPct}
                valueLabel={`${secondHandPct}%`}
                disabled={shoppingReducePct === 100}
                onChange={setSecondHandPct}
                isDefault={secondHandPct === 0}
              />
            </CardContent>
          </Card>

          {/* Waste Category */}
          <Card className="overflow-hidden rounded-3xl border border-border-default/60 bg-bg-surface shadow-xs hover:shadow-sm hover:border-border-default/80 transition-all duration-200">
            <SectionHeader
              icon={<Recycle className="h-5.5 w-5.5" />}
              title="Waste"
              description="Estimate recycling and composting improvements."
              accent="rose"
            />

            <CardContent className="p-6">
              <SliderControl
                label="Recycling and composting rate"
                description="Divert landfill waste into recycling or composting."
                value={recyclePct}
                valueLabel={`${recyclePct}%`}
                onChange={setRecyclePct}
                isDefault={recyclePct === 0}
              />
            </CardContent>
          </Card>
        </section>

        {/* Sidebar Summary Column */}
        <aside className="space-y-6 xl:sticky xl:top-[32px] xl:self-start">
          {/* Main Simulated Results Glass Card */}
          <Card className="group relative overflow-hidden rounded-3xl border-emerald-200 bg-emerald-600 text-white shadow-sm">
            <CardContent className="relative p-6">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:scale-110 transition-transform duration-500" />

              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-50/80">
                Simulated result
              </p>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-black tracking-tight leading-none">
                    -{pctReduction.toFixed(1)}%
                  </p>
                  <p className="mt-3 text-sm font-medium text-emerald-50/90 leading-relaxed">
                    <strong>{formatKg(savingsTotal)}</strong> CO₂e saved per month
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shadow-inner transition-transform duration-300 group-hover:scale-105">
                  <Leaf className="h-7 w-7 text-white" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-sm">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-50/70">
                    Current
                  </p>
                  <p className="mt-1.5 text-lg font-black leading-none">{baseline.total.toFixed(0)} kg</p>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-50/70">
                    New estimate
                  </p>
                  <p className="mt-1.5 text-lg font-black leading-none text-emerald-200">
                    {simulated.total.toFixed(0)} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recharts Bar Comparison Chart */}
          <Card className="overflow-hidden rounded-3xl border border-border-default/60 bg-bg-surface shadow-xs hover:shadow-sm hover:border-border-default/80 transition-all duration-200">
            <SectionHeader
              icon={<Bike className="h-5 w-5 text-text-secondary" />}
              title="Category comparison"
              description="Current baseline vs simulated result."
            />

            <CardContent className="h-[210px] p-6 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  barCategoryGap="22%"
                  margin={{
                    top: 8,
                    right: 8,
                    left: -10,
                    bottom: 8,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value) => `${Number(value).toFixed(1)} kg`}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="Current" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={8} />
                  <Bar dataKey="Simulated" fill="#10b981" radius={[0, 4, 4, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Equivalents */}
          <Card className="rounded-3xl border border-border-default/60 bg-bg-surface shadow-xs hover:shadow-sm hover:border-border-default/80 transition-all duration-200">
            <CardContent className="p-6">
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                Monthly equivalent
              </h3>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border-subtle bg-slate-50/50 p-3 text-center flex flex-col items-center justify-between min-h-[110px] hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                    <TreePine className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-text-primary mt-2 leading-none">
                      {equivalentTrees.toFixed(1)}
                    </p>
                    <p className="mt-1.5 text-[9px] font-bold text-text-secondary uppercase tracking-wider">trees</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-slate-50/50 p-3 text-center flex flex-col items-center justify-between min-h-[110px] hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-text-primary mt-2 leading-none">
                      {equivalentKm.toFixed(0)}
                    </p>
                    <p className="mt-1.5 text-[9px] font-bold text-text-secondary uppercase tracking-wider">km avoided</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-slate-50/50 p-3 text-center flex flex-col items-center justify-between min-h-[110px] hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-100">
                    <Recycle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-text-primary mt-2 leading-none">
                      {equivalentBottles.toFixed(0)}
                    </p>
                    <p className="mt-1.5 text-[9px] font-bold text-text-secondary uppercase tracking-wider">bottles</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl text-sm font-black border-border-default/80 hover:bg-slate-50 transition-all duration-200 active:scale-[0.98]"
              onClick={resetParameters}
            >
              <RotateCcw className="mr-2 h-4 w-4 text-text-secondary" />
              Reset
            </Button>

            <Button
              type="button"
              className="h-11 flex-1 rounded-xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
              disabled={savingsTotal === 0}
              onClick={() => setIsCommitOpen(true)}
            >
              <Leaf className="mr-2 h-4 w-4" />
              Commit
            </Button>
          </div>
        </aside>
      </div>

      {/* Commit Dialog */}
      <Dialog open={isCommitOpen} onOpenChange={setIsCommitOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-emerald-200 bg-bg-surface p-0 shadow-xl sm:max-w-lg">
          <div className="bg-gradient-to-br from-emerald-50/50 via-bg-surface to-bg-surface px-7 pb-6 pt-7">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-black text-text-primary">
                <Leaf className="h-5 w-5 text-emerald-600" />
                Turn simulation into action
              </DialogTitle>

              <DialogDescription className="pt-2 text-sm leading-6 text-text-secondary">
                You simulated a{' '}
                <span className="font-black text-text-primary">
                  {pctReduction.toFixed(1)}% monthly reduction
                </span>
                , lowering your estimate from{' '}
                <span className="font-black text-text-primary">{baseline.total.toFixed(0)} kg</span>{' '}
                to{' '}
                <span className="font-black text-text-primary">
                  {simulated.total.toFixed(0)} kg CO₂e
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-3.5 rounded-2xl border border-emerald-100 bg-white/70 p-5">
              <p className="text-sm font-black text-text-primary">Reduction summary</p>

              <div className="space-y-3 mt-3">
                {savings.transport > 0 && (
                  <div className="flex items-center justify-between border-b border-emerald-100/50 pb-2.5 last:border-0 last:pb-0">
                    <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
                      <Car className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                      Transport
                    </span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100 text-xs">
                      -{formatKg(savings.transport)}
                    </span>
                  </div>
                )}

                {savings.food > 0 && (
                  <div className="flex items-center justify-between border-b border-emerald-100/50 pb-2.5 last:border-0 last:pb-0">
                    <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
                      <Utensils className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                      Food
                    </span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100 text-xs">
                      -{formatKg(savings.food)}
                    </span>
                  </div>
                )}

                {savings.energy > 0 && (
                  <div className="flex items-center justify-between border-b border-emerald-100/50 pb-2.5 last:border-0 last:pb-0">
                    <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
                      <Zap className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                      Energy
                    </span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100 text-xs">
                      -{formatKg(savings.energy)}
                    </span>
                  </div>
                )}

                {savings.shopping + savings.waste > 0 && (
                  <div className="flex items-center justify-between border-b border-emerald-100/50 pb-2.5 last:border-0 last:pb-0">
                    <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
                      <Package className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                      Shopping & Waste
                    </span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100 text-xs">
                      -{formatKg(savings.shopping + savings.waste)}
                    </span>
                  </div>
                )}
              </div>

              <p className="mt-3 border-t border-emerald-100 pt-3 text-xs font-semibold leading-relaxed text-emerald-700">
                This simulation can be converted into a checklist mission to help you track your progress in real life.
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-border-subtle bg-bg-surface px-7 py-5">
            <Button
              type="button"
              variant="outline"
              disabled={missionCreated || isCreatingMission}
              onClick={createMissionFromSimulation}
              className="h-10 rounded-xl"
            >
              {isCreatingMission ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {missionCreated ? 'Mission created' : 'Create mission'}
            </Button>

            <Button type="button" onClick={() => setIsCommitOpen(false)} className="h-10 rounded-xl">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
