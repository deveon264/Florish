import React from 'react';
import { Flame, Droplets, Activity, Camera, TrendingUp, ArrowRight, Clock, Zap, History } from 'lucide-react';

export function DashboardCards() {
  return (
    <div className="min-h-screen bg-white font-sans max-w-[390px] mx-auto pb-20">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* HEADER */}
      <header className="pt-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Wed, May 28 · 3 day streak 🔥</span>
            <h1 className="text-2xl font-black text-gray-900">Good morning, Ndili 🌸</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FFB6C1] flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
        </div>
      </header>

      {/* MOTIVATIONAL BANNER */}
      <div className="w-full bg-pink-50 border-b border-pink-100 py-2 text-center italic text-sm text-pink-600 mb-6">
        "Small steps lead to big results. Let's crush it today!"
      </div>

      <div className="px-4">
        {/* FEATURED WORKOUT CARD */}
        <section className="mb-6">
          <div 
            className="rounded-[2rem] p-6 relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #FFECF1 0%, #FFD6E3 100%)',
              borderLeft: '4px solid #D81B60'
            }}
          >
            <div className="inline-block bg-[#D81B60] text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-3 tracking-wider">
              TODAY'S WORKOUT
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Upper Body Strength</h2>
            
            <div className="bg-pink-100 text-pink-700 text-xs font-bold rounded-full px-2 py-0.5 inline-flex mb-4">
              Strength Training
            </div>

            <div className="flex items-center gap-4 text-sm font-medium text-gray-700 mb-6">
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-[#D81B60]" />
                <span>25 min</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={16} className="text-[#D81B60]" />
                <span>180 cal</span>
              </div>
            </div>

            <button className="w-full bg-[#D81B60] hover:bg-[#C2185B] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-pink-200">
              Start Workout <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* METRICS ROW */}
        <section className="grid grid-cols-3 gap-3 mb-8">
          {/* CALORIES */}
          <div className="bg-pink-50 rounded-2xl border border-pink-200 p-3 h-[130px] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-pink-700 block mb-1">Calories</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-gray-900">0</span>
                <span className="text-xs text-gray-500 font-medium">cal</span>
              </div>
            </div>
            <div>
              <div className="h-1.5 w-full bg-pink-200 rounded overflow-hidden mb-1">
                <div className="h-full bg-pink-500 rounded" style={{ width: '0%' }} />
              </div>
              <span className="text-[10px] text-gray-400 block">of 1800 goal</span>
            </div>
          </div>

          {/* WATER */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-3 h-[130px] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-700 block mb-1">Hydration</span>
              <span className="text-xl font-black text-gray-900">0 / 8</span>
              <span className="text-[10px] text-gray-400 block">glasses</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < 0 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          {/* STREAK */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-3 h-[130px] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-700 block mb-1">Streak</span>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-gray-900">3</span>
                <span className="text-lg">🔥</span>
              </div>
              <span className="text-[10px] text-gray-500 block">day streak</span>
            </div>
            <div className="bg-white/50 rounded-lg py-1 px-2 border border-amber-100">
              <span className="text-[10px] text-amber-600 font-bold">+1 today?</span>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-gray-400 mb-3 ml-1">QUICK ACTIONS</h3>
          <div className="flex flex-row gap-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
            {[
              { icon: Activity, label: 'Workouts', color: 'bg-purple-50 text-purple-600', iconBg: 'bg-purple-100' },
              { icon: Camera, label: 'Log Food', color: 'bg-emerald-50 text-emerald-600', iconBg: 'bg-emerald-100' },
              { icon: Droplets, label: 'Water', color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100' },
              { icon: TrendingUp, label: 'Progress', color: 'bg-pink-50 text-pink-600', iconBg: 'bg-pink-100' },
              { icon: History, label: 'History', color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-100' },
            ].map((action, idx) => (
              <div 
                key={idx} 
                className="bg-white shadow-sm border border-gray-100 rounded-2xl px-4 py-3 flex flex-col items-center gap-1.5 min-w-[85px] whitespace-nowrap active:scale-95 transition-transform cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full ${action.iconBg} flex items-center justify-center ${action.color.split(' ')[1]}`}>
                  <action.icon size={16} />
                </div>
                <span className="font-bold text-gray-600 text-xs">{action.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
