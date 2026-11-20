import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

// Public pages
import { LandingPage } from '@/pages/LandingPage';
import { FeaturesPage } from '@/pages/FeaturesPage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';

// Onboarding
import { OnboardingPage } from '@/pages/OnboardingPage';

// Protected dashboard pages
import { DashboardPage } from '@/pages/DashboardPage';
import { ResumePage } from '@/pages/ResumePage';
import { CareerExplorerPage } from '@/pages/CareerExplorerPage';
import { SkillGapPage } from '@/pages/SkillGapPage';
import { JobsPage } from '@/pages/JobsPage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { JobAnalysisPage } from '@/pages/JobAnalysisPage';
import { MarketInsightsPage } from '@/pages/MarketInsightsPage';
import { SalaryInsightsPage } from '@/pages/SalaryInsightsPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { LensBotPage } from '@/pages/LensBotPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Route>

            {/* Auth Standalone Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Onboarding Flow (Requires Auth, but allows incomplete onboarding) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Dashboard Routes (Strictly Authenticated + Onboarded) */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/career-explorer" element={<CareerExplorerPage />} />
              <Route path="/skill-gap" element={<SkillGapPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:jobId" element={<JobDetailPage />} />
              <Route path="/job-analysis" element={<JobAnalysisPage />} />
              <Route path="/market-insights" element={<MarketInsightsPage />} />
              <Route path="/salary-insights" element={<SalaryInsightsPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/lensbot" element={<LensBotPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
