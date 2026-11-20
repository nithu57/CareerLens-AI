import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  Server,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import { deleteUserData } from '@/services/userService';

export const SettingsPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const clientConfigured = isFirebaseConfigured();

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const confirmPrompt = window.prompt(
      'WARNING: This will permanently delete your user profile, resume analyses, saved jobs, learning roadmap, and uploaded PDF files in Cloud Storage.\n\nType "DELETE" to confirm:'
    );

    if (confirmPrompt !== 'DELETE') return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // 1. Delete Firestore and Cloud Storage data
      await deleteUserData(currentUser.uid);

      // 2. Delete Firebase Auth user
      await currentUser.delete();

      // 3. Logout
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      console.error('Account deletion error:', err);
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError(
          'Security requirement: Deleting your account requires a recent login. Please log out and sign in again before deleting.'
        );
      } else {
        setDeleteError(err.message || 'Failed to complete account deletion.');
      }
      setIsDeleting(false);
    }
  };

  const secretCommands = [
    {
      name: 'GEMINI_API_KEY',
      desc: 'Google Gemini API key for structured resume parsing and LensBot mentorship',
      cmd: 'npx firebase-tools functions:secrets:set GEMINI_API_KEY',
    },
    {
      name: 'ADZUNA_APP_ID',
      desc: 'Adzuna Application ID for live job market feeds',
      cmd: 'npx firebase-tools functions:secrets:set ADZUNA_APP_ID',
    },
    {
      name: 'ADZUNA_APP_KEY',
      desc: 'Adzuna Application Secret Key for query authentication',
      cmd: 'npx firebase-tools functions:secrets:set ADZUNA_APP_KEY',
    },
    {
      name: 'YOUTUBE_API_KEY',
      desc: 'Google Cloud YouTube Data API v3 key for tutorial search',
      cmd: 'npx firebase-tools functions:secrets:set YOUTUBE_API_KEY',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
          <Settings className="w-6 h-6 text-brand-600" />
          <span>System Settings & Firebase Credentials</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect Firebase configuration status, Cloud Functions Secret Manager commands, and privacy workflows.
        </p>
      </div>

      {deleteError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Firebase Project Binding Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-950">Firebase Project Status</h2>
              <p className="text-xs text-slate-500">
                Project ID: <code className="font-bold text-brand-700">careerLens-ai-8beae</code>
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              clientConfigured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {clientConfigured ? 'Client Credentials Active' : 'Setup Required (.env.local)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Hosting Target</span>
            <span className="font-bold text-slate-800 mt-0.5 block">Firebase Hosting (SPA)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-medium block">Database & Storage</span>
            <span className="font-bold text-slate-800 mt-0.5 block">Cloud Firestore & Cloud Storage</span>
          </div>
        </div>

        {!clientConfigured && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
            <div className="font-bold flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>To complete web client configuration:</span>
            </div>
            <p className="leading-relaxed text-amber-800">
              Copy your Firebase Web SDK config from Firebase Console (Project settings &gt; General &gt; Your apps) into your local <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code> file.
            </p>
          </div>
        )}
      </div>

      {/* Backend Secret Manager Instructions Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
            <Key className="w-4 h-4 text-brand-600" />
            <span>Backend Private API Credentials (Secret Manager)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Private credentials (Gemini, Adzuna, YouTube) are managed securely via Firebase Secret Manager in Cloud Functions. NEVER paste them in client bundles or public repositories.
          </p>
        </div>

        <div className="space-y-3">
          {secretCommands.map((sec) => (
            <div
              key={sec.name}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {sec.name}
                </span>
                <button
                  onClick={() => copyToClipboard(sec.cmd, sec.name)}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === sec.name ? 'Copied!' : 'Copy Command'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">{sec.desc}</p>
              <div className="p-2 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg overflow-x-auto select-all">
                {sec.cmd}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Deploy functions with secrets:</p>
          <div className="p-2 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg overflow-x-auto select-all">
            npx firebase-tools deploy --only functions
          </div>
        </div>
      </div>

      {/* Account Deletion Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-200 shadow-subtle space-y-4">
        <div className="border-b border-rose-100 pb-3">
          <h2 className="text-sm font-bold text-rose-800 flex items-center space-x-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Permanent Account & Data Deletion</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Completely purge your user document, all resume analyses, stored PDF files, saved jobs, and learning roadmaps.
          </p>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          In accordance with privacy best practices, triggering account deletion immediately removes all personal documents from Cloud Firestore and cascades deletion to your uploaded resumes in Cloud Storage. This action cannot be reversed.
        </p>

        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Deleting Account & Storage Data...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Delete My Account & Purge Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
