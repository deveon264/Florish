import React from 'react';
import { Flame, Droplets, Zap, Clock, BarChart2, Play, Activity, Camera, TrendingUp } from 'lucide-react';

interface ActivityRingProps {
  progress: number; // 0 to 1
  color: string;
  size?: number;
  strokeWidth?: number;
  icon: React.ReactNode;
  value: string;
  label: string;
}

function Ring({ progress, color, size = 110, strokeWidth = 10, icon, value, label }: ActivityRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative group" style={{ width: size, height: size }}>
        {/* Depth circle background */}
        <div 
          className="absolute inset-[-2px] border border-white/5 rounded-full"
          style={{ width: size + 4, height: size + 4, left: -2, top: -2 }}
        />
        
        <svg className="transform -rotate-90 w-full h-full relative z-10">
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-white/15"
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
              strokeLinecap: 'round',
              filter: `drop-shadow(0 0 8px ${color}80)`
            }}
          />
        </svg>
        {/* Icon in center */}
        <div className="absolute inset-0 flex items-center justify-center text-white/80 z-20">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 22 })}
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-white font-bold text-base">{value}</div>
        <div className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">{label}</div>
      </div>
    </div>
  );
}

export function RingsPremium() {
  const quickActions = [
    { label: 'Workouts', icon: <Activity size={16} /> },
    { label: 'Log Food', icon: <Camera size={16} /> },
    { label: 'Water', icon: <Droplets size={16} /> },
    { label: 'Progress', icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-y-auto pb-12">
      {/* Premium Dark Section */}
      <div 
        className="relative overflow-hidden px-6 pt-14 pb-20"
        style={{ background: 'radial-gradient(ellipse at 30% 0%, #5C1A3A 0%, #2D0A1A 50%, #1A0510 100%)' }}
      >
        {/* Decorative Blurred Circles */}
        <div className="absolute top-[-40px] left-[-40px] w-[200px] h-[200px] bg-pink-600/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-[-30px] w-[150px] h-[150px] bg-purple-700/20 blur-2xl rounded-full" />

        {/* Header */}
        <div className="relative z-10 flex justify-between items-start mb-12">
          <div>
            <p className="text-white/40 text-xs font-semibold mb-1 uppercase tracking-wider">Wednesday, May 28</p>
            <p className="text-white/60 text-lg font-medium">Good morning,</p>
            <h1 className="text-white text-3xl font-black">Ndili</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold border border-white/20 shadow-lg shadow-pink-900/20">
            N
          </div>
        </div>

        {/* Rings Row */}
        <div className="relative z-10 flex justify-between items-center mb-12">
          <Ring 
            progress={0.65} 
            color="#FF4D8D" 
            icon={<Flame />} 
            value="1,170" 
            label="Calories" 
          />
          <Ring 
            progress={0.5} 
            color="#4DA3FF" 
            icon={<Droplets />} 
            value="4/8" 
            label="Glasses" 
          />
          <Ring 
            progress={0.4} 
            color="#FFB84D" 
            icon={<Zap />} 
            value="3 day" 
            label="Streak" 
          />
        </div>

        {/* Quick Actions */}
        <div className="relative z-10 flex gap-3 overflow-x-auto no-scrollbar py-2">
          {quickActions.map((action) => (
            <button 
              key={action.label}
              className="flex items-center gap-2 px-5 py-2.5 border border-white/20 bg-white/8 backdrop-blur-md rounded-full whitespace-nowrap text-sm font-semibold text-white/90 active:scale-95 transition-transform shadow-lg shadow-black/10"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Card Content Section */}
      <div className="px-6 relative z-20 -mt-12">
        {/* Featured Workout Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-2xl shadow-black/30 border-0 mb-8">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-black tracking-[0.2em] text-white bg-pink-500 px-3 py-1.5 rounded-lg">TODAY</span>
            <div className="flex gap-4 text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock size={16} strokeWidth={2.5} />
                <span className="text-sm font-bold">45m</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart2 size={16} strokeWidth={2.5} />
                <span className="text-sm font-bold">Mid</span>
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <span className="text-pink-500 font-bold text-xs uppercase tracking-tighter bg-pink-50 px-2 py-0.5 rounded">Strength Training</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Upper Body Strength</h3>
          <p className="text-slate-500 text-base mb-8 font-medium">Focus on building definition in shoulders and triceps.</p>
          
          <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-5 rounded-[20px] flex items-center justify-center gap-3 shadow-xl shadow-pink-300/50 active:scale-[0.97] transition-all text-lg">
            <Play size={20} fill="currentColor" />
            Start Workout
          </button>
        </div>

        {/* Your Week Section */}
        <div className="mb-8">
          <h2 className="text-slate-900 font-black text-xl mb-4">Your Week</h2>
          <div className="flex justify-between bg-slate-50 p-5 rounded-3xl border border-slate-100">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">{day}</span>
                <div className={`w-3 h-3 rounded-full ${i < 3 ? 'bg-pink-500 shadow-sm shadow-pink-200' : 'bg-slate-200'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="text-center pt-2">
          <p className="text-pink-500 italic text-sm font-semibold tracking-tight">
            "You're stronger than you were yesterday."
          </p>
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-1">— Dillish</p>
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
