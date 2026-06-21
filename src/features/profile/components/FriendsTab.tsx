/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import FriendsOverviewCards from './FriendsOverviewCards';
import FriendList from './FriendList';
import FriendRequestCard from './FriendRequestCard';
import AddFriendModal from './AddFriendModal';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/components/ui/toast-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';

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

interface Request {
  friendshipId: string;
  senderId?: string;
  receiverId?: string;
  name: string;
  email: string;
  city?: string | null;
}

interface FriendsTabProps {
  friends: Friend[];
  incomingRequests: Request[];
  outgoingRequests: Request[];
  onRefresh: () => void;
}

interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  xpReward: number;
}

export default function FriendsTab({
  friends,
  incomingRequests,
  outgoingRequests,
  onRefresh,
}: FriendsTabProps) {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  // Invite to Mission Modal State
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [templates, setTemplates] = useState<MissionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [invitingFriend, setInvitingFriend] = useState(false);

  // Fetch active mission templates when a friend is selected
  useEffect(() => {
    if (!selectedFriend) return;
    setLoadingTemplates(true);
    fetch('/api/challenges/missions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Filter missions that are weekly templates to pick from
          setTemplates(data.missions || []);
        }
      })
      .catch((err) => console.error('Failed to load mission templates:', err))
      .finally(() => setLoadingTemplates(false));
  }, [selectedFriend]);

  const handleSendFriendRequest = async (target: { friendId?: string; friendEmail?: string }) => {
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_request', ...target }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to send friend request.');
    }
    toast({
      variant: 'success',
      description: 'Friend request sent successfully.',
    });
    onRefresh();
  };

  const handleRespondToRequest = async (friendshipId: string, accept: boolean) => {
    setIsResponding(friendshipId);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'respond', friendshipId, accept }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to respond to request.');
      }
      toast({
        variant: 'success',
        description: accept ? 'Friend request accepted!' : 'Friend request declined.',
      });
      onRefresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      });
    } finally {
      setIsResponding(null);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    try {
      await fetch(`/api/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', friendId }),
      });
      toast({
        variant: 'info',
        description: 'Removing friend...',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to remove friend.',
      });
    }
  };

  const handleInviteToMission = async (template: MissionTemplate) => {
    if (!selectedFriend) return;
    setInvitingFriend(true);
    try {
      const res = await fetch('/api/challenges/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_friend_mission',
          title: template.title,
          description: template.description,
          category: template.category,
          targetValue: template.targetValue,
          xpReward: template.xpReward,
          inviteeIds: [selectedFriend.id],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send invite.');
      }
      toast({
        variant: 'success',
        description: `Successfully invited ${selectedFriend.displayName} to mission: ${template.title}!`,
      });
      setSelectedFriend(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to send invite.',
      });
    } finally {
      setInvitingFriend(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Social metrics overview */}
      <FriendsOverviewCards
        friendsCount={friends.length}
        pendingCount={incomingRequests.length + outgoingRequests.length}
        activeMissionsCount={0} // We can compute active friend missions if available
      />

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        {/* Left Column: Accepted Friends */}
        <div className="h-full lg:col-span-2">
          <Card className="flex h-full flex-col overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
            <div className="border-b border-border-subtle px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Icons.Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-text-primary">
                    Friend List
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Your accepted connections in Carbon Compass.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="h-9 px-4 rounded-xl text-xs font-black"
              >
                <Icons.UserPlus className="mr-2 h-4 w-4" />
                Add Friend
              </Button>
            </div>

            <CardContent className="flex-1 p-5">
              <FriendList
                friends={friends}
                onInviteToMission={setSelectedFriend}
                onRemoveFriend={handleRemoveFriend}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pending Invites */}
        <div className="h-full">
          <Card className="flex h-full flex-col overflow-hidden rounded-3xl border-border-default bg-bg-surface shadow-sm">
            <div className="border-b border-border-subtle px-5 py-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <Icons.MailOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-text-primary">
                  Pending Requests
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Manage incoming and outgoing invites.
                </p>
              </div>
            </div>

            <CardContent className="flex-1 p-5">
              <FriendRequestCard
                incoming={incomingRequests}
                outgoing={outgoingRequests}
                onRespond={handleRespondToRequest}
                isResponding={isResponding}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Friend Dialog Modal */}
      <AddFriendModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSendRequest={handleSendFriendRequest}
      />

      {/* Mission Invite Dialog Picker */}
      <Dialog open={!!selectedFriend} onOpenChange={(open) => !open && setSelectedFriend(null)}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl border border-border-default bg-bg-surface p-6 shadow-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-text-primary flex items-center gap-2">
              <Icons.Trophy className="w-5 h-5 text-accent-primary shrink-0" />
              <span>Invite to Mission</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-text-secondary leading-relaxed font-semibold">
              Invite <strong>{selectedFriend?.displayName}</strong> to complete a weekly carbon-saving mission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 my-4 max-h-[300px] overflow-y-auto pr-1">
            {loadingTemplates ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Icons.Loader className="w-6 h-6 text-accent-primary animate-spin" />
                <p className="text-xs text-text-muted">Loading weekly missions...</p>
              </div>
            ) : templates.length > 0 ? (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-2xl border border-border-default bg-bg-base/40 p-4 space-y-3"
                >
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="font-extrabold text-xs text-text-primary leading-tight">
                        {template.title}
                      </h4>
                      <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-black text-indigo-700 leading-none">
                        +{template.xpReward} XP
                      </span>
                    </div>
                    <p className="text-[10px] text-text-secondary mt-1 font-semibold leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={invitingFriend}
                      onClick={() => handleInviteToMission(template)}
                      className="rounded-lg bg-accent-primary hover:bg-accent-primary/95 text-white text-[10px] font-black px-3 py-1.5 transition-colors cursor-pointer"
                    >
                      Invite Friend
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-border-default rounded-2xl">
                <Icons.Compass className="w-8 h-8 text-text-muted mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-black text-text-primary">No active templates found</p>
                <p className="text-[10px] text-text-muted mt-0.5">Please check back later this week.</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 border-t border-border-default pt-4">
            <button
              type="button"
              onClick={() => setSelectedFriend(null)}
              className="rounded-xl border border-border-default hover:bg-bg-elevated px-4 py-2 text-xs font-bold text-text-primary h-10 transition-colors cursor-pointer outline-none"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
