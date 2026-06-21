/* eslint-disable react-hooks/purity */
import React from 'react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import ProfileSummaryCards from './ProfileSummaryCards';
import ProfileCategoryBreakdown from './ProfileCategoryBreakdown';
import ProfileXpProgress from './ProfileXpProgress';
import ProfileMilestones from './ProfileMilestones';
import ProfileRecentActivity from './ProfileRecentActivity';
import { Card, CardContent } from '@/src/components/ui/card';

interface Goal {
  id: string;
  title: string;
  category: string;
  targetValue: number;
  currentValue: number;
  endsAt: string;
}

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

interface RecentActivity {
  id: string;
  category: string;
  subType: string;
  co2eKg: number;
  occurredAt: string;
}

interface SummaryTabProps {
  summary: {
    weeklyCo2eKg: number;
    monthlyCo2eKg: number;
    totalCo2eSavedKg: number;
    bestCategory: string;
    categoryBreakdown: {
      category: string;
      co2eKg: number;
    }[];
  };
  gamification: {
    level: number;
    totalXp: number;
    weeklyXp: number;
    currentStreak: number;
    longestStreak: number;
  };
  goals: Goal[];
  milestones: Milestone[];
  recentActivities: RecentActivity[];
}

export default function SummaryTab({
  summary,
  gamification,
  goals,
  milestones,
  recentActivities,
}: SummaryTabProps) {
  const getDaysLeft = (endsAtStr: string) => {
    const endsAt = new Date(endsAtStr);
    const diff = endsAt.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getGoalProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Cards Grid */}
      <ProfileSummaryCards
        weeklyCo2eKg={summary.weeklyCo2eKg}
        monthlyCo2eKg={summary.monthlyCo2eKg}
        totalCo2eSavedKg={summary.totalCo2eSavedKg}
        bestCategory={summary.bestCategory}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Breakdown and History */}
        <div className="space-y-6">
          <ProfileCategoryBreakdown data={summary.categoryBreakdown} />
          <ProfileRecentActivity activities={recentActivities} />
        </div>

        {/* Right Column: Gamification, Goals, Milestones */}
        <div className="space-y-6">
          <ProfileXpProgress
            level={gamification.level}
            totalXp={gamification.totalXp}
            weeklyXp={gamification.weeklyXp}
            currentStreak={gamification.currentStreak}
            longestStreak={gamification.longestStreak}
          />

          {/* Active Goals Card */}
          <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm overflow-hidden animate-fade-in">
            <div className="border-b border-border-subtle px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Icons.Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-text-primary">
                    Active Goals
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Your current carbon reduction target pledges.
                  </p>
                </div>
              </div>
              <Link
                href="/challenges"
                className="text-xs font-black text-accent-primary hover:underline"
              >
                View All Goals
              </Link>
            </div>

            <CardContent className="p-5">
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.map((g) => {
                    const percent = getGoalProgress(g.currentValue, g.targetValue);
                    const daysLeft = getDaysLeft(g.endsAt);

                    return (
                      <div
                        key={g.id}
                        className="rounded-xl border border-border-default bg-bg-base/30 p-3.5 space-y-2.5"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="font-extrabold text-xs text-text-primary leading-snug">
                            {g.title}
                          </h4>
                          <span className="shrink-0 rounded-full bg-bg-surface border border-border-default px-2 py-0.5 text-[9px] font-black text-text-secondary leading-none">
                            {daysLeft} days left
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-semibold text-text-secondary">
                            <span>Goal progress</span>
                            <span>
                              {g.currentValue.toFixed(1)} / {g.targetValue} kg ({percent}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-bg-surface border border-border-subtle rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                  <Icons.Compass className="w-8 h-8 text-text-muted animate-pulse" />
                  <div>
                    <p className="text-sm font-black text-text-primary">No active goals set</p>
                    <p className="text-xs text-text-secondary max-w-xs mt-1 leading-normal font-semibold">
                      Set habit goals on the Challenges tab to begin tracking milestones.
                    </p>
                  </div>
                  <Link
                    href="/challenges"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-accent-primary text-white text-xs font-black px-4 py-2 hover:bg-accent-primary/95 transition-colors cursor-pointer mt-1"
                  >
                    Set a Goal
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <ProfileMilestones milestones={milestones} />
        </div>
      </div>
    </div>
  );
}
