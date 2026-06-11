import React from 'react';
import PageHeader from '@/components/app/page-header';
import PlaceholderState from '@/components/app/placeholder-state';

export default function LogActivityPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Log Activity"
        description="Record your daily travels, food choices, and home utility consumption."
        badge="Coming in Task 16"
      />
      <PlaceholderState
        title="Record Daily Footprint"
        description="Forms to log transit (car, bus, flight), meals (vegan, vegetarian, meat-heavy), and home energy consumption will be implemented here."
      />
    </div>
  );
}
