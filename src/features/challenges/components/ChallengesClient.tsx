'use client';

import {
  Award,
  CheckCircle2,
  Flame,
  Loader2,
  Target,
  Sparkles,
  Leaf,
  Bike,
  TrendingDown,
  Lock,
  Utensils,
  Zap,
  ShoppingBag,
  Trash2,
  Check
} from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { Button, buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { useToast } from '@/src/components/ui/toast-provider';
import Icon from '@/src/components/Icon';
import { iconMap } from '@/src/lib/icons';
import { routes } from '@/src/config/routes';
import {
  ActivityLogLite,
  LEVELS,
  getStreakStats,
  getWeeklyFootprintStats,
  getWeeklyMissions,
  getBadges,
  getLevelInfo,
  calculateUserXp,
} from '../utils/gamification';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  startedAt?: string;
  completedAt?: string | null;
  points: number;
  icon: keyof typeof iconMap;
  badgeName: string;
  progress?: {
    current: number;
    target: number;
    percent: number;
  };
}

interface Template {
  key: string;
  title: string;
  description: string;
  category: string;
  targetCount: number;
  points: number;
  icon: keyof typeof iconMap;
  badgeName: string;
}

interface ChallengesClientProps {
  initialActive: Challenge[];
  initialCompleted: Challenge[];
  initialAvailable: Template[];
  activityLogs: ActivityLogLite[];
}


