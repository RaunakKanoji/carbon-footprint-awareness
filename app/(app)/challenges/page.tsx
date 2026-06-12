import React from 'react';

import PageHeader from '@/components/app/page-header';
import PlaceholderState from '@/components/app/placeholder-state';

export default function ChallengesPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Eco Challenges"
        description="Participate in community and personal carbon reduction challenges."
        badge="Coming in Task 23"
      />
      <PlaceholderState
        title="Gamification & Challenges"
        description="Earn badges, join reduction goals (like 'Meat-free Week' or 'Cycle to Work'), and monitor challenge streaks here."
      />
    </div>
  );
}
