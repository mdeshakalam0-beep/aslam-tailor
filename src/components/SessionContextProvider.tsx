import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner'; // Using sonner for toasts

interface SessionContextType {
  session: Session | null;
  userRole: string | null; // Add userRole to the context type
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // State for user role
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserRole(data.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);

      if (currentSession) {
        await fetchUserRole(currentSession.user.id); // Fetch role when session is active
        if (location.pathname === '/login') {
          navigate('/'); // Redirect authenticated users from login page to home
        }
      } else {
        setUserRole(null); // Clear role on sign out
        if (location.pathname !== '/login') {
          navigate('/login'); // Redirect unauthenticated users to login page
        }
      }
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) {
        await fetchUserRole(initialSession.user.id);
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else {
        setUserRole(null);
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, userRole }}>
      {children}
      <Toaster /> {/* Ensure Toaster is available for notifications */}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};