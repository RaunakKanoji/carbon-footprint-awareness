import React from 'react';
import LandingHero from '@/components/landing/landing-hero';
import FeatureCard from '@/components/landing/feature-card';

export default function RootLandingPage() {
  const features = [
    {
      title: 'Daily Carbon Tracking',
      description: 'Log daily transit, food consumption, and electricity usage with instantaneous calculation of greenhouse gas impact.',
      iconName: 'PlusCircle',
    },
    {
      title: 'AI Carbon Copilot',
      description: 'Interact with an intelligent sustainability chatbot that analyzes your logs and delivers custom offset recommendations.',
      iconName: 'Bot',
    },
    {
      title: 'Lifestyle Simulator',
      description: 'Model future options (e.g. buying an EV or changing your diet) to quantify offsets before you make the switch.',
      iconName: 'Sliders',
    },
    {
      title: 'Carbon Budget',
      description: 'Define monthly greenhouse gas limits, track progress visually, and unlock gamified reduction goals.',
      iconName: 'Trophy',
    },
  ];

  return (
    <div className="flex-1 bg-bg-base flex flex-col items-center">
      {/* Hero Section */}
      <LandingHero />

      {/* Features Showcase Grid */}
      <section id="features" className="w-full max-w-5xl px-6 pb-24 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            Smarter Carbon Reduction
          </h2>
          <p className="text-text-secondary text-sm w-full max-w-md mx-auto">
            Everything you need to track, simulate, and reduce your greenhouse gas footprint.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              iconName={feature.iconName}
            />
          ))}
        </div>
      </section>
    </div>
  );
}