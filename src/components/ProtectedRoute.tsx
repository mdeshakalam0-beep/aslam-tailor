import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean; // Optional prop for admin-specific routes
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { session, userRole, loading } = useSession();

  if (loading) {
    // Show a loading spinner or message while session is being determined
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userRole !== 'admin') {
    // User is logged in but not an admin, redirect to home or a forbidden page
    return <Navigate to="/" replace />; // Or to a specific /forbidden page
  }

  return <>{children}</>;
};

export default ProtectedRoute;