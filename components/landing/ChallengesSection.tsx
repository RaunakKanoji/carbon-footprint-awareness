import React from 'react';
import { Users, Star, Target } from 'lucide-react';

export default function ChallengesSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20 border-t border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left column: gamification benefits description */}
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primarySoft px-3 py-1 rounded-full inline-block">
              GAMIFICATION
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary font-display">
              Turn climate action into consistent progress.
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              Compete with yourself and friends through practical weekly missions, custom logging streaks, and long-term milestones. Stay motivated with zero climate anxiety.
            </p>
          </div>
          
          <div className="space-y-3.5">
            <div className="flex gap-3">
              <span className="p-1 bg-emerald-50 rounded-lg text-emerald-500 h-7 w-7 flex items-center justify-center shrink-0 border border-emerald-100">
                <Target className="h-4 w-4" />
              </span>
              <div>
                <h4 className="font-bold text-gray-800 text-[13px]">Active Weekly Missions</h4>
                <p className="text-[12px] text-textSecondary mt-0.5">Participate in challenges focused on specific daily habit changes with clear XP rewards.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="p-1 bg-blue-50 rounded-lg text-blue-500 h-7 w-7 flex items-center justify-center shrink-0 border border-blue-100">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <h4 className="font-bold text-gray-800 text-[13px]">Social Leaderboards</h4>
                <p className="text-[12px] text-textSecondary mt-0.5">Compare logging progress and share reduction tips with friends on a weekly scoreboard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: 3 interactive mockup cards stacked/arranged */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Weekly Mission */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-emerald-500" />
                <span>Active Mission</span>
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-bold">
                WEEKLY
              </span>
            </div>
            
            <div className="space-y-1">
              <h4 className="font-bold text-gray-700 text-sm">Low-Carbon Commute</h4>
              <p className="text-[11px] text-gray-400 leading-tight">Use public transit, cycle, or walk for your errands this week.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-semibold text-gray-600">
                <span>Progress</span>
                <span>1 / 2 completed</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-1/2" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] border-t border-gray-50 pt-2.5">
              <span className="text-gray-400">Reward</span>
              <span className="font-bold text-emerald-600">+300 XP</span>
            </div>
          </div>

          {/* Card 2: Friends Leaderboard */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-3 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                <span>Friends Leaderboard</span>
              </span>
              <span className="text-[9px] text-blue-500 font-bold cursor-pointer">Invite</span>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold text-[10px] w-3 text-center">#1</span>
                  <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-[8px]">
                    MA
                  </div>
                  <span className="font-semibold text-gray-700 text-[11px]">Maya Alok</span>
                </div>
                <span className="font-bold text-gray-600 text-[10px]">1,240 XP</span>
              </div>
              
              <div className="flex items-center justify-between bg-slate-50 rounded-lg p-1 px-2 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold text-[10px] w-3 text-center">#2</span>
                  <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[8px]">
                    JD
                  </div>
                  <span className="font-bold text-gray-800 text-[11px]">You</span>
                </div>
                <span className="font-bold text-emerald-600 text-[10px]">840 XP</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold text-[10px] w-3 text-center">#3</span>
                  <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-[8px]">
                    AR
                  </div>
                  <span className="font-semibold text-gray-700 text-[11px]">Aarav Raj</span>
                </div>
                <span className="font-bold text-gray-600 text-[10px]">790 XP</span>
              </div>
            </div>
          </div>

          {/* Card 3: Milestone Progression (Full width span across columns on small grids if needed) */}
          <div className="sm:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span>Next Milestone Progress</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Rank 3</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-1.5">
                <div className="font-bold text-gray-700 text-xs">First 100 kg Saved</div>
                <p className="text-[9.5px] text-gray-400">Keep logging to unlock your first carbon offset certificate.</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs font-bold text-gray-800">64 / 100 kg</div>
                <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-emerald-500 h-full w-[64%]" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
