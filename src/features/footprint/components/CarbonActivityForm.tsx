'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

import CarbonResultCard from './CarbonResultCard';

type ActivityMode = 'TRANSPORT' | 'ELECTRICITY' | 'FUEL' | 'SHOPPING' | 'PRODUCT';

export default function CarbonActivityForm() {
  const [mode, setMode] = useState<ActivityMode>('TRANSPORT');
  const [result, setResult] = useState<Parameters<typeof CarbonResultCard>[0]['result']>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const body =
      mode === 'TRANSPORT'
        ? {
            category: 'TRANSPORT',
            provider: 'CLIMATIQ',
            mappingKey: formData.get('transportType'),
            distanceValue: Number(formData.get('distanceValue')),
            distanceUnit: formData.get('distanceUnit'),
          }
        : mode === 'ELECTRICITY'
          ? {
              category: 'ELECTRICITY',
              provider: 'CLIMATIQ',
              mappingKey: formData.get('electricityRegion'),
              energyValue: Number(formData.get('energyValue')),
              energyUnit: formData.get('energyUnit'),
            }
          : mode === 'FUEL'
            ? {
                category: 'FUEL',
                provider: 'CLIMATIQ',
                mappingKey: formData.get('fuelType'),
                volumeValue: Number(formData.get('fuelAmount')),
                volumeUnit: formData.get('fuelUnit'),
              }
            : mode === 'SHOPPING'
              ? {
                  category: 'SHOPPING',
                  provider: 'CLIMATIQ',
                  mappingKey: formData.get('purchaseCategory'),
                  moneyValue: Number(formData.get('moneyValue')),
                  moneyUnit: formData.get('moneyUnit'),
                  spentYear: Number(formData.get('spentYear')),
                }
              : {
                  category: 'PRODUCT',
                  provider: 'CLIMATIQ',
                  mappingKey: formData.get('materialCategory'),
                  weightValue: Number(formData.get('weightValue')),
                  weightUnit: formData.get('weightUnit'),
                };

    try {
      const res = await fetch('/api/carbon/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not calculate this activity right now.');
      }
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not calculate this activity right now. Please check the values and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Climatiq Activity</CardTitle>
          <CardDescription>Log transport, electricity, fuel, shopping, or product activity with Climatiq mappings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Activity type
              </label>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as ActivityMode)}
                className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm font-medium"
              >
                <option value="TRANSPORT">Commute</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="FUEL">Fuel</option>
                <option value="SHOPPING">Shopping</option>
                <option value="PRODUCT">Product/material</option>
              </select>
            </div>

            {mode === 'TRANSPORT' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  Transport type
                  <select name="transportType" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3">
                    <option value="transport.car.average">Car</option>
                    <option value="transport.bus.local">Bus</option>
                    <option value="transport.train.local">Train</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Distance
                  <Input name="distanceValue" type="number" min="0.1" step="0.1" defaultValue="12" />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Distance unit
                  <select name="distanceUnit" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3">
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                  </select>
                </label>
              </div>
            ) : null}

            {mode === 'ELECTRICITY' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  Country / region
                  <select name="electricityRegion" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3">
                    <option value="electricity.grid.india">India grid electricity</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Electricity usage
                  <Input name="energyValue" type="number" min="0.1" step="0.1" defaultValue="180" />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Unit
                  <select name="energyUnit" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3">
                    <option value="kWh">kWh</option>
                    <option value="MWh">MWh</option>
                    <option value="Wh">Wh</option>
                  </select>
                </label>
              </div>
            ) : null}

            {mode === 'FUEL' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  Fuel type
                  <select name="fuelType" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3">
                    <option value="fuel.petrol">Petrol</option>
                    <option value="fuel.diesel">Diesel</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Amount
                  <Input name="fuelAmount" type="number" min="0.1" step="0.1" defaultValue="20" />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Unit
                  <select name="fuelUnit" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3">
                    <option value="l">liters</option>
                    <option value="gal">gallons</option>
                  </select>
                </label>
              </div>
            ) : null}

            {mode === 'SHOPPING' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  Purchase category
                  <select name="purchaseCategory" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3">
                    <option value="shopping.clothing.spend">Clothing</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Amount spent
                  <Input name="moneyValue" type="number" min="0.1" step="0.1" defaultValue="2500" />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Currency
                  <select name="moneyUnit" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3">
                    <option value="inr">INR</option>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Purchase year
                  <Input name="spentYear" type="number" min="2000" step="1" defaultValue="2026" />
                </label>
              </div>
            ) : null}

            {mode === 'PRODUCT' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  Product/material category
                  <select name="materialCategory" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3">
                    <option value="product.steel.weight">Steel</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Weight
                  <Input name="weightValue" type="number" min="0.1" step="0.1" defaultValue="2" />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Unit
                  <select name="weightUnit" className="h-9 rounded-lg border border-border-default bg-bg-surface px-3">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="t">t</option>
                    <option value="lb">lb</option>
                  </select>
                </label>
              </div>
            ) : null}

            {error ? <p className="text-sm font-medium text-state-error">{error}</p> : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Calculating...' : 'Calculate and log activity'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <CarbonResultCard result={result} />
    </div>
  );
}
