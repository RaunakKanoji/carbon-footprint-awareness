import React from 'react';
import DashboardMockup from './DashboardMockup';
import MobileMockup from './MobileMockup';
import ExtensionMockup from './ExtensionMockup';

export default function AppShowcase() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 text-center space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl font-display">
          Everything you need to live lighter.
        </h2>
        <p className="text-base text-textSecondary max-w-2xl mx-auto leading-relaxed">
          Track, understand, simulate, and reduce your footprint from one connected, premium dashboard.
        </p>
      </div>

      {/* Mockups Container */}
      <div className="relative pt-6 pb-12 w-full flex flex-col items-center">
        {/* Large Layout for Desktop (MD & UP) */}
        <div className="hidden lg:block relative w-full h-[620px]">
          {/* Main Desktop Dashboard */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[840px] z-10 hover:scale-[1.01] transition-transform duration-300">
            <DashboardMockup />
          </div>

          {/* Overlapping Mobile Mockup */}
          <div className="absolute bottom-2 left-6 z-20 hover:-translate-y-1 transition-transform duration-300 shadow-2xl">
            <MobileMockup />
          </div>

          {/* Overlapping Extension Mockup */}
          <div className="absolute top-16 right-6 z-20 hover:-translate-y-1 transition-transform duration-300 shadow-2xl">
            <ExtensionMockup />
          </div>
        </div>

        {/* Medium Screen Layout (MD to LG) */}
        <div className="hidden md:flex lg:hidden flex-col items-center gap-8 w-full">
          <div className="w-[720px]">
            <DashboardMockup />
          </div>
          <div className="flex gap-8 justify-center items-start">
            <MobileMockup />
            <ExtensionMockup />
          </div>
        </div>

        {/* Mobile Screen Layout (SM & BELOW) */}
        <div className="flex md:hidden flex-col items-center gap-6 w-full">
          {/* Dashboard is represented by a scrollable container or we scale it down */}
          <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
            <div className="w-[500px] px-2 shrink-0">
              <DashboardMockup />
            </div>
          </div>
          <div className="text-[11px] text-textMuted italic -mt-2">Scroll horizontally to view the web dashboard</div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-4">
            <MobileMockup />
            <ExtensionMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
