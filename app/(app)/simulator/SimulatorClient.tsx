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

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/src/components/Icon';

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

const getProfileCommuteSubType = (mode: string): string => {
  const m = mode.toUpperCase();
  if (m === 'BUS') return 'bus';
  if (m === 'METRO') return 'metro';
  if (m === 'TRAIN') return 'train';
  if (m === 'BICYCLE' || m === 'WALK' || m === 'WORK_FROM_HOME') return 'bicycle';
  return 'petrolCar';
};

const isZeroEmissionCommute = (mode: string): boolean => {
  const m = mode.toUpperCase();
  return (
    m === 'REMOTE' || m === 'WORK_FROM_HOME' || m === 'WALK' || m === 'WALKING' || m === 'BICYCLE'
  );
};

export default function SimulatorClient({ initialLogs, profile, factors }: SimulatorClientProps) {
  // SSR Safeguard
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const handle = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  // Simulator Sliders State
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

  // Helper to get active emission factor values
  const getFactorValue = useCallback(
    (cat: string, sub: string, fallback: number): number => {
      const match = factors.find(
        (f) =>
          f.category.toUpperCase() === cat.toUpperCase() &&
          f.subType.toLowerCase() === sub.toLowerCase(),
      );
      return match ? match.factor : fallback;
    },
    [factors],
  );

  // 1. Calculate baselines for each category
  const baseline = useMemo(() => {
    // TRANSPORT
    const transportLogs = initialLogs.filter((l) => l.category.toUpperCase() === 'TRANSPORT');
    let transportBaseline = 0;
    let carDistance = 0;
    let transitDistance = 0;
    const applyProfileTransportFallback = () => {
      const mode = profile?.commuteMode || 'remote';
      const distanceKm = profile?.commuteDistanceKm || 0;
      const monthlyDistance = distanceKm * 2 * 22; // round-trip commute for 22 days

      if (monthlyDistance > 0 && !isZeroEmissionCommute(mode)) {
        const subType = getProfileCommuteSubType(mode);
        const factor = getFactorValue('TRANSPORT', subType, 0.192);
        transportBaseline = monthlyDistance * factor;
        if (subType === 'petrolCar' || subType === 'dieselCar') {
          carDistance = monthlyDistance;
        } else {
          transitDistance = monthlyDistance;
        }
      }
    };

    if (transportLogs.length > 0) {
      transportBaseline = transportLogs.reduce((sum, l) => sum + l.co2eKg, 0);
      transportLogs.forEach((l) => {
        const sub = l.subType.toLowerCase();
        if (
          sub === 'petrolcar' ||
          sub === 'dieselcar' ||
          sub === 'car' ||
          sub === 'petrol_car' ||
          sub === 'diesel_car'
        ) {
          carDistance += l.quantity;
        } else if (
          sub === 'bus' ||
          sub === 'metro' ||
          sub === 'train' ||
          sub === 'public-transit'
        ) {
          transitDistance += l.quantity;
        }
      });

      if (transportBaseline === 0) {
        applyProfileTransportFallback();
      }
    } else {
      // Fallback from profile data
      applyProfileTransportFallback();
    }

    // FOOD
    const foodLogs = initialLogs.filter((l) => l.category.toUpperCase() === 'FOOD');
    let foodBaseline = 0;
    let beefMeals = 0;
    let chickenMeals = 0;
    let vegetarianMeals = 0;
    let veganMeals = 0;

    if (foodLogs.length > 0) {
      foodBaseline = foodLogs.reduce((sum, l) => sum + l.co2eKg, 0);
      foodLogs.forEach((l) => {
        const sub = l.subType.toLowerCase();
        if (sub.includes('beef')) beefMeals += l.quantity;
        else if (sub.includes('chicken') || sub.includes('fish')) chickenMeals += l.quantity;
        else if (sub.includes('vegetarian')) vegetarianMeals += l.quantity;
        else if (sub.includes('vegan')) veganMeals += l.quantity;
      });
    } else {
      // Fallback from profile diet type (estimating 90 meals/month)
      const diet = profile?.dietType || 'OMNIVORE';
      const dietStr = diet.toUpperCase();
      if (dietStr === 'VEGAN') {
        veganMeals = 90;
      } else if (dietStr === 'VEGETARIAN') {
        vegetarianMeals = 90;
      } else if (dietStr === 'PESCATARIAN') {
        vegetarianMeals = 45;
        veganMeals = 45;
      } else if (dietStr === 'OMNIVORE' || dietStr === 'OTHER') {
        beefMeals = 15;
        chickenMeals = 30;
        vegetarianMeals = 30;
        veganMeals = 15;
      } else {
        // MIXED / Default
        beefMeals = 5;
        chickenMeals = 25;
        vegetarianMeals = 40;
        veganMeals = 20;
      }

      const beefFactor = getFactorValue('FOOD', 'beefMeal', 7.0);
      const chickenFactor = getFactorValue('FOOD', 'chickenMeal', 2.5);
      const vegFactor = getFactorValue('FOOD', 'vegetarianMeal', 1.2);
      const veganFactor = getFactorValue('FOOD', 'veganMeal', 0.7);

      foodBaseline =
        beefMeals * beefFactor +
        chickenMeals * chickenFactor +
        vegetarianMeals * vegFactor +
        veganMeals * veganFactor;
    }

    // ENERGY
    const energyLogs = initialLogs.filter((l) => l.category.toUpperCase() === 'ENERGY');
    let energyBaseline = 0;
    let electricityKwh = 0;

    if (energyLogs.length > 0) {
      energyBaseline = energyLogs.reduce((sum, l) => sum + l.co2eKg, 0);
      energyLogs.forEach((l) => {
        electricityKwh += l.quantity;
      });
    } else {
      electricityKwh = profile?.electricityUsageKwh || 250;
      const factor = getFactorValue('ENERGY', 'indiaGrid', 0.71);
      energyBaseline = electricityKwh * factor;
    }

    // SHOPPING
    const shoppingLogs = initialLogs.filter((l) => l.category.toUpperCase() === 'SHOPPING');
    let shoppingBaseline = 0;
    if (shoppingLogs.length > 0) {
      shoppingBaseline = shoppingLogs.reduce((sum, l) => sum + l.co2eKg, 0);
    } else {
      shoppingBaseline = 25; // fallback
    }

    // WASTE
    const wasteLogs = initialLogs.filter((l) => l.category.toUpperCase() === 'WASTE');
    let wasteBaseline = 0;
    if (wasteLogs.length > 0) {
      wasteBaseline = wasteLogs.reduce((sum, l) => sum + l.co2eKg, 0);
    } else {
      wasteBaseline = 12; // fallback
    }

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

  // 2. Calculate simulated values based on parameters
  const simulated = useMemo(() => {
    // TRANSPORT
    const { carDistance, transitDistance } = baseline.transport;
    const carFactor = getFactorValue('TRANSPORT', 'petrolCar', 0.192);
    const busFactor = getFactorValue('TRANSPORT', 'bus', 0.105);

    const carEmissionsFromDistance = carDistance * carFactor;
    const transitEmissionsFromDistance = transitDistance * busFactor;
    const modeledTransportEmissions = carEmissionsFromDistance + transitEmissionsFromDistance;
    const unmodeledTransportEmissions = Math.max(
      0,
      baseline.transport.baseline - modeledTransportEmissions,
    );
    const drivingBaseline =
      carEmissionsFromDistance > 0 ? carEmissionsFromDistance : baseline.transport.baseline;
    const originalTransitEmissions =
      carEmissionsFromDistance > 0 ? transitEmissionsFromDistance : 0;
    const reducedDrivingEmissions = drivingBaseline * (carReducePct / 100);
    const shiftedTransitEmissions =
      carFactor > 0
        ? reducedDrivingEmissions * (publicTransitPct / 100) * (busFactor / carFactor)
        : 0;
    const remainingDrivingEmissions =
      (drivingBaseline - reducedDrivingEmissions) / carpoolOccupancy;

    const transportSimulated =
      unmodeledTransportEmissions +
      originalTransitEmissions +
      remainingDrivingEmissions +
      shiftedTransitEmissions;

    // FOOD
    const { beefMeals, chickenMeals, vegetarianMeals, veganMeals } = baseline.food;
    const beefFactor = getFactorValue('FOOD', 'beefMeal', 7.0);
    const chickenFactor = getFactorValue('FOOD', 'chickenMeal', 2.5);
    const vegFactor = getFactorValue('FOOD', 'vegetarianMeal', 1.2);
    const veganFactor = getFactorValue('FOOD', 'veganMeal', 0.7);

    const monthlyReplacedMeals = plantMealsPerWeek * 4.33;
    const animalMeals = beefMeals + chickenMeals;
    let foodSimulated = baseline.food.baseline;

    if (animalMeals > 0) {
      let remainingBeef = beefMeals;
      let remainingChicken = chickenMeals;
      let addedVegan = 0;

      let mealsToReplace = monthlyReplacedMeals;

      if (mealsToReplace > 0) {
        const beefReplaced = Math.min(mealsToReplace, remainingBeef);
        remainingBeef -= beefReplaced;
        addedVegan += beefReplaced;
        mealsToReplace -= beefReplaced;
      }

      if (mealsToReplace > 0) {
        const chickenReplaced = Math.min(mealsToReplace, remainingChicken);
        remainingChicken -= chickenReplaced;
        addedVegan += chickenReplaced;
        mealsToReplace -= chickenReplaced;
      }

      const modeledFood =
        remainingBeef * beefFactor +
        remainingChicken * chickenFactor +
        vegetarianMeals * vegFactor +
        (veganMeals + addedVegan) * veganFactor;
      const originalModeledFood =
        beefMeals * beefFactor +
        chickenMeals * chickenFactor +
        vegetarianMeals * vegFactor +
        veganMeals * veganFactor;
      foodSimulated = Math.max(
        0,
        baseline.food.baseline - Math.max(0, originalModeledFood - modeledFood),
      );
    } else {
      const plantSwapIntensity = Math.min(plantMealsPerWeek / 21, 1);
      foodSimulated = baseline.food.baseline * (1 - plantSwapIntensity * 0.5);
    }

    // ENERGY
    const { electricityKwh } = baseline.energy;
    const gridFactor = getFactorValue('ENERGY', 'indiaGrid', 0.71);
    const remainingKwh = electricityKwh * (1 - energyReducePct / 100);
    const gridKwh = remainingKwh * (1 - solarPct / 100);
    const energySimulated = gridKwh * gridFactor;

    // SHOPPING
    const shoppingBaselineVal = baseline.shopping.baseline;
    const remainingShopping = shoppingBaselineVal * (1 - shoppingReducePct / 100);
    const shoppingSimulated = remainingShopping * (1 - (secondHandPct / 100) * 0.8);

    // WASTE
    const wasteBaselineVal = baseline.waste.baseline;
    const wasteSimulated = wasteBaselineVal * (1 - (recyclePct / 100) * 0.8);

    return {
      transport: transportSimulated,
      food: foodSimulated,
      energy: energySimulated,
      shopping: shoppingSimulated,
      waste: wasteSimulated,
      total:
        transportSimulated + foodSimulated + energySimulated + shoppingSimulated + wasteSimulated,
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

  // Savings
  const savingsTotal = Math.max(0, baseline.total - simulated.total);
  const pctReduction = baseline.total > 0 ? (savingsTotal / baseline.total) * 100 : 0;

  const savingsTransport = Math.max(0, baseline.transport.baseline - simulated.transport);
  const savingsFood = Math.max(0, baseline.food.baseline - simulated.food);
  const savingsEnergy = Math.max(0, baseline.energy.baseline - simulated.energy);
  const savingsShopping = Math.max(0, baseline.shopping.baseline - simulated.shopping);
  const savingsWaste = Math.max(0, baseline.waste.baseline - simulated.waste);

  // Equivalents calculations
  const equivalentTrees = savingsTotal / 1.8; // 1 tree absorbs ~1.8kg CO2e per month
  const equivalentKm = savingsTotal / 0.192; // 1km petrol car avoided
  const equivalentBottles = savingsTotal / 0.08; // 1 plastic bottle avoided

  // Recharts structured comparison data
  const chartData = [
    {
      name: 'Transport',
      Current: parseFloat(baseline.transport.baseline.toFixed(1)),
      Simulated: parseFloat(simulated.transport.toFixed(1)),
    },
    {
      name: 'Food',
      Current: parseFloat(baseline.food.baseline.toFixed(1)),
      Simulated: parseFloat(simulated.food.toFixed(1)),
    },
    {
      name: 'Energy',
      Current: parseFloat(baseline.energy.baseline.toFixed(1)),
      Simulated: parseFloat(simulated.energy.toFixed(1)),
    },
    {
      name: 'Shopping',
      Current: parseFloat(baseline.shopping.baseline.toFixed(1)),
      Simulated: parseFloat(simulated.shopping.toFixed(1)),
    },
    {
      name: 'Waste',
      Current: parseFloat(baseline.waste.baseline.toFixed(1)),
      Simulated: parseFloat(simulated.waste.toFixed(1)),
    },
  ];

  // SVG Progress circle values
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(pctReduction, 100) / 100) * circumference;

  return (
    <div className="grid w-full grid-cols-1 items-start gap-6 pb-6 lg:grid-cols-12">
      {/* LEFT COLUMN: Controls tabbed layout */}
      <div className="lg:col-span-7 space-y-6">
        <Tabs
          defaultValue="transport"
          orientation="vertical"
          className="flex flex-col md:flex-row gap-6 w-full"
        >
          {/* Tab triggers list */}
          <TabsList className="flex md:flex-col w-full md:w-52 bg-bg-surface border border-border-default/50 p-1.5 rounded-xl h-fit gap-1 shadow-xs">
            <TabsTrigger
              value="transport"
              className="w-full py-2.5 px-3 rounded-lg justify-start gap-3 text-left data-active:bg-zinc-100/70"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Icon icon="car" className="text-blue-500 h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-sm">Transport</span>
                </div>
                {savingsTransport > 0 && (
                  <span className="rounded-full border border-emerald-500/10 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20">
                    -{savingsTransport.toFixed(0)} kg
                  </span>
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="food"
              className="w-full py-2.5 px-3 rounded-lg justify-start gap-3 text-left data-active:bg-zinc-100/70"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Icon icon="utensils" className="text-green-500 h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-sm">Diet</span>
                </div>
                {savingsFood > 0 && (
                  <span className="rounded-full border border-emerald-500/10 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20">
                    -{savingsFood.toFixed(0)} kg
                  </span>
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="energy"
              className="w-full py-2.5 px-3 rounded-lg justify-start gap-3 text-left data-active:bg-zinc-100/70"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Icon icon="bolt" className="text-yellow-600 h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-sm">Energy</span>
                </div>
                {savingsEnergy > 0 && (
                  <span className="rounded-full border border-emerald-500/10 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20">
                    -{savingsEnergy.toFixed(0)} kg
                  </span>
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="shopping"
              className="w-full py-2.5 px-3 rounded-lg justify-start gap-3 text-left data-active:bg-zinc-100/70"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Icon icon="shopping-bag" className="text-purple-500 h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-sm">Shopping</span>
                </div>
                {savingsShopping > 0 && (
                  <span className="rounded-full border border-emerald-500/10 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20">
                    -{savingsShopping.toFixed(0)} kg
                  </span>
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="waste"
              className="w-full py-2.5 px-3 rounded-lg justify-start gap-3 text-left data-active:bg-zinc-100/70"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Icon icon="trash" className="text-red-500 h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-sm">Waste</span>
                </div>
                {savingsWaste > 0 && (
                  <span className="rounded-full border border-emerald-500/10 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20">
                    -{savingsWaste.toFixed(0)} kg
                  </span>
                )}
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Tabs Content panel */}
          <div className="flex-1 bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {/* 1. TRANSPORT CONTENT */}
            <TabsContent value="transport" className="space-y-6 outline-none">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-1">Transport Simulator</h3>
                <p className="text-xs text-text-muted">
                  Simulate reductions in fuel usage by commuting smarter, carpooling, or taking
                  transit.
                </p>
              </div>

              {baseline.transport.baseline === 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3.5 rounded-lg border border-blue-500/10 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Icon icon="leaf" className="text-blue-500 mt-0.5 h-3.5 w-3.5" />
                  <div>
                    <span className="font-semibold">Zero Commute Baseline:</span> Your transport
                    emissions are currently 0. Adjusting these sliders won&apos;t affect simulated
                    totals until transport activities are logged.
                  </div>
                </div>
              )}

              {/* Slider 1 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-text-primary">Reduce Driving</label>
                  <span className="text-xs font-bold text-accent-primary bg-accent-primary-dim px-2 py-0.5 rounded-full">
                    {carReducePct}% less
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={carReducePct}
                  onChange={(e) => setCarReducePct(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <p className="text-xs text-text-muted">
                  Avoid personal vehicle trips by working from home, walking, or biking.
                </p>
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-text-primary">
                    Shift to Public Transit
                  </label>
                  <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    {publicTransitPct}% shifted
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={publicTransitPct}
                  disabled={carReducePct === 0}
                  onChange={(e) => setPublicTransitPct(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent-primary disabled:opacity-40"
                />
                <p className="text-xs text-text-muted">
                  Of the reduced driving trips above, shift this percentage to trains, metros, or
                  buses.
                </p>
              </div>

              {/* Slider 3 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-text-primary">
                    Carpooling (Car Occupancy)
                  </label>
                  <span className="text-xs font-bold text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded-full">
                    {carpoolOccupancy} {carpoolOccupancy === 1 ? 'person' : 'people'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={carpoolOccupancy}
                  onChange={(e) => setCarpoolOccupancy(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <p className="text-xs text-text-muted">
                  Share remaining driving distance with others. More passengers reduce per-person
                  footprint.
                </p>
              </div>
            </TabsContent>

            {/* 2. FOOD CONTENT */}
            <TabsContent value="food" className="space-y-6 outline-none">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-1">Dietary Simulator</h3>
                <p className="text-xs text-text-muted">
                  Model swapping animal protein with vegetarian or vegan meals.
                </p>
              </div>

              {/* Info banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3.5 rounded-lg border border-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold text-emerald-900 dark:text-emerald-200 block mb-0.5">
                  Meal Substitution Priority:
                </span>
                We substitute your highest emission meals (beef, followed by chicken) with a
                plant-based vegan option (saving up to 6.3 kg CO₂e per meal).
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-text-primary">
                    Plant-Based Swap
                  </label>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {plantMealsPerWeek} meals / week
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="21"
                  value={plantMealsPerWeek}
                  onChange={(e) => setPlantMealsPerWeek(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <p className="text-xs text-text-muted">
                  Replace animal-based meals with plant-based alternatives (maximum of 21
                  meals/week).
                </p>
              </div>

              <div className="border-t border-border-default/50 pt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-muted block">Current Beef Meals:</span>
                  <span className="font-bold text-text-primary">
                    {baseline.food.beefMeals.toFixed(0)} meals / month
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Current Poultry Meals:</span>
                  <span className="font-bold text-text-primary">
                    {baseline.food.chickenMeals.toFixed(0)} meals / month
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* 3. ENERGY CONTENT */}
            <TabsContent value="energy" className="space-y-6 outline-none">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-1">Home Energy Simulator</h3>
                <p className="text-xs text-text-muted">
                  Decrease utilities waste or transition grid electricity to clean solar energy.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-text-primary">
                    Reduce Consumption
                  </label>
                  <span className="text-xs font-bold text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                    {energyReducePct}% reduction
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={energyReducePct}
                  onChange={(e) => setEnergyReducePct(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <p className="text-xs text-text-muted">
                  Reduce electricity use up to 50% by adjusting AC/heating, installing LED lights,
                  or switching off appliances.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-text-primary">
                    Transition to Solar
                  </label>
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {solarPct}% solar
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={solarPct}
                  onChange={(e) => setSolarPct(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <p className="text-xs text-text-muted">
                  Power your remaining home electricity requirements with clean solar energy (0
                  emissions factor).
                </p>
              </div>

              <div className="border-t border-border-default/50 pt-4 text-xs">
                <span className="text-text-muted block">Home Baseline Usage:</span>
                <span className="font-bold text-text-primary">
                  {baseline.energy.electricityKwh.toFixed(0)} kWh / month (
                  {baseline.energy.baseline.toFixed(0)} kg CO₂e)
                </span>
              </div>
            </TabsContent>

            {/* 4. SHOPPING CONTENT */}
            <TabsContent value="shopping" className="space-y-6 outline-none">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-1">
                  Shopping & Goods Simulator
                </h3>
                <p className="text-xs text-text-muted">
                  Simulate buying fewer clothing/electronic goods, or buying pre-owned.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-text-primary">
                    Reduce New Purchases
                  </label>
                  <span className="text-xs font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
                    {shoppingReducePct}% less
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shoppingReducePct}
                  onChange={(e) => setShoppingReducePct(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <p className="text-xs text-text-muted">
                  Avoid purchasing non-essential goods like fast fashion items or yearly electronics
                  upgrades.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-text-primary">
                    Choose Second-Hand
                  </label>
                  <span className="text-xs font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
                    {secondHandPct}% second-hand
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={secondHandPct}
                  disabled={shoppingReducePct === 100}
                  onChange={(e) => setSecondHandPct(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent-primary disabled:opacity-40"
                />
                <p className="text-xs text-text-muted">
                  For remaining purchases, choose pre-owned/second-hand goods (saves 80% of carbon
                  impact).
                </p>
              </div>
            </TabsContent>

            {/* 5. WASTE CONTENT */}
            <TabsContent value="waste" className="space-y-6 outline-none">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-1">
                  Waste & Recycling Simulator
                </h3>
                <p className="text-xs text-text-muted">
                  Divert food waste to compost, or increase home recycling rates.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-text-primary">
                    Recycling & Composting Rate
                  </label>
                  <span className="text-xs font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full">
                    {recyclePct}% diversion
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={recyclePct}
                  onChange={(e) => setRecyclePct(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <p className="text-xs text-text-muted">
                  Divert general landfill waste to municipal recycling schemes or organic composting
                  (reduces carbon footprint of diverted waste by 80%).
                </p>
              </div>
            </TabsContent>

            {/* General bottom reset trigger */}
            <div className="mt-4 flex justify-end border-t border-border-default/50 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCarReducePct(0);
                  setPublicTransitPct(0);
                  setCarpoolOccupancy(1);
                  setPlantMealsPerWeek(0);
                  setEnergyReducePct(0);
                  setSolarPct(0);
                  setShoppingReducePct(0);
                  setSecondHandPct(0);
                  setRecyclePct(0);
                }}
                className="text-xs font-medium border-border-default hover:bg-zinc-50"
              >
                Reset Parameters
              </Button>
            </div>
          </div>
        </Tabs>
      </div>

      {/* RIGHT COLUMN: Results panel */}
      <div className="space-y-6 lg:col-span-5 lg:self-start">
        {/* Main savings total Card */}
        <Card className="bg-linear-to-br from-emerald-600 to-teal-700 text-white border-0 shadow-lg relative overflow-hidden rounded-xl">
          {/* Subtle bg glow meshes */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

          <CardHeader className="pb-3 border-b border-white/10">
            <CardTitle className="text-white text-sm uppercase tracking-wider font-semibold">
              Simulated CO₂e Reductions
            </CardTitle>
            <CardDescription className="text-emerald-100 text-xs">
              Model parameters to see immediate changes
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-3xl font-extrabold tracking-tight">
                  -{pctReduction.toFixed(1)}%
                </span>
                <p className="text-xs text-emerald-100 font-medium">Potential monthly savings:</p>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-2xl font-bold">{savingsTotal.toFixed(0)}</span>
                  <span className="text-xs font-semibold">kg CO₂e</span>
                </div>
              </div>

              {/* Circular SVG Ring */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  {/* Outer gray border circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="text-white/10"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Inner animated circle indicator */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="text-emerald-300 transition-[stroke-dashoffset] duration-300 ease-out"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                {/* Center text icons */}
                <div className="absolute flex flex-col items-center">
                  <Icon icon="leaf" className="text-emerald-300 h-5 w-5 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Baseline comparison split bar */}
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="border-r border-white/10 pr-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Baseline
                </span>
                <span className="font-extrabold text-white">{baseline.total.toFixed(0)} kg</span>
              </div>
              <div className="pl-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Simulated
                </span>
                <span className="font-extrabold text-emerald-300">
                  {simulated.total.toFixed(0)} kg
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown chart card */}
        <Card className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-text-primary">
              Category Impact Comparison
            </CardTitle>
            <CardDescription className="text-xs text-text-muted">
              Current Baseline vs. Simulated emissions (kg CO₂e)
            </CardDescription>
          </CardHeader>

          <CardContent className="h-56 w-full pr-4 pb-4">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  barCategoryGap="20%"
                  barGap={4}
                  margin={{ top: 10, right: 16, left: 12, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Current" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={8} />
                  <Bar dataKey="Simulated" fill="#10b981" radius={[0, 4, 4, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-text-muted">
                Loading simulator chart…
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environmental Equivalents card */}
        <Card className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-text-primary">
              Monthly Environmental Impact
            </CardTitle>
            <CardDescription className="text-xs text-text-muted">
              What your savings equal over a full month
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-3 gap-2 pb-4 pt-2">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-border-default/50 text-center flex flex-col items-center justify-center">
              <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1">
                <Icon icon="tree" className="text-emerald-600 h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-text-primary">
                {equivalentTrees.toFixed(1)}
              </span>
              <span className="mt-0.5 text-xs leading-tight text-text-muted">Trees planted</span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-border-default/50 text-center flex flex-col items-center justify-center">
              <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center mb-1">
                <Icon icon="car" className="text-blue-500 h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-text-primary">
                {equivalentKm.toFixed(0)} km
              </span>
              <span className="mt-0.5 text-xs leading-tight text-text-muted">Driving avoided</span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-border-default/50 text-center flex flex-col items-center justify-center">
              <div className="h-7 w-7 rounded-full bg-teal-500/10 flex items-center justify-center mb-1">
                <Icon icon="leaf" className="text-teal-600 h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-text-primary">
                {equivalentBottles.toFixed(0)}
              </span>
              <span className="mt-0.5 text-xs leading-tight text-text-muted">Bottles saved</span>
            </div>
          </CardContent>
        </Card>

        {/* Commit Button */}
        <div className="pt-1">
          <Button
            onClick={() => setIsCommitOpen(true)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white shadow-md transition-colors hover:bg-accent-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
            disabled={savingsTotal === 0}
          >
            <Icon icon="leaf" className="text-white h-4 w-4" />
            Commit to Lifestyle Changes
          </Button>
        </div>
      </div>

      {/* COMMITMENT MODAL */}
      <Dialog open={isCommitOpen} onOpenChange={setIsCommitOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-zinc-200">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
              <Icon icon="leaf" className="text-emerald-500 h-5 w-5 animate-bounce" />
              Commitment Registered!
            </DialogTitle>
            <DialogDescription className="text-zinc-600 text-xs">
              Excellent decision! You&apos;ve pledged to implement these carbon-reducing habits.
              Your target reduction of{' '}
              <strong className="text-zinc-900 font-semibold">-{pctReduction.toFixed(0)}%</strong>{' '}
              sets a new carbon limit of{' '}
              <strong className="text-zinc-900 font-semibold">
                {simulated.total.toFixed(0)} kg CO₂e/month
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-500/10 text-xs space-y-2 text-emerald-800">
            <p className="font-bold text-emerald-950">Planned Reductions Summary:</p>
            <ul className="list-disc pl-4 space-y-1.5 leading-relaxed font-medium">
              {savingsTransport > 0 && (
                <li>
                  Transport: Save{' '}
                  <strong className="text-emerald-900">
                    {savingsTransport.toFixed(0)} kg CO₂e
                  </strong>{' '}
                  by reducing car travel by {carReducePct}% and using public transit/carpooling.
                </li>
              )}
              {savingsFood > 0 && (
                <li>
                  Diet: Save{' '}
                  <strong className="text-emerald-900">{savingsFood.toFixed(0)} kg CO₂e</strong> by
                  replacing {plantMealsPerWeek} meat meals/week with plant-based alternatives.
                </li>
              )}
              {savingsEnergy > 0 && (
                <li>
                  Energy: Save{' '}
                  <strong className="text-emerald-900">{savingsEnergy.toFixed(0)} kg CO₂e</strong>{' '}
                  through conservation or solar installation.
                </li>
              )}
              {savingsShopping + savingsWaste > 0 && (
                <li>
                  Shopping & Waste: Save{' '}
                  <strong className="text-emerald-900">
                    {(savingsShopping + savingsWaste).toFixed(0)} kg CO₂e
                  </strong>{' '}
                  by buying second-hand, recycling, and composting.
                </li>
              )}
            </ul>
            <p className="mt-2 border-t border-emerald-500/10 pt-1 text-xs font-semibold text-emerald-600">
              * Note: These choices will prefill your Carbon Challenges and goals. Keep logging
              activities to realize these simulated offsets!
            </p>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <DialogClose
              render={
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-2 text-xs" />
              }
            >
              Let&apos;s Do It!
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
