import React, { useState, useEffect } from 'react';
import { Save, User, Target, Bell, Zap, Sliders, PawPrint } from 'lucide-react';
import { RodentProfile, DEFAULT_PROFILE } from '../types';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<RodentProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ratonaut_profile');
    if (stored) {
        try {
            setProfile(JSON.parse(stored));
        } catch(e) { console.error("Profile load failed", e); }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('ratonaut_profile', JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateGoal = (key: keyof RodentProfile['goals'], value: string) => {
    setProfile(prev => ({
        ...prev,
        goals: { ...prev.goals, [key]: parseFloat(value) || 0 }
    }));
  };

  const updatePref = (key: keyof RodentProfile['preferences']) => {
    setProfile(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [key]: !prev.preferences[key] }
    }));
  };

  return (
    <div className="h-full bg-[#F5F7FA] px-6 pt-10 pb-32 overflow-y-auto">
      <h2 className="text-2xl font-bold text-[#1C1C1C] mb-8">Rodent Profile</h2>

      <div className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E4EA]">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg text-[#4F8FBF]">
                    <PawPrint size={20} />
                </div>
                <span className="text-lg font-semibold text-[#1C1C1C]">Subject Details</span>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-[#6E747A] uppercase mb-2">Name</label>
                    <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full bg-[#F5F7FA] border border-[#E0E4EA] rounded-xl p-3 text-[#1C1C1C] focus:border-[#59C3C3] focus:outline-none transition-colors font-medium"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#6E747A] uppercase mb-2">Species</label>
                    <select
                        value={profile.species}
                        onChange={(e) => setProfile({...profile, species: e.target.value})}
                        className="w-full bg-[#F5F7FA] border border-[#E0E4EA] rounded-xl p-3 text-[#1C1C1C] focus:border-[#59C3C3] focus:outline-none transition-colors font-medium"
                    >
                        <option value="Syrian Hamster">Syrian Hamster</option>
                        <option value="Dwarf Campbell">Dwarf Campbell</option>
                        <option value="Roborovski">Roborovski</option>
                        <option value="Winter White">Winter White</option>
                        <option value="Chinese Hamster">Chinese Hamster</option>
                        <option value="Mouse">Mouse</option>
                        <option value="Gerbil">Gerbil</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#6E747A] uppercase mb-2">Weight (grams)</label>
                        <input 
                            type="number" 
                            value={profile.weight}
                            onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value)})}
                            className="w-full bg-[#F5F7FA] border border-[#E0E4EA] rounded-xl p-3 text-[#1C1C1C] focus:border-[#59C3C3] focus:outline-none transition-colors font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#6E747A] uppercase mb-2">Age (Months)</label>
                        <input 
                            type="number" 
                            value={profile.age}
                            onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                            className="w-full bg-[#F5F7FA] border border-[#E0E4EA] rounded-xl p-3 text-[#1C1C1C] focus:border-[#59C3C3] focus:outline-none transition-colors font-medium"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E4EA]">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-50 rounded-lg text-[#59C3C3]">
                    <Target size={20} />
                </div>
                <span className="text-lg font-semibold text-[#1C1C1C]">Activity Goals</span>
            </div>

            <div className="space-y-6">
                 <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-[#1C1C1C]">Target Speed</label>
                        <span className="text-sm font-bold text-[#59C3C3]">{profile.goals.speed.toFixed(1)} m/s</span>
                    </div>
                    <input 
                        type="range" min="0" max="3.0" step="0.1"
                        value={profile.goals.speed}
                        onChange={(e) => updateGoal('speed', e.target.value)}
                        className="w-full h-2 bg-[#F5F7FA] rounded-full appearance-none cursor-pointer accent-[#59C3C3]"
                    />
                </div>
                 <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-[#1C1C1C]">Cadence (PPS)</label>
                        <span className="text-sm font-bold text-[#4F8FBF]">{profile.goals.pps.toFixed(1)}</span>
                    </div>
                    <input 
                        type="range" min="0" max="15" step="0.5"
                        value={profile.goals.pps}
                        onChange={(e) => updateGoal('pps', e.target.value)}
                        className="w-full h-2 bg-[#F5F7FA] rounded-full appearance-none cursor-pointer accent-[#4F8FBF]"
                    />
                </div>
            </div>
        </div>

        {/* Feedback Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E4EA]">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-400">
                    <Sliders size={20} />
                </div>
                <span className="text-lg font-semibold text-[#1C1C1C]">Alerts</span>
            </div>

            <div className="space-y-4">
                <button 
                    onClick={() => updatePref('haptics')}
                    className="w-full flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full transition-colors ${profile.preferences.haptics ? 'bg-teal-50 text-[#59C3C3]' : 'bg-gray-50 text-gray-400'}`}>
                            <Zap size={18} />
                        </div>
                        <span className="text-sm font-medium text-[#1C1C1C]">Vibration Alert</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${profile.preferences.haptics ? 'bg-[#59C3C3]' : 'bg-[#E0E4EA]'}`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${profile.preferences.haptics ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </button>

                <div className="h-px bg-[#F5F7FA] w-full" />

                <button 
                    onClick={() => updatePref('audio')}
                    className="w-full flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full transition-colors ${profile.preferences.audio ? 'bg-blue-50 text-[#4F8FBF]' : 'bg-gray-50 text-gray-400'}`}>
                            <Bell size={18} />
                        </div>
                        <span className="text-sm font-medium text-[#1C1C1C]">Audio Chirp</span>
                    </div>
                     <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${profile.preferences.audio ? 'bg-[#59C3C3]' : 'bg-[#E0E4EA]'}`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${profile.preferences.audio ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </button>
            </div>
        </div>

        <button 
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-gray-200 ${saved ? 'bg-[#59C3C3] text-white' : 'bg-[#1C1C1C] text-white hover:bg-gray-900'}`}
        >
            <Save size={18} />
            {saved ? 'Profile Updated' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default Profile;