import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Compass, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginWithEmail, loginWithGoogle, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const stateFrom = (location.state as any)?.from?.pathname;
  const from = stateFrom && stateFrom !== '/onboarding' ? stateFrom : '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginWithEmail(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Too many failed attempts. Please reset your password or try again later.');
      } else if (
        err.code === 'auth/api-key-not-valid-please-pass-a-valid-api-key' ||
        err.code === 'auth/invalid-api-key'
      ) {
        setAuthError('Firebase Web API key is not configured or invalid. Please retrieve your Web API key from Firebase Console (Project settings > General > Your apps) and save it in .env.local.');
      } else {
        setAuthError(err.message || 'Failed to authenticate. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup, do not show error
      } else if (
        err.code === 'auth/api-key-not-valid-please-pass-a-valid-api-key' ||
        err.code === 'auth/invalid-api-key'
      ) {
        setAuthError('Firebase Web API key is not configured or invalid. Please copy the Web API key from Firebase Console into .env.local.');
      } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setAuthError('Google Sign-In is not yet enabled in your Firebase Console (Authentication -> Sign-in method).');
      } else {
        setAuthError(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-subtle">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-navy-950">
            Career<span className="text-brand-600">Lens</span> AI
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-navy-950">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-subtle border border-slate-200 sm:rounded-2xl sm:px-10 space-y-6">
          {!isConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Firebase Web Credentials Pending:</span>
                <p className="mt-0.5 text-amber-700">
                  Update <code className="bg-amber-100 px-1 rounded">.env.local</code> with your actual Firebase API keys to connect to project <code className="bg-amber-100 px-1 rounded">careerlens-ai-8beae</code>.
                </p>
              </div>
            </div>
          )}

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Or with email</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Email address
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="developer@example.com"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-brand-600 hover:text-brand-500"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
