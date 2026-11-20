import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { AuthContext } from '@/contexts/AuthContext';

describe('Layout Components', () => {
  describe('Footer', () => {
    it('renders branding and essential navigation links', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );

      expect(screen.getByText(/Intelligent career & skill gap analyzer/i)).toBeInTheDocument();
      expect(screen.getByText('Platform Features')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    });

    it('displays the disclaimer regarding guidance metrics and external providers', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );

      expect(
        screen.getByText(/The Career Readiness Score is an explainable guidance metric/i)
      ).toBeInTheDocument();
    });
  });

  describe('Navbar', () => {
    it('renders navigation links and action buttons when unauthenticated', () => {
      const mockAuthValue: any = {
        currentUser: null,
        userProfile: null,
        loading: false,
        isConfigured: true,
        loginWithEmail: async () => {},
        registerWithEmail: async () => {},
        loginWithGoogle: async () => {},
        logout: async () => {},
        resetPassword: async () => {},
        refreshProfile: async () => {},
      };

      render(
        <AuthContext.Provider value={mockAuthValue}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByRole('link', { name: /features/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /how it works/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
    });
  });
});
