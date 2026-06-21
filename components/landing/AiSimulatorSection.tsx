'use client';

import React, { useState } from 'react';
import { Bot, Sliders, Sparkles, Check } from 'lucide-react';

export default function AiSimulatorSection() {
  // Simulator state simulation
  const [transitKm, setTransitKm] = useState(40);
  const [meatMeals, setMeatMeals] = useState(4);

  // Math simulation (e.g. baseline and simulated results)
  const baseTransit = 40 * 0.192; // 7.68 kg
  const baseMeals = 4 * 7.0; // 28 kg
  const baseTotal = baseTransit + baseMeals + 15; // +15 fixed factors (electricity, etc.)

  const simTransit = transitKm * 0.192;
  const simMeals = meatMeals * 7.0;
  const simTotal = simTransit + simMeals + 15;
  const savings = Math.max(0, baseTotal - simTotal);
  const percentReduction = Math.min(100, Math.max(0, (savings / baseTotal) * 100));

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 border-t border-gray-100 bg-slate-50/20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: AI Carbon Coach Chat Mockup */}
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primarySoft px-3 py-1 rounded-full inline-block">
              AI ASSISTANT
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary font-display">
              Personalized guidance, free of climate guilt.
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              Ask questions about your daily habits, discover hidden carbon footprints, and receive structured tips based directly on your logged activities.
            </p>
          </div>

          {/* AI Chat Window Mockup */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg overflow-hidden flex flex-col h-[280px] font-sans text-xs">
            {/* Chat Header */}
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
              <span className="p-1 bg-emerald-500 rounded-lg text-white"><Bot className="h-4 w-4" /></span>
              <div>
                <div className="font-bold text-gray-800">Carbon Coach AI</div>
                <div className="text-[9px] text-emerald-600 font-medium">Ready to chat</div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50/50">
              {/* User message */}
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                  U
                </div>
                <div className="bg-white border border-gray-150 rounded-2xl rounded-tl-xs p-2.5 text-gray-700 shadow-3xs leading-relaxed text-[11px]">
                  How can I reduce my food carbon footprint this week?
                </div>
              </div>

              {/* Bot response */}
              <div className="flex gap-2.5 max-w-[90%] ml-auto flex-row-reverse">
                <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="h-3 w-3" />
                </div>
                <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-xs p-3 shadow-sm leading-relaxed text-[11px]">
                  Your logs show that beef meals represent 54% of your food footprint this week. Swapping just <strong>two beef dinners</strong> for vegetarian alternatives (like bean chillies or dal) will save approximately <strong>12.6 kg CO₂e</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Lifestyle Simulator Widget */}
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primarySoft px-3 py-1 rounded-full inline-block">
              SIMULATOR
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary font-display">
              Quantify changes before you make them.
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              Test future changes in transportation, diets, energy sourcing, and waste habits. Find out how much carbon you save before modifying your budget.
            </p>
          </div>

          {/* Interactive Simulator Box Mockup */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg p-5 font-sans text-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-emerald-500" />
                <span>Simulate Habit Adjustments</span>
              </span>
              <span className="text-[9px] text-gray-400">Drag sliders to adjust</span>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-gray-600">Weekly Commute (Petrol Car)</span>
                  <span className="font-bold text-emerald-600">{transitKm} km</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={transitKm}
                  onChange={(e) => setTransitKm(Number(e.target.value))}
                  className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-gray-600">Weekly Beef Meals</span>
                  <span className="font-bold text-emerald-600">{meatMeals} meals</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={meatMeals}
                  onChange={(e) => setMeatMeals(Number(e.target.value))}
                  className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
              <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                <div className="text-[8.5px] text-gray-400 uppercase font-semibold">Simulated footprint</div>
                <div className="text-sm font-bold text-gray-800 mt-0.5">{simTotal.toFixed(1)} <span className="text-[9px] font-normal text-gray-400">kg</span></div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-500/10">
                <div className="text-[8.5px] text-emerald-800 uppercase font-semibold flex items-center justify-center gap-0.5">
                  <Check className="h-3 w-3" />
                  <span>Estimated Savings</span>
                </div>
                <div className="text-sm font-bold text-emerald-600 mt-0.5">
                  {savings.toFixed(1)} kg <span className="text-[9px] font-normal">({percentReduction.toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
