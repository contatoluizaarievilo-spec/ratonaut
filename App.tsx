import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import AICoach from './components/AICoach';
import Stability from './components/Stability';
import Analysis from './components/Analysis';
import Profile from './components/Profile';
import { AppTab } from './types';

const App: React.FC = () => {
  const [currentTab, setTab] = useState<AppTab>(AppTab.HUD);

  const renderContent = () => {
    switch (currentTab) {
      case AppTab.HUD:
        return <Dashboard />;
      case AppTab.COACH:
        return <AICoach />;
      case AppTab.STABILITY:
        return <Stability />;
      case AppTab.LAB:
        return <Analysis />;
      case AppTab.PROFILE:
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F5F7FA] text-[#1C1C1C] overflow-hidden flex flex-col font-sans">
      <div className="flex-1 relative overflow-hidden">
        {renderContent()}
      </div>
      <Navigation currentTab={currentTab} setTab={setTab} />
    </div>
  );
};

export default App;