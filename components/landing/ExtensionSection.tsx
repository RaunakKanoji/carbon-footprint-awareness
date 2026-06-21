import React from 'react';
import ExtensionMockup from './ExtensionMockup';
import { Globe, Search, ShieldCheck } from 'lucide-react';

export default function ExtensionSection() {
  return (
    <section id="extension" className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 border-t border-gray-100 bg-slate-50/40">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Store layout background behind overlapping ExtensionMockup */}
        <div className="flex justify-center items-center relative py-6">
          {/* Blurred E-commerce Store mock layout */}
          <div className="absolute inset-0 bg-white/20 border border-gray-100 rounded-3xl -z-10 shadow-inner blur-xs flex flex-col justify-between p-6 opacity-30 select-none">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="font-bold text-[10px] text-gray-400">⚡ GLAMOUR SHOP</span>
              <span className="w-16 h-2 bg-gray-250 rounded-full" />
            </div>
            <div className="flex-1 flex gap-4 items-center my-6">
              <div className="w-16 h-16 bg-gray-200 rounded-md shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="w-1/2 h-2.5 bg-gray-300 rounded-full" />
                <div className="w-3/4 h-2 bg-gray-200 rounded-full" />
                <div className="w-1/3 h-2.5 bg-gray-300 rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className="w-12 h-2.5 bg-gray-200 rounded-full" />
              <span className="w-16 h-6 bg-emerald-500 rounded-lg" />
            </div>
          </div>

          {/* Actual Extension Mockup in the foreground */}
          <div className="relative z-10 shadow-2xl hover:scale-[1.01] transition-transform duration-300">
            <ExtensionMockup />
          </div>
        </div>

        {/* Right Column: Descriptions */}
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primarySoft px-3 py-1 rounded-full inline-block">
              EXTENSION
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary font-display">
              A carbon reminder before you checkout.
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              The Carbon Compass browser assistant scans your shopping cart automatically and suggests lower-impact alternatives while you browse. Start making climate-positive choices.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex gap-3">
              <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500 h-7 w-7 flex items-center justify-center shrink-0 border border-emerald-100">
                <Search className="h-4 w-4" />
              </span>
              <div>
                <h4 className="font-bold text-gray-800 text-[13px]">Automatic Cart Extraction</h4>
                <p className="text-[12px] text-textSecondary mt-0.5">Works on e-commerce checkout sheets, grocery sliders, and shopping sites natively.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500 h-7 w-7 flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h4 className="font-bold text-gray-800 text-[13px]">Privacy First Design</h4>
                <p className="text-[12px] text-textSecondary mt-0.5">Extracts only generic text names inside a secure shadow DOM; keeps your transactions private.</p>
              </div>
            </div>
          </div>

          {/* Install extension button */}
          <div className="pt-2">
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-[13px] hover:bg-gray-800 active:scale-[0.98] shadow-sm transition-all"
            >
              <Globe className="h-4 w-4" />
              <span>Install Chrome Extension</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
