import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthContext';
import { LogIn, LogOut, Video } from 'lucide-react';
import { toast } from 'sonner';

export const Login = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Successfully logged in');
    } catch (error: any) {
      console.error(error);
      toast.error('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
    } catch (error: any) {
      toast.error('Logout failed');
    }
  };

  if (user) {
    return (
      <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
        <LogOut className="w-4 h-4" />
        Logout ({user.displayName})
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative">
        <div className="w-16 h-16 bg-primary rounded-xl absolute -inset-1 blur-xl opacity-20 animate-pulse" />
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center relative shadow-2xl">
          <Video className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl uppercase italic text-foreground">Viral Studio</h1>
        <p className="text-muted-foreground max-w-sm text-sm tracking-wide leading-relaxed">
          Access the secure precision video management terminal. Authenticate via administrator credentials to continue.
        </p>
      </div>

      <div className="w-full max-w-[280px] p-1 bg-muted/30 border border-border rounded-lg shadow-sm">
        <Button 
          onClick={handleLogin} 
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[11px] rounded transition-all duration-300"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Verifying...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LogIn className="w-3.5 h-3.5" />
              Admin Login (Google)
            </div>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-8 pt-4">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">Latency</div>
          <div className="text-xs font-mono text-emerald-500/60">12ms</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">Region</div>
          <div className="text-xs font-mono text-muted-foreground/60">Asia-SE1</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">Node</div>
          <div className="text-xs font-mono text-muted-foreground/60">v1.2</div>
        </div>
      </div>
    </div>
  );
};

