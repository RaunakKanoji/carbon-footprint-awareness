import React from 'react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/src/components/ui/card';

interface Activity {
  id: string;
  category: string;
  subType: string;
  co2eKg: number;
  occurredAt: string;
}

interface ProfileRecentActivityProps {
  activities: Activity[];
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FOOD: Icons.Utensils,
  TRANSPORT: Icons.Car,
  ENERGY: Icons.Zap,
  SHOPPING: Icons.ShoppingBag,
  WASTE: Icons.Trash2,
};

const CATEGORY_COLORS: Record<string, string> = {
  FOOD: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  TRANSPORT: 'bg-teal-50 text-teal-700 ring-teal-100',
  ENERGY: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  SHOPPING: 'bg-amber-50 text-amber-700 ring-amber-100',
  WASTE: 'bg-red-50 text-red-700 ring-red-100',
};

export default function ProfileRecentActivity({ activities }: ProfileRecentActivityProps) {
  const formatCategory = (cat: string) => {
    return cat.charAt(0) + cat.slice(1).toLowerCase();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="rounded-3xl border-border-default bg-bg-surface shadow-sm overflow-hidden animate-fade-in">
      <div className="border-b border-border-subtle px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
            <Icons.History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-text-primary">
              Recent Activity
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Your 5 latest logged footprints.
            </p>
          </div>
        </div>
        <Link
          href="/log"
          className="text-xs font-black text-accent-primary hover:underline"
        >
          View Full Log
        </Link>
      </div>

      <CardContent className="p-5">
        {activities.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {activities.map((activity) => {
              const IconComponent = CATEGORY_ICONS[activity.category] || Icons.Package;
              const bgClass = CATEGORY_COLORS[activity.category] || 'bg-bg-elevated text-text-secondary';

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${bgClass}`}>
                      <IconComponent className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-xs text-text-primary truncate">
                        {activity.subType || formatCategory(activity.category)}
                      </p>
                      <p className="text-[10px] text-text-secondary mt-1 font-semibold leading-none truncate">
                        {formatCategory(activity.category)} · {formatDate(activity.occurredAt)}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-bg-base border border-border-subtle px-2.5 py-1 text-xs font-black tabular-nums text-text-primary">
                    {activity.co2eKg.toFixed(2)} kg
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <Icons.Inbox className="w-8 h-8 text-text-muted animate-pulse" />
            <div>
              <p className="text-sm font-black text-text-primary">No activities logged yet</p>
              <p className="text-xs text-text-secondary max-w-xs mt-1 leading-normal font-semibold">
                Start tracking food, travel, shopping, waste or energy to populate your history.
              </p>
            </div>
            <Link
              href="/log"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-accent-primary text-white text-xs font-black px-4 py-2 hover:bg-accent-primary/95 transition-colors cursor-pointer mt-1"
            >
              Log Activity
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
