import React from 'react';
import { Apple, Car, Zap, ShoppingBag, Trash2 } from 'lucide-react';

interface CategoryItem {
  title: string;
  description: string;
  sources: string[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: 'green' | 'blue' | 'amber' | 'purple' | 'red';
}

const categoriesList: CategoryItem[] = [
  {
    title: 'Food',
    description: 'Search meal types, scan barcodes, analyze custom ingredients with AI, and view Agribalyse lifecycle metrics.',
    sources: ['Agribalyse', 'Open Food Facts', 'Carbon Compass Engine'],
    icon: Apple,
    accent: 'green',
  },
  {
    title: 'Transport',
    description: 'Estimate trips automatically with location name lookups, route mapping APIs, or standard vehicle engine math.',
    sources: ['OpenRouteService', 'CarbonSutra', 'Carbon Compass Engine'],
    icon: Car,
    accent: 'blue',
  },
  {
    title: 'Energy',
    description: 'Log grid electricity usage, solar panels, generator fuels (diesel/LPG), and heating metrics.',
    sources: ['CarbonSutra', 'Climatiq', 'Carbon Compass Engine'],
    icon: Zap,
    accent: 'amber',
  },
  {
    title: 'Shopping',
    description: 'Estimate product impact, scan/import receipts, or track lifetime footprints with browser extension guidance.',
    sources: ['Product Engine', 'Climatiq', 'Browser Extension'],
    icon: ShoppingBag,
    accent: 'purple',
  },
  {
    title: 'Waste',
    description: 'Track landfill recycling, biodegradable compost loads, paper waste, and e-waste disposal methods.',
    sources: ['Carbon Compass Engine'],
    icon: Trash2,
    accent: 'red',
  },
];

export default function ActivityCategories() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 border-t border-gray-100">
      <div className="text-center space-y-4 mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primarySoft px-3 py-1 rounded-full">
          CATEGORIES
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl font-display">
          Track the everyday choices that matter.
        </h2>
        <p className="text-base text-textSecondary max-w-2xl mx-auto">
          We combine localized carbon factors, public databases, and fallback estimation mechanisms to keep tracking simple.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {categoriesList.map((cat, idx) => {
          const CategoryIcon = cat.icon;

          const accentBg = {
            green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            blue: 'bg-blue-50 text-blue-600 border-blue-100',
            amber: 'bg-amber-50 text-amber-600 border-amber-100',
            purple: 'bg-purple-50 text-purple-600 border-purple-100',
            red: 'bg-red-50 text-red-600 border-red-100',
          }[cat.accent];

          const borderHover = {
            green: 'hover:border-emerald-500/20 hover:shadow-emerald-500/[0.01]',
            blue: 'hover:border-blue-500/20 hover:shadow-blue-500/[0.01]',
            amber: 'hover:border-amber-500/20 hover:shadow-amber-500/[0.01]',
            purple: 'hover:border-purple-500/20 hover:shadow-purple-500/[0.01]',
            red: 'hover:border-red-500/20 hover:shadow-red-500/[0.01]',
          }[cat.accent];

          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border border-gray-200/80 p-5 flex flex-col justify-between shadow-xs transition-all duration-300 ${borderHover} hover:shadow-md`}
            >
              <div className="space-y-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${accentBg}`}>
                  <CategoryIcon className="h-4.5 w-4.5" />
                </div>
                {/* Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-800 tracking-tight">
                    {cat.title}
                  </h3>
                  <p className="text-[12px] text-textSecondary leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Source chips */}
              <div className="mt-6 pt-4 border-t border-gray-50 space-y-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Data Sources</span>
                <div className="flex flex-wrap gap-1">
                  {cat.sources.map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[8.5px] font-semibold bg-gray-50 text-gray-500 border border-gray-100 rounded px-1 py-0.5"
                    >
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
