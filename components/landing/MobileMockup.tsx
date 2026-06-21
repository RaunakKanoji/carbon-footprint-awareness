import React from 'react';
import {
  Apple,
  Car,
  Zap,
  ShoppingBag,
  Home,
  PlusCircle,
  TrendingUp,
  User,
  Leaf
} from 'lucide-react';

export default function MobileMockup() {
  return (
    <div className="w-[240px] h-[480px] bg-gray-950 rounded-[36px] p-2.5 shadow-2xl border-4 border-gray-800 overflow-hidden relative flex flex-col font-sans select-none text-left">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-gray-950 rounded-b-xl z-20 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-800 mr-2" />
        <div className="w-8 h-1 bg-gray-900 rounded-full" />
      </div>

      {/* Screen area */}
      <div className="flex-1 bg-slate-50 rounded-[28px] overflow-hidden flex flex-col justify-between pt-6 pb-2 px-3 text-[10px]">
        {/* Mobile Header */}
        <div className="flex justify-between items-center px-1 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="p-0.5 bg-emerald-500 rounded text-white shrink-0"><Leaf className="h-3 w-3" /></span>
            <span className="font-bold text-gray-800 text-[10px]">Carbon Compass</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[8px] text-gray-600">
            JD
          </div>
        </div>

        {/* Footprint Circular metric */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-xs flex-1 flex flex-col justify-center items-center gap-2 mb-3">
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">My Footprint</span>
          
          {/* Progress circle */}
          <div className="h-24 w-24 rounded-full border-8 border-emerald-100 flex items-center justify-center relative my-1">
            {/* Overlay segment */}
            <div className="absolute inset-[-8px] rounded-full border-8 border-transparent border-t-emerald-500 border-r-emerald-500 transform rotate-45" />
            <div className="text-center">
              <span className="text-lg font-bold text-gray-800">11.4</span>
              <span className="text-[7px] text-gray-400 block">kg CO₂e today</span>
            </div>
          </div>

          <div className="text-[8px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
            ↓ 12% below your target
          </div>
        </div>

        {/* Category list */}
        <div className="space-y-1.5 mb-2">
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider px-1">Log Activity</span>
          
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white border border-gray-100 rounded-xl p-2 flex items-center gap-1.5 hover:bg-emerald-50/20 transition-all cursor-pointer">
              <span className="p-1 bg-emerald-50 rounded text-emerald-500"><Apple className="h-3 w-3" /></span>
              <span className="font-semibold text-gray-700">Food</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-2 flex items-center gap-1.5 hover:bg-blue-50/20 transition-all cursor-pointer">
              <span className="p-1 bg-blue-50 rounded text-blue-500"><Car className="h-3 w-3" /></span>
              <span className="font-semibold text-gray-700">Transit</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-2 flex items-center gap-1.5 hover:bg-amber-50/20 transition-all cursor-pointer">
              <span className="p-1 bg-amber-50 rounded text-amber-500"><Zap className="h-3 w-3" /></span>
              <span className="font-semibold text-gray-700">Energy</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-2 flex items-center gap-1.5 hover:bg-purple-50/20 transition-all cursor-pointer">
              <span className="p-1 bg-purple-50 rounded text-purple-500"><ShoppingBag className="h-3 w-3" /></span>
              <span className="font-semibold text-gray-700">Shopping</span>
            </div>
          </div>
        </div>

        {/* Navigation bottom bar */}
        <div className="bg-white border border-gray-100 rounded-2xl py-1 px-3 flex justify-between items-center shadow-md">
          <div className="flex flex-col items-center gap-0.5 text-emerald-500">
            <Home className="h-3.5 w-3.5" />
            <span className="text-[7px] font-semibold">Home</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 cursor-pointer">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-[7px]">Trends</span>
          </div>
          <div className="flex flex-col items-center -mt-4 bg-emerald-500 p-1.5 rounded-full text-white shadow-lg cursor-pointer">
            <PlusCircle className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 cursor-pointer">
            <TrendingUp className="h-3.5 w-3.5 transform rotate-90" />
            <span className="text-[7px]">Coach</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 cursor-pointer">
            <User className="h-3.5 w-3.5" />
            <span className="text-[7px]">Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
