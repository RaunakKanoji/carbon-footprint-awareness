import React from 'react';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';

interface ProfileXpProgressProps {
  level: number;
  totalXp: number;
  weeklyXp: number;
  currentStreak: number;
  longestStreak: number;
}

const LEVEL_TABLE = [
  { level: 1, requiredXp: 0 },
  { level: 2, requiredXp: 250 },
  { level: 3, requiredXp: 600 },
  { level: 4, requiredXp: 1000 },
  { level: 5, requiredXp: 1600 },
  { level: 6, requiredXp: 2400 },
  { level: 7, requiredXp: 3400 },
  { level: 8, requiredXp: 4800 },
  { level: 9, requiredXp: 6500 },
  { level: 10, requiredXp: 8500 },
];

export default function ProfileXpProgress({
  level,
  totalXp,
  weeklyXp,
  currentStreak,
  longestStreak,
}: ProfileXpProgressProps) {
  // Find current level progress
  const currentEntry = LEVEL_TABLE.find(e => e.level === level) || LEVEL_TABLE[0]!;
  const nextEntry = LEVEL_TABLE.find(e => e.level === level + 1);

  let progressPercent = 100;
  let pointsToNextLevel = 0;

  if (nextEntry) {
    const range = nextEntry.requiredXp - currentEntry.requiredXp;
    const progress = totalXp - currentEntry.requiredXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
    pointsToNextLevel = nextEntry.requiredXp - totalXp;
  }

  const getLevelTitle = (lvl: number) => {
    if (lvl >= 6) return 'Carbon Sage';
    if (lvl >= 4) return 'Carbon Master';
    if (lvl === 3) return 'Eco Warrior';
    if (lvl === 2) return 'Green Scout';
    return 'Eco Recruit';
  };

  return (
    <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm overflow-hidden animate-fade-in">
      <div className="border-b border-border-subtle px-5 py-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
          <Icons.Award className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-text-primary">
            XP & Level Progress
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Your standing and gamification progress summary.
          </p>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Icons.Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-text-primary">
                Level {level}: {getLevelTitle(level)}
              </h4>
              <p className="text-[10px] font-black uppercase tracking-wider text-text-muted mt-0.5">
                {getLevelTitle(level)} Badge Unlocked
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-emerald-600">{totalXp} XP</span>
            <p className="text-[10px] font-black uppercase tracking-wider text-text-muted mt-0.5">
              Total Points
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {nextEntry && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-text-secondary">Next Level: Level {level + 1}</span>
              <span className="text-text-primary font-bold">
                {totalXp - currentEntry.requiredXp} / {nextEntry.requiredXp - currentEntry.requiredXp} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-bg-base border border-border-subtle rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-primary transition-[width] duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-text-secondary font-semibold">
              {pointsToNextLevel} XP needed to unlock Level {level + 1}.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-dashed border-border-default">
          <div className="bg-bg-base/40 border border-border-subtle rounded-xl p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Weekly XP</p>
            <p className="text-base font-black text-text-primary mt-1">+{weeklyXp}</p>
          </div>

          <div className="bg-bg-base/40 border border-border-subtle rounded-xl p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Streak</p>
            <p className="text-base font-black text-text-primary mt-1">{currentStreak}d</p>
          </div>

          <div className="bg-bg-base/40 border border-border-subtle rounded-xl p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Best Streak</p>
            <p className="text-base font-black text-text-primary mt-1">{longestStreak}d</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
