import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

interface SessionContextType {
  session: Session | null;
  userRole: string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Keep this true initially
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      return data.role;
    } catch (error) {
      console.error('Unexpected error in fetchUserRole:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleAuthStateChange = async (currentSession: Session | null) => {
      if (!isMounted) return;

      setSession(currentSession);
      let role = null;
      if (currentSession) {
        role = await fetchUserRole(currentSession.user.id);
        if (!isMounted) return;
        setUserRole(role);
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else {
        if (!isMounted) return;
        setUserRole(null);
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (isMounted) {
        handleAuthStateChange(initialSession).finally(() => {
          if (isMounted) {
            setLoading(false); // Set loading to false after initial check and role determination
          }
        });
      }
    });

    // Listen for subsequent auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (isMounted) {
        // Only update session and role, loading is already false after initial check
        handleAuthStateChange(currentSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
      <Toaster />
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