import React, { useState, useEffect, useRef } from 'react';
import { Scale, RotateCcw, Activity, Zap, Brain, ChevronRight } from 'lucide-react';
import { StabilityData } from '../types';
import { analyzeGaitPattern } from '../services/geminiService';

const Stability: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [data, setData] = useState<StabilityData>({ tiltX: 0, tiltY: 0, vibration: 0, symmetryScore: 100 });
  const [history, setHistory] = useState<StabilityData[]>([]);
  const [aiReport, setAiReport] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Simulation loop for hamster running mechanics
  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = window.setInterval(() => {
        const time = Date.now();
        // Simulate subtle body sway of a running hamster
        const swayFreq = 8; // Hz
        const tiltX = Math.sin(time / 100 * swayFreq) * 5 + (Math.random() - 0.5) * 2;
        const tiltY = Math.cos(time / 120 * swayFreq) * 3 + (Math.random() - 0.5) * 1;
        const vibration = Math.abs(Math.sin(time / 50)) * 2 + Math.random(); // Z-axis jitter
        
        // Symmetry decreases if tilts are erratic
        const currentSymmetry = 100 - (Math.abs(tiltX) + Math.abs(tiltY)) * 2;
        const clampedSymmetry = Math.max(0, Math.min(100, currentSymmetry));

        const newData = {
          tiltX: parseFloat(tiltX.toFixed(1)),
          tiltY: parseFloat(tiltY.toFixed(1)),
          vibration: parseFloat(vibration.toFixed(2)),
          symmetryScore: parseFloat(clampedSymmetry.toFixed(0))
        };

        setData(newData);
        setHistory(prev => [...prev.slice(-50), newData]); // Keep last 50 points
      }, 50); // 20Hz update
    } else {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [isMonitoring]);

  const handleAnalyze = async () => {
    if (history.length === 0) return;
    setIsAnalyzing(true);
    setAiReport('');
    
    // Calculate stats to send to AI
    const avgSym = history.reduce((acc, curr) => acc + curr.symmetryScore, 0) / history.length;
    const maxTilt = Math.max(...history.map(d => Math.abs(d.tiltX)));
    const avgVib = history.reduce((acc, curr) => acc + curr.vibration, 0) / history.length;

    const prompt = `Analyze this rodent gait data: 
    - Average Symmetry: ${avgSym.toFixed(1)}%
    - Max Lateral Tilt: ${maxTilt.toFixed(1)} degrees
    - Vertical Vibration Factor: ${avgVib.toFixed(2)}
    
    Provide a brief biomechanical assessment of the hamster's running form. Is there signs of injury, wobbling, or good health?`;

    try {
        const report = await analyzeGaitPattern(prompt);
        setAiReport(report);
    } catch (e) {
        setAiReport("Analysis failed. Sensors interference detected.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full bg-[#F5F7FA] p-6 pb-32 overflow-y-auto flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-[#1C1C1C]">Stability</h2>
            <p className="text-sm text-[#6E747A]">Biomechanics & Gait Monitor</p>
        </div>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#59C3C3]">
            <Scale size={20} />
        </div>
      </div>

      {/* Main Visualizer - Bubble Level */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E0E4EA] flex flex-col items-center justify-center relative mb-6">
         <div className="w-64 h-64 rounded-full border-[12px] border-[#F5F7FA] relative flex items-center justify-center bg-gray-50 shadow-inner">
             {/* Crosshairs */}
             <div className="absolute w-full h-[1px] bg-[#E0E4EA]" />
             <div className="absolute h-full w-[1px] bg-[#E0E4EA]" />
             
             {/* Concentric rings */}
             <div className="absolute w-32 h-32 rounded-full border border-[#E0E4EA] border-dashed" />
             <div className="absolute w-16 h-16 rounded-full border border-[#E0E4EA]" />

             {/* The "Bubble" / Hamster Center of Mass */}
             <div 
                className="w-8 h-8 bg-[#59C3C3] rounded-full shadow-lg absolute transition-all duration-75 flex items-center justify-center z-10"
                style={{
                    transform: `translate(${data.tiltX * 5}px, ${data.tiltY * 5}px)`
                }}
             >
                <div className="w-2 h-2 bg-white/50 rounded-full" />
             </div>
         </div>
         <p className="mt-4 text-xs font-bold text-[#6E747A] uppercase tracking-wider">Center of Mass Displacement</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E0E4EA]">
             <div className="flex items-center gap-2 mb-2 text-[#6E747A]">
                 <Activity size={16} />
                 <span className="text-xs font-bold uppercase">Symmetry</span>
             </div>
             <div className="flex items-end gap-2">
                 <span className="text-3xl font-bold text-[#1C1C1C]">{data.symmetryScore}</span>
                 <span className="text-sm text-[#6E747A] mb-1">%</span>
             </div>
             <div className="w-full bg-[#F5F7FA] h-1.5 rounded-full mt-2 overflow-hidden">
                 <div className={`h-full rounded-full transition-all duration-300 ${data.symmetryScore > 80 ? 'bg-[#59C3C3]' : 'bg-amber-400'}`} style={{width: `${data.symmetryScore}%`}} />
             </div>
         </div>

         <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E0E4EA]">
             <div className="flex items-center gap-2 mb-2 text-[#6E747A]">
                 <RotateCcw size={16} />
                 <span className="text-xs font-bold uppercase">Lat. Tilt</span>
             </div>
             <div className="flex items-end gap-2">
                 <span className="text-3xl font-bold text-[#1C1C1C]">{Math.abs(data.tiltX).toFixed(1)}</span>
                 <span className="text-sm text-[#6E747A] mb-1">°</span>
             </div>
             <div className="w-full bg-[#F5F7FA] h-1.5 rounded-full mt-2 overflow-hidden">
                 <div className="h-full bg-[#4F8FBF] rounded-full transition-all duration-300" style={{width: `${Math.min(100, Math.abs(data.tiltX) * 10)}%`}} />
             </div>
         </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
          <button 
             onClick={() => setIsMonitoring(!isMonitoring)}
             className={`flex-1 py-4 rounded-xl font-bold text-sm shadow-sm transition-all ${isMonitoring ? 'bg-white text-red-500 border border-red-100 hover:bg-red-50' : 'bg-[#1C1C1C] text-white hover:bg-gray-900'}`}
          >
             {isMonitoring ? 'Stop Sensors' : 'Start Monitoring'}
          </button>
          
          <button 
             onClick={handleAnalyze}
             disabled={history.length < 10 || isAnalyzing}
             className="flex-1 py-4 bg-[#59C3C3] text-white rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#48b0b0] transition-all"
          >
             {isAnalyzing ? <Brain className="animate-pulse" size={18} /> : <Zap size={18} />}
             {isAnalyzing ? 'Analyzing...' : 'AI Gait Report'}
          </button>
      </div>

      {/* AI Report Card */}
      {aiReport && (
          <div className="mt-6 bg-white border border-[#E0E4EA] rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-3">
                  <Brain size={18} className="text-[#59C3C3]" />
                  <span className="text-sm font-bold text-[#1C1C1C]">Gemini Biomechanics Assessment</span>
              </div>
              <p className="text-sm text-[#6E747A] leading-relaxed">{aiReport}</p>
          </div>
      )}

    </div>
  );
};

export default Stability;