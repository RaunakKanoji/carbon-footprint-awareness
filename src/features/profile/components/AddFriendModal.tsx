import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';

interface SearchedUser {
  id: string;
  name: string;
  email: string;
  city?: string | null;
}

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendRequest: (target: { friendId?: string; friendEmail?: string }) => Promise<void>;
}

const inputClassName =
  'h-10 w-full rounded-xl border border-border-default bg-bg-base px-3 text-sm font-semibold text-text-primary transition-colors placeholder:text-text-muted focus-visible:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50';

export default function AddFriendModal({ isOpen, onClose, onSendRequest }: AddFriendModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query: searchQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.users || []);
      } else {
        throw new Error(data.error || 'Failed to search users.');
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendDirectInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onSendRequest({ friendEmail: emailInput.trim() });
      setSuccessMsg(`Friend request sent to ${emailInput}`);
      setEmailInput('');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to send request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSearchResult = async (user: SearchedUser) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onSendRequest({ friendId: user.id });
      setSuccessMsg(`Friend request sent to ${user.name}`);
      // Remove from results
      setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to send request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] rounded-3xl border border-border-default bg-bg-surface p-6 shadow-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-text-primary flex items-center gap-2">
            <Icons.UserPlus className="w-5 h-5 text-accent-primary shrink-0" />
            <span>Add Friend to Climate Circle</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-secondary leading-relaxed font-semibold">
            Invite friends to track progress together, compete on leaderboards, and complete weekly missions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 my-4">
          {/* Section 1: Search */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
              Search by name or email
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type name or email..."
                className={inputClassName}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="flex items-center justify-center rounded-xl bg-accent-primary hover:bg-accent-primary/95 text-white font-black text-xs h-10 w-10 shrink-0 cursor-pointer transition-colors"
              >
                {isSearching ? (
                  <Icons.Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Icons.Search className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 rounded-xl border border-border-default bg-bg-base/30 max-h-[160px] overflow-y-auto p-1.5 space-y-1">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg bg-bg-surface border border-border-subtle"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-xs text-text-primary truncate">{user.name}</p>
                      <p className="text-[10px] text-text-secondary font-semibold truncate">
                        {user.city ? `From ${user.city}` : user.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleAddSearchResult(user)}
                      className="shrink-0 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-black px-2.5 py-1 transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <p className="text-[10px] text-text-secondary italic">No users found matching query.</p>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border-default"></div>
            <span className="flex-shrink mx-3 text-[10px] font-black uppercase text-text-muted">Or Direct Invite</span>
            <div className="flex-grow border-t border-border-default"></div>
          </div>

          {/* Section 2: Direct invite */}
          <form onSubmit={handleSendDirectInvite} className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
              Invite by Email Address
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="friend@email.com"
              className={inputClassName}
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting || !emailInput.trim()}
              className="w-full h-10 rounded-xl text-xs font-black"
            >
              {isSubmitting ? (
                <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.Send className="mr-2 h-4 w-4" />
              )}
              Send Direct Invite
            </Button>
          </form>

          {/* Status Banners */}
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
              <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300 text-xs font-semibold rounded-xl flex items-center gap-2">
              <Icons.AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 border-t border-border-default pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border-default hover:bg-bg-elevated px-4 py-2 text-xs font-bold text-text-primary h-10 transition-colors cursor-pointer outline-none"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
