import React from 'react';
import * as Icons from 'lucide-react';
import { formatKgSaved, formatXp } from '@/src/lib/format';

interface ProfileOverviewCardProps {
  imageUrl?: string | null;
  displayName: string;
  email: string;
  location?: string;
  level: number;
  streak: number;
  totalXp: number;
  totalCo2eSavedKg: number;
}

export default function ProfileOverviewCard({
  imageUrl,
  displayName,
  email,
  location,
  level,
  streak,
  totalXp,
  totalCo2eSavedKg,
}: ProfileOverviewCardProps) {
  return (
    <div className="rounded-3xl border border-border-default bg-bg-surface p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between animate-fade-in">
      <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left min-w-0 flex-1 w-full">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={displayName}
            className="w-20 h-20 rounded-full border-4 border-bg-base object-cover shadow-md shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-accent-primary-dim border border-accent-primary/20 flex items-center justify-center text-accent-primary shadow-md shrink-0">
            <Icons.User className="w-9 h-9" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black text-text-primary truncate">
            {displayName || 'Citizen'}
          </h2>
          <p className="text-xs text-text-muted mt-0.5 truncate">{email}</p>
          {location && (
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-text-secondary mt-2 font-semibold">
              <Icons.MapPin className="w-3.5 h-3.5 text-accent-primary shrink-0" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-auto grid grid-cols-2 sm:grid-cols-4 md:flex items-center gap-3 md:gap-4 shrink-0 pt-4 md:pt-0 border-t border-dashed border-border-default md:border-t-0">
        {/* Level */}
        <div className="bg-bg-base border border-border-subtle rounded-2xl p-3 text-center min-w-[100px] flex-1 md:flex-initial">
          <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Level</p>
          <div className="flex items-center justify-center gap-1 mt-1.5">
            <Icons.Award className="w-4 h-4 text-emerald-500" />
            <span className="text-lg font-black text-text-primary">{level}</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-bg-base border border-border-subtle rounded-2xl p-3 text-center min-w-[100px] flex-1 md:flex-initial">
          <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Streak</p>
          <div className="flex items-center justify-center gap-1 mt-1.5">
            <Icons.Flame className="w-4 h-4 text-orange-500" />
            <span className="text-lg font-black text-text-primary">{streak} days</span>
          </div>
        </div>

        {/* Total XP */}
        <div className="bg-bg-base border border-border-subtle rounded-2xl p-3 text-center min-w-[100px] flex-1 md:flex-initial">
          <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">XP</p>
          <div className="flex items-center justify-center gap-1 mt-1.5">
            <Icons.Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-lg font-bold text-text-primary">{formatXp(totalXp)}</span>
          </div>
        </div>

        {/* Saved CO2e */}
        <div className="bg-bg-base border border-border-subtle rounded-2xl p-3 text-center min-w-[100px] flex-1 md:flex-initial">
          <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Saved</p>
          <div className="flex items-center justify-center gap-1 mt-1.5">
            <Icons.Leaf className="w-4 h-4 text-emerald-600" />
            <span className="text-lg font-bold text-text-primary">
              {formatKgSaved(totalCo2eSavedKg)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
