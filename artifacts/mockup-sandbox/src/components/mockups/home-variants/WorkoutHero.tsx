import React from 'react';
import { Clock, Zap, BarChart2, Droplets, Flame } from 'lucide-react';

export function WorkoutHero() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedDays = [0, 1, 2]; // M, T, W

  return (
    <div className="min-h-screen bg-[#FFF5F7] font-sans pb-10">
      {/* TOP HERO */}
      <div className="relative w-full h-[280px] bg-gradient-to-br from-[#C06080] to-[#E8A0B4] p-6 flex flex-col justify-between overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-white opacity-10" />
        <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 rounded-full bg-white opacity-5" />

        <div className="z-10">
          <p className="text-[11px] text-white/80 uppercase tracking-wider font-semibold">GOOD MORNING</p>
          <h1 className="text-28px font-bold text-white mt-1">Ndili</h1>
        </div>

        <div className="z-10 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-white tracking-wider uppercase">TODAY'S PICK</p>
          </div>
          <h2 className="text-[24px] font-bold text-white leading-tight">Upper Body Strength</h2>
          
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span className="text-xs font-medium">25 min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={14} />
              <span className="text-xs font-medium">180 cal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart2 size={14} />
              <span className="text-xs font-medium">Intermediate</span>
            </div>
          </div>
        </div>

        <button className="z-10 w-full bg-white text-[#C06080] py-3 rounded-full font-bold text-sm shadow-lg active:scale-[0.98] transition-transform mt-4">
          Start Workout →
        </button>
      </div>

      {/* Quote */}
      <div className="px-6 py-3">
        <p className="text-[13px] text-[#C06080] italic text-center opacity-80">
          ✨ "You're stronger than yesterday. Let's prove it today."
        </p>
      </div>

      {/* STATS STRIP */}
      <div className="px-4 mt-2">
        <div className="flex justify-between gap-3">
          {/* Calories */}
          <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-pink-100 flex flex-col items-center justify-center text-center">
            <div className="relative w-10 h-10 mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#FCE4EC"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#C06080"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={12} className="text-[#C06080]" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-800">0 / 1800 cal</p>
          </div>

          {/* Water */}
          <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-pink-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 mb-2 bg-blue-50 rounded-full flex items-center justify-center">
              <Droplets size={18} className="text-blue-500" />
            </div>
            <p className="text-[10px] font-bold text-gray-800">0 / 8 glasses</p>
          </div>

          {/* Streak */}
          <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-pink-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 mb-2 bg-orange-50 rounded-full flex items-center justify-center">
              <Flame size={18} className="text-orange-500" />
            </div>
            <p className="text-[10px] font-bold text-gray-800">3 day streak</p>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="px-6 mt-8">
        <h3 className="text-[16px] font-bold text-gray-800 mb-4">Recent Activity</h3>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-50">
          <div className="flex justify-between items-center">
            {days.map((day, i) => {
              const isActive = completedDays.includes(i);
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? 'bg-[#C06080] text-white' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {isActive ? (
                      <Zap size={14} fill="currentColor" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold ${isActive ? 'text-[#C06080]' : 'text-gray-400'}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
