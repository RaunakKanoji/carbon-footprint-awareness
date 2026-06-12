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

  // Calculate user total points (100 base onboarding points + completed challenges)
  const completedPoints = completedChallenges.reduce((sum, c) => sum + c.points, 0);
  const totalPoints = 100 + completedPoints;

  // Determine user level based on points
  let userLevel = 'Eco Recruit';
  let levelColor = 'text-zinc-500 bg-zinc-100 border-zinc-200';
  let nextLevelPoints = 300;

  if (totalPoints >= 500) {
    userLevel = 'Carbon Master';
    levelColor =
      'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20';
    nextLevelPoints = 1000;
  } else if (totalPoints >= 300) {
    userLevel = 'Eco Warrior';
    levelColor =
      'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20';
    nextLevelPoints = 500;
  } else if (totalPoints >= 150) {
    userLevel = 'Green Scout';
    levelColor = 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20';
    nextLevelPoints = 300;
  }

  const progressToNextLevel = Math.min(100, Math.round((totalPoints / nextLevelPoints) * 100));

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
        alert(data.error || 'Failed to join challenge');
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
        alert(data.error || 'Failed to abandon challenge');
      }
    } catch (err) {
      console.error('Error abandoning challenge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full flex flex-col min-h-0 pb-10">
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
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${levelColor}`}
            >
              {userLevel}
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-text-secondary">Progress to Next Level</span>
              <span className="text-text-primary">
                {totalPoints} / {nextLevelPoints} pts
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-accent-primary h-full transition-all duration-500 rounded-full"
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
                            <span className="text-[10px] font-bold text-accent-primary bg-accent-primary-dim px-2 py-0.5 rounded-full border border-accent-primary/10 inline-block mt-0.5">
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
                            className="bg-accent-primary h-full transition-all duration-300 rounded-full"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-zinc-50/50 p-4 border-t border-border-default/30 flex justify-between gap-4">
                      <span className="text-[10px] text-text-muted">
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
                          <span className="text-[10px] font-bold text-text-muted bg-zinc-100 px-2 py-0.5 rounded-full border border-border-default/10 inline-block mt-0.5">
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
                    <div className="mt-4 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-border-default/50 text-[10px] text-text-muted">
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
                  className="bg-bg-surface border-2 border-amber-500/30 dark:border-amber-500/20 shadow-sm rounded-xl p-4 flex flex-col items-center text-center relative group hover:border-amber-500/50 transition-all duration-300 overflow-hidden"
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
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-500/10 mt-1 inline-block">
                    {challenge.badgeName}
                  </span>

                  <div className="text-[9px] text-text-muted mt-3">
                    Completed: {formatDate(challenge.completedAt)}
                  </div>

                  <div className="text-[10px] font-bold text-amber-700 mt-1">
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
        <DialogContent className="sm:max-w-md bg-white border border-zinc-200 p-6">
          <DialogHeader className="space-y-2 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-2 relative animate-bounce">
              <Icon
                icon={celebrationChallenge?.icon || 'tree'}
                className="text-amber-500 h-8 w-8"
              />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center border border-white text-white">
                <Icon icon="leaf" className="h-3 w-3 text-white" />
              </div>
            </div>
            <DialogTitle className="flex items-center gap-2 text-amber-600 font-extrabold text-xl">
              Badge Unlocked!
            </DialogTitle>
            <DialogDescription className="text-zinc-600 text-xs">
              Incredible work! You&apos;ve completed the{' '}
              <strong className="text-zinc-900 font-semibold">{celebrationChallenge?.title}</strong>{' '}
              challenge and earned a new badge!
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-500/10 text-center space-y-2 mt-4">
            <span className="text-lg font-black text-amber-700 uppercase tracking-widest block">
              {celebrationChallenge?.badgeName}
            </span>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              &quot;{celebrationChallenge?.description}&quot;
            </p>
            <div className="text-sm font-black text-amber-600 animate-pulse pt-2">
              +{celebrationChallenge?.points} Points Awarded!
            </div>
          </div>

          <DialogFooter className="sm:justify-center mt-6">
            <DialogClose
              render={
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-6 py-2 text-xs" />
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
