import React from 'react';
import * as Icons from 'lucide-react';
import { EmptyState } from '@/src/components/ui/empty-state';

interface Friend {
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

interface FriendListProps {
  friends: Friend[];
  onInviteToMission: (friend: Friend) => void;
  onRemoveFriend?: (friendId: string) => void;
}

export default function FriendList({ friends, onInviteToMission, onRemoveFriend }: FriendListProps) {
  if (friends.length === 0) {
    return (
      <EmptyState
        className="h-full min-h-64"
        icon={<Icons.Users />}
        title="Your climate circle is empty"
        description="Add friends to compare progress and complete weekly missions together."
      />
    );
  }

  return (
    <div className="space-y-3.5">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="rounded-2xl border border-border-default bg-bg-surface p-4 flex flex-col sm:flex-row items-center gap-4 justify-between transition-shadow hover:shadow-xs"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1 w-full">
            <div className="w-11 h-11 rounded-full bg-accent-primary-dim border border-accent-primary/20 flex items-center justify-center text-accent-primary font-black text-sm shrink-0">
              {friend.displayName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-text-primary truncate">
                  {friend.displayName}
                </span>
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 leading-none">
                  Lvl {friend.level}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1 font-semibold leading-none truncate">
                {friend.city ? `${friend.city}, ${friend.country || ''}` : 'Earth citizen'}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] font-bold text-text-muted">
                <span className="flex items-center gap-1">
                  <Icons.Sparkles className="w-3 h-3 text-indigo-500" />
                  {friend.weeklyXp} weekly XP
                </span>
                <span className="h-3 w-px bg-border-default hidden sm:inline" />
                <span className="flex items-center gap-1">
                  <Icons.Leaf className="w-3 h-3 text-emerald-500" />
                  {friend.weeklyCo2eSavedKg.toFixed(1)} kg saved
                </span>
                <span className="h-3 w-px bg-border-default hidden sm:inline" />
                <span className="flex items-center gap-1">
                  <Icons.Flame className="w-3 h-3 text-orange-500" />
                  {friend.currentStreak}-day streak
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-dashed border-border-default">
            <button
              type="button"
              onClick={() => onInviteToMission(friend)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-accent-primary hover:bg-accent-primary/95 text-white text-xs font-black px-4 py-2 h-9 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
            >
              <Icons.Plus className="w-3.5 h-3.5" />
              <span>Invite to Mission</span>
            </button>
            {onRemoveFriend && (
              <button
                type="button"
                onClick={() => onRemoveFriend(friend.id)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-default bg-bg-base hover:bg-bg-elevated hover:text-red-600 text-text-muted transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500/25"
                title="Remove Friend"
              >
                <Icons.UserMinus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
