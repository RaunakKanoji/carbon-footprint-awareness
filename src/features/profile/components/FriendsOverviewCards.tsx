import React from 'react';
import * as Icons from 'lucide-react';
import { MetricCard } from '@/src/components/ui/metric-card';

interface FriendsOverviewCardsProps {
  friendsCount: number;
  pendingCount: number;
  activeMissionsCount: number;
}

export default function FriendsOverviewCards({
  friendsCount,
  pendingCount,
  activeMissionsCount,
}: FriendsOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricCard label="Friends" value={String(friendsCount)} icon={<Icons.Users />} tone="green" />
      <MetricCard
        label="Pending Requests"
        value={String(pendingCount)}
        icon={<Icons.Clock />}
        tone="amber"
      />
      <MetricCard
        label="Active Missions"
        value={String(activeMissionsCount)}
        icon={<Icons.Trophy />}
        tone="blue"
      />
    </div>
  );
}
