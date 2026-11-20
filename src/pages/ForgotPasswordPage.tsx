import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Compass, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (
        err.code === 'auth/api-key-not-valid-please-pass-a-valid-api-key' ||
        err.code === 'auth/invalid-api-key'
      ) {
        setError('Firebase Web API key is not configured or invalid. Please check .env.local.');
      } else {
        setError(err.message || 'Failed to send password reset email.');
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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-xs text-slate-600">
          Enter your email address and we will send you a secure password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-subtle border border-slate-200 sm:rounded-2xl sm:px-10 space-y-6">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Password Reset Email Sent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check your inbox for instructions to reset your password. If it does not appear within a few minutes, check your spam folder.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
