import React from 'react';
import PageHeader from '@/components/app/page-header';
import PlaceholderState from '@/components/app/placeholder-state';

export default function ProfilePage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="User Profile"
        description="Review your onboarding baseline information and current profile preferences."
        badge="Coming in Task 13"
      />
      <PlaceholderState
        title="Manage Sustainability Profile"
        description="Profile cards and data synchronizations to edit baseline inputs (like household size and locations) will be active here."
      />
    </div>
  );
}
