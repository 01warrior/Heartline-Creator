import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar as SidebarIcon, 
  Home, 
  Video, 
  FolderLock, 
  Settings 
} from 'lucide-react';

export function StudioLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { path: '/studio', label: 'Créer', icon: Home },
    { path: '/studio/videos', label: 'Mes Vidéos', icon: Video },
    { path: '/studio/assets', label: 'Mes Assets', icon: FolderLock },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#FAF9F7] overflow-hidden text-[#2D2D2D] font-sans">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex bg-white border-r border-[#E5E1DA] shrink-0 transition-all duration-300 flex-col ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-20 flex items-center justify-center border-b border-[#E5E1DA]">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-[#A8A196] hover:bg-[#F5F2EE] hover:text-[#1A1A1A] transition-colors"
          >
            <SidebarIcon className="w-6 h-6" />
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
                <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-current'}`} />
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
                <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold tracking-wide ${isActive ? 'text-[#1A1A1A]' : 'text-[#A8A196]'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
