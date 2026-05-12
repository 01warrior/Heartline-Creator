import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Menu01Icon,
  Home01Icon,
  VideoIcon,
  FolderIcon,
  CogIcon
} from '@hugeicons/core-free-icons';

export function StudioLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { path: '/studio', label: 'Créer', icon: Home01Icon },
    { path: '/studio/videos', label: 'Mes Vidéos', icon: VideoIcon },
    { path: '/studio/assets', label: 'Mes Assets', icon: FolderIcon },
    { path: '/studio/settings', label: 'Parametres', icon: CogIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#FAF9F7] overflow-hidden text-[#2D2D2D] font-sans">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex bg-white border-r border-[#E5E1DA] shrink-0 transition-all duration-300 flex-col ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#E5E1DA]">
          {isExpanded && (
            <span className="font-bold text-lg tracking-wide text-[#1A1A1A]">Studio</span>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-[#A8A196] hover:bg-[#F5F2EE] hover:text-[#1A1A1A] transition-colors"
          >
            <HugeiconsIcon icon={Menu01Icon} size={24} color="currentColor" strokeWidth={2.25} />
          </button>
        </div>
        
        <div className="flex-1 py-8 flex flex-col gap-2 px-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-4 rounded-2xl transition-all ${
                  isExpanded ? 'p-4' : 'p-4 justify-center'
                } ${
                  isActive 
                    ? 'bg-[#1A1A1A] text-white shadow-lg' 
                    : 'text-[#A8A196] hover:bg-[#F5F2EE] hover:text-[#1A1A1A]'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <HugeiconsIcon icon={Icon} size={24} color="currentColor" strokeWidth={2.25} className="shrink-0" />
                {isExpanded && (
                  <span className="font-bold tracking-wide truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative" style={{ minWidth: 0 }}>
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex items-center justify-around bg-white border-t border-[#E5E1DA] shrink-0 px-2 py-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl min-w-[4.5rem] transition-all ${
                isActive 
                  ? 'text-[#1A1A1A]' 
                  : 'text-[#A8A196] hover:text-[#1A1A1A]'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-[#1A1A1A] text-white shadow-md' : 'bg-transparent'}`}>
                <HugeiconsIcon icon={Icon} size={20} color="currentColor" strokeWidth={2.25} />
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold tracking-wide ${isActive ? 'text-[#1A1A1A]' : 'text-[#A8A196]'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
