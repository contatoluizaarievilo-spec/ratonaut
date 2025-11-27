import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Play, Square, RefreshCw, Activity, Zap, MapPin, User as UserIcon, PawPrint } from 'lucide-react';
import { SensorData, RodentProfile, DEFAULT_PROFILE } from '../types';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<SensorData>({ speed: 0, pps: 0, acceleration: 0, totalSteps: 0 });
  const [history, setHistory] = useState<{ time: number; speed: number; pps: number }[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [profile, setProfile] = useState<RodentProfile>(DEFAULT_PROFILE);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastAlertTime = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('ratonaut_profile');
    if (stored) {
        try {
            setProfile(JSON.parse(stored));
        } catch (e) { console.error("Profile load error", e); }
    }
  }, []);

  const playFeedbackTone = (freq: number, type: 'sine' | 'triangle' = 'sine') => {
    if (!profile.preferences.audio) return;
    if (Date.now() - lastAlertTime.current < 4000) return;

    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); // Faster chirp for hamsters
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    
    lastAlertTime.current = Date.now();
  };

  const triggerHaptic = () => {
      if (profile.preferences.haptics && navigator.vibrate) {
          navigator.vibrate(5); // Shorter, sharper vibration for tiny steps
      }
  };

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }

    if (isSimulating) {
      intervalRef.current = window.setInterval(() => {
        const time = Date.now();
        
        // HAMSTER Simulation Logic
        // Hamsters on wheels run at approx 3-6 km/h (0.8 - 1.6 m/s)
        // Their cadence is extremely high, 6-12 Hz
        const baseSpeed = 0.5 + Math.sin(time / 1500) * 0.8; // m/s
        const newSpeed = Math.max(0, baseSpeed + (Math.random() * 0.1));
        
        // Paws Per Second calculation
        const newPPS = newSpeed > 0.1 ? 4.0 + (newSpeed * 4) + (Math.random() * 1.0) : 0; 
        const newAcc = newSpeed > 0 ? 0.2 + Math.random() * 0.3 : 0;
        
        const stepThreshold = 1000 / (newPPS || 1); 
        const isStep = newPPS > 0; // Continuous stream for high frequency
        
        const addedStep = isStep ? Math.max(1, Math.round(newPPS / 4)) : 0; // Simulate multiple tiny steps per update

        if (addedStep > 0) triggerHaptic();
        if (newSpeed >= profile.goals.speed) playFeedbackTone(1200, 'sine'); // Higher pitch for hamsters
        else if (newPPS >= profile.goals.pps) playFeedbackTone(800, 'triangle');

        const newData = {
          speed: parseFloat(newSpeed.toFixed(2)),
          pps: parseFloat(newPPS.toFixed(1)),
          acceleration: parseFloat(newAcc.toFixed(2)),
          totalSteps: data.totalSteps + addedStep
        };

        setData(prev => ({ ...newData, totalSteps: prev.totalSteps + addedStep }));
        setHistory(prev => [...prev.slice(-40), { time, speed: newData.speed, pps: newData.pps }]);
      }, 250); // Faster update rate (4Hz) for smoother high-speed hamster graphs
    } else {
        setIsSimulating(true);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isActive, isSimulating, profile]);

  const toggleSession = () => setIsActive(!isActive);

  return (
    <div className="h-full flex flex-col px-6 pt-10 pb-32 overflow-y-auto bg-[#F5F7FA]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-[#1C1C1C] tracking-tight">RATONAUT</h1>
            <p className="text-sm text-[#6E747A] font-medium mt-0.5">Subject: {profile.name} ({profile.species})</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white border border-[#E0E4EA] flex items-center justify-center text-[#1C1C1C] shadow-sm">
            <PawPrint size={20} />
        </div>
      </div>

      {isActive ? (
        // Active View
        <div className="flex-1 flex flex-col">
            <div className="text-center mb-8">
                <span className="inline-block py-1 px-3 rounded-full bg-white border border-[#E0E4EA] text-[#6E747A] text-sm font-medium shadow-sm mb-6">
                    Active Session
                </span>
                
                <div className="flex flex-col items-center justify-center">
                    <span className="text-7xl font-extrabold text-[#1C1C1C] tracking-tighter mb-2">
                        {data.pps.toFixed(1)}
                    </span>
                    <span className="text-[#6E747A] font-medium text-lg uppercase tracking-wide">Paws / Sec</span>
                </div>

                {/* Wave Animation */}
                <div className="h-16 flex items-center justify-center gap-1.5 mt-8">
                    {[...Array(8)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-1.5 bg-[#59C3C3] rounded-full transition-all duration-100"
                            style={{ 
                                height: isActive ? `${10 + Math.random() * 40}px` : '4px',
                                opacity: 0.6 + (i * 0.1)
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Realtime Chart */}
            <div className="flex-1 min-h-[150px] w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#59C3C3" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#59C3C3" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area 
                            type="monotone" 
                            dataKey="speed" 
                            stroke="#59C3C3" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorSpeed)" 
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E0E4EA] text-center">
                    <span className="block text-[#6E747A] text-[10px] font-bold uppercase mb-1">Wheel Speed</span>
                    <span className="text-xl font-bold text-[#1C1C1C]">{data.speed} <span className="text-xs font-normal text-[#6E747A]">m/s</span></span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E0E4EA] text-center">
                    <span className="block text-[#6E747A] text-[10px] font-bold uppercase mb-1">G-Force</span>
                    <span className="text-xl font-bold text-[#1C1C1C]">{data.acceleration} <span className="text-xs font-normal text-[#6E747A]">g</span></span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E0E4EA] text-center">
                    <span className="block text-[#6E747A] text-[10px] font-bold uppercase mb-1">Total Paws</span>
                    <span className="text-xl font-bold text-[#1C1C1C]">{data.totalSteps}</span>
                </div>
            </div>

             <button 
                onClick={toggleSession}
                className="mt-8 w-full py-4 rounded-2xl bg-[#1C1C1C] text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-all shadow-lg shadow-gray-200"
            >
                <Square size={18} fill="currentColor" /> END RUN
            </button>
        </div>
      ) : (
        // Dashboard View
        <div className="space-y-6">
            
            {/* Primary Card - Speed */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E0E4EA] relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-[#6E747A] font-medium text-sm">Wheel Velocity</span>
                        <h2 className="text-5xl font-extrabold text-[#1C1C1C] mt-2 tracking-tight">
                            {data.speed.toFixed(2)} <span className="text-2xl font-semibold text-[#6E747A]">m/s</span>
                        </h2>
                    </div>
                    <div className="p-3 bg-[#F5F7FA] rounded-full text-[#59C3C3]">
                        <Activity size={24} className="opacity-50"/>
                    </div>
                </div>
                
                <div className="w-full bg-[#F5F7FA] h-2 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#59C3C3] transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(100, (data.speed / 2.0) * 100)}%` }}
                    />
                </div>
                <p className="text-xs text-[#6E747A] mt-3 font-medium">Goal: {profile.goals.speed} m/s</p>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#E0E4EA] flex flex-col justify-between h-40 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                        <PawPrint size={80} />
                     </div>
                     <span className="text-[#6E747A] font-medium text-sm">Paw Cadence</span>
                     <div>
                        <span className="text-3xl font-extrabold text-[#1C1C1C]">{data.pps.toFixed(1)}</span>
                        <span className="text-sm text-[#6E747A] ml-1">PPS</span>
                     </div>
                     <div className="flex items-center gap-1 text-[#59C3C3] text-xs font-semibold">
                        <div className={`w-2 h-2 rounded-full ${data.pps > 0 ? 'bg-[#59C3C3] animate-pulse' : 'bg-gray-300'}`} />
                        {data.pps > 0 ? 'Running' : 'Sleeping'}
                     </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#E0E4EA] flex flex-col justify-between h-40">
                     <span className="text-[#6E747A] font-medium text-sm">Est. Distance</span>
                     <div>
                        <span className="text-3xl font-extrabold text-[#1C1C1C]">{(data.totalSteps * 0.05).toFixed(1)}</span>
                        <span className="text-sm text-[#6E747A] ml-1">m</span>
                     </div>
                     <span className="text-xs text-[#6E747A]">Stride: ~5cm</span>
                </div>
            </div>
            
            {/* Main Action */}
            <button 
                onClick={toggleSession}
                className="w-full py-5 rounded-2xl bg-[#59C3C3] text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#48b0b0] transition-all shadow-[0_10px_20px_rgba(89,195,195,0.3)]"
            >
                <Play size={20} fill="currentColor" /> MONITOR WHEEL
            </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;