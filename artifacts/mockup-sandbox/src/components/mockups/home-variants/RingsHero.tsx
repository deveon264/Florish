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

function Ring({ progress, color, size = 104, strokeWidth = 9, icon, value, label }: ActivityRingProps) {
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

export function RingsHero() {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedDays = [0, 1, 2]; // Monday, Tuesday, Wednesday completed

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-y-auto pb-10">
      {/* Header & Hero Section (Dark) */}
      <div className="bg-[#2D0A1A] pt-12 shadow-2xl overflow-hidden">
        <div className="px-5 mb-6 flex justify-between items-center">
          <div>
            <p className="text-white/60 text-sm font-medium">Good morning,</p>
            <h1 className="text-white text-2xl font-bold">Ndili</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E8A0B4] flex items-center justify-center text-white font-bold border-2 border-white/20">
            N
          </div>
        </div>

        {/* HERO RING */}
        <div className="flex flex-col items-center py-8">
          <div className="relative" style={{ width: 180, height: 180 }}>
             {/* Simple ring logic duplicated for Hero to avoid prop drilling complex styles or breaking the Ring component's simplicity */}
             <svg className="transform -rotate-90 w-full h-full">
              <circle
                cx={90}
                cy={90}
                r={84}
                stroke="currentColor"
                strokeWidth={12}
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx={90}
                cy={90}
                r={84}
                stroke="#E8A0B4"
                strokeWidth={12}
                fill="transparent"
                strokeDasharray={84 * 2 * Math.PI}
                style={{ 
                  filter: `drop-shadow(0 0 10px #E8A0B460)`,
                  strokeDashoffset: (84 * 2 * Math.PI) * (1 - 0.65),
                  transition: 'stroke-dashoffset 0.5s ease-in-out',
                  strokeLinecap: 'round'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame size={36} className="text-white/80" />
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="text-4xl font-black text-white">1170</div>
            <div className="text-sm text-white/50 font-medium mt-1">of 1800 cal</div>
          </div>
        </div>

        {/* SECONDARY METRICS ROW */}
        <div className="flex justify-center gap-8 mb-8 px-4">
          <Ring 
            size={56}
            strokeWidth={5}
            progress={0.5} 
            color="#5DADE2" 
            icon={<Droplets size={16} />} 
            value="4/8" 
            label="Glasses" 
          />
          <Ring 
            size={56}
            strokeWidth={5}
            progress={0.4} 
            color="#F39C12" 
            icon={<Zap size={16} />} 
            value="3 days" 
            label="Streak" 
          />
        </div>

        {/* Quick Actions Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
          {['Workouts', 'Log Food', 'Water', 'Progress'].map((action) => (
            <button 
              key={action}
              className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full whitespace-nowrap text-xs font-semibold text-white active:scale-95 transition-all border border-white/5"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Wave Transition */}
        <svg viewBox="0 0 390 40" className="w-full -mb-1 mt-4">
          <path d="M0,20 Q97.5,0 195,20 Q292.5,40 390,20 L390,40 L0,40 Z" fill="white"/>
        </svg>
      </div>

      {/* Content Section (Light) */}
      <div className="px-5 pt-4">
        {/* Featured Workout Card */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
            Today's Workout
            <span className="text-xs font-medium text-[#E8A0B4] bg-[#E8A0B4]/10 px-2 py-1 rounded">View all</span>
          </h2>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold tracking-widest text-white bg-[#E8A0B4] px-2 py-1 rounded">TODAY</span>
              <div className="flex gap-3 text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span className="text-xs font-medium">45 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart2 size={14} />
                  <span className="text-xs font-medium">Medium</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-800 mb-1">Upper Body Strength</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">Focus on shoulders and triceps</p>
            
            <button className="w-full bg-[#E8A0B4] hover:bg-[#d88fa3] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#E8A0B4]/20 active:scale-[0.98] transition-all">
              <Play size={18} fill="currentColor" />
              Start Workout
            </button>
          </div>
        </div>

        {/* This Week Streak */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">This Week</h3>
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

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-[#E8A0B4] italic text-sm font-medium">
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
