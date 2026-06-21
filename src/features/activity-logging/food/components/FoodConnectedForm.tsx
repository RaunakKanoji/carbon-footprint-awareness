'use client';

import { Barcode, Clock3, Loader2, Search, Sparkles, Utensils } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

type FoodMode = 'POPULAR' | 'BARCODE' | 'RECENT' | 'AI';

type CatalogFood = {
  id: string;
  name: string;
  description: string | null;
  dietType: string | null;
  servingSizeKg: number;
  totalCo2eKg: number;
  confidence: string;
};

type RecentFood = {
  id: string;
  name: string;
  description: string | null;
  servings: number;
  quantityKg: number;
  totalCo2eKg: number;
  confidence: string;
};

type FoodAnalysis = {
  name: string;
  description?: string;
  servings: number;
  quantityKg: number;
  cookingMinutes?: number;
  ingredients: Array<{
    name: string;
    quantityKg: number;
    co2eKg: number;
    provider: string;
    factorName?: string;
  }>;
  totalCo2eKg: number;
  confidence: string;
  dataSources: string[];
};

const modes = [
  { value: 'POPULAR', label: 'Search', description: 'Popular and generic foods.', icon: Search },
  { value: 'BARCODE', label: 'Scan', description: 'Open Food Facts barcode.', icon: Barcode },
  { value: 'RECENT', label: 'Recent', description: 'Repeat a previous food.', icon: Clock3 },
  { value: 'AI', label: 'AI Meals', description: 'Analyze a prepared dish.', icon: Sparkles },
] as const;

const fieldClassName =
  'h-11 w-full rounded-2xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15';

