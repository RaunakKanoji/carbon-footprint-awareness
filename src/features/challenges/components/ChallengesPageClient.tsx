'use client';

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
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
  Check,
  UserPlus,
  Users,
  Trophy,
  Mail,
  Plus,
  X,
  Search,
  MapPin,
  Clock,
  ChevronRight,
  Shield,
  RotateCcw
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { useToast } from '@/src/components/ui/toast-provider';

interface Milestone {
  key: string;
  title: string;
  description: string;
  xpReward: number;
  unlockedAt: string | null;
  progress: number;
  targetValue: number;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  missionType: string;
  targetValue: number;
  xpReward: number;
  estimatedCo2eImpactKg: number | null;
  endsAt: string;
  progress: number;
  status: string;
  participants?: Array<{
    userId: string;
    name: string;
    progress: number;
    status: string;
  }>;
}

interface Goal {
  id: string;
  title: string;
  category: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  startsAt: string;
  endsAt: string;
  status: string;
}

interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string;
  city: string | null;
  country: string | null;
  weeklyXp: number;
  co2eSavedKg: number;
  streak: number;
  completedMissions: number;
  isCurrentUser: boolean;
  impactScore: number;
}

interface Friend {
  id: string;
  name: string;
  email: string;
  city: string | null;
  level: number;
  weeklyXp: number;
  streak: number;
}

