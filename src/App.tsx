import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Toaster } from '@/components/ui/sonner';
import { Video, ShieldCheck, LayoutGrid } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'media' | 'access'>('dashboard');

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      {/* Sidebar - Always shown, responsive layout */}
      <aside className="w-full md:w-64 bg-card border-b md:border-r flex flex-col p-4 md:p-6 transition-all duration-300 shrink-0">
        <div className="flex items-center justify-between md:justify-start gap-3 mb-4 md:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-primary rounded" />
            <span className="font-bold text-lg tracking-tight text-primary">Viral Studio</span>
          </div>
          <div className="md:hidden">
            <div className="flex items-center gap-2 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">
              Live Session
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-x-auto md:overflow-visible">
          <ul className="flex md:flex-col gap-1 md:space-y-1">
            <li 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'} rounded-md text-sm font-medium cursor-pointer flex items-center gap-3 whitespace-nowrap transition-colors`}
            >
              <Video className="w-4 h-4" /> Dashboard
            </li>
            <li 
              onClick={() => setActiveTab('media')}
              className={`px-4 py-2 ${activeTab === 'media' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'} rounded-md text-sm font-medium cursor-pointer flex items-center gap-3 whitespace-nowrap transition-colors`}
            >
              <LayoutGrid className="w-4 h-4" /> Media Library
            </li>
            <li 
              onClick={() => setActiveTab('access')}
              className={`px-4 py-2 ${activeTab === 'access' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'} rounded-md text-sm font-medium cursor-pointer flex items-center gap-3 whitespace-nowrap transition-colors`}
            >
              <ShieldCheck className="w-4 h-4" /> User Access
            </li>
          </ul>
        </nav>

        <div className="hidden md:block mt-auto pt-6 border-t font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
          Firebase Backend Ready
          <div className="text-primary mt-1">viral-c349c</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-14 md:h-16 border-b bg-card px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-[10px] md:text-sm uppercase tracking-widest text-muted-foreground">
              {activeTab === 'dashboard' && 'Video Management Terminal'}
              {activeTab === 'media' && 'Media Library'}
              {activeTab === 'access' && 'User Access Console'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 pr-4 border-r">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Connection
              </div>
            </div>
            <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-primary/20 text-primary uppercase text-xs">VS</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1200px] mx-auto animate-in fade-in duration-700">
             {activeTab === 'access' ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
                  <ShieldCheck className="w-12 h-12 text-muted-foreground/30" />
                  <div>
                    <h2 className="text-xl font-bold">Access Denied</h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[300px]">This module is currently locked or under development.</p>
                  </div>
                </div>
             ) : (
                <Dashboard activeTab={activeTab} />
             )}
          </div>
        </main>

        <footer className="h-10 md:h-12 border-t flex items-center justify-center px-8 bg-card/50 text-[10px] uppercase tracking-widest text-muted-foreground/30 shrink-0">
          &copy; {new Date().getFullYear()} Viral Studio &bull; Precision Control
        </footer>
      </div>
      
      <Toaster position="top-right" richColors theme="dark" />
    </div>
  );
}

