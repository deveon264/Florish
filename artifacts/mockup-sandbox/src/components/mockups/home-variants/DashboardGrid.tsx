import React from 'react';
import { Flame, Droplets, Activity, Camera, TrendingUp, ArrowRight, Clock, Zap } from 'lucide-react';

export function DashboardGrid() {
  return (
    <div className="min-h-screen bg-[#FFF5F7] p-4 font-sans max-w-[390px] mx-auto">
      {/* HEADER */}
      <header className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Ndili 🌸</h1>
          <div className="w-10 h-10 rounded-full bg-[#FFB6C1] flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
        </div>
        <div className="inline-flex self-start bg-[#FFE8EF] border border-[#FFB6C1] rounded-full px-3 py-1 items-center gap-1.5">
          <span className="text-xs font-medium text-[#D81B60]">✨ Let's prove it today.</span>
        </div>
      </header>

      {/* FEATURED WORKOUT CARD */}
      <section className="mb-4">
        <div className="bg-[#FFE8EF] rounded-[2rem] p-6 border border-[#FFB6C1]/30">
          <div className="inline-block bg-[#D81B60] text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-3 tracking-wider">
            TODAY'S WORKOUT
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Upper Body Strength</h2>
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
            <span>Upper Body</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            <span>25 min</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            <span>180 cal</span>
          </div>
          <button className="w-full bg-[#D81B60] hover:bg-[#C2185B] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors">
            Start Workout <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* METRICS ROW */}
      <section className="grid grid-cols-3 gap-3 mb-6">
        {/* CALORIES */}
        <div className="bg-white rounded-2xl border border-pink-100 p-3 h-[120px] flex flex-col items-center justify-center text-center">
          <div className="relative w-14 h-14 flex items-center justify-center mb-1">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="#FFE8EF"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="#D81B60"
                strokeWidth="3"
                fill="none"
                strokeDasharray="150"
                strokeDashoffset="150"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">0</span>
          </div>
          <span className="text-[10px] text-gray-500 mb-0.5">1800 goal</span>
          <span className="text-[11px] font-bold text-gray-700">Calories</span>
        </div>

        {/* WATER */}
        <div className="bg-white rounded-2xl border border-pink-100 p-3 h-[120px] flex flex-col items-center justify-center text-center">
          <div className="relative w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
             <Droplets size={24} className="text-blue-400 fill-blue-400/20" />
          </div>
          <span className="text-lg font-bold text-gray-900">0 / 8</span>
          <span className="text-[11px] font-bold text-gray-700">Hydration</span>
        </div>

        {/* STREAK */}
        <div className="bg-white rounded-2xl border border-pink-100 p-3 h-[120px] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-2">
            <Flame size={24} className="text-orange-500 fill-orange-500/20" />
          </div>
          <span className="text-2xl font-bold text-gray-900 leading-none mb-1">3</span>
          <span className="text-[11px] font-bold text-gray-700">Day streak</span>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="grid grid-cols-2 gap-3">
        {[
          { icon: Activity, label: 'Workouts', color: 'bg-purple-50 text-purple-600' },
          { icon: Camera, label: 'Log Food', color: 'bg-emerald-50 text-emerald-600' },
          { icon: Droplets, label: 'Water', color: 'bg-blue-50 text-blue-600' },
          { icon: TrendingUp, label: 'Progress', color: 'bg-pink-50 text-pink-600' },
        ].map((action, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-pink-50 p-4 flex items-center gap-3 active:scale-95 transition-transform cursor-pointer">
            <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
              <action.icon size={20} />
            </div>
            <span className="font-bold text-gray-700 text-sm">{action.label}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
