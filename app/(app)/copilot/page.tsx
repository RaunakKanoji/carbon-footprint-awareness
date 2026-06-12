import React from 'react';

import PageHeader from '@/components/app/page-header';
import PlaceholderState from '@/components/app/placeholder-state';

export default function AiCopilotPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="AI Carbon Copilot"
        description="Interact with your personal AI coach to get customized carbon reduction recommendations."
        badge="Coming in Tasks 20–21"
      />
      <PlaceholderState
        title="Interactive AI Advice"
        description="A real-time, streaming AI chat interface built on top of Gemini will be integrated here to offer personalized sustainability advice."
      />
    </div>
  );
}
