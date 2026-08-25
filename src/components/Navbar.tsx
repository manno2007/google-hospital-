import React from 'react';
import { 
  HeartPulse, 
  Code2, 
  Database, 
  BookOpen, 
  RotateCcw, 
  Globe2, 
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'mvc' | 'code' | 'db' | 'mentor';
  setActiveTab: (tab: 'mvc' | 'code' | 'db' | 'mentor') => void;
  isRtl: boolean;
  setIsRtl: (rtl: boolean) => void;
  onResetDatabase: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isRtl,
  setIsRtl,
  onResetDatabase
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-bold text-lg text-slate-100 tracking-tight">MediCore Hospital</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                  .NET 8 MVC
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">EF Core 8 • SQLite • Direct DbContext • Bootstrap 5</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse">
            <button
              id="tab-mvc-btn"
              onClick={() => setActiveTab('mvc')}
              className={`flex items-center px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'mvc'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
              <span>Live MVC App</span>
            </button>

            <button
              id="tab-code-btn"
              onClick={() => setActiveTab('code')}
              className={`flex items-center px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
              <span>C# Source Code</span>
            </button>

            <button
              id="tab-db-btn"
              onClick={() => setActiveTab('db')}
              className={`flex items-center px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'db'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
              <span>SQLite & EF Logs</span>
            </button>

            <button
              id="tab-mentor-btn"
              onClick={() => setActiveTab('mentor')}
              className={`flex items-center px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'mentor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
              <span className="hidden md:inline">Mentor Notes</span>
              <span className="md:hidden">Guide</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              id="toggle-rtl-btn"
              onClick={() => setIsRtl(!isRtl)}
              title="Toggle RTL / LTR Layout"
              className={`p-2 rounded-lg text-sm flex items-center transition border ${
                isRtl 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Globe2 className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
              <span className="text-xs font-semibold">{isRtl ? 'RTL' : 'LTR'}</span>
            </button>

            <button
              id="reset-db-btn"
              onClick={onResetDatabase}
              title="Re-seed SQLite Database to Initial State"
              className="p-2 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
