import React from 'react';
import PageHeader from '@/components/app/page-header';
import PlaceholderState from '@/components/app/placeholder-state';

export default function InsightsPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Footprint Insights"
        description="Explore detailed analysis and trend histories of your carbon impact."
        badge="Coming in Task 24"
      />
      <PlaceholderState
        title="Data Analytics & Trends"
        description="Interactive charts, monthly category distributions, and trend histories using Recharts will be rendered on this page."
      />
    </div>
  );
}
