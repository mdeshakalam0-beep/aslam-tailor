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

      if (error) throw error;
      return data.role; // Return the role
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null; // Return null on error
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);

      if (currentSession) {
        const role = await fetchUserRole(currentSession.user.id);
        setUserRole(role);
        if (location.pathname === '/login') {
          navigate('/'); // Redirect authenticated users from login page to home
        }
      } else {
        setUserRole(null); // Clear role on sign out
        if (location.pathname !== '/login') {
          navigate('/login'); // Redirect unauthenticated users to login page
        }
      }
      // Set loading to false only after the initial session and role are determined
      // This ensures child components don't render before session/role is ready
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]); // Dependencies should be stable

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