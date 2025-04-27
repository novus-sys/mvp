import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { session, user, profile, isLoading } = useSupabaseAuth();
  const location = useLocation();
  
  // Check if user is authenticated
  const isAuthenticated = !!session && !!user;

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access if requiredRoles is provided
  if (requiredRoles && requiredRoles.length > 0 && profile) {
    const hasRequiredRole = requiredRoles.includes(profile.role);
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has required role, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
