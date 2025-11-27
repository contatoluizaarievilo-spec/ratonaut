import React from 'react';
import { Activity, Zap, Scale, Mic, User } from 'lucide-react';
import { AppTab } from '../types';

interface NavigationProps {
  currentTab: AppTab;
  setTab: (tab: AppTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab }) => {
  const navItems = [
    { id: AppTab.HUD, icon: Activity, label: 'Flow' },
    { id: AppTab.COACH, icon: Zap, label: 'Coach' },
    { id: AppTab.STABILITY, icon: Scale, label: 'Stability' },
    { id: AppTab.LAB, icon: Mic, label: 'Lab' },
    { id: AppTab.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/90 border-t border-[#E0E4EA] backdrop-blur-xl z-50 pb-safe">
      <div className="flex justify-around items-center p-4 pb-6">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 group ${
                isActive ? 'text-[#3AAFA9]' : 'text-[#6E747A] hover:text-[#1C1C1C]'
              }`}
            >
              <item.icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} 
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;