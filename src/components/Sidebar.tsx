import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  FileText, 
  FolderGit, 
  CheckSquare, 
  Users, 
  Folder, 
  BarChart3, 
  Sparkles, 
  Settings, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout,
  darkMode,
  setDarkMode
}: SidebarProps) {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'meetings', label: 'Meetings', icon: FileText },
    { id: 'actionItems', label: 'Action Items', icon: CheckSquare },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'aiAssistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-polish-bg border-r border-polish-border flex flex-col justify-between h-screen sticky top-0 font-sans z-20">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-polish-border">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-tight">MeetFlow<span className="text-blue-500">AI</span></h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Enterprise Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          const isAi = item.id === 'aiAssistant';
          
          if (isAi) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-md shadow-blue-500/10' 
                    : 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 text-blue-300 border-blue-500/20 hover:from-purple-800/50 hover:to-blue-800/50'
                }`}
              >
                <IconComponent className={`h-4 w-4 ${isActive ? 'text-white animate-pulse' : 'text-blue-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                isActive 
                  ? 'bg-polish-hover text-white border-polish-border font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-polish-hover border-transparent'
              }`}
            >
              <IconComponent className={`h-4 w-4 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom User Profile Section */}
      <div className="p-4 border-t border-polish-border space-y-4 bg-[#1e1e1e]">
        
        {/* Dark Mode and User Role Toggle Display */}
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">Tampilan</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg border border-polish-border bg-polish-card text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title="Toggle Tema"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3 p-2 bg-polish-card rounded-2xl border border-polish-border">
            <img 
              src={currentUser.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg'} 
              alt="Avatar" 
              className="h-10 w-10 rounded-xl bg-polish-input border border-polish-border p-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-blue-400 font-mono uppercase tracking-wider truncate">{currentUser.role === 'Contractor' ? 'Kontraktor' : currentUser.role === 'Director' ? 'Direktur' : currentUser.role === 'Manager' ? 'Manajer' : 'Staf'}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

    </aside>
  );
}
