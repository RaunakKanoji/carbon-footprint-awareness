'use client';

import React, { useEffect, useState } from 'react';

import PageHeader from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast-provider';
import Icon from '@/src/components/Icon';
import { iconMap } from '@/src/lib/icons';

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
}

export default function ChallengesClient({
  initialActive,
  initialCompleted,
  initialAvailable,
}: ChallengesClientProps) {
  const { toast } = useToast();
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>(initialActive);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>(initialCompleted);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>(initialAvailable);

  const [isLoading, setIsLoading] = useState(false);
  const [celebrationChallenge, setCelebrationChallenge] = useState<Challenge | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, []);

  const formatDate = (dateStr?: string | null) => {
    if (!isMounted || !dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  // Check for newly completed challenges to trigger celebration popup
  useEffect(() => {
    if (completedChallenges.length === 0) return;

    const storedIds = localStorage.getItem('eco_completed_challenges');
    const completedIds: string[] = storedIds ? JSON.parse(storedIds) : [];

    const newlyCompleted = completedChallenges.find((c) => !completedIds.includes(c.id));

    if (newlyCompleted) {
      setTimeout(() => {
        setCelebrationChallenge(newlyCompleted);
      }, 0);
      const updatedIds = [...completedIds, ...completedChallenges.map((c) => c.id)];
      localStorage.setItem('eco_completed_challenges', JSON.stringify(updatedIds));
    } else {
      const allIds = completedChallenges.map((c) => c.id);
      localStorage.setItem('eco_completed_challenges', JSON.stringify(allIds));
    }
  }, [completedChallenges]);

  // Level is derived from real earned points. There is no persisted XP model yet,
  // so completed challenge rewards plus the onboarding base determine progress.
  const completedPoints = completedChallenges.reduce((sum, c) => sum + c.points, 0);
  const totalPoints = 100 + completedPoints;
  const levelNumber = Math.floor(totalPoints / 500) + 1;
  const currentLevelProgress = totalPoints % 500;
  const pointsToNextLevel = 500 - currentLevelProgress;
  const progressToNextLevel = Math.round((currentLevelProgress / 500) * 100);
  const levelTitles = ['Eco Recruit', 'Green Scout', 'Eco Builder', 'Climate Strategist'];
  const userLevel =
    levelTitles[Math.min(levelNumber - 1, levelTitles.length - 1)] ?? 'Carbon Master';

  // Fetch updated challenges from API
  const refreshChallenges = async () => {
    try {
      const res = await fetch('/api/challenge');
      const data = await res.json();
      if (data.success) {
        setActiveChallenges(data.activeChallenges);
        setCompletedChallenges(data.completedChallenges);
        setAvailableTemplates(data.availableTemplates);
      }
    } catch (err) {
      console.error('Failed to refresh challenges:', err);
    }
  };

  // Join challenge action
  const handleJoinChallenge = async (templateKey: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshChallenges();
      } else {
        toast({
          title: 'Could not join challenge',
          description: data.error || 'Failed to join challenge.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error joining challenge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Abandon challenge action
  const handleAbandonChallenge = async (challengeId: string) => {
    if (
      !confirm(
        'Are you sure you want to abandon this challenge? Your logged activities will still remain, but challenge progress will be lost.',
      )
    ) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/challenge', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, action: 'abandon' }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshChallenges();
      } else {
        toast({
          title: 'Could not abandon challenge',
          description: data.error || 'Failed to abandon challenge.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error abandoning challenge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-0 w-full flex-col gap-6 pb-6">
      <PageHeader
        title="Eco Challenges & Achievements"
        description="Pledge to sustainable challenges, monitor your progress, and earn achievements."
      />

      {/* TOP SUMMARY ROW: Points, Level, Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Points Card */}
        <Card className="bg-linear-to-br from-emerald-600 to-teal-700 text-white border-0 shadow-sm relative overflow-hidden rounded-xl">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-white/80 text-xs uppercase tracking-wider font-semibold">
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline gap-2 pb-4">
            <span className="text-4xl font-extrabold tracking-tight">{totalPoints}</span>
            <span className="text-xs font-semibold text-emerald-100">pts</span>
          </CardContent>
        </Card>

        {/* Level Card */}
        <Card className="bg-bg-surface border border-border-default shadow-xs rounded-xl flex flex-col justify-between p-5">
          <div className="flex justify-between items-center">
            <span className="text-text-muted text-xs uppercase tracking-wider font-semibold">
              Achievement Level
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
              Level {levelNumber}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-lg font-extrabold leading-none text-text-primary">{userLevel}</p>
                <p className="mt-1 text-xs font-semibold text-text-secondary tabular-nums">
                  {totalPoints.toLocaleString()} XP
                </p>
              </div>
              <p className="text-xs font-semibold text-accent-primary tabular-nums">
                {pointsToNextLevel} XP to Level {levelNumber + 1}
              </p>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-text-secondary">Progress to Next Level</span>
              <span className="text-text-primary tabular-nums">
                {currentLevelProgress} / 500 XP
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-primary transition-[width] duration-500"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Badges Earned Card */}
        <Card className="bg-bg-surface border border-border-default shadow-xs rounded-xl flex items-center justify-between p-5">
          <div className="space-y-1">
            <span className="text-text-muted text-xs uppercase tracking-wider font-semibold block">
              Badges Earned
            </span>
            <span className="text-3xl font-extrabold text-text-primary">
              {completedChallenges.length}
            </span>
          </div>
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Icon icon="tree" className="text-amber-500 h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* TABS CONTAINER */}
      <Tabs defaultValue="active" className="w-full space-y-6">
        <TabsList className="bg-bg-subtle border border-border-default/50 p-1.5 rounded-xl h-fit">
          <TabsTrigger value="active" className="px-4 py-2 text-xs font-semibold">
            Active ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="px-4 py-2 text-xs font-semibold">
            Available ({availableTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="px-4 py-2 text-xs font-semibold">
            Achievements ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. ACTIVE CHALLENGES TAB */}
        <TabsContent value="active" className="outline-none">
          {activeChallenges.length === 0 ? (
            <div className="text-center py-16 bg-bg-surface border border-border-default border-dashed rounded-xl max-w-xl mx-auto px-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <Icon icon="leaf" className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-text-primary">No Active Challenges</h3>
                <p className="text-xs text-text-muted">
                  You aren&apos;t participating in any eco-challenges right now. Browse available
                  challenges and join one to start earning points!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeChallenges.map((challenge) => {
                const progress = challenge.progress || { current: 0, target: 10, percent: 0 };
                return (
                  <Card
                    key={challenge.id}
                    className="bg-bg-surface border border-border-default shadow-xs rounded-xl flex flex-col justify-between overflow-hidden"
                  >
                    <CardHeader className="pb-3 border-b border-border-default/30">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Icon icon={challenge.icon} className="text-emerald-600 h-4.5 w-4.5" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold text-text-primary">
                              {challenge.title}
                            </CardTitle>
                            <span className="mt-1 inline-flex rounded-full border border-accent-primary/10 bg-accent-primary-dim px-2.5 py-0.5 text-xs font-semibold text-accent-primary">
                              {challenge.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-lg">
                          +{challenge.points} pts
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4 flex-1">
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {challenge.description}
                      </p>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-text-muted">Progress</span>
                          <span className="text-text-primary">
                            {progress.current} / {progress.target} logs ({progress.percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent-primary transition-[width] duration-300"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-zinc-50/50 p-4 border-t border-border-default/30 flex justify-between gap-4">
                      <span className="text-xs text-text-muted">
                        Started: {formatDate(challenge.startedAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleAbandonChallenge(challenge.id)}
                        className="text-xs text-state-error hover:bg-red-50 hover:text-state-error font-medium"
                      >
                        Abandon
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 2. AVAILABLE CHALLENGES TAB */}
        <TabsContent value="available" className="outline-none">
          {availableTemplates.length === 0 ? (
            <div className="text-center py-16 bg-bg-surface border border-border-default border-dashed rounded-xl max-w-xl mx-auto px-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
                <Icon icon="tree" className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-text-primary">All Challenges Joined!</h3>
                <p className="text-xs text-text-muted">
                  Wow, you&apos;ve accepted all available eco-challenges! Complete them or check
                  back later for new templates.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableTemplates.map((template) => (
                <Card
                  key={template.key}
                  className="bg-bg-surface border border-border-default shadow-xs rounded-xl flex flex-col justify-between overflow-hidden"
                >
                  <CardHeader className="pb-3 border-b border-border-default/30">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <Icon icon={template.icon} className="text-text-secondary h-4.5 w-4.5" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold text-text-primary">
                            {template.title}
                          </CardTitle>
                          <span className="mt-1 inline-flex rounded-full border border-border-default bg-bg-elevated px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-lg">
                        +{template.points} pts
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {template.description}
                    </p>
                    <div className="mt-4 rounded-xl border border-border-default/50 bg-bg-elevated/60 p-3 text-xs text-text-secondary">
                      Goal: Log at least{' '}
                      <strong className="text-text-primary font-semibold">
                        {template.targetCount} times
                      </strong>{' '}
                      of matching activity types after starting.
                    </div>
                  </CardContent>
                  <CardFooter className="bg-zinc-50/50 p-4 border-t border-border-default/30">
                    <Button
                      disabled={isLoading}
                      onClick={() => handleJoinChallenge(template.key)}
                      className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold text-xs py-2 rounded-lg"
                    >
                      Join Challenge
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 3. COMPLETED ACHIEVEMENTS TAB */}
        <TabsContent value="completed" className="outline-none">
          {completedChallenges.length === 0 ? (
            <div className="text-center py-16 bg-bg-surface border border-border-default border-dashed rounded-xl max-w-xl mx-auto px-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <Icon icon="tree" className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-text-primary">No Achievements Yet</h3>
                <p className="text-xs text-text-muted">
                  Completed challenges will be unlocked as custom badges here. Keep logging
                  eco-friendly activities to claim achievements!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {completedChallenges.map((challenge) => (
                <Card
                  key={challenge.id}
                  className="group relative flex flex-col items-center overflow-hidden rounded-xl border-2 border-amber-500/30 bg-bg-surface p-4 text-center shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-amber-500/50 dark:border-amber-500/20"
                >
                  {/* Glowing medal shine effect */}
                  <div className="absolute inset-0 bg-linear-to-tr from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-3 border border-amber-500/20 relative">
                    <Icon icon={challenge.icon} className="text-amber-500 h-6 w-6" />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center border border-white text-white">
                      <Icon icon="leaf" className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>

                  <h4 className="font-extrabold text-xs text-text-primary">{challenge.title}</h4>
                  <span className="mt-1 inline-flex rounded-full border border-amber-500/10 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                    {challenge.badgeName}
                  </span>

                  <div className="mt-3 text-xs text-text-muted">
                    Completed: {formatDate(challenge.completedAt)}
                  </div>

                  <div className="mt-1 text-xs font-bold text-amber-700">
                    +{challenge.points} pts awarded
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* CELEBRATION UNLOCKED MODAL */}
      <Dialog
        open={!!celebrationChallenge}
        onOpenChange={(open) => !open && setCelebrationChallenge(null)}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-visible rounded-3xl border border-emerald-500/20 bg-white p-0 shadow-2xl sm:max-w-md">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-emerald-500/15 via-amber-400/10 to-transparent" />
          <div className="relative px-8 pb-6 pt-8">
            <DialogHeader className="flex flex-col items-center space-y-2 text-center">
              <div className="relative mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 shadow-lg shadow-amber-500/10">
                <Icon
                  icon={celebrationChallenge?.icon || 'tree'}
                  className="text-amber-500 h-8 w-8"
                />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center border border-white text-white">
                  <Icon icon="leaf" className="h-3 w-3 text-white" />
                </div>
              </div>
              <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-amber-600">
                Badge Unlocked!
              </DialogTitle>
              <DialogDescription className="text-sm text-text-secondary">
                Incredible work. You completed{' '}
                <strong className="font-semibold text-text-primary">
                  {celebrationChallenge?.title}
                </strong>{' '}
                and earned a new badge.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-2 rounded-2xl border border-amber-500/10 bg-amber-50/70 p-4 text-center">
              <span className="block text-lg font-black uppercase tracking-widest text-amber-700">
                {celebrationChallenge?.badgeName}
              </span>
              <p className="text-sm font-medium leading-relaxed text-amber-800">
                &quot;{celebrationChallenge?.description}&quot;
              </p>
              <div className="pt-2 text-sm font-black text-amber-600">
                +{celebrationChallenge?.points} Points Awarded
              </div>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 border-t border-emerald-500/10 bg-emerald-50/50 px-8 py-5 sm:justify-center">
            <DialogClose
              render={
                <Button className="h-10 w-full rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white hover:bg-accent-primary/90" />
              }
            >
              Awesome!
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
