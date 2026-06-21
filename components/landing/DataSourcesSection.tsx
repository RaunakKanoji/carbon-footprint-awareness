import React from 'react';
import { Database, ShieldAlert, Award } from 'lucide-react';

const sourcesList = [
  'CarbonSutra',
  'Climatiq',
  'OpenRouteService',
  'Open Food Facts',
  'Agribalyse',
  'Google Maps links',
  'Carbon Compass Engine',
  'Product Engine'
];

export default function DataSourcesSection() {
  return (
    <section id="data-sources" className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 border-t border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left column: descriptive block */}
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primarySoft px-3 py-1 rounded-full inline-block">
              INTEGRATIONS
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary font-display">
              Powered by trusted data and smart fallbacks.
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              Carbon Compass integrates external APIs, public life-cycle databases (LCA), and a calibrated local engine. This ensures we produce reliable carbon footprint estimates, even when exact barcode or product details are missing.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2.5 items-start">
              <span className="p-1 bg-emerald-50 rounded-lg text-emerald-500 shrink-0 border border-emerald-100"><Award className="h-4 w-4" /></span>
              <p className="text-[12px] text-textSecondary">
                <strong>Source transparency:</strong> Every log item cites the calculator or database provider used to determine its footprint value.
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="p-1 bg-emerald-50 rounded-lg text-emerald-500 shrink-0 border border-emerald-100"><ShieldAlert className="h-4 w-4" /></span>
              <p className="text-[12px] text-textSecondary">
                <strong>Confidence indicators:</strong> Estimates display confidence tags (High, Medium, Low) to represent calculation method reliability.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: floating chip elements */}
        <div className="bg-slate-50/50 border border-gray-200/80 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[220px]">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1">
            <Database className="h-3.5 w-3.5" />
            <span>Connected Carbon Databases & APIs</span>
          </span>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {sourcesList.map((src, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-white border border-gray-150 rounded-xl text-xs font-bold text-gray-700 hover:border-primary hover:text-primary transition-all cursor-default shadow-3xs"
              >
                {src}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