export default function ChallengesPageClient() {
  const { toast } = useToast();

  // Basic stats
  const [weeklyXp, setWeeklyXp] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [weeklyCo2eSavedKg, setWeeklyCo2eSavedKg] = useState(0);
  const [activeMissionCount, setActiveMissionCount] = useState(0);
  const [friendMissionCount, setFriendMissionCount] = useState(0);
  const [activeGoalCount, setActiveGoalCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [levelInfo, setLevelInfo] = useState<any>(null);

  // Lists
  const [leaderboardScope, setLeaderboardScope] = useState<'friends' | 'local' | 'global'>('friends');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'all_time'>('weekly');
  const [leaderboardRows, setLeaderboardRows] = useState<LeaderboardRow[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<any[]>([]);
  const [outgoingInvites, setOutgoingInvites] = useState<any[]>([]);

  // Friend Request States
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [selectedMissionForInvite, setSelectedMissionForInvite] = useState<Mission | null>(null);
  const [invitedFriendIds, setInvitedFriendIds] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('FOOD');
  const [goalMetric, setGoalMetric] = useState('ACTIVITY_COUNT');
  const [goalTarget, setGoalTarget] = useState('3');
  const [goalPeriod, setGoalPeriod] = useState('week');
  const [goalDifficulty, setGoalDifficulty] = useState('medium');

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Dynamic calculations
  const featuredMission = useMemo(() => {
    return missions.find((m) => m.status === 'ACTIVE' || m.status === 'NOT_STARTED') || missions[0] || null;
  }, [missions]);

  const suggestedMissions = useMemo(() => {
    return missions.filter((m) => m.id !== featuredMission?.id).slice(0, 3);
  }, [missions, featuredMission]);

  // API Call Helpers
  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/challenges/overview');
      const data = await res.json();
      if (data.success) {
        setWeeklyXp(data.weeklyXp);
        setTotalXp(data.totalXp);
        setLevel(data.level);
        setLevelInfo(data.levelInfo);
        setWeeklyCo2eSavedKg(data.weeklyCo2eSavedKg);
        setActiveMissionCount(data.activeMissionCount);
        setFriendMissionCount(data.friendMissionCount);
        setActiveGoalCount(data.activeGoalCount);
        setCurrentStreak(data.currentStreak);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/challenges/leaderboard?scope=${leaderboardScope}&period=${leaderboardPeriod}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboardRows(data.rows);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMissions = async () => {
    try {
      const res = await fetch('/api/challenges/missions');
      const data = await res.json();
      if (data.success) {
        setMissions(data.missions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvites = async () => {
    try {
      const res = await fetch('/api/challenges/invites');
      const data = await res.json();
      if (data.success) {
        setIncomingInvites(data.incoming);
        setOutgoingInvites(data.outgoing);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/challenges/goals');
      const data = await res.json();
      if (data.success) {
        setGoals(data.goals);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMilestones = async () => {
    try {
      const res = await fetch('/api/challenges/milestones');
      const data = await res.json();
      if (data.success) {
        setMilestones(data.milestones);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends');
      const data = await res.json();
      if (data.success) {
        setFriends(data.friends);
        setIncomingRequests(data.incoming);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Poll databases
  useEffect(() => {
    fetchOverview();
    fetchLeaderboard();
    fetchMissions();
    fetchInvites();
    fetchGoals();
    fetchMilestones();
    fetchFriends();

    const interval = setInterval(() => {
      fetchOverview();
      fetchLeaderboard();
      fetchMissions();
      fetchInvites();
      fetchGoals();
      fetchMilestones();
      fetchFriends();
    }, 30000); // 30s polling

    return () => clearInterval(interval);
  }, [leaderboardScope, leaderboardPeriod]);

  // Joins mission template
  const handleJoinTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/challenges/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join_template', templateId }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Joined Mission', description: 'Weekly progress is now active.' });
        fetchMissions();
        fetchOverview();
      } else {
        toast({ title: 'Failed to join', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network issue occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Creates custom personal goal
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) {
      toast({ title: 'Title required', description: 'Please name your carbon goal.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/challenges/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: goalTitle,
          category: goalCategory,
          metric: goalMetric,
          targetValue: Number(goalTarget),
          timePeriod: goalPeriod,
          difficulty: goalDifficulty,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Goal Created', description: 'Your progress has been initialized.' });
        setIsGoalModalOpen(false);
        setGoalTitle('');
        fetchGoals();
        fetchOverview();
      } else {
        toast({ title: 'Failed', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network issue occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Decline/Accept mission invites
  const handleRespondInvite = async (inviteId: string, action: 'accept' | 'decline') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/challenges/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: `Invite ${action === 'accept' ? 'accepted' : 'declined'}`, description: `The mission invite was successfully processed.` });
        fetchInvites();
        fetchMissions();
        fetchOverview();
      } else {
        toast({ title: 'Failed', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network issue occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Sends invites to friend mission
  const handleSendMissionInvites = async () => {
    if (invitedFriendIds.length === 0 && !inviteEmail.trim()) {
      toast({ title: 'Invitee required', description: 'Select a friend or enter an email.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/challenges/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_friend_mission',
          title: selectedMissionForInvite?.title || 'Weekly Friend Mission',
          description: selectedMissionForInvite?.description,
          category: selectedMissionForInvite?.category || 'OTHER',
          targetValue: selectedMissionForInvite?.targetValue || 3,
          xpReward: selectedMissionForInvite?.xpReward || 250,
          inviteeIds: invitedFriendIds,
          inviteEmail: inviteEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Invites Sent', description: 'Waiting for friend acceptance.' });
        setIsInviteModalOpen(false);
        setInvitedFriendIds([]);
        setInviteEmail('');
        fetchInvites();
        fetchMissions();
      } else {
        toast({ title: 'Failed', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network issue occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Friend Request Handling
  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query: searchQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendFriendRequest = async (friendId: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_request', friendId }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Request Sent', description: 'Friend request is pending.' });
        setSearchResults((prev) => prev.filter((u) => u.id !== friendId));
      } else {
        toast({ title: 'Request Failed', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondFriendRequest = async (friendshipId: string, accept: boolean) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'respond', friendshipId, accept }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: accept ? 'Request accepted' : 'Request declined', description: accept ? 'You are now friends!' : 'Friend request declined.' });
        fetchFriends();
        fetchLeaderboard();
      } else {
        toast({ title: 'Response failed', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Delete this carbon goal?')) return;
    try {
      const res = await fetch(`/api/challenges/goals/${goalId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Goal Removed', description: 'The personal goal was deleted successfully.' });
        fetchGoals();
        fetchOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render category icons dynamically
  const getCategoryIcon = (category: string, className = 'h-5 w-5') => {
    switch (category?.toUpperCase()) {
      case 'FOOD':
        return <Utensils className={className} />;
      case 'TRANSPORT':
        return <Bike className={className} />;
      case 'ENERGY':
      case 'ELECTRICITY':
        return <Zap className={className} />;
      case 'SHOPPING':
        return <ShoppingBag className={className} />;
      case 'WASTE':
      case 'RECYCLING':
        return <Trash2 className={className} />;
      default:
        return <Leaf className={className} />;
    }
  };

  // Render Category colors
  const getCategoryColor = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'FOOD':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'TRANSPORT':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'ENERGY':
      case 'ELECTRICITY':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'SHOPPING':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'WASTE':
      case 'RECYCLING':
        return 'bg-teal-50 text-teal-600 border-teal-100';
      default:
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview stats cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Level Card */}
        <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">Current Level</p>
              <h3 className="text-2xl font-black text-text-primary">Level {level}</h3>
              <p className="text-xs text-text-secondary">
                {levelInfo ? `${levelInfo.pointsToNextLevel} XP to Level ${level + 1}` : 'Building habits'}
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <Trophy className="h-5 w-5" />
            </div>
          </CardContent>
          {levelInfo && (
            <div className="px-5 pb-4">
              <div className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${levelInfo.progressPercent}%` }} />
              </div>
            </div>
          )}
        </Card>

        {/* 2. Weekly XP */}
        <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">Weekly XP</p>
              <h3 className="text-2xl font-black text-text-primary">{weeklyXp} XP</h3>
              <p className="text-xs text-text-secondary">+{totalXp} total points</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* 3. CO2e Saved */}
        <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">CO₂e Saved</p>
              <h3 className="text-2xl font-black text-text-primary">{weeklyCo2eSavedKg.toFixed(1)} kg</h3>
              <p className="text-xs text-text-secondary">This week</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* 4. Active Streak */}
        <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm">
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">Logging Streak</p>
              <h3 className="text-2xl font-black text-text-primary">{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</h3>
              <p className="text-xs text-text-secondary">Keep logging daily</p>
            </div>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${currentStreak > 0 ? 'bg-amber-50 text-amber-600 ring-amber-100' : 'bg-bg-elevated text-text-muted ring-border-subtle'}`}>
              <Flame className={`h-5 w-5 ${currentStreak > 0 ? 'fill-amber-500 animate-pulse' : ''}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main dashboard columns layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column (Missions, Goals, Milestones) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Featured Weekly Mission Card */}
          {featuredMission ? (
            <Card className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
              <div className="bg-gradient-to-br from-emerald-50 via-white to-white border-b border-border-subtle px-5 py-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${getCategoryColor(featuredMission.category)}`}>
                    {getCategoryIcon(featuredMission.category)}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{featuredMission.category} · Featured Mission</span>
                    <h3 className="text-lg font-black text-text-primary mt-0.5">{featuredMission.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black px-2.5 py-1">
                    +{featuredMission.xpReward} XP
                  </span>
                  {featuredMission.estimatedCo2eImpactKg && (
                    <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black px-2.5 py-1">
                      -{featuredMission.estimatedCo2eImpactKg} kg CO₂e
                    </span>
                  )}
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                <p className="text-sm leading-relaxed text-text-secondary">{featuredMission.description}</p>

                {/* Progress bar */}
                <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-text-secondary">Progress</span>
                    <span className="text-text-primary">
                      {featuredMission.progress} / {featuredMission.targetValue} logs · {Math.round((featuredMission.progress / featuredMission.targetValue) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (featuredMission.progress / featuredMission.targetValue) * 100)}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {featuredMission.status === 'NOT_STARTED' ? (
                    <Button size="sm" onClick={() => handleJoinTemplate(featuredMission.id)} disabled={isLoading} className="rounded-xl text-xs font-black h-9">
                      Join Weekly Mission
                    </Button>
                  ) : featuredMission.status === 'COMPLETED' ? (
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="h-4 w-4" /> Completed (+{featuredMission.xpReward} XP awarded)
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 text-xs font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                        <Clock className="h-4 w-4" /> Active
                      </div>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedMissionForInvite(featuredMission); setIsInviteModalOpen(true); }} className="rounded-xl text-xs font-black h-9 border-border-default">
                        Invite Friends
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-3xl border-border-default bg-bg-surface p-6 text-center text-sm font-semibold text-text-secondary shadow-sm">
              No weekly mission template currently active.
            </Card>
          )}

          {/* Suggested Missions list */}
          {suggestedMissions.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-text-muted">Suggested Weekly Missions</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {suggestedMissions.map((m) => (
                  <Card key={m.id} className="rounded-2xl border border-border-default bg-bg-surface p-4 flex flex-col justify-between shadow-xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${getCategoryColor(m.category)}`}>
                          {getCategoryIcon(m.category, 'h-4 w-4')}
                        </div>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">+{m.xpReward} XP</span>
                      </div>
                      <h4 className="font-black text-sm text-text-primary leading-snug">{m.title}</h4>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{m.description}</p>
                    </div>

                    <div className="pt-3 border-t border-border-subtle mt-4">
                      {m.status === 'NOT_STARTED' ? (
                        <Button size="sm" variant="outline" onClick={() => handleJoinTemplate(m.id)} disabled={isLoading} className="w-full text-xs font-black h-8 rounded-lg">
                          Join
                        </Button>
                      ) : m.status === 'COMPLETED' ? (
                        <span className="block text-center text-xs font-black text-emerald-600">Completed ✓</span>
                      ) : (
                        <div className="flex justify-between items-center text-xs font-bold text-text-primary">
                          <span>Progress</span>
                          <span>{m.progress} / {m.targetValue}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Personal Goals Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-wider text-text-muted">Active Goals</h3>
              <Button size="sm" onClick={() => setIsGoalModalOpen(true)} className="rounded-xl text-xs font-black h-8">
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Goal
              </Button>
            </div>

            {goals.length === 0 ? (
              <Card className="mx-auto flex flex-col items-center rounded-3xl border border-dashed border-border-default bg-bg-surface px-6 py-10 text-center">
                <Target className="h-8 w-8 text-text-muted" />
                <h4 className="mt-3 font-black text-text-primary">Set your first goal</h4>
                <p className="mt-1 text-xs text-text-secondary max-w-sm">Start tracking custom carbon footprint targets and earn level rewards.</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {goals.map((goal) => {
                  const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                  const daysLeft = Math.max(0, Math.round((new Date(goal.endsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

                  return (
                    <Card key={goal.id} className="rounded-2xl border border-border-default bg-bg-surface p-4 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${getCategoryColor(goal.category)}`}>
                              {getCategoryIcon(goal.category, 'h-4 w-4')}
                            </div>
                            <h4 className="font-black text-sm text-text-primary leading-tight">{goal.title}</h4>
                          </div>
                          <button onClick={() => handleDeleteGoal(goal.id)} className="text-text-muted hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between items-center text-xs font-black">
                            <span className="text-text-secondary">Progress</span>
                            <span className="text-text-primary">{goal.currentValue.toFixed(0)} / {goal.targetValue} · {percent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-4 text-[11px] text-text-secondary">
                        <span>{daysLeft} days left</span>
                        <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">+{goal.xpReward} XP</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Milestones Sections */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-text-muted">Unlocked Milestones</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {milestones.map((m) => {
                const unlocked = !!m.unlockedAt;
                const percent = Math.min(100, Math.round((m.progress / m.targetValue) * 100));

                return (
                  <Card key={m.key} className={`rounded-2xl border p-4 flex flex-col justify-between shadow-xs transition-all duration-300 ${unlocked ? 'border-amber-200 bg-amber-50/5' : 'border-border-subtle bg-bg-surface/50 opacity-60'}`}>
                    <div className="space-y-2 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl shadow-xs ring-1 bg-bg-elevated">
                        {unlocked ? (
                          <Award className="h-5 w-5 text-amber-500 fill-amber-100" />
                        ) : (
                          <Lock className="h-4 w-4 text-text-muted" />
                        )}
                      </div>
                      <h4 className="font-black text-xs text-text-primary leading-tight mt-2">{m.title}</h4>
                      <p className="text-[10px] text-text-secondary leading-normal line-clamp-2">{m.description}</p>
                    </div>

                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary">
                        <span>Progress</span>
                        <span>{m.progress} / {m.targetValue}</span>
                      </div>
                      <div className="h-1 w-full bg-bg-elevated rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right column (Leaderboards, Friend Invites, Active Friend request widgets) */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Leaderboard widget */}
          <Card className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
            <div className="border-b border-border-subtle px-5 py-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">Weekly Ranks</p>
                  <h2 className="text-lg font-black text-text-primary leading-tight">Leaderboard</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] text-text-muted font-bold">Live updates</span>
                </div>
              </div>

              {/* Scopes Tabs selection */}
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-bg-elevated p-0.5 border border-border-subtle">
                {(['friends', 'local', 'global'] as const).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setLeaderboardScope(sc)}
                    className={`rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${leaderboardScope === sc ? 'bg-white text-emerald-900 shadow-sm border border-emerald-100' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[300px] flex-1 divide-y divide-border-subtle">
              {leaderboardRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <Users className="h-8 w-8 text-text-muted" />
                  <p className="text-xs text-text-secondary mt-2 font-semibold">Join or invite friends to fill up this rankings tab!</p>
                </div>
              ) : (
                leaderboardRows.map((user) => (
                  <div
                    key={user.userId}
                    className={`flex items-center justify-between px-4 py-3 text-xs transition-all duration-200 ${
                      user.isCurrentUser
                        ? 'bg-emerald-50/50 border-l-4 border-l-emerald-500 font-bold'
                        : 'hover:bg-bg-elevated/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                        user.rank === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : user.rank === 2
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : user.rank === 3
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'text-text-muted border border-transparent'
                      }`}>
                        {user.rank}
                      </span>
                      <div className="min-w-0">
                        <span className={`block truncate ${user.isCurrentUser ? 'text-emerald-950 font-black' : 'text-text-primary font-bold'}`}>
                          {user.displayName} {user.isCurrentUser && '(You)'}
                        </span>
                        {user.city && (
                          <span className="text-[10px] text-text-muted flex items-center gap-0.5 mt-0.5">
                            <MapPin className="h-3 w-3 inline text-text-muted" /> {user.city}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block font-black text-text-primary">{user.weeklyXp} XP</span>
                      <span className="text-[9px] text-text-muted block mt-0.5">-{user.co2eSavedKg.toFixed(0)} kg CO₂e</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-3 bg-bg-elevated/20 border-t border-border-subtle text-center flex justify-between items-center text-[10px] text-text-muted font-semibold">
              <span>Period: Weekly metrics</span>
              <button onClick={() => setIsFriendsModalOpen(true)} className="text-emerald-700 hover:underline flex items-center gap-1 font-black">
                <UserPlus className="h-3.5 w-3.5" /> Manage Friends
              </button>
            </div>
          </Card>

          {/* Pending invites / notifications section */}
          {incomingInvites.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-text-muted">Mission Invites</h3>
              <div className="space-y-3">
                {incomingInvites.map((inv) => (
                  <Card key={inv.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/5 p-4 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-xs text-text-muted leading-none">
                          <span className="font-black text-text-primary">{inv.senderName}</span> invited you
                        </p>
                        <h4 className="font-black text-sm text-text-primary leading-tight mt-1">{inv.title}</h4>
                        <p className="text-xs text-text-secondary leading-normal">{inv.description}</p>
                      </div>
                      <div className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2 py-0.5">
                        +{inv.xpReward} XP
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-border-subtle pt-3">
                      <Button size="sm" onClick={() => handleRespondInvite(inv.id, 'accept')} disabled={isLoading} className="flex-1 rounded-xl text-xs font-black h-8 bg-emerald-600 hover:bg-emerald-700">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRespondInvite(inv.id, 'decline')} disabled={isLoading} className="flex-1 rounded-xl text-xs font-black h-8 border-border-default">
                        Decline
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Social Notification Widget (Incoming requests) */}
          {incomingRequests.length > 0 && (
            <Card className="rounded-3xl border border-amber-100 bg-amber-50/5 p-4 space-y-3 shadow-sm">
              <h4 className="font-black text-sm text-amber-900 flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-amber-700" /> Friend Requests
              </h4>
              <div className="divide-y divide-border-subtle">
                {incomingRequests.map((req) => (
                  <div key={req.friendshipId} className="flex items-center justify-between py-2.5 text-xs">
                    <div>
                      <span className="block font-bold text-text-primary">{req.name}</span>
                      {req.city && <span className="text-[10px] text-text-muted">{req.city}</span>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => handleRespondFriendRequest(req.friendshipId, true)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-colors">
                        ✓
                      </button>
                      <button onClick={() => handleRespondFriendRequest(req.friendshipId, false)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition-colors">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 1. Create Goal Modal */}
      <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-emerald-200 bg-bg-surface p-0 shadow-xl sm:max-w-md">
          <form onSubmit={handleCreateGoal}>
            <div className="bg-gradient-to-br from-emerald-50 via-bg-surface to-bg-surface px-6 pb-5 pt-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-black text-text-primary">
                  <Target className="h-5 w-5 text-emerald-600" /> Set Climate Goal
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                  Design a personal milestone to target specific carbon reduction habits.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-text-primary font-bold">Goal Name</label>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. Reduce driving, More veggies"
                    className="w-full h-10 px-3 rounded-xl border border-border-default bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-text-primary font-bold">Category</label>
                    <select
                      value={goalCategory}
                      onChange={(e) => setGoalCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border-default bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    >
                      <option value="FOOD">Food</option>
                      <option value="TRANSPORT">Transport</option>
                      <option value="ENERGY">Energy</option>
                      <option value="SHOPPING">Shopping</option>
                      <option value="WASTE">Waste</option>
                      <option value="OTHER">Other/Overall</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-text-primary font-bold">Metric</label>
                    <select
                      value={goalMetric}
                      onChange={(e) => setGoalMetric(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border-default bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    >
                      <option value="ACTIVITY_COUNT">Activity Logs Count</option>
                      <option value="CO2E_REDUCTION">Carbon Saved (kg)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-text-primary font-bold">Target Value</label>
                    <input
                      type="number"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      min="1"
                      className="w-full h-10 px-3 rounded-xl border border-border-default bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-text-primary font-bold">Duration</label>
                    <select
                      value={goalPeriod}
                      onChange={(e) => setGoalPeriod(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border-default bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    >
                      <option value="week">1 Week</option>
                      <option value="month">1 Month</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-primary font-bold">Difficulty</label>
                  <select
                    value={goalDifficulty}
                    onChange={(e) => setGoalDifficulty(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border-default bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    <option value="easy">Easy (150 XP)</option>
                    <option value="medium">Medium (400 XP)</option>
                    <option value="hard">Hard (800 XP)</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border-subtle bg-bg-surface px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setIsGoalModalOpen(false)} className="rounded-xl text-xs font-black h-10 border-border-default">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl text-xs font-black h-10 bg-emerald-600 hover:bg-emerald-700">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Create Goal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Invite Friends Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-emerald-200 bg-bg-surface p-0 shadow-xl sm:max-w-md">
          <div className="bg-gradient-to-br from-emerald-50 via-bg-surface to-bg-surface px-6 pb-5 pt-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-black text-text-primary">
                <UserPlus className="h-5 w-5 text-emerald-600" /> Challenge Invite
              </DialogTitle>
              <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                Invite accepted friends or enter an email to launch a cooperative carbon reduction mission.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-4 text-xs font-semibold">
              {/* Friends list */}
              <div className="space-y-1.5">
                <label className="text-text-primary font-bold">Select Friends</label>
                <div className="border border-border-default rounded-xl bg-white p-2 divide-y divide-border-subtle max-h-40 overflow-y-auto">
                  {friends.length === 0 ? (
                    <p className="text-center py-4 text-text-muted text-[11px]">No friends connected yet.</p>
                  ) : (
                    friends.map((friend) => (
                      <label key={friend.id} className="flex items-center gap-2 py-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={invitedFriendIds.includes(friend.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInvitedFriendIds((prev) => [...prev, friend.id]);
                            } else {
                              setInvitedFriendIds((prev) => prev.filter((id) => id !== friend.id));
                            }
                          }}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <div className="text-xs">
                          <span className="block font-bold text-text-primary">{friend.name}</span>
                          <span className="text-[10px] text-text-muted">Level {friend.level}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-primary font-bold">Or Add By Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. friend@example.com"
                  className="w-full h-10 px-3 rounded-xl border border-border-default bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border-subtle bg-bg-surface px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)} className="rounded-xl text-xs font-black h-10 border-border-default">
              Cancel
            </Button>
            <Button type="button" onClick={handleSendMissionInvites} disabled={isLoading} className="rounded-xl text-xs font-black h-10 bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Send Invites
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Manage Friends Modal */}
      <Dialog open={isFriendsModalOpen} onOpenChange={setIsFriendsModalOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-emerald-200 bg-bg-surface p-0 shadow-xl sm:max-w-md">
          <div className="bg-gradient-to-br from-emerald-50 via-bg-surface to-bg-surface px-6 pb-5 pt-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-black text-text-primary">
                <Users className="h-5 w-5 text-emerald-600" /> Climate Connections
              </DialogTitle>
              <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                Search other eco-trackers to add them to your friends leaderboard.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-4 text-xs font-semibold">
              {/* Search Widget */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or email..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-border-default bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <Button type="button" onClick={handleSearchUsers} className="rounded-xl h-10 px-4 text-xs font-black">
                  Search
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-border-default rounded-xl bg-white p-2 divide-y divide-border-subtle max-h-36 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2">
                      <div>
                        <span className="block font-bold text-text-primary">{user.name}</span>
                        <span className="text-[10px] text-text-muted">{user.email}</span>
                      </div>
                      <Button size="sm" onClick={() => handleSendFriendRequest(user.id)} className="h-8 rounded-lg text-[10px] font-black bg-blue-600 hover:bg-blue-700">
                        Add Friend
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Current Friends List */}
              <div className="space-y-1.5 pt-2">
                <label className="text-text-primary font-bold">Connected Friends ({friends.length})</label>
                <div className="border border-border-default rounded-xl bg-white p-2 divide-y divide-border-subtle max-h-36 overflow-y-auto">
                  {friends.length === 0 ? (
                    <p className="text-center py-4 text-text-muted text-[10px]">No friends connected yet.</p>
                  ) : (
                    friends.map((f) => (
                      <div key={f.id} className="flex items-center justify-between py-2">
                        <div>
                          <span className="block font-bold text-text-primary">{f.name}</span>
                          {f.city && <span className="text-[10px] text-text-muted">{f.city}</span>}
                        </div>
                        <div className="text-right text-[10px] font-bold text-text-secondary">
                          <span>Level {f.level}</span>
                          {f.streak > 0 && <span className="block text-amber-600 mt-0.5">🔥 {f.streak} streak</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border-subtle bg-bg-surface px-6 py-4">
            <Button type="button" onClick={() => setIsFriendsModalOpen(false)} className="w-full rounded-xl text-xs font-black h-10">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