function ProgressBar({ percent }: { percent: number }) {
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
      <div
        className="h-full rounded-full bg-accent-primary transition-[width] duration-500"
        style={{ width: `${safePercent}%` }}
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-border-default bg-bg-surface px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-elevated text-text-muted">
        <Icon icon={icon} className="h-6 w-6" />
      </div>

      <h3 className="mt-4 font-black text-text-primary">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

function IconBubble({
  icon,
  tone = 'emerald',
}: {
  icon: keyof typeof iconMap;
  tone?: 'emerald' | 'amber' | 'indigo' | 'neutral';
}) {
  const toneClassName =
    tone === 'amber'
      ? 'bg-amber-50 text-amber-700 ring-amber-100'
      : tone === 'indigo'
        ? 'bg-indigo-50 text-indigo-700 ring-indigo-100'
        : tone === 'neutral'
          ? 'bg-bg-elevated text-text-secondary ring-border-subtle'
          : 'bg-emerald-50 text-emerald-700 ring-emerald-100';

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${toneClassName}`}>
      <Icon icon={icon} className="h-5 w-5" />
    </div>
  );
}

export default function ChallengesClient({
  initialActive,
  initialCompleted,
  initialAvailable,
  activityLogs,
}: ChallengesClientProps) {
  const { toast } = useToast();

  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>(initialActive);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>(initialCompleted);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>(initialAvailable);
  const [isLoading, setIsLoading] = useState(false);
  const [celebrationChallenge, setCelebrationChallenge] = useState<Challenge | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isMounted || completedChallenges.length === 0) return;

    try {
      const storedIds = localStorage.getItem('eco_completed_challenges');
      const completedIds: string[] = storedIds ? JSON.parse(storedIds) : [];

      const newlyCompleted = completedChallenges.find((challenge) => {
        return !completedIds.includes(challenge.id);
      });

      if (newlyCompleted) {
        window.setTimeout(() => setCelebrationChallenge(newlyCompleted), 0);
      }

      localStorage.setItem(
        'eco_completed_challenges',
        JSON.stringify(completedChallenges.map((challenge) => challenge.id)),
      );
    } catch {
      localStorage.setItem(
        'eco_completed_challenges',
        JSON.stringify(completedChallenges.map((challenge) => challenge.id)),
      );
    }
  }, [completedChallenges, isMounted]);

  // Compute live gamification state
  const streakStats = useMemo(() => getStreakStats(activityLogs), [activityLogs]);
  const weeklyStats = useMemo(() => getWeeklyFootprintStats(activityLogs), [activityLogs]);
  const weeklyMissions = useMemo(() => getWeeklyMissions(activityLogs), [activityLogs]);
  const completedMissionsCount = useMemo(() => weeklyMissions.filter((m) => m.completed).length, [weeklyMissions]);

  const totalXp = useMemo(() => {
    const completedChallengesPoints = completedChallenges.reduce((sum, challenge) => sum + challenge.points, 0);
    return calculateUserXp(
      activityLogs,
      completedMissionsCount,
      completedChallengesPoints,
      streakStats.currentStreak,
      weeklyStats.reductionPercent
    );
  }, [activityLogs, completedMissionsCount, completedChallenges, streakStats.currentStreak, weeklyStats.reductionPercent]);

  const levelInfo = useMemo(() => getLevelInfo(totalXp), [totalXp]);

  const badges = useMemo(() => {
    return getBadges(activityLogs, streakStats.currentStreak, streakStats.bestStreak, weeklyStats.reductionPercent);
  }, [activityLogs, streakStats, weeklyStats]);

  const unlockedBadgesCount = useMemo(() => badges.filter((b) => b.unlocked).length, [badges]);

  const sortedLeaderboard = useMemo(() => {
    const currentUserRow = {
      name: 'You',
      level: levelInfo.currentLevel,
      weeklyReductionPercent: weeklyStats.reductionPercent,
      completedMissions: completedMissionsCount,
      isCurrentUser: true,
    };

    const allUsers = [
      { name: 'Aarav', level: 5, weeklyReductionPercent: 18, completedMissions: 5, isCurrentUser: false },
      { name: 'Mira', level: 4, weeklyReductionPercent: 14, completedMissions: 4, isCurrentUser: false },
      { name: 'Riya', level: 3, weeklyReductionPercent: 8, completedMissions: 2, isCurrentUser: false },
      { name: 'Kabir', level: 2, weeklyReductionPercent: 5, completedMissions: 2, isCurrentUser: false },
      currentUserRow,
    ];

    return allUsers
      .sort((a, b) => {
        if (b.weeklyReductionPercent !== a.weeklyReductionPercent) {
          return b.weeklyReductionPercent - a.weeklyReductionPercent;
        }
        return b.completedMissions - a.completedMissions;
      })
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
  }, [levelInfo.currentLevel, weeklyStats.reductionPercent, completedMissionsCount]);

  function formatDate(dateStr?: string | null) {
    if (!isMounted || !dateStr) return '—';

    return new Date(dateStr).toLocaleDateString();
  }


  async function refreshChallenges() {
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();

      if (data.success) {
        setActiveChallenges(data.activeChallenges);
        setCompletedChallenges(data.completedChallenges);
        setAvailableTemplates(data.availableTemplates);
      }
    } catch {
      toast({
        title: 'Could not refresh challenges',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    }
  }

  async function handleJoinChallenge(templateKey: string) {
    setIsLoading(true);

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey }),
      });

      const data = await res.json();

      if (data.success) {
        await refreshChallenges();

        toast({
          title: 'Challenge started',
          description: 'Your new mission is now active.',
        });
      } else {
        toast({
          title: 'Could not join challenge',
          description: data.error || 'Failed to join challenge.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Could not join challenge',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAbandonChallenge(challengeId: string) {
    const confirmed = window.confirm(
      'Abandon this challenge? Your logged activities will stay, but this mission progress will be removed.',
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, action: 'abandon' }),
      });

      const data = await res.json();

      if (data.success) {
        await refreshChallenges();

        toast({
          title: 'Challenge abandoned',
          description: 'You can join another mission whenever you are ready.',
        });
      } else {
        toast({
          title: 'Could not abandon challenge',
          description: data.error || 'Failed to abandon challenge.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Could not abandon challenge',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Helper to render dynamic icons for badges
  function getBadgeIcon(iconName: string, className?: string) {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Leaf':
        return <Leaf className={className} />;
      case 'Bike':
        return <Bike className={className} />;
      case 'TrendingDown':
        return <TrendingDown className={className} />;
      default:
        return <Award className={className} />;
    }
  }

  // Helper to render dynamic category icons for weekly missions
  function getMissionCategoryIcon(category: string, className?: string) {
    switch (category.toLowerCase()) {
      case 'food':
        return <Utensils className={className} />;
      case 'transport':
        return <Bike className={className} />;
      case 'energy':
        return <Zap className={className} />;
      case 'shopping':
        return <ShoppingBag className={className} />;
      case 'waste':
        return <Trash2 className={className} />;
      default:
        return <Target className={className} />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Grid: Level Progress Card & Streak Card */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Level Progress Card */}
        <Card className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm flex flex-col justify-between">
          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                    Level progress
                  </p>
                  <h3 className="mt-2 text-xl font-black text-text-primary leading-tight">
                    {levelInfo.currentTitle}
                  </h3>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 shrink-0">
                  Level {levelInfo.currentLevel}
                </span>
              </div>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                {LEVELS.find((l) => l.level === levelInfo.currentLevel)?.description || ''}
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-end text-xs font-bold">
                <span className="text-text-secondary">{levelInfo.currentXp} XP total</span>
                {levelInfo.pointsToNextLevel > 0 ? (
                  <span className="text-text-primary">{levelInfo.pointsToNextLevel} XP to Level {levelInfo.currentLevel + 1}</span>
                ) : (
                  <span className="text-emerald-700 font-black">Max Level Reached</span>
                )}
              </div>

              <ProgressBar percent={levelInfo.progressPercent} />
              
              <p className="text-[10px] text-text-muted">
                {levelInfo.progressPercent}% of progress complete toward the next milestone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="rounded-3xl border border-border-default bg-bg-surface shadow-sm flex flex-col justify-between">
          <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                    Current streak
                  </p>
                  <h3 className="mt-2 text-xl font-black text-text-primary leading-tight">
                    {streakStats.currentStreak} {streakStats.currentStreak === 1 ? 'Day' : 'Days'}
                  </h3>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl shrink-0 ring-1 ${
                  streakStats.loggedToday
                    ? 'bg-amber-50 text-amber-600 ring-amber-100'
                    : 'bg-bg-elevated text-text-muted ring-border-subtle'
                }`}>
                  <Flame className={`h-5 w-5 ${streakStats.loggedToday ? 'fill-amber-500 animate-pulse' : ''}`} />
                </div>
              </div>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                {streakStats.loggedToday
                  ? "You logged today. Consistency builds sustainable habits."
                  : "Log today to maintain your logging streak."}
              </p>
            </div>

            {/* Weekly Calendar Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-1 rounded-2xl border border-border-subtle bg-bg-elevated/40 p-2.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
                  const isLogged = streakStats.weekCalendar[idx];
                  return (
                    <div key={dayName} className="flex flex-col items-center gap-1.5 flex-1">
                      <span className="text-[9px] font-bold text-text-secondary uppercase">{dayName}</span>
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300 ${
                          isLogged
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm'
                            : 'bg-bg-surface text-text-muted border border-border-subtle'
                        }`}
                      >
                        {isLogged ? (
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        ) : (
                          <span className="text-[10px] font-bold">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-text-muted text-center leading-normal">
                &quot;One useful log per day is enough.&quot; Best streak: <span className="font-bold text-text-primary">{streakStats.bestStreak} days</span>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Weekly Missions */}
      <section className="rounded-3xl border border-border-default bg-bg-surface p-5 shadow-sm space-y-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                Weekly missions
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-text-primary">
                Habit-building habits
              </h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50/50 px-3 py-1 text-xs font-black text-emerald-700">
              {completedMissionsCount} / 5 completed
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-secondary">
            Missions reset every Monday. Earn +50 XP for each carbon-aware behavior logged this week.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {weeklyMissions.map((mission) => {
            return (
              <Card key={mission.id} className="overflow-hidden rounded-[20px] border border-border-default bg-bg-surface flex flex-col justify-between">
                <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ring-1 ${
                        mission.completed
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                          : 'bg-bg-elevated text-text-secondary ring-border-subtle'
                      }`}>
                        {getMissionCategoryIcon(mission.category, "h-4.5 w-4.5")}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider uppercase ${
                        mission.completed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        +{mission.xpReward} XP
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-text-muted">
                          {mission.category}
                        </span>
                        {mission.completed && (
                          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 text-white text-[8px] font-black">
                            ✓
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-sm text-text-primary mt-0.5 leading-snug">
                        {mission.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-text-secondary leading-normal">
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary">
                      <span>Progress</span>
                      <span>{mission.current} / {mission.target} {mission.unit}</span>
                    </div>
                    <ProgressBar percent={mission.completed ? 100 : (mission.current / mission.target) * 100} />
                    
                    {mission.completed ? (
                      <div className="flex items-center justify-center gap-1.5 w-full h-8 text-[11px] font-black text-emerald-700 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Completed
                      </div>
                    ) : (
                      <Link
                        href={routes.log}
                        className={cn(
                          buttonVariants({ variant: 'outline', size: 'sm' }),
                          "h-8 w-full text-[11px] font-black rounded-lg border-border-default hover:bg-bg-elevated hover:text-text-primary flex items-center justify-center"
                        )}
                      >
                        Log activity
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Bottom Grid: Badges & Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Milestone Badges */}
        <section className="lg:col-span-2 rounded-3xl border border-border-default bg-bg-surface p-5 shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                  Badges earned
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-text-primary">
                  Milestones
                </h2>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50/50 px-3 py-1 text-xs font-black text-amber-700">
                {unlockedBadgesCount} / 5 unlocked
              </span>
            </div>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-text-secondary">
              Unlock unique carbon medals by tracking consistently and reducing your lifestyle impact.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {badges.map((badge) => {
              return (
                <Card key={badge.id} className={`overflow-hidden rounded-[20px] border transition-all duration-300 ${
                  badge.unlocked
                    ? 'border-amber-200 bg-amber-50/5 shadow-xs'
                    : 'border-border-subtle bg-bg-surface/50 opacity-60'
                }`}>
                  <CardContent className="p-4 flex gap-3.5 items-start">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shrink-0 ring-1 shadow-xs ${
                      badge.unlocked
                        ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white ring-amber-300'
                        : 'bg-bg-elevated text-text-muted ring-border-subtle'
                    }`}>
                      {badge.unlocked ? (
                        getBadgeIcon(badge.icon, "h-5 w-5 fill-white/20")
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-text-primary leading-tight">
                          {badge.title}
                        </h4>
                        {badge.unlocked ? (
                          <span className="rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[8px] font-black px-1.5 py-0.5 tracking-wider uppercase">
                            Unlocked
                          </span>
                        ) : (
                          <span className="rounded-full bg-bg-elevated border border-border-subtle text-text-muted text-[8px] font-black px-1.5 py-0.5 tracking-wider uppercase">
                            Locked
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-text-secondary leading-normal">
                        {badge.description}
                      </p>
                      <p className="mt-2 text-[10px] text-text-muted leading-tight">
                        <span className="font-bold">Goal:</span> {badge.unlockCondition}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Community Leaderboard */}
        <section className="lg:col-span-1 rounded-3xl border border-border-default bg-bg-surface overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-border-subtle px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                Community progress
              </p>
              <h2 className="mt-1 text-lg font-black tracking-tight text-text-primary">
                Weekly Leaderboard
              </h2>
              <p className="mt-1 text-[11px] text-text-muted leading-normal">
                Ranked by weekly footprint reduction and completed missions.
              </p>
            </div>

            <div className="divide-y divide-border-subtle">
              {sortedLeaderboard.map((user) => {
                return (
                  <div
                    key={user.name}
                    className={`flex items-center justify-between px-4 py-3 text-xs transition-colors duration-200 ${
                      user.isCurrentUser
                        ? 'bg-emerald-50/45 border-l-4 border-l-emerald-500 font-bold'
                        : 'hover:bg-bg-elevated/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                        user.rank === 1
                          ? 'bg-amber-100 text-amber-800'
                          : user.rank === 2
                            ? 'bg-slate-100 text-slate-800'
                            : 'text-text-muted'
                      }`}>
                        {user.rank}
                      </span>
                      <div className="min-w-0">
                        <span className={`block truncate ${user.isCurrentUser ? 'text-emerald-950 font-black' : 'text-text-primary'}`}>
                          {user.name} {user.isCurrentUser && ' (You)'}
                        </span>
                        <span className="text-[10px] text-text-muted block mt-0.5">
                          Level {user.level}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block font-black text-text-primary">
                        -{user.weeklyReductionPercent}% CO₂e
                      </span>
                      <span className="text-[9px] text-text-muted block mt-0.5">
                        {user.completedMissions} / 5 missions
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="px-4 py-3 bg-bg-elevated/20 border-t border-border-subtle text-center">
            <p className="text-[10px] text-text-muted italic">
              Small actions compound over time. Keep reducing!
            </p>
          </div>
        </section>
      </div>

      {/* Campaigns & Pledges (Existing Database template challenges) */}
      <section className="rounded-3xl border border-border-default bg-bg-surface shadow-sm overflow-hidden">
        <div className="border-b border-border-subtle px-5 py-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
            Focused campaigns
          </p>

          <h2 className="mt-1 text-xl font-black tracking-tight text-text-primary">
            Pledge custom lifestyle goals
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-secondary">
            Join a multi-day focus campaign to build dedicated carbon reduction habits and earn high XP milestones.
          </p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <div className="border-b border-border-subtle px-5 py-4">
            <TabsList className="h-auto rounded-2xl border border-border-subtle bg-bg-elevated/60 p-1">
              <TabsTrigger value="active" className="rounded-xl px-4 py-2 text-xs font-black">
                Active {activeChallenges.length}
              </TabsTrigger>

              <TabsTrigger value="available" className="rounded-xl px-4 py-2 text-xs font-black">
                Discover {availableTemplates.length}
              </TabsTrigger>

              <TabsTrigger value="completed" className="rounded-xl px-4 py-2 text-xs font-black">
                Achievements {completedChallenges.length}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="m-0 p-5 outline-none">
            {activeChallenges.length === 0 ? (
              <EmptyState
                icon="leaf"
                title="No active challenges"
                description="Join a challenge from Discover to start a focused carbon-reduction mission."
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {activeChallenges.map((challenge) => {
                  const progress = challenge.progress || {
                    current: 0,
                    target: 10,
                    percent: 0,
                  };

                  return (
                    <Card
                      key={challenge.id}
                      className="overflow-hidden rounded-[22px] border border-border-default bg-bg-surface shadow-sm"
                    >
                      <CardContent className="p-0">
                        <div className="flex items-start justify-between gap-4 border-b border-border-subtle p-4">
                          <div className="flex min-w-0 gap-3">
                            <IconBubble icon={challenge.icon} />

                            <div className="min-w-0">
                              <h3 className="font-black leading-6 text-text-primary">
                                {challenge.title}
                              </h3>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {challenge.category && (
                                  <span className="rounded-full border border-border-subtle bg-bg-elevated px-2.5 py-1 text-xs font-bold text-text-secondary">
                                    {challenge.category}
                                  </span>
                                )}

                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                                  +{challenge.points} XP
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isLoading}
                            onClick={() => handleAbandonChallenge(challenge.id)}
                            className="h-8 shrink-0 rounded-full px-3 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            Abandon
                          </Button>
                        </div>

                        <div className="space-y-4 p-4">
                          <p className="text-sm leading-6 text-text-secondary">
                            {challenge.description}
                          </p>

                          <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4">
                            <div className="mb-2 flex justify-between gap-3 text-xs font-black">
                              <span className="text-text-secondary">Progress</span>
                              <span className="text-text-primary">
                                {progress.current} / {progress.target} logs · {progress.percent}%
                              </span>
                            </div>

                            <ProgressBar percent={progress.percent} />

                            <p className="mt-3 text-xs font-medium text-text-secondary">
                              Started {formatDate(challenge.startedAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="m-0 p-5 outline-none">
            {availableTemplates.length === 0 ? (
              <EmptyState
                icon="tree"
                title="No more challenges available"
                description="You have already joined or completed every available mission."
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {availableTemplates.map((template) => (
                  <Card
                    key={template.key}
                    className="overflow-hidden rounded-[22px] border border-border-default bg-bg-surface shadow-sm"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between gap-4 border-b border-border-subtle p-4">
                        <div className="flex min-w-0 gap-3">
                          <IconBubble icon={template.icon} tone="neutral" />

                          <div className="min-w-0">
                            <h3 className="font-black leading-6 text-text-primary">
                              {template.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full border border-border-subtle bg-bg-elevated px-2.5 py-1 text-xs font-bold text-text-secondary">
                                {template.category}
                              </span>

                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                                +{template.points} XP
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 p-4">
                        <p className="text-sm leading-6 text-text-secondary">
                          {template.description}
                        </p>

                        <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4 text-sm leading-6 text-text-secondary">
                          Goal: log matching activity{' '}
                          <span className="font-black text-text-primary">
                            {template.targetCount} times
                          </span>{' '}
                          after joining.
                        </div>

                        <Button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleJoinChallenge(template.key)}
                          className="h-10 w-full rounded-xl text-sm font-black"
                        >
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Join challenge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="m-0 p-5 outline-none">
            {completedChallenges.length === 0 ? (
              <EmptyState
                icon="tree"
                title="No achievements yet"
                description="Completed challenges will appear here as achievement badges."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {completedChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="overflow-hidden rounded-[22px] border border-amber-200 bg-bg-surface shadow-sm"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <IconBubble icon={challenge.icon} tone="amber" />

                          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white ring-2 ring-bg-surface">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-black leading-6 text-text-primary">
                            {challenge.title}
                          </h3>

                          <p className="mt-1 text-sm font-bold text-amber-700">
                            {challenge.badgeName}
                          </p>

                          <p className="mt-3 text-xs font-medium text-text-secondary">
                            Completed {formatDate(challenge.completedAt)}
                          </p>

                          <p className="mt-1 text-xs font-black text-amber-700">
                            +{challenge.points} XP awarded
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <Dialog
        open={!!celebrationChallenge}
        onOpenChange={(open) => {
          if (!open) setCelebrationChallenge(null);
        }}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-emerald-200 bg-bg-surface p-0 shadow-xl sm:max-w-md">
          <div className="bg-gradient-to-br from-emerald-50 via-amber-50 to-bg-surface px-8 pb-6 pt-8">
            <DialogHeader className="flex flex-col items-center space-y-2 text-center">
              <div className="relative mb-2 flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 text-amber-700 shadow-sm">
                <Award className="h-8 w-8" />
              </div>

              <DialogTitle className="text-xl font-black text-text-primary">
                Badge unlocked
              </DialogTitle>

              <DialogDescription className="text-sm leading-6 text-text-secondary">
                You completed{' '}
                <span className="font-black text-text-primary">
                  {celebrationChallenge?.title}
                </span>{' '}
                and earned a new achievement.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-white/70 p-4 text-center">
              <span className="block text-base font-black uppercase tracking-[0.16em] text-amber-700">
                {celebrationChallenge?.badgeName}
              </span>

              <p className="mt-2 text-sm font-medium leading-6 text-amber-800">
                {celebrationChallenge?.description}
              </p>

              <div className="mt-3 text-sm font-black text-amber-700">
                +{celebrationChallenge?.points} XP awarded
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border-subtle bg-bg-surface px-8 py-5 sm:justify-center">
            <Button
              type="button"
              className="h-10 w-full rounded-xl text-sm font-black"
              onClick={() => setCelebrationChallenge(null)}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
