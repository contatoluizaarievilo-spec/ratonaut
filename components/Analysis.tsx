import React, { useState } from 'react';
import { Mic, Video, FileText, CheckCircle, PawPrint } from 'lucide-react';
import { transcribeAudio, analyzeVideo } from '../services/geminiService';

const Analysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audio' | 'video'>('audio');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const f = e.target.files[0];
          setFile(f);
          setResult('');
          const reader = new FileReader();
          reader.onload = (ev) => setPreview(ev.target?.result as string);
          reader.readAsDataURL(f);
      }
  };

  const process = async () => {
      if (!file || !preview) return;
      setIsLoading(true);
      try {
          const base64 = preview.split(',')[1];
          let output = '';
          
          if (activeTab === 'audio') {
              output = await transcribeAudio(base64, file.type);
          } else {
              output = await analyzeVideo(
                  base64, 
                  file.type, 
                  "Analyze this video of a rodent/hamster. Describe the activity (e.g. wheel running, burrowing, eating). If running, estimate the enthusiasm and gait smoothness."
              );
          }
          setResult(output);
      } catch (e) {
          setResult("Error analyzing file.");
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="h-full bg-[#F5F7FA] p-6 pb-32 overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#1C1C1C] mb-8">Rodent Lab</h2>

        <div className="flex gap-4 mb-8">
            <button 
                onClick={() => { setActiveTab('audio'); setFile(null); setPreview(null); setResult(''); }}
                className={`flex-1 p-6 border rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 shadow-sm ${activeTab === 'audio' ? 'border-[#59C3C3] bg-white text-[#59C3C3] ring-1 ring-[#59C3C3]' : 'border-[#E0E4EA] bg-white text-[#6E747A] hover:bg-gray-50'}`}
            >
                <Mic size={28} strokeWidth={1.5} />
                <span className="text-sm font-semibold tracking-wide">Squeak Log</span>
            </button>
            <button 
                onClick={() => { setActiveTab('video'); setFile(null); setPreview(null); setResult(''); }}
                className={`flex-1 p-6 border rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 shadow-sm ${activeTab === 'video' ? 'border-[#4F8FBF] bg-white text-[#4F8FBF] ring-1 ring-[#4F8FBF]' : 'border-[#E0E4EA] bg-white text-[#6E747A] hover:bg-gray-50'}`}
            >
                <Video size={28} strokeWidth={1.5} />
                <span className="text-sm font-semibold tracking-wide">Gait Check</span>
            </button>
        </div>

        <div className="bg-white border border-[#E0E4EA] rounded-2xl p-8 text-center shadow-sm">
            <input 
                type="file" 
                id="lab-upload" 
                className="hidden" 
                accept={activeTab === 'audio' ? "audio/*" : "video/*"}
                onChange={handleFile}
            />
            {!file ? (
                <label htmlFor="lab-upload" className="block cursor-pointer py-8">
                    <div className="w-20 h-20 rounded-full bg-[#F5F7FA] flex items-center justify-center mx-auto mb-4 text-[#6E747A] group-hover:bg-gray-200 transition-colors">
                        <FileText size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-[#6E747A] font-medium">Upload {activeTab} recording</p>
                </label>
            ) : (
                <div className="space-y-6">
                    <p className="text-[#59C3C3] flex items-center justify-center gap-2 text-sm font-semibold">
                        <CheckCircle size={16} /> {file.name}
                    </p>
                    {activeTab === 'video' && preview && (
                        <video src={preview} className="w-full h-40 object-cover rounded-xl border border-[#E0E4EA]" />
                    )}
                    <button 
                        onClick={process} 
                        disabled={isLoading}
                        className="w-full py-4 bg-[#1C1C1C] text-white font-bold rounded-xl hover:bg-gray-900 disabled:opacity-50 transition-colors shadow-lg shadow-gray-200"
                    >
                        {isLoading ? 'Processing...' : `Analyze ${activeTab === 'audio' ? 'Sounds' : 'Movement'}`}
                    </button>
                    <button onClick={() => { setFile(null); setPreview(null); }} className="text-sm text-red-400 font-medium hover:text-red-500">Remove File</button>
                </div>
            )}
        </div>

        {result && (
            <div className="mt-8 p-6 border-l-4 border-[#59C3C3] bg-white rounded-r-xl shadow-sm">
                <h3 className="text-[#6E747A] text-xs font-bold uppercase mb-3">AI Findings</h3>
                <p className="text-[#1C1C1C] text-sm whitespace-pre-wrap leading-relaxed">{result}</p>
            </div>
        )}
    </div>
  );
};

export default Analysis;