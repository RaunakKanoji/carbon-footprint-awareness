import React from 'react';
import PageHeader from '@/components/app/page-header';
import PlaceholderState from '@/components/app/placeholder-state';

export default function OnboardingPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Profile Onboarding"
        description="Establish your location, diet, and transit details to personalize footprint baselines."
        badge="Coming in Task 12"
      />
      <PlaceholderState
        title="Set Up Your Carbon Baseline"
        description="An interactive onboarding questionnaire will be implemented in the next task to calculate your personal starting footprint."
      />
    </div>
  );
}
