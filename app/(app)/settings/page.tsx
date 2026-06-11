import React from 'react';

import PageHeader from '@/components/app/page-header';
import PlaceholderState from '@/components/app/placeholder-state';

export default function SettingsPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Settings"
        description="Configure application preferences, UI display tokens, and account keys."
        badge="Coming in Task 19"
      />
      <PlaceholderState
        title="Account Preferences"
        description="Theme adjustments, notification controls, and API configurations will be accessible on this settings screen."
      />
    </div>
  );
}
