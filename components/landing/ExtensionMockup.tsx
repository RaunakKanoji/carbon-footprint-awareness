import React from 'react';
import { Leaf, AlertTriangle, Check } from 'lucide-react';

export default function ExtensionMockup() {
  return (
    <div className="w-[300px] bg-white rounded-xl border border-gray-200/80 shadow-2xl overflow-hidden font-sans text-xs text-left">
      {/* Extension Header */}
      <div className="bg-gray-50 border-b border-gray-100 px-3.5 py-2.5 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="h-5.5 w-5.5 rounded bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Leaf className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="font-bold text-gray-800 tracking-tight text-[10px]">Carbon Compass Assistant</span>
        </div>
        <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-700 text-[8px] font-bold">
          CONNECTED
        </span>
      </div>

      {/* Extension Content */}
      <div className="p-3.5 space-y-3.5">
        {/* Cart Footprint */}
        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Estimated Cart Footprint</div>
            <div className="text-sm font-bold text-gray-800 mt-0.5">12.4 <span className="text-[10px] font-normal text-gray-400">kg CO₂e</span></div>
          </div>
          <span className="p-1 bg-amber-500/10 rounded-full text-amber-500"><AlertTriangle className="h-4.5 w-4.5" /></span>
        </div>

        {/* Top Impact Item */}
        <div className="space-y-1.5">
          <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Top Impact Item</div>
          <div className="bg-white border border-gray-100 rounded-lg p-2 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-[16px]">
                👖
              </div>
              <div>
                <div className="font-semibold text-gray-700">Denim Jeans</div>
                <div className="text-[8px] text-gray-400">Clothes · 1 Unit</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-700">25.0 kg</div>
              <span className="text-[7.5px] text-red-500 font-semibold uppercase bg-red-50 px-1 rounded-sm">High Impact</span>
            </div>
          </div>
        </div>

        {/* Dynamic Action Nudge */}
        <div className="bg-emerald-50/50 border border-emerald-500/15 rounded-lg p-2.5 space-y-1.5">
          <div className="font-bold text-emerald-800 text-[9px] uppercase tracking-wider flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>Suggested Action</span>
          </div>
          <p className="text-[9.5px] text-emerald-700 leading-relaxed font-medium">
            Buy a similar second-hand pair or delay this order by 7 days to evaluate alternatives.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          <button className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-lg text-[9.5px] font-semibold text-center shadow-xs cursor-pointer transition-all">
            Review Alternatives
          </button>
          <button className="py-1.5 px-3 border border-gray-200 rounded-lg text-[9.5px] text-gray-500 hover:bg-gray-50 cursor-pointer transition-all">
            Continue anyway
          </button>
        </div>
      </div>
    </div>
  );
}
