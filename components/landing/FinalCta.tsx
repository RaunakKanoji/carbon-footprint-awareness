import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

interface FinalCtaProps {
  hasUser: boolean;
}

export default function FinalCta({ hasUser }: FinalCtaProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 border-t border-gray-100">
      <div className="bg-emerald-500 rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-xl">
        {/* Soft floating glow background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-600/30 blur-3xl" />

        <div className="relative max-w-2xl mx-auto space-y-6 z-10">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-display leading-tight">
            Start building lower-carbon habits today.
          </h2>
          <p className="text-base text-emerald-50 leading-relaxed font-medium">
            Track your footprint, understand your daily impact, simulate lifestyle changes, and make cleaner choices with Carbon Compass.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            {hasUser ? (
              <Link
                href="/dashboard"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-emerald-600 hover:bg-emerald-50 active:scale-[0.98] transition-all shadow-sm"
              >
                Go to Dashboard
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-emerald-600 hover:bg-emerald-50 active:scale-[0.98] transition-all shadow-sm"
                >
                  Get Started Free
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-600/20 px-8 text-sm font-bold text-white hover:bg-emerald-600/40 active:scale-[0.98] transition-all"
                >
                  <Play className="h-4 w-4 fill-current text-emerald-100" />
                  View Demo Log
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
