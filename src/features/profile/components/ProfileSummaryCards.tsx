import React from 'react';
import * as Icons from 'lucide-react';
import { MetricCard } from '@/src/components/ui/metric-card';
import { formatKgCo2e, formatKgSaved } from '@/src/lib/format';

interface ProfileSummaryCardsProps {
  weeklyCo2eKg: number;
  monthlyCo2eKg: number;
  totalCo2eSavedKg: number;
  bestCategory: string;
}

export default function ProfileSummaryCards({
  weeklyCo2eKg,
  monthlyCo2eKg,
  totalCo2eSavedKg,
  bestCategory,
}: ProfileSummaryCardsProps) {
  const formatCategoryName = (cat: string) => {
    if (!cat || cat === 'None') return 'None yet';
    return cat.charAt(0) + cat.slice(1).toLowerCase();
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard
        label="This Week"
        value={formatKgCo2e(weeklyCo2eKg)}
        description="Estimated footprint"
        icon={<Icons.CalendarRange />}
        tone="green"
      />
      <MetricCard
        label="This Month"
        value={formatKgCo2e(monthlyCo2eKg)}
        description="Estimated footprint"
        icon={<Icons.Calendar />}
        tone="blue"
      />
      <MetricCard
        label="Saved Carbon"
        value={formatKgSaved(totalCo2eSavedKg)}
        description="CO₂e saved"
        icon={<Icons.TrendingDown />}
        tone="green"
      />
      <MetricCard
        label="Best Category"
        value={formatCategoryName(bestCategory)}
        description="Lowest emissions"
        icon={<Icons.CheckCircle />}
        tone="amber"
      />
    </div>
  );
}
