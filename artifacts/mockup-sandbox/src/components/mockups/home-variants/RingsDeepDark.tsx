import React from 'react';
import { Flame, Droplets, Zap, Clock, BarChart2, Play } from 'lucide-react';

interface ActivityRingProps {
  progress: number; // 0 to 1
  color: string;
  size?: number;
  strokeWidth?: number;
  icon: React.ReactNode;
  value: string;
  label: string;
}

function Ring({ progress, color, size = 96, strokeWidth = 8, icon, value, label }: ActivityRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-white/20"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            style={{ 
              filter: `drop-shadow(0 0 5px ${color}60)`,
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 0.5s ease-in-out',
              strokeLinecap: 'round'
            }}
          />
        </svg>
        {/* Icon in center */}
        <div className="absolute inset-0 flex items-center justify-center text-white/80">
          {icon}
        </div>
      </div>
      <div className="mt-3 text-center">
        <div className="text-white font-bold text-[13px]">{value}</div>
        <div className="text-white/50 text-[10px] uppercase tracking-wider font-medium">{label}</div>
      </div>
    </div>
  );
}

export function RingsDeepDark() {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedDays = [0, 1, 2]; // Monday, Tuesday, Wednesday completed

  return (
    <div className="min-h-screen bg-[#2D0A1A] font-sans overflow-y-auto">
      {/* DARK SECTION */}
      <div className="bg-[#2D0A1A] pt-12 pb-6 px-5">
        {/* Top row */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-white/60 text-sm font-medium">Good morning,</p>
            <h1 className="text-white text-2xl font-bold">Ndili</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E8A0B4] flex items-center justify-center text-white font-bold border-2 border-white/20">
            N
          </div>
        </div>

        {/* Rings Row */}
        <div className="flex justify-between items-center mb-8">
          <Ring 
            progress={0.65} 
            color="#E8A0B4" 
            size={96}
            strokeWidth={8}
            icon={<Flame size={20} />} 
            value="1170 / 1800" 
            label="Calories" 
          />
          <Ring 
            progress={0.5} 
            color="#5DADE2" 
            size={96}
            strokeWidth={8}
            icon={<Droplets size={20} />} 
            value="4 / 8" 
            label="Glasses" 
          />
          <Ring 
            progress={0.4} 
            color="#F39C12" 
            size={96}
            strokeWidth={8}
            icon={<Zap size={20} />} 
            value="3 days" 
            label="Streak" 
          />
        </div>

        {/* Quick Action Pills */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mt-4 mb-6">
          {['Workouts', 'Log Food', 'Water', 'Progress'].map((action) => (
            <button 
              key={action}
              className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full whitespace-nowrap text-xs font-semibold text-white active:scale-95 transition-all border border-white/5"
            >
              {action}
            </button>
          ))}
        </div>

        {/* WORKOUT CARD */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-5">
          <div className="bg-[#E8A0B4]/20 text-[#E8A0B4] text-[10px] font-bold px-2 py-0.5 rounded tracking-widest inline-block mb-2">
            TODAY'S WORKOUT
          </div>
          <h3 className="text-xl font-extrabold text-white mb-1">Upper Body Strength</h3>
          <p className="text-sm text-white/50 mb-4">Focus on shoulders and triceps</p>
          
          <div className="flex gap-4 text-white/60 text-xs mb-4">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>45 min</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart2 size={14} />
              <span>Medium</span>
            </div>
          </div>

          <button className="w-full bg-[#E8A0B4] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#E8A0B4]/20 active:scale-[0.98] transition-all">
            <Play size={18} fill="currentColor" />
            Start Workout
          </button>
        </div>
      </div>

      {/* LIGHT SECTION */}
      <div className="bg-white rounded-t-[2rem] px-5 pt-6 pb-10 shadow-inner min-h-[200px]">
        {/* This Week Streak */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">This Week</h3>
          <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center">
            {weekDays.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">{day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  completedDays.includes(idx) 
                    ? 'bg-[#E8A0B4] border-[#E8A0B4] text-white' 
                    : 'bg-white border-slate-200 text-slate-300'
                }`}>
                  {completedDays.includes(idx) && <Zap size={14} fill="currentColor" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="text-center mt-4">
          <p className="text-[#E8A0B4] italic text-sm">
            ✨ Dillish: You're stronger than yesterday
          </p>
        </div>
      </div>

      {/* Custom styles for hidden scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
