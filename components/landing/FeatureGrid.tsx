import React from 'react';
import * as Icons from 'lucide-react';

interface FeatureItem {
  title: string;
  description: string;
  iconName: keyof typeof Icons;
  accent: 'green' | 'blue' | 'amber' | 'purple';
}

const featuresList: FeatureItem[] = [
  {
    title: 'Track Everything',
    description: 'Log food, transport, energy, shopping, and waste activities in seconds with smart inputs.',
    iconName: 'PlusCircle',
    accent: 'green',
  },
  {
    title: 'See Real Impact',
    description: 'Understand your daily, weekly, and monthly footprint with clear, verified CO₂e estimates.',
    iconName: 'BarChart3',
    accent: 'blue',
  },
  {
    title: 'Simulate Change',
    description: 'Test lifestyle adjustments (e.g. buying an EV or changing your diet) before turning them into real commitments.',
    iconName: 'Sliders',
    accent: 'amber',
  },
  {
    title: 'Build Better Habits',
    description: 'Complete weekly missions, earn consistency streaks, unlock milestones, and compete with friends.',
    iconName: 'Trophy',
    accent: 'purple',
  },
  {
    title: 'AI Carbon Coach',
    description: 'Get personalized, actionable suggestions based on your actual logs, goals, and lifestyle profile.',
    iconName: 'Sparkles',
    accent: 'green',
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 border-t border-gray-100">
      <div className="text-center space-y-4 mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primarySoft px-3 py-1 rounded-full">
          FEATURES
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl font-display">
          One platform for your climate journey.
        </h2>
        <p className="text-base text-textSecondary max-w-2xl mx-auto">
          Everything you need to track, simulate, and reduce your daily environmental footprint without guilt.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuresList.map((feature, idx) => {
          const LucideIcon = (Icons[feature.iconName] || Icons.HelpCircle) as React.ComponentType<React.SVGProps<SVGSVGElement>>;
          
          // Accent styles
          const accentBg = {
            green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            blue: 'bg-blue-50 text-blue-600 border-blue-100',
            amber: 'bg-amber-50 text-amber-600 border-amber-100',
            purple: 'bg-purple-50 text-purple-600 border-purple-100',
          }[feature.accent];

          const borderHover = {
            green: 'hover:border-emerald-500/20 hover:shadow-emerald-500/[0.02]',
            blue: 'hover:border-blue-500/20 hover:shadow-blue-500/[0.02]',
            amber: 'hover:border-amber-500/20 hover:shadow-amber-500/[0.02]',
            purple: 'hover:border-purple-500/20 hover:shadow-purple-500/[0.02]',
          }[feature.accent];

          return (
            <div
              key={idx}
              className={`group bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${borderHover}`}
            >
              <div className="space-y-4">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${accentBg}`}>
                  <LucideIcon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-gray-800 tracking-tight group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] text-textSecondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
