import React from 'react';
import { PlusCircle, BarChart3, Trophy } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Log your activities',
    description: 'Add meals, transit trips, home energy use, purchases, and waste habits manually, by scanning barcodes, or with AI meal descriptions.',
    icon: PlusCircle,
  },
  {
    number: 2,
    title: 'Understand your footprint',
    description: 'See clear CO₂e estimates, category breakdowns, daily trends, calculation confidence levels, and database source citations.',
    icon: BarChart3,
  },
  {
    number: 3,
    title: 'Take action and track progress',
    description: 'Join weekly active challenges, track consecutive consistency streaks, set budgets, compare with friends, and reduce your impact.',
    icon: Trophy,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 border-t border-gray-100 bg-slate-50/40">
      <div className="text-center space-y-4 mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primarySoft px-3 py-1 rounded-full">
          PROCESS
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl font-display">
          Make a difference in 3 simple steps.
        </h2>
        <p className="text-base text-textSecondary max-w-2xl mx-auto">
          Start building eco-friendly daily habits. Understand the real impact of your choices without climate anxiety.
        </p>
      </div>

      {/* Horizontal / Vertical steps container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Draw a connecting line behind cards for desktop */}
        <div className="hidden md:block absolute top-[68px] left-[15%] right-[15%] h-[1px] bg-gray-200 -z-10" />

        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200/80 p-8 flex flex-col items-center text-center shadow-xs relative hover:shadow-md transition-shadow"
            >
              {/* Number Badge */}
              <div className="absolute -top-3 left-6 bg-emerald-500 text-white font-bold text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                {step.number}
              </div>

              {/* Icon Circle */}
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 shadow-2xs">
                <StepIcon className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-800 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-[13px] text-textSecondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
