import React from 'react';
import { ShieldCheck, Lock, EyeOff, Trash2, Database, Key } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Security & Privacy Policy</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-950">
          Privacy Policy for CareerLens AI
        </h1>
        <p className="text-xs text-slate-500">
          Last updated: October 2026 · Firebase Project: careerLens-ai-8beae
        </p>
      </div>

      <div className="prose prose-sm prose-slate max-w-none space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy-950">1. Overview and Core Commitment</h2>
          <p>
            CareerLens AI ("Platform", "we", "our") is designed to provide career intelligence, resume skill gap analysis, and personalized learning roadmaps while maintaining strict user data privacy. We do not sell your personal data, scrape career portals in violation of terms, or expose your resume to third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy-950">2. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li><strong>Account Identity:</strong> Email address, full name, and authentication tokens provided through Firebase Authentication (Email/Password or Google Sign-In).</li>
            <li><strong>Resume Content:</strong> Extracted education history, technical skills, employment details, and projects contained within PDF files you explicitly upload.</li>
            <li><strong>Platform Preferences:</strong> Target career role, preferred work locations, weekly learning availability, and career goals.</li>
            <li><strong>Interaction Data:</strong> Saved jobs, learning roadmap milestone checkmarks, and conversational queries sent to LensBot AI Mentor.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy-950">3. Storage Isolation & Security Rules</h2>
          <p>
            All uploaded resumes are stored in dedicated, user-scoped buckets in <strong>Firebase Cloud Storage</strong> (e.g. <code>/resumes/&#123;userId&#125;/...</code>). Cloud Firestore documents and subcollections are guarded by strict document-level security rules enforcing <code>request.auth.uid == userId</code>. No user has permission to read, list, or download another user's files.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy-950">4. Processing with Artificial Intelligence</h2>
          <p>
            Extracted resume text and job descriptions are analyzed via Google Gemini API through secured Firebase Cloud Functions. We treat all uploaded text as untrusted data and enforce strict schema output validation. We do not use your private resume content to train foundational public language models without your consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy-950">5. External Providers & Third Parties</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li><strong>Firebase / Google Cloud:</strong> Provides hosting, database storage, and secure serverless function execution.</li>
            <li><strong>Adzuna API:</strong> Used strictly for retrieving genuine live job postings. No user resumes or PII are passed to Adzuna.</li>
            <li><strong>YouTube Data API:</strong> Used strictly for retrieving public educational tutorial courses based on skill topics.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy-950">6. User Rights & Complete Data Deletion</h2>
          <p>
            You have the right to inspect, update, replace, or permanently delete your data at any time. Clicking "Delete My Account" in Settings permanently purges your user profile, all associated subcollections from Cloud Firestore, and all uploaded resume files from Cloud Storage immediately.
          </p>
        </section>
      </div>
    </div>
  );
};
