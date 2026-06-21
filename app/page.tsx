import React from 'react';
import { getCurrentUser } from '@/src/lib/auth';

// Import landing page sections
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import AppShowcase from '@/components/landing/AppShowcase';
import FeatureGrid from '@/components/landing/FeatureGrid';
import HowItWorks from '@/components/landing/HowItWorks';
import ActivityCategories from '@/components/landing/ActivityCategories';
import AiSimulatorSection from '@/components/landing/AiSimulatorSection';
import ChallengesSection from '@/components/landing/ChallengesSection';
import ExtensionSection from '@/components/landing/ExtensionSection';
import ImpactStats from '@/components/landing/ImpactStats';
import DataSourcesSection from '@/components/landing/DataSourcesSection';
import TestimonialSection from '@/components/landing/TestimonialSection';
import FinalCta from '@/components/landing/FinalCta';
import LandingFooter from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'Carbon Compass — Track and Reduce Your Carbon Footprint',
  description:
    'Carbon Compass helps you track everyday activities, understand your carbon footprint, simulate lifestyle changes, and build lower-impact habits with AI guidance.',
};

export default async function RootLandingPage() {
  const dbUser = await getCurrentUser();
  const hasUser = !!dbUser;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-textPrimary">
      {/* 1. Navigation Bar */}
      <LandingNav hasUser={hasUser} />

      {/* Main content wrapper */}
      <main className="flex-1 w-full flex flex-col items-center overflow-x-hidden">
        {/* 2. Hero Section */}
        <HeroSection hasUser={hasUser} />

        {/* 3. App UI Showcase (Desktop, Mobile, Extension mockups) */}
        <AppShowcase />

        {/* 4. Feature Highlights */}
        <FeatureGrid />

        {/* 5. How It Works */}
        <HowItWorks />

        {/* 6. Activity Tracking Categories */}
        <ActivityCategories />

        {/* 7. AI + Simulator Section */}
        <AiSimulatorSection />

        {/* 8. Challenges + Social Progress */}
        <ChallengesSection />

        {/* 9. Shopping Extension Section */}
        <ExtensionSection />

        {/* 10. Impact Metrics */}
        <ImpactStats />

        {/* 11. Data Sources / API Integrations */}
        <DataSourcesSection />

        {/* 12. Testimonial / Demo Story */}
        <TestimonialSection />

        {/* 13. Final CTA */}
        <FinalCta hasUser={hasUser} />
      </main>

      {/* 14. Footer */}
      <LandingFooter />
    </div>
  );
}
