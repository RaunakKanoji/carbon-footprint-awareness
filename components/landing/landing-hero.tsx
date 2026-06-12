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
          <Leaf className="w-4 h-4" />
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-base font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href={routes.dashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-bg-surface hover:bg-bg-base text-text-primary px-8 py-4 text-base font-bold border border-border-default transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 fill-current text-text-secondary" />
            <span>View Demo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
