import React from 'react';

interface StatItem {
  value: string;
  label: string;
}

const stats: StatItem[] = [
  {
    value: '42%',
    label: 'Average footprint reduction potential',
  },
  {
    value: '7.2M',
    label: 'Sustainable actions tracked',
  },
  {
    value: '4.9 / 5',
    label: 'User satisfaction rating',
  },
  {
    value: '25+',
    label: 'Carbon databases and APIs',
  },
];

export default function ImpactStats() {
  return (
    <section id="impact" className="w-full bg-emerald-500 text-white py-12 lg:py-16 select-none">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
                {stat.value}
              </div>
              <div className="text-[12px] sm:text-xs font-semibold text-emerald-100 uppercase tracking-wide px-4">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
