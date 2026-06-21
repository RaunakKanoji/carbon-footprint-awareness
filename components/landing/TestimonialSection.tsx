import React from 'react';
import { Star } from 'lucide-react';

export default function TestimonialSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 border-t border-gray-100 bg-slate-50/20">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        
        {/* Five Star rating */}
        <div className="flex justify-center gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-current" />
          ))}
        </div>
        
        {/* Testimonial Quote */}
        <blockquote className="text-lg sm:text-xl font-medium text-textPrimary leading-relaxed italic">
          &ldquo;Carbon Compass changed the way I think about my daily commute and food choices. It is highly motivating, gamified, and gives me practical alternatives instead of climate guilt.&rdquo;
        </blockquote>

        {/* User profile */}
        <div className="space-y-0.5">
          <div className="font-bold text-gray-800 text-sm">Ananya Rao</div>
          <div className="text-xs text-textMuted">Verified Habit Builder · Bangalore</div>
        </div>

        {/* Extra hackathon challenge context */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-center items-center gap-4 text-left max-w-lg mx-auto">
          <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0 border border-emerald-200 text-[18px]">
            💡
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-[12px] uppercase tracking-wider">Climate-Tech Hackathon Showcase</h4>
            <p className="text-[11.5px] text-textSecondary mt-0.5 leading-relaxed">
              Demonstrates end-to-end user flows: log meals or vehicle trips, simulate reduction plans, and join challenges.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
