import React from 'react';
import { ArrowRight, Flame, Droplets, Zap, Pin } from 'lucide-react';

export function CoachMessage() {
  return (
    <div className="min-h-screen bg-[#FFF5F7] font-sans pb-20 max-w-[390px] mx-auto overflow-y-auto">
      {/* 1. COACH HEADER */}
      <header className="px-6 pt-8 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4789A] to-[#E8A0B4] flex items-center justify-center text-white font-bold text-xl shadow-sm">
            D
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Dillish</h1>
            <p className="text-xs text-gray-500">Your Coach</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#D4789A] flex items-center justify-center text-white text-xs font-bold">
          N
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* 2. COACH MESSAGE BUBBLE */}
        <section>
          <div className="bg-[#FFE8EF] rounded-3xl rounded-tl-sm p-6 relative shadow-sm border border-[#FFD1E0]">
            <p className="text-[#632C3E] text-lg font-medium leading-relaxed">
              Hey Ndili! 💪 You're stronger than yesterday. Ready to crush it today?
            </p>
            <div className="mt-2 text-right">
              <span className="text-[10px] text-[#A67E8B]">Just now</span>
            </div>
          </div>
        </section>

        {/* 3. "YOUR PLAN FOR TODAY" section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-[#D4789A] uppercase tracking-wider px-1">Your plan for today</h2>
          <div className="bg-[#FFFDF5] rounded-2xl p-6 relative shadow-sm border border-[#F3EFE0] overflow-hidden">
            <div className="absolute top-0 left-4 w-6 h-8 flex items-center justify-center">
                <Pin className="w-4 h-4 text-[#D4789A] rotate-45" />
            </div>
            <div className="pt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Upper Body Strength</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                    <span>Upper Body</span>
                    <span>•</span>
                    <span>45 min</span>
                    <span>•</span>
                    <span>320 cal</span>
                </div>
                <button className="w-full bg-[#D4789A] hover:bg-[#C16285] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    Let's Go <ArrowRight className="w-5 h-5" />
                </button>
            </div>
          </div>
        </section>

        {/* 4. "HOW YOU'RE DOING" section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-[#D4789A] uppercase tracking-wider px-1">How you're doing</h2>
          <div className="space-y-3">
            {/* Calories row */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-[#FFE8EF]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#D4789A]" />
                  <span className="text-sm font-medium text-gray-700">
                    Calories: <span className="text-gray-500 font-normal">You've had 0 of your 1,800 cal goal</span>
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#D4789A] rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            {/* Hydration row */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-[#FFE8EF]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Hydration: <span className="text-gray-500 font-normal">0 of 8 glasses today</span>
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            {/* Streak row */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-[#FFE8EF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D4789A]" />
                <span className="text-sm font-medium text-gray-700">
                  Streak: <span className="text-gray-500 font-normal">You're on a 3-day streak. Keep going!</span>
                </span>
              </div>
              <div className="bg-[#FFE8EF] text-[#D4789A] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                3 Days
              </div>
            </div>
          </div>
        </section>

        {/* 5. Footer */}
        <footer className="pt-4 pb-12 text-center">
            <p className="text-[#D4789A] font-medium italic">
                I'm cheering you on — Dillish 🌸
            </p>
        </footer>
      </main>
    </div>
  );
}
