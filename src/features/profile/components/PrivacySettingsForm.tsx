import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

interface PrivacySettingsFormProps {
  initialData: {
    leaderboardVisibility: string;
    showCityOnLeaderboard: boolean;
    showCo2eSavedPublicly: boolean;
    showStreakPublicly: boolean;
  };
  onSave: (data: {
    leaderboardVisibility: string;
    showCityOnLeaderboard: boolean;
    showCo2eSavedPublicly: boolean;
    showStreakPublicly: boolean;
  }) => Promise<void>;
  isSaving: boolean;
}

export default function PrivacySettingsForm({
  initialData,
  onSave,
  isSaving,
}: PrivacySettingsFormProps) {
  const [formData, setFormData] = useState({ ...initialData });
  const [isDirty, setIsDirty] = useState(false);

  const handleVisibilityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, leaderboardVisibility: value }));
    setIsDirty(true);
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData).then(() => setIsDirty(false));
  };

  const visibilityOptions = [
    {
      value: 'PUBLIC',
      label: 'Public',
      description: 'Visible on global, local, and friends leaderboards.',
    },
    {
      value: 'LOCAL_ONLY',
      label: 'Local only',
      description: 'Visible on local and friends leaderboards.',
    },
    {
      value: 'FRIENDS_ONLY',
      label: 'Friends only',
      description: 'Visible only to accepted friends.',
    },
    {
      value: 'PRIVATE',
      label: 'Private',
      description: 'Hidden from leaderboards.',
    },
  ];

  return (
    <Card className="h-full rounded-3xl border-border-default bg-bg-surface shadow-sm overflow-hidden animate-fade-in">
      <div className="border-b border-border-subtle px-5 py-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
          <Icons.ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-text-primary">
            Privacy & Leaderboard
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure how your progress is visible to the community.
          </p>
        </div>
      </div>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Radio Group for Visibility */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-muted">
              Leaderboard Visibility
            </h4>
            <div className="space-y-2.5">
              {visibilityOptions.map((opt) => {
                const isSelected = formData.leaderboardVisibility === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleVisibilityChange(opt.value)}
                    className={`w-full flex items-start text-left gap-3 p-3.5 rounded-xl border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 ${
                      isSelected
                        ? 'border-accent-primary bg-accent-primary-dim/35 text-accent-primary'
                        : 'border-border-default bg-bg-base/40 text-text-primary hover:bg-bg-elevated'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-accent-primary bg-accent-primary' : 'border-border-default'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider leading-none">
                        {opt.label}
                      </p>
                      <p className="text-xs text-text-secondary mt-1 font-semibold leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-4 border-t border-dashed border-border-default">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-muted">
              Profile Customizations
            </h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 cursor-pointer group">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-text-primary">
                    Show city on leaderboard
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 font-semibold">
                    Displays your city next to your name on ranks.
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="showCityOnLeaderboard"
                  checked={formData.showCityOnLeaderboard}
                  onChange={handleToggleChange}
                  className="w-4 h-4 accent-accent-primary"
                />
              </label>

              <label className="flex items-center justify-between gap-3 cursor-pointer group">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-text-primary">
                    Show CO₂e saved publicly
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 font-semibold">
                    Allows other users to see your lifetime carbon offsets.
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="showCo2eSavedPublicly"
                  checked={formData.showCo2eSavedPublicly}
                  onChange={handleToggleChange}
                  className="w-4 h-4 accent-accent-primary"
                />
              </label>

              <label className="flex items-center justify-between gap-3 cursor-pointer group">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-text-primary">
                    Show streak publicly
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 font-semibold">
                    Displays your logging streak publicly on profiles.
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="showStreakPublicly"
                  checked={formData.showStreakPublicly}
                  onChange={handleToggleChange}
                  className="w-4 h-4 accent-accent-primary"
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
                  Saving
                </>
              ) : (
                <>
                  <Icons.Save className="mr-2 h-4 w-4" />
                  Save Privacy
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
