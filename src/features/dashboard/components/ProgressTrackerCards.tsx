'use client';

import { ArrowRight, Flame, Layers3, Target, Trophy } from 'lucide-react';

import type { ComponentType } from 'react';

import Link from 'next/link';

import { cn } from '@/src/lib/utils';
import type { DashboardData } from '@/src/server/dashboard/dashboard.service';

function calculateBudgetUsedPercent(monthlyBudgetKg: number, remainingBudgetKg: number) {
  if (!monthlyBudgetKg || monthlyBudgetKg <= 0) return 0;

  const used = Math.max(0, monthlyBudgetKg - remainingBudgetKg);

  return Math.min(100, Math.round((used / monthlyBudgetKg) * 100));
}

function calculateCarbonScore(data: DashboardData) {
  const budgetUsedPercent = calculateBudgetUsedPercent(
    data.summary.monthlyBudgetKg,
    data.summary.remainingBudgetKg,
  );

  const hasActivity =
    data.summary.todayKg > 0 || data.summary.weekKg > 0 || data.summary.monthKg > 0;

  if (!hasActivity) return 72;

  if (budgetUsedPercent <= 30) return 88;
  if (budgetUsedPercent <= 50) return 78;
  if (budgetUsedPercent <= 75) return 66;
  if (budgetUsedPercent <= 90) return 54;

  return 42;
}

type ProgressTone = 'emerald' | 'amber';

type ProgressItem = {
  title: string;
  value: string;
  unit: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tone: ProgressTone;
  progress: number;
  showTrophy?: boolean;
};

function getStreakData(data: DashboardData) {
  if (data.streak) return data.streak;

  const recentDays = data.trend.slice(-7);
  const loggedToday = recentDays.at(-1)?.isToday === true && recentDays.at(-1)!.co2eKg > 0;
  let currentDays = 0;

  for (let index = recentDays.length - (loggedToday ? 1 : 2); index >= 0; index -= 1) {
    if (recentDays[index]!.co2eKg <= 0) break;
    currentDays += 1;
  }

  if (loggedToday) currentDays += 1;

  return {
    currentDays,
    loggedToday,
    lastSevenDays: recentDays.map((day) => ({
      date: day.date,
      label: new Date(`${day.date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'narrow',
      }),
      active: day.co2eKg > 0,
      isToday: day.isToday,
    })),
  };
}

export default function ProgressTrackerCards({ data }: { data: DashboardData }) {
  const score = calculateCarbonScore(data);
  const streak = getStreakData(data);
  const currentMissions = data.currentMissions ?? [];

  const streakDays = streak.currentDays;
  const level = Math.max(1, Math.min(10, Math.floor(score / 12)));
  const levelProgress = Math.min(100, Math.max(12, score));
  const activeMissions = currentMissions.length;

  const trackerItems: ProgressItem[] = [
    {
      title: 'Level',
      value: `Level ${level}`,
      unit: '',
      description: 'Your level grows as you log, learn, and reduce your impact.',
      icon: Layers3,
      tone: 'emerald',
      progress: levelProgress,
    },
    {
      title: 'Current missions',
      value: `${activeMissions}`,
      unit: 'active',
      description:
        activeMissions > 0
          ? currentMissions.map((mission) => mission.title).join(' · ')
          : 'No active missions. Choose a challenge to start improving one habit.',
      icon: Target,
      tone: 'emerald',
      progress: activeMissions > 0 ? Math.min(100, activeMissions * 20) : 0,
      showTrophy: true,
    },
    {
      title: 'Streak',
      value: `${streakDays}`,
      unit: streakDays === 1 ? 'day' : 'days',
      description:
        streakDays > 0
          ? streak.loggedToday
            ? 'Today is secured. Come back tomorrow to keep the flame alive.'
            : 'Log one activity today to keep your streak alive.'
          : 'Log your first activity today to light your streak.',
      icon: Flame,
      tone: 'amber',
      progress: Math.min(100, streakDays * 14),
    },
  ];

  const toneClasses: Record<
    ProgressTone,
    {
      icon: string;
      glow: string;
      progress: string;
    }
  > = {
    emerald: {
      icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      glow: 'bg-emerald-500/10',
      progress: 'bg-emerald-600',
    },
    amber: {
      icon: 'bg-amber-50 text-amber-700 ring-amber-100',
      glow: 'bg-amber-500/10',
      progress: 'bg-amber-500',
    },
  };

  return (
    <section className="space-y-4" aria-labelledby="progress-tracker-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
            Progress Tracker
          </p>

          <h2
            id="progress-tracker-heading"
            className="text-2xl font-black tracking-tight text-text-primary"
          >
            Your habit-building progress
          </h2>

          <p className="max-w-2xl text-sm leading-6 text-text-secondary">
            A lightweight progress layer that keeps you engaged without turning climate action into
            a childish game.
          </p>
        </div>

        <Link
          href="/challenges"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border-default bg-bg-surface px-4 py-2 text-sm font-bold text-text-primary shadow-sm transition-colors hover:bg-bg-elevated"
        >
          View challenges
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {trackerItems.map((item) => {
          const Icon = item.icon;
          const colors = toneClasses[item.tone];

          return (
            <article
              key={item.title}
              className="group relative overflow-hidden rounded-3xl border border-border-default bg-bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={cn(
                  'absolute right-0 top-0 h-24 w-24 rounded-full blur-2xl',
                  colors.glow,
                )}
              />

              <div className="relative flex min-h-[210px] flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-2xl ring-1',
                      colors.icon,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {item.showTrophy && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <Trophy className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {item.title === 'Streak' ? (
                  <div className="mt-5 flex flex-1 flex-col">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-amber-700">Current streak</p>
                        <div className="mt-1 flex items-end gap-2">
                          <span className="text-4xl font-black tracking-tight text-text-primary">
                            {streakDays}
                          </span>
                          <span className="pb-1 text-sm font-black text-text-secondary">
                            {streakDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'flex h-16 w-16 items-center justify-center rounded-[22px] shadow-sm',
                          streakDays > 0
                            ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-orange-500/20'
                            : 'bg-bg-elevated text-text-muted',
                        )}
                      >
                        <Flame className={cn('h-8 w-8', streakDays > 0 && 'fill-current')} />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-7 gap-1.5">
                      {streak.lastSevenDays.map((day) => (
                        <div
                          key={day.date}
                          className="flex flex-col items-center gap-1.5"
                          title={`${day.date}: ${day.active ? 'activity logged' : 'no activity logged'}`}
                        >
                          <span
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black transition-colors',
                              day.active
                                ? 'border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                                : 'border-border-default bg-bg-elevated text-text-muted',
                              day.isToday &&
                              'ring-2 ring-amber-300 ring-offset-2 ring-offset-bg-surface',
                            )}
                            aria-label={`${day.date}: ${day.active ? 'activity logged' : 'no activity logged'}`}
                          >
                            {day.active ? <Flame className="h-4 w-4 fill-current" /> : '·'}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase text-text-muted',
                              day.isToday && 'text-amber-700',
                            )}
                          >
                            {day.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 text-sm leading-5 text-text-secondary">{item.description}</p>
                  </div>
                ) : (
                  <div className="mt-5 flex-1">
                    <p className="text-sm font-bold text-text-secondary">{item.title}</p>

                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-3xl font-black tracking-tight text-text-primary">
                        {item.value}
                      </span>

                      {item.unit && (
                        <span className="pb-1 text-xs font-bold text-text-secondary">
                          {item.unit}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg-elevated">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          colors.progress,
                        )}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <p className="mt-3 text-sm leading-6 text-text-secondary">{item.description}</p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
