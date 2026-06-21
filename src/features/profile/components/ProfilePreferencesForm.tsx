import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

interface ProfilePreferencesFormProps {
  initialData: {
    carbonUnit: string;
    distanceUnit: string;
  };
  onSave: (data: { carbonUnit: string; distanceUnit: string }) => Promise<void>;
  isSaving: boolean;
}

const selectClassName =
  'h-10 w-full rounded-xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary transition-colors focus-visible:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 cursor-pointer';

export default function ProfilePreferencesForm({
  initialData,
  onSave,
  isSaving,
}: ProfilePreferencesFormProps) {
  const [formData, setFormData] = useState({ ...initialData });
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData).then(() => setIsDirty(false));
  };

  return (
    <Card className="h-full rounded-3xl border-border-default bg-bg-surface shadow-sm overflow-hidden animate-fade-in">
      <div className="border-b border-border-subtle px-5 py-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
          <Icons.SlidersHorizontal className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-text-primary">
            App Preferences
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure default unit systems and measurements display.
          </p>
        </div>
      </div>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
              Carbon Unit Display
              <select
                name="carbonUnit"
                value={formData.carbonUnit}
                onChange={handleChange}
                className={selectClassName}
              >
                <option value="kg_co2e">Kilograms (kg CO₂e)</option>
                <option value="t_co2e">Metric Tons (t CO₂e)</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
              Distance Unit System
              <select
                name="distanceUnit"
                value={formData.distanceUnit}
                onChange={handleChange}
                className={selectClassName}
              >
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
              Preferred Language
              <select disabled className="h-10 w-full rounded-xl border border-border-default bg-bg-elevated px-3 text-sm font-semibold text-text-muted cursor-not-allowed opacity-75">
                <option value="en">English (US)</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
              App Theme
              <select disabled className="h-10 w-full rounded-xl border border-border-default bg-bg-elevated px-3 text-sm font-semibold text-text-muted cursor-not-allowed opacity-75">
                <option value="light">Light Theme</option>
              </select>
            </label>
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
                  Saving
                </>
              ) : (
                <>
                  <Icons.Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
