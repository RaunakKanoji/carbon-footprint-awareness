import React from 'react';
import {
  Leaf,
  LayoutDashboard,
  Calendar,
  Flame,
  Bot,
  Trophy,
  ArrowRight,
  TrendingUp,
  User,
  Car,
  Apple
} from 'lucide-react';

export default function DashboardMockup() {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200/80 shadow-2xl overflow-hidden flex text-left font-sans text-xs h-[520px]">
      {/* Sidebar */}
      <div className="w-48 bg-gray-50 border-r border-gray-100 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Leaf className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="font-bold text-gray-800 tracking-tight text-[11px]">Carbon Compass</span>
          </div>

          {/* Nav Items */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </div>
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Calendar className="h-4.5 w-4.5" />
              <span>Activity Log</span>
            </div>
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Bot className="h-4.5 w-4.5" />
              <span>Carbon Coach</span>
            </div>
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <TrendingUp className="h-4.5 w-4.5" />
              <span>Insights</span>
            </div>
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Trophy className="h-4.5 w-4.5" />
              <span>Challenges</span>
            </div>
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <User className="h-4.5 w-4.5" />
              <span>Profile</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 px-2 py-1 border-t border-gray-100 pt-3">
          <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div className="overflow-hidden">
            <div className="font-semibold text-gray-700 truncate">John Doe</div>
            <div className="text-[10px] text-gray-400 truncate">john@example.com</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Hello, John! 👋</h2>
            <p className="text-[10px] text-gray-500">Track and make lower-impact daily choices.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-600">
              Week
            </span>
            <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-sm">
              <Flame className="h-3 w-3 fill-current" />
              <span>5 Day Streak</span>
            </span>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs">
            <div className="text-[10px] text-gray-400 font-medium">Daily Average</div>
            <div className="text-base font-bold text-gray-800 mt-1">11.4 <span className="text-[9px] font-normal text-gray-400">kg CO₂e</span></div>
            <div className="text-[9px] text-emerald-600 mt-1 font-semibold flex items-center gap-0.5">
              <span>↓ 12% vs last week</span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs">
            <div className="text-[10px] text-gray-400 font-medium">This Week Total</div>
            <div className="text-base font-bold text-gray-800 mt-1">79.8 <span className="text-[9px] font-normal text-gray-400">kg CO₂e</span></div>
            <div className="text-[9px] text-gray-400 mt-1">Goal: under 90 kg</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs">
            <div className="text-[10px] text-gray-400 font-medium">Remaining Budget</div>
            <div className="text-base font-bold text-gray-800 mt-1">68.2%</div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[68.2%]" />
            </div>
          </div>
        </div>

        {/* Charts & Breakdown Split */}
        <div className="grid grid-cols-5 gap-4">
          {/* Daily Trend (Stacked) */}
          <div className="col-span-3 bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex flex-col justify-between h-[170px]">
            <div className="font-semibold text-gray-700 text-[10px] mb-2 flex justify-between items-center">
              <span>Weekly Emission Trend</span>
              <span className="text-[9px] font-normal text-gray-400">kg CO₂e</span>
            </div>
            {/* Chart Bars CSS */}
            <div className="flex-1 flex items-end justify-between gap-2.5 px-2 pt-2 border-b border-gray-100 pb-1">
              {[
                { day: 'Mon', transport: 6, food: 3, energy: 4, shopping: 2, waste: 1 },
                { day: 'Tue', transport: 4, food: 4, energy: 4, shopping: 1, waste: 1 },
                { day: 'Wed', transport: 5, food: 2, energy: 3, shopping: 0, waste: 2 },
                { day: 'Thu', transport: 7, food: 5, energy: 4, shopping: 4, waste: 1 },
                { day: 'Fri', transport: 3, food: 3, energy: 3, shopping: 1, waste: 1 },
                { day: 'Sat', transport: 2, food: 4, energy: 5, shopping: 5, waste: 2 },
                { day: 'Sun', transport: 1, food: 3, energy: 4, shopping: 1, waste: 1 }
              ].map((d, idx) => {
                const total = d.transport + d.food + d.energy + d.shopping + d.waste;
                const scale = 7; // scale multiplier for height
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                    <div className="w-4 rounded-t-xs overflow-hidden flex flex-col justify-end" style={{ height: `${total * scale}px` }}>
                      <div className="bg-red-500 w-full" style={{ height: `${d.waste * scale}px` }} />
                      <div className="bg-purple-500 w-full" style={{ height: `${d.shopping * scale}px` }} />
                      <div className="bg-amber-500 w-full" style={{ height: `${d.energy * scale}px` }} />
                      <div className="bg-emerald-500 w-full" style={{ height: `${d.food * scale}px` }} />
                      <div className="bg-blue-500 w-full" style={{ height: `${d.transport * scale}px` }} />
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1.5">{d.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[8px] text-gray-400 mt-2 px-1">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Transit</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Food</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Energy</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Shopping</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Waste</span>
            </div>
          </div>

          {/* Donut Category Breakdown */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs flex flex-col justify-between h-[170px]">
            <div className="font-semibold text-gray-700 text-[10px] mb-2">Category Share</div>
            <div className="flex-1 flex items-center justify-center relative">
              {/* Circular CSS representation */}
              <div className="h-20 w-20 rounded-full border-[10px] border-emerald-500 flex items-center justify-center relative">
                {/* Simulated segments via border overlays */}
                <div className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-t-blue-500 border-r-amber-500" />
                <div className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-b-purple-500 border-l-red-500" />
                <div className="text-center font-bold text-[10px] text-gray-700">
                  79.8<br />
                  <span className="text-[7px] font-normal text-gray-400">kg CO₂e</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Transport
                </span>
                <span className="font-semibold text-gray-700">35.4%</span>
              </div>
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Food
                </span>
                <span className="font-semibold text-gray-700">28.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower row: Recent activity list & AI tips split */}
        <div className="grid grid-cols-5 gap-4">
          {/* Recent Activity */}
          <div className="col-span-3 bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs">
            <div className="font-semibold text-gray-700 text-[10px] mb-2.5 flex justify-between items-center">
              <span>Recent Activity Logs</span>
              <span className="text-[9px] text-emerald-500 font-semibold cursor-pointer flex items-center">Log new <ArrowRight className="h-2.5 w-2.5 ml-0.5" /></span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-gray-50 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-emerald-50 rounded text-emerald-600"><Apple className="h-3.5 w-3.5" /></span>
                  <div>
                    <div className="font-semibold text-gray-700">Vegan Lunch Bowl</div>
                    <div className="text-[8px] text-gray-400">Today · Food</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-700">0.7 kg CO₂e</div>
                  <div className="text-[8px] text-emerald-500 font-bold bg-emerald-50 px-1 rounded-sm inline-block">Agribalyse</div>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-blue-50 rounded text-blue-600"><Car className="h-3.5 w-3.5" /></span>
                  <div>
                    <div className="font-semibold text-gray-700">Office Commute (Petrol Car)</div>
                    <div className="text-[8px] text-gray-400">Yesterday · Transport</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-700">1.9 kg CO₂e</div>
                  <div className="text-[8px] text-blue-500 font-bold bg-blue-50 px-1 rounded-sm inline-block">ORS Estimate</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Coach Suggestion & active challenge */}
          <div className="col-span-2 flex flex-col gap-3">
            {/* AI suggestion */}
            <div className="bg-emerald-500 text-white rounded-xl p-3 shadow-sm flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wide uppercase opacity-90">
                  <Bot className="h-3.5 w-3.5" />
                  <span>Coach recommendation</span>
                </div>
                <p className="text-[9.5px] mt-1.5 leading-relaxed font-medium">
                  Your lunches are your largest food impact this week. Swapping paneer for lentils on Wed could save ~2.4 kg CO₂e.
                </p>
              </div>
              <div className="text-[8.5px] font-semibold underline text-right cursor-pointer hover:opacity-80 mt-1">
                Chat with coach
              </div>
            </div>
            {/* Active Challenge */}
            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-amber-50 rounded text-amber-500"><Trophy className="h-3.5 w-3.5" /></span>
                <div>
                  <div className="font-semibold text-gray-700 truncate max-w-[100px]">Low-Carbon Commute</div>
                  <div className="text-[8px] text-gray-400">Challenge · 2d left</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-gray-700 text-[10px]">1 / 2 <span className="font-normal text-gray-400">done</span></div>
                <div className="text-[8px] text-emerald-600 font-semibold">+300 XP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
