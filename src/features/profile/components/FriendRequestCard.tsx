import React from 'react';
import * as Icons from 'lucide-react';
import { EmptyState } from '@/src/components/ui/empty-state';

interface Request {
  friendshipId: string;
  senderId?: string;
  receiverId?: string;
  name: string;
  email: string;
  city?: string | null;
}

interface FriendRequestCardProps {
  incoming: Request[];
  outgoing: Request[];
  onRespond: (friendshipId: string, accept: boolean) => Promise<void>;
  isResponding: string | null;
}

export default function FriendRequestCard({
  incoming,
  outgoing,
  onRespond,
  isResponding,
}: FriendRequestCardProps) {
  if (incoming.length === 0 && outgoing.length === 0) {
    return (
      <EmptyState
        className="h-full min-h-64 px-4"
        icon={<Icons.Clock />}
        title="No pending requests"
        description="Incoming and outgoing invites will appear here."
      />
    );
  }

  return (
    <div className="h-full space-y-4">
      {/* Incoming Requests */}
      {incoming.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted">
            Incoming Requests ({incoming.length})
          </h4>
          <div className="space-y-2">
            {incoming.map((req) => {
              const loading = isResponding === req.friendshipId;
              return (
                <div
                  key={req.friendshipId}
                  className="rounded-2xl border border-amber-200 bg-amber-50/20 p-3.5 flex flex-col sm:flex-row items-center gap-3 justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 w-full">
                    <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-xs shrink-0">
                      {req.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-xs text-text-primary truncate">
                        {req.name} wants to connect
                      </p>
                      <p className="text-[10px] text-text-secondary font-semibold truncate">
                        {req.city ? `From ${req.city}` : req.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto shrink-0 mt-2.5 sm:mt-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-dashed border-amber-200/50">
                    <button
                      type="button"
                      disabled={loading || !!isResponding}
                      onClick={() => onRespond(req.friendshipId, true)}
                      className="flex-1 sm:flex-initial flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black px-3 py-1.5 h-8 transition-colors cursor-pointer outline-none"
                    >
                      {loading ? (
                        <Icons.Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Accept</span>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={loading || !!isResponding}
                      onClick={() => onRespond(req.friendshipId, false)}
                      className="flex-1 sm:flex-initial flex items-center justify-center rounded-lg border border-border-default bg-bg-base hover:bg-bg-elevated text-text-primary text-[11px] font-black px-3 py-1.5 h-8 transition-colors cursor-pointer outline-none"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outgoing Requests */}
      {outgoing.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted">
            Sent Requests ({outgoing.length})
          </h4>
          <div className="space-y-2">
            {outgoing.map((req) => (
              <div
                key={req.friendshipId}
                className="rounded-2xl border border-border-default bg-bg-base/30 p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-full bg-bg-surface border border-border-default flex items-center justify-center text-text-secondary font-black text-xs shrink-0">
                    {req.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-xs text-text-primary truncate">
                      Waiting for {req.name} to accept
                    </p>
                    <p className="text-[10px] text-text-muted font-semibold truncate">
                      {req.email}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase text-text-muted">
                  <Icons.Hourglass className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  <span className="hidden sm:inline">Pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
