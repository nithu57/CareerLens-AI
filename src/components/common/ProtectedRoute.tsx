import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Compass } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
}) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white animate-pulse shadow-md">
          <Compass className="w-6 h-6 animate-spin" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600">
          Loading CareerLens AI...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if onboarding is completed either in userProfile or locally cached flag
  const isCompleted =
    userProfile?.onboardingCompleted ||
    (typeof window !== 'undefined' &&
      window.localStorage?.getItem(`careerlens_onboarding_completed_${currentUser.uid}`) === 'true');

  // If user has not completed onboarding and is not currently on /onboarding
  if (requireOnboarding && !isCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If user HAS completed onboarding and lands on /onboarding, send them straight to /dashboard!
  if (isCompleted && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : null;
};
