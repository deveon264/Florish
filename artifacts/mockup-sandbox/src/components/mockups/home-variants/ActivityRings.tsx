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

function Ring({ progress, color, size = 90, strokeWidth = 8, icon, value, label }: ActivityRingProps) {
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
            className="text-white/10"
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
        <div className="text-white font-bold text-sm">{value}</div>
        <div className="text-white/50 text-[10px] uppercase tracking-wider font-medium">{label}</div>
      </div>
    </div>
  );
}

export function ActivityRings() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-y-auto pb-10">
      {/* Header & Rings Section (Dark) */}
      <div className="bg-[#2D0A1A] px-5 pt-12 pb-10 rounded-b-[40px] shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-white/60 text-sm font-medium">Good morning,</p>
            <h1 className="text-white text-2xl font-bold">Ndili</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold border-2 border-white/20">
            N
          </div>
        </div>

        {/* Rings Row */}
        <div className="flex justify-between items-center px-2">
          <Ring 
            progress={0.65} 
            color="#E8A0B4" 
            icon={<Flame size={18} />} 
            value="1170" 
            label="Calories" 
          />
          <Ring 
            progress={0.5} 
            color="#5DADE2" 
            icon={<Droplets size={18} />} 
            value="4/8" 
            label="Glasses" 
          />
          <Ring 
            progress={0.4} 
            color="#F39C12" 
            icon={<Zap size={18} />} 
            value="3 day" 
            label="Streak" 
          />
        </div>
      </div>

      {/* Content Section (Light) */}
      <div className="px-5 -mt-6">
        {/* Quick Actions Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
          {['Workouts', 'Log Food', 'Water', 'Progress'].map((action) => (
            <button 
              key={action}
              className="px-5 py-2.5 bg-white border border-slate-100 shadow-sm rounded-full whitespace-nowrap text-sm font-semibold text-slate-700 active:scale-95 transition-transform"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Featured Workout Card */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
            Today's Workout
            <span className="text-xs font-medium text-pink-500 bg-pink-50 px-2 py-1 rounded">View all</span>
          </h2>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold tracking-widest text-white bg-pink-500 px-2 py-1 rounded">TODAY</span>
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
            
            <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-200 active:scale-[0.98] transition-all">
              <Play size={18} fill="currentColor" />
              Start Workout
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-pink-400 italic text-sm font-medium">
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
