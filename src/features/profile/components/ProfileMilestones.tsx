import React from 'react';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';

interface Milestone {
  id: string;
  key: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  xpReward: number;
  progress: number;
  unlockedAt: string | null;
}

interface ProfileMilestonesProps {
  milestones: Milestone[];
}

export default function ProfileMilestones({ milestones }: ProfileMilestonesProps) {
  const unlocked = milestones.filter((m) => m.unlockedAt !== null);
  const inProgress = milestones.filter((m) => m.unlockedAt === null);

  const formatValue = (val: number, key: string) => {
    if (key.includes('CO2E') || key.includes('saved')) return `${val.toFixed(0)} kg CO₂e`;
    return `${val} logs`;
  };

  return (
    <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm overflow-hidden animate-fade-in">
      <div className="border-b border-border-subtle px-5 py-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
          <Icons.Milestone className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-text-primary">
            Milestones
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Your achievements and habit-building landmarks.
          </p>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Next Landmarks (In Progress) */}
        {inProgress.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted">
              Next Landmarks
            </h4>
            <div className="space-y-2.5">
              {inProgress.slice(0, 2).map((m) => {
                const percent = Math.min(100, Math.round((m.progress / m.targetValue) * 100));
                return (
                  <div
                    key={m.id}
                    className="rounded-xl border border-border-default bg-bg-base/30 p-3 space-y-2"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-extrabold text-xs text-text-primary">
                          {m.title}
                        </p>
                        <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                          {m.description}
                        </p>
                      </div>
                      <span className="shrink-0 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-black text-indigo-700 leading-none">
                        +{m.xpReward} XP
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-text-secondary">
                        <span>Progress</span>
                        <span>
                          {formatValue(m.progress, m.key)} / {formatValue(m.targetValue, m.key)} ({percent}%)
                        </span>
                      </div>
                      <div className="h-1 w-full bg-bg-surface border border-border-subtle rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recently Unlocked */}
        {unlocked.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-dashed border-border-default">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted">
              Recently Unlocked
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {unlocked.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-amber-200 bg-amber-50/20 p-3 flex items-start gap-2.5"
                >
                  <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 border border-amber-200/50">
                    <Icons.Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-text-primary leading-none truncate">
                      {m.title}
                    </p>
                    <p className="text-[9px] text-text-muted mt-1 font-semibold truncate leading-none">
                      Unlocked! (+{m.xpReward} XP)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {milestones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-xs text-text-secondary">
              Milestones will appear as you build consistent low-carbon habits.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
