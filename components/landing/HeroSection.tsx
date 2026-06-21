import React from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Play } from 'lucide-react';

interface HeroSectionProps {
  hasUser: boolean;
}

export default function HeroSection({ hasUser }: HeroSectionProps) {
  return (
    <div className="relative py-20 px-6 sm:py-28 sm:px-12 flex flex-col items-center justify-center text-center overflow-hidden w-full">
      {/* Background soft ambient green glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-emerald-500/5 blur-[120px] -z-10" />

      <div className="relative max-w-4xl space-y-8 z-10 flex flex-col items-center">
        {/* Eco Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider animate-fade-in select-none">
          <Leaf className="w-4 h-4 fill-current" aria-hidden="true" />
          <span>Carbon tracking and guidance</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-textPrimary sm:text-6xl max-w-3xl font-display">
          Understand your impact. <br />
          <span className="text-emerald-500">
            Build a better tomorrow.
          </span>
        </h1>

        {/* Description */}
        <p className="w-full max-w-2xl text-base sm:text-lg text-textSecondary leading-relaxed font-normal">
          Carbon Compass helps you track everyday activities, understand your carbon footprint, simulate lifestyle changes, and build lower-impact habits with AI guidance.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
          {hasUser ? (
            <Link
              href="/dashboard"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm hover:bg-primaryHover transition-all active:scale-[0.98]"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm hover:bg-primaryHover transition-all active:scale-[0.98]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-bg-surface px-6 text-sm font-bold text-text-primary transition-all hover:bg-slate-50"
              >
                <Play className="w-4 h-4 fill-current text-textSecondary" aria-hidden="true" />
                <span>See How It Works</span>
              </a>
            </>
          )}
        </div>

        {/* Trust Row under buttons */}
        <div className="pt-8 border-t border-gray-100/60 w-full max-w-xl flex flex-wrap justify-between items-center gap-4 text-[10px] sm:text-xs font-bold text-textMuted uppercase tracking-wider select-none">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 10K+ activities tracked</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 500K+ actions logged</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 25+ data sources</span>
        </div>
      </div>
    </div>
  );
}
