import { ArrowRight, Leaf, Play } from 'lucide-react';

import Link from 'next/link';

import { routes } from '@/lib/routes';

export default function LandingHero() {
  return (
    <div className="relative py-20 px-6 sm:py-32 sm:px-12 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>

      <div className="relative max-w-4xl space-y-8 z-10 flex flex-col items-center">
        {/* Eco Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider animate-fade-in">
          <Leaf className="w-4 h-4" aria-hidden="true" />
          <span>AI-Powered Carbon Compass</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.15]">
          Your personal AI coach for <br />
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            reducing carbon footprint.
          </span>
        </h1>

        {/* Description */}
        <p className="w-full max-w-2xl text-base sm:text-xl text-text-secondary leading-relaxed font-normal">
          Track daily activities, understand your emissions, and discover simple, high-impact ways
          to reduce your environmental impact.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
          <Link
            href={routes.signUp}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-[background-color,transform] hover:scale-[1.02] hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 active:scale-[0.98] sm:w-auto"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
          <Link
            href={routes.dashboard}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-surface px-8 py-4 text-base font-bold text-text-primary transition-[background-color,transform] hover:scale-[1.02] hover:bg-bg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 active:scale-[0.98] sm:w-auto"
          >
            <Play className="w-5 h-5 fill-current text-text-secondary" aria-hidden="true" />
            <span>View Demo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
