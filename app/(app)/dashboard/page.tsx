import React from 'react';
import PageHeader from '@/components/app/page-header';
import PlaceholderState from '@/components/app/placeholder-state';

export default function DashboardPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Dashboard"
        description="View your carbon footprint summary, monthly budgets, and actionable goals."
        badge="Coming in Task 18"
      />
      <PlaceholderState
        title="Your Carbon Overview"
        description="Detailed emission summaries and budget tracking graphs will appear here once activity logging and calculation engines are integrated."
        actionLabel="Go to Log Activity"
        actionHref="/log"
      />
    </div>
  );
}
