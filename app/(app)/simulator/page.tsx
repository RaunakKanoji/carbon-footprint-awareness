import React from 'react';

import PageHeader from '@/components/app/page-header';
import PlaceholderState from '@/components/app/placeholder-state';

export default function SimulatorPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Lifestyle Simulator"
        description="Simulate potential lifestyle adjustments and view their hypothetical offsets."
        badge="Coming in Task 22"
      />
      <PlaceholderState
        title="Predict Future Offsets"
        description="Interactive lifestyle sliders (e.g. converting to an EV, switching to solar, eating vegan) will let you run simulations before making changes."
      />
    </div>
  );
}