export default function FoodConnectedForm({
  todayStr,
  hideActions,
  onLiveEstimateChange,
  onLogged,
}: {
  todayStr: string;
  hideActions?: boolean;
  onLiveEstimateChange: (value: number) => void;
  onLogged: (result: { co2eKg: number; name: string; sourceLabel: string }) => void;
}) {
  const [mode, setMode] = useState<FoodMode>('POPULAR');
  const [dietType, setDietType] = useState('vegetarian');
  const [catalog, setCatalog] = useState<CatalogFood[]>([]);
  const [recent, setRecent] = useState<RecentFood[]>([]);
  const [catalogItemId, setCatalogItemId] = useState('');
  const [recentFoodId, setRecentFoodId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState('1');
  const [quantityKg, setQuantityKg] = useState('');
  const [occurredAt, setOccurredAt] = useState(todayStr);
  const [note, setNote] = useState('');
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode !== 'POPULAR') return;
    const controller = new AbortController();
    void fetch(`/api/food/catalog?dietType=${encodeURIComponent(dietType)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((payload: { foods?: CatalogFood[] }) => setCatalog(payload.foods ?? []))
      .catch(() => setCatalog([]));
    return () => controller.abort();
  }, [dietType, mode]);

  useEffect(() => {
    if (mode !== 'RECENT') return;
    const controller = new AbortController();
    void fetch('/api/food/recent', { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: { foods?: RecentFood[] }) => setRecent(payload.foods ?? []))
      .catch(() => setRecent([]));
    return () => controller.abort();
  }, [mode]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAnalysis(null);
      setStatus('');
      onLiveEstimateChange(0);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [barcode, catalogItemId, description, mode, onLiveEstimateChange, recentFoodId, servings]);

  const canAnalyze = useMemo(() => {
    if (mode === 'POPULAR') return Boolean(catalogItemId);
    if (mode === 'BARCODE') return barcode.trim().length >= 8;
    if (mode === 'RECENT') return Boolean(recentFoodId);
    return description.trim().length >= 3;
  }, [barcode, catalogItemId, description, mode, recentFoodId]);

  async function analyze(createActivityLog: boolean) {
    setIsLoading(true);
    setStatus('');

    try {
      const count = Math.max(0.1, Number(servings) || 1);
      const modePayload =
        mode === 'POPULAR'
          ? { mode, catalogItemId, servings: count }
          : mode === 'BARCODE'
            ? {
                mode,
                barcode: barcode.trim(),
                quantityKg: quantityKg ? Number(quantityKg) : undefined,
              }
            : mode === 'RECENT'
              ? { mode, foodLogId: recentFoodId, servings: count }
              : { mode, description: description.trim(), servings: count };

      const response = await fetch('/api/food/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...modePayload,
          createActivityLog,
          occurredAt,
          note: note.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        result?: FoodAnalysis;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.error ?? 'Food analysis failed.');
      }

      setAnalysis(payload.result);
      onLiveEstimateChange(payload.result.totalCo2eKg);
      setStatus(createActivityLog ? 'Food activity saved.' : 'Ingredient analysis ready.');

      if (createActivityLog) {
        onLogged({
          co2eKg: payload.result.totalCo2eKg,
          name: payload.result.name,
          sourceLabel: payload.result.dataSources.join(' + '),
        });
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Food analysis failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void analyze(true);
      }}
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {modes.map((item) => {
          const Icon = item.icon;
          const active = mode === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                active
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-border-default bg-bg-base text-text-secondary hover:bg-bg-elevated'
              }`}
            >
              <Icon className="h-5 w-5" />
              <p className="mt-3 text-sm font-black">{item.label}</p>
              <p className="mt-1 text-xs leading-5">{item.description}</p>
            </button>
          );
        })}
      </section>

      {mode === 'POPULAR' ? (
        <section className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Food type
            <select
              value={dietType}
              onChange={(event) => {
                setDietType(event.target.value);
                setCatalogItemId('');
              }}
              className={fieldClassName}
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="nonVegetarian">Non-vegetarian</option>
              <option value="mixed">Mixed / packaged</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Food item
            <select
              value={catalogItemId}
              onChange={(event) => setCatalogItemId(event.target.value)}
              className={fieldClassName}
            >
              <option value="">Select a food item</option>
              {catalog.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name} · {food.totalCo2eKg.toFixed(2)} kg CO₂e
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}

      {mode === 'BARCODE' ? (
        <section className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Product barcode
            <Input
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              placeholder="EAN, UPC, or GTIN"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Product weight in kg
            <Input
              type="number"
              min="0.001"
              step="0.001"
              value={quantityKg}
              onChange={(event) => setQuantityKg(event.target.value)}
              placeholder="Optional; uses package weight when available"
            />
          </label>
        </section>
      ) : null}

      {mode === 'RECENT' ? (
        <label className="grid gap-2 text-sm font-bold text-text-primary">
          Recent food
          <select
            value={recentFoodId}
            onChange={(event) => setRecentFoodId(event.target.value)}
            className={fieldClassName}
          >
            <option value="">Select a recent food</option>
            {recent.map((food) => (
              <option key={food.id} value={food.id}>
                {food.name} · {food.totalCo2eKg.toFixed(2)} kg CO₂e
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {mode === 'AI' ? (
        <label className="grid gap-2 text-sm font-bold text-text-primary">
          Describe the meal
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            placeholder="Example: butter chicken with one cup of basmati rice"
            className="resize-none rounded-2xl border border-border-default bg-bg-base px-3 py-3 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
          />
        </label>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {mode !== 'BARCODE' ? (
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Servings
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={servings}
              onChange={(event) => setServings(event.target.value)}
            />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-bold text-text-primary">
          Date
          <Input
            type="date"
            value={occurredAt}
            onChange={(event) => setOccurredAt(event.target.value)}
          />
        </label>
      </section>

      <label className="grid gap-2 text-sm font-bold text-text-primary">
        Notes
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Restaurant, recipe variation, portion notes..."
          className="resize-none rounded-2xl border border-border-default bg-bg-base px-3 py-3 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => void analyze(false)}
          disabled={!canAnalyze || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Analyze food
        </Button>
        {status ? <p className="text-sm font-semibold text-text-secondary">{status}</p> : null}
      </div>

      {analysis ? (
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-black text-text-primary">{analysis.name}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {analysis.quantityKg.toFixed(3)} kg · {analysis.servings} serving(s)
                {analysis.cookingMinutes ? ` · ${analysis.cookingMinutes} min cooking` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-emerald-800">
                {analysis.totalCo2eKg.toFixed(3)} kg CO₂e
              </p>
              <p className="text-xs font-semibold text-emerald-700">
                {analysis.confidence} confidence
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {analysis.ingredients.map((ingredient, index) => (
              <div
                key={`${ingredient.name}-${index}`}
                className="flex flex-col justify-between gap-1 rounded-xl bg-white/80 px-3 py-2 text-sm sm:flex-row"
              >
                <span className="font-semibold text-text-primary">{ingredient.name}</span>
                <span className="text-text-secondary">
                  {ingredient.quantityKg.toFixed(3)} kg · {ingredient.co2eKg.toFixed(3)} kg CO₂e ·{' '}
                  {ingredient.provider}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4 text-sm text-text-secondary">
          <div className="flex items-start gap-3">
            <Utensils className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Analyze the food to see its ingredient-level carbon estimate before logging.</p>
          </div>
        </section>
      )}

      {!hideActions ? (
        <div className="flex justify-end border-t border-border-subtle pt-5">
          <Button type="submit" disabled={!canAnalyze || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Log analyzed food
          </Button>
        </div>
      ) : null}
    </form>
  );
}
