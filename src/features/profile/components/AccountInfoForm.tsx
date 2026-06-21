import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

interface AccountInfoFormProps {
  initialData: {
    displayName: string;
    email: string;
    city: string;
    state: string;
    country: string;
    householdSize: number;
    dietType: string;
    commuteMode: string;
    commuteDistanceKm: number;
    electricityUsageKwh: number;
    monthlyBudgetKg: number;
  };
  onSave: (data: AccountInfoFormProps['initialData']) => Promise<void>;
  isSaving: boolean;
}

const inputClassName =
  'h-10 w-full rounded-xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary transition-colors placeholder:text-text-muted focus-visible:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50';

const selectClassName = `${inputClassName} cursor-pointer`;

export default function AccountInfoForm({ initialData, onSave, isSaving }: AccountInfoFormProps) {
  const [formData, setFormData] = useState({ ...initialData });
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(String(initialData.monthlyBudgetKg));
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'monthlyBudgetKg') {
      setMonthlyBudgetInput(value);
      setIsDirty(true);
      return;
    }

    let parsedValue: string | number = value;
    if (['householdSize', 'commuteDistanceKm', 'electricityUsageKwh'].includes(name)) {
      parsedValue = Number.parseFloat(value) || 0;
    }
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyBudgetKg = Number.parseFloat(monthlyBudgetInput);
    if (!Number.isFinite(monthlyBudgetKg) || monthlyBudgetKg < 1) return;

    onSave({ ...formData, monthlyBudgetKg }).then(() => setIsDirty(false));
  };

  return (
    <Card className="h-full rounded-3xl border-border-default bg-bg-surface shadow-sm overflow-hidden animate-fade-in">
      <div className="border-b border-border-subtle px-5 py-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Icons.User className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-text-primary">
            Account Information
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your display profile and calculation baseline parameters.
          </p>
        </div>
      </div>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Identity */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-muted">Identity & Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                Display Name
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className={inputClassName}
                  required
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                Email Address (Read-only)
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-10 w-full rounded-xl border border-border-default bg-bg-elevated px-3 text-sm font-semibold text-text-muted cursor-not-allowed opacity-75"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                City
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className={inputClassName}
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                State / Region
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className={inputClassName}
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                Country
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g. India"
                  className={inputClassName}
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                Household Size
                <input
                  type="number"
                  name="householdSize"
                  min="1"
                  value={formData.householdSize}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </label>
            </div>
          </div>

          {/* Section: Baseline Parameters */}
          <div className="space-y-4 pt-4 border-t border-dashed border-border-default">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-muted">Calculations Baseline</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                Diet Style
                <select
                  name="dietType"
                  value={formData.dietType.toLowerCase()}
                  onChange={handleChange}
                  className={selectClassName}
                >
                  <option value="vegan">Vegan</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="pescatarian">Pescatarian</option>
                  <option value="omnivore">Omnivore (Balanced Meat/Veg)</option>
                  <option value="mixed">Mixed</option>
                  <option value="heavy-meat">Heavy Meat Consumer</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                Primary Transit
                <select
                  name="commuteMode"
                  value={formData.commuteMode.toLowerCase()}
                  onChange={handleChange}
                  className={selectClassName}
                >
                  <option value="car">Car (Petrol/Diesel)</option>
                  <option value="motorbike">Motorcycle</option>
                  <option value="bus">Public Bus</option>
                  <option value="metro">Metro / Subway</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="walk">Walking</option>
                  <option value="work_from_home">Remote / WFH</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                One-Way Daily Travel (km)
                <input
                  type="number"
                  name="commuteDistanceKm"
                  min="0"
                  step="any"
                  value={formData.commuteDistanceKm}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                Monthly Electricity (kWh)
                <input
                  type="number"
                  name="electricityUsageKwh"
                  min="0"
                  step="any"
                  value={formData.electricityUsageKwh}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider sm:col-span-2">
                Monthly Carbon Target (kg CO₂e)
                <input
                  type="number"
                  name="monthlyBudgetKg"
                  min="1"
                  step="any"
                  required
                  value={monthlyBudgetInput}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              className="h-10 px-5 rounded-xl text-xs font-black"
            >
              {isSaving ? (
                <>
                  <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes
                </>
              ) : (
                <>
                  <Icons.Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
