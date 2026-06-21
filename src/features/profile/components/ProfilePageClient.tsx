'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import ProfileOverviewCard from './ProfileOverviewCard';
import ProfileTabs, { ProfileTab } from './ProfileTabs';
import AccountTab from './AccountTab';
import FriendsTab from './FriendsTab';
import SummaryTab from './SummaryTab';

interface ProfileUser {
  id: string;
  displayName: string;
  email: string;
  city: string;
  state: string;
  country: string;
  householdSize: number;
  dietType: string;
  commuteMode: string;
  commuteDistanceKm: number;
  electricityUsageKwh: number;
  monthlyBudgetKg: number;
}

interface ProfilePreferences {
  carbonUnit: string;
  distanceUnit: string;
  leaderboardVisibility: string;
  showCityOnLeaderboard: boolean;
  showCo2eSavedPublicly: boolean;
  showStreakPublicly: boolean;
}

interface ProfileSummary {
  weeklyCo2eKg: number;
  monthlyCo2eKg: number;
  totalCo2eSavedKg: number;
  bestCategory: string;
  categoryBreakdown: {
    category: string;
    co2eKg: number;
  }[];
}

interface ProfileGamification {
  level: number;
  totalXp: number;
  weeklyXp: number;
  currentStreak: number;
  longestStreak: number;
}

interface ProfileFriend {
  id: string;
  displayName: string;
  email: string;
  city?: string | null;
  country?: string | null;
  weeklyXp: number;
  weeklyCo2eSavedKg: number;
  currentStreak: number;
  level: number;
}

interface ProfileFriendRequest {
  friendshipId: string;
  senderId?: string;
  receiverId?: string;
  name: string;
  email: string;
  city?: string | null;
}

interface ProfileGoal {
  id: string;
  title: string;
  category: string;
  targetValue: number;
  currentValue: number;
  endsAt: string;
}

interface ProfileMilestone {
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

interface ProfileRecentActivity {
  id: string;
  category: string;
  subType: string;
  co2eKg: number;
  occurredAt: string;
}

interface ProfileData {
  user: ProfileUser;
  preferences: ProfilePreferences;
  summary: ProfileSummary;
  gamification: ProfileGamification;
  friends: {
    list: ProfileFriend[];
    incoming: ProfileFriendRequest[];
    outgoing: ProfileFriendRequest[];
  };
  goals: ProfileGoal[];
  milestones: ProfileMilestone[];
  recentActivities: ProfileRecentActivity[];
}

export default function ProfilePageClient() {
  const { user: clerkUser } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const tabParam = searchParams.get('tab') as ProfileTab | null;
  const activeTab = (tabParam && ['account', 'friends', 'summary'].includes(tabParam)) ? tabParam : 'account';

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/profile?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setProfileData(data);
      } else {
        throw new Error(data.error || 'Failed to load profile.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleTabChange = (tab: ProfileTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSaveAccount = async (formData: ProfileUser) => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.displayName,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        householdSize: formData.householdSize,
        dietType: formData.dietType,
        commuteMode: formData.commuteMode,
        commuteDistanceKm: formData.commuteDistanceKm,
        electricityUsageKwh: formData.electricityUsageKwh,
        monthlyBudgetKg: formData.monthlyBudgetKg,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save account details.');
    }
    // Refresh local state and server-side routes
    await fetchProfileData();
    startTransition(() => {
      router.refresh();
    });
  };

  const handleSavePreferences = async (formData: Partial<ProfilePreferences>) => {
    const res = await fetch('/api/profile/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save preferences.');
    }
    // Refresh local state and server-side routes
    await fetchProfileData();
    startTransition(() => {
      router.refresh();
    });
  };

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <Icons.Loader className="w-8 h-8 text-accent-primary animate-spin" />
          <p className="text-sm text-text-secondary font-medium animate-pulse">
            Loading your unified profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-6 text-center gap-4">
        <Icons.AlertTriangle className="w-12 h-12 text-red-500 animate-bounce" />
        <div>
          <h3 className="text-lg font-black text-text-primary">Could not load profile dashboard</h3>
          <p className="text-sm text-text-secondary mt-1">{error || 'Unknown error'}</p>
        </div>
        <button
          type="button"
          onClick={fetchProfileData}
          className="rounded-xl bg-accent-primary text-white text-xs font-black px-5 py-2.5 hover:bg-accent-primary/95 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { user, preferences, summary, gamification, friends, goals, milestones, recentActivities } = profileData;

  const getActiveTabAction = () => {
    if (activeTab === 'friends') {
      return (
        <button
          type="button"
          onClick={() => {
            // Trigger Add Friend modal from the header
            const addBtn = document.querySelector('[data-add-friend-trigger]');
            if (addBtn) (addBtn as HTMLButtonElement).click();
          }}
          className="rounded-xl bg-accent-primary hover:bg-accent-primary/95 text-white text-xs font-black px-4.5 py-2 h-10 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
        >
          <Icons.UserPlus className="mr-2 h-4 w-4 inline" />
          Add Friend
        </button>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-col gap-6 pb-6 animate-fade-in">
      {activeTab === 'friends' && (
        <div className="flex justify-end">{getActiveTabAction()}</div>
      )}

      {/* Hero overview identity card */}
      <ProfileOverviewCard
        imageUrl={clerkUser?.imageUrl}
        displayName={user.displayName || clerkUser?.fullName || clerkUser?.username || 'Citizen'}
        email={user.email}
        location={user.city ? `${user.city}, ${user.country || ''}` : undefined}
        level={gamification.level}
        streak={gamification.currentStreak}
        totalXp={gamification.totalXp}
        totalCo2eSavedKg={summary.totalCo2eSavedKg}
      />

      {/* Tabs segment navigation */}
      <ProfileTabs
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        friendRequestsCount={friends.incoming.length}
      />

      {/* Active Tab Panel */}
      <div className="min-h-[400px]">
        {activeTab === 'account' && (
          <AccountTab
            user={user}
            preferences={preferences}
            onSaveAccount={handleSaveAccount}
            onSavePreferences={handleSavePreferences}
          />
        )}

        {activeTab === 'friends' && (
          <FriendsTab
            friends={friends.list}
            incomingRequests={friends.incoming}
            outgoingRequests={friends.outgoing}
            onRefresh={fetchProfileData}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryTab
            summary={summary}
            gamification={gamification}
            goals={goals}
            milestones={milestones}
            recentActivities={recentActivities}
          />
        )}
      </div>
    </div>
  );
}
