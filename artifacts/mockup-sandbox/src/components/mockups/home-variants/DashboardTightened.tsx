import React from 'react';
import { Flame, Droplets, Activity, Camera, TrendingUp, ArrowRight, Zap, Check } from 'lucide-react';

function MiniRing({ progress, color, track, icon, value, label }: { progress: number; color: string; track: string; icon: React.ReactNode; value: string; label: string }) {
  const r = 22; const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} stroke={track} strokeWidth="4" fill="none" />
          <circle cx="28" cy="28" r={r} stroke={color} strokeWidth="4" fill="none"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">{icon}</div>
      </div>
      <span className="text-sm font-bold text-gray-900 mt-1 leading-none">{value}</span>
      <span className="text-[10px] font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function DashboardTightened() {
  const days = [
    { label: 'M', completed: true },
    { label: 'T', completed: true },
    { label: 'W', completed: true },
    { label: 'T', completed: false },
    { label: 'F', completed: false },
    { label: 'S', completed: false },
    { label: 'S', completed: false },
  ];

  return (
    <div className="min-h-screen bg-[#FFF5F7] p-4 font-sans max-w-[390px] mx-auto pb-10">
      {/* HEADER */}
      <header className="flex flex-col gap-1 mb-6">
        <span className="text-xs text-gray-400 font-medium">Wednesday, May 28</span>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Ndili 🌸</h1>
          <div className="w-10 h-10 rounded-full bg-[#FFB6C1] flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
        </div>
        <div className="inline-flex self-start bg-[#FFE8EF] border border-[#FFB6C1] rounded-full px-3 py-1 items-center gap-1.5 mt-2">
          <span className="text-xs font-medium text-[#D81B60]">✨ Let's prove it today.</span>
        </div>
      </header>

      {/* FEATURED WORKOUT CARD */}
      <section className="mb-6">
        <div 
          className="bg-[#FFD6E3] rounded-[2rem] p-6 border border-[#FFB6C1]/30"
          style={{ boxShadow: "0 4px 24px rgba(216,27,96,0.12)" }}
        >
          <div className="inline-block bg-[#D81B60] text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-3 tracking-wider">
            TODAY'S WORKOUT
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Upper Body Strength</h2>
          <div className="flex items-center gap-3 text-sm text-gray-700 mb-6">
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
        <div className="bg-white rounded-2xl border border-pink-100 p-3 h-[120px] flex flex-col items-center justify-center">
          <MiniRing 
            progress={0.0} 
            color="#D81B60" 
            track="#FFE8EF" 
            icon={<Flame size={16} className="text-pink-400" />} 
            value="0 / 1800" 
            label="Calories" 
          />
        </div>
        <div className="bg-white rounded-2xl border border-pink-100 p-3 h-[120px] flex flex-col items-center justify-center">
          <MiniRing 
            progress={0.0} 
            color="#3B82F6" 
            track="#DBEAFE" 
            icon={<Droplets size={16} className="text-blue-400" />} 
            value="0 / 8" 
            label="Glasses" 
          />
        </div>
        <div className="bg-white rounded-2xl border border-pink-100 p-3 h-[120px] flex flex-col items-center justify-center">
          <MiniRing 
            progress={3/7} 
            color="#F59E0B" 
            track="#FEF3C7" 
            icon={<Zap size={16} className="text-amber-400" />} 
            value="3 days" 
            label="Streak" 
          />
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
          <div key={idx} className="bg-white rounded-2xl border border-pink-50 p-4 flex items-center gap-3 active:scale-95 transition-transform cursor-pointer overflow-hidden">
            <div className={`w-10 h-10 shrink-0 rounded-xl ${action.color} flex items-center justify-center`}>
              <action.icon size={20} />
            </div>
            <span className="font-bold text-gray-700 text-xs whitespace-nowrap">{action.label}</span>
          </div>
        ))}
      </section>

      {/* WEEKLY PROGRESS */}
      <section className="mt-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">This Week</h3>
        <div className="flex justify-between items-center bg-white rounded-2xl border border-pink-100 p-4">
          {days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center ${day.completed ? 'bg-pink-500' : 'bg-pink-100'}`}>
                {day.completed && <Check size={12} className="text-white" />}
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{day.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
