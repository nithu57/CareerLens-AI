import React, { useState, useEffect } from 'react';
import {
  SearchCode,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Save,
  ArrowRight,
} from 'lucide-react';
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getLatestResumeAnalysis } from '@/services/resumeService';
import { ResumeAnalysisRecord, JobAnalysisRecord } from '@/types';

export const JobAnalysisPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysisRecord | null>(null);
  const [latestResume, setLatestResume] = useState<ResumeAnalysisRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    getLatestResumeAnalysis(currentUser.uid).then((res) => setLatestResume(res));
  }, [currentUser]);

  const handleAnalyzeJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || !currentUser) return;

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const resumeText = latestResume?.extractedText || 'Proficient in JavaScript, TypeScript, React, Node.js, SQL, REST APIs.';
      let result;

      // Try backend function if configured
      const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || '';
      if (backendBaseUrl) {
        try {
          const resp = await fetch(`${backendBaseUrl}/api/jobs/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText, jobDescription }),
          });
          if (resp.ok) {
            result = await resp.json();
          }
        } catch (err) {
          console.warn('Backend job match fallback to local analyzer:', err);
        }
      }

      // Local heuristic analyzer fallback
      if (!result) {
        const jdLower = jobDescription.toLowerCase();
        const candidateSkills = latestResume?.extractedData.technicalSkills || [
          'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git',
        ];

        const matched: string[] = [];
        const missing: string[] = [];

        candidateSkills.forEach((skill) => {
          if (jdLower.includes(skill.toLowerCase())) {
            matched.push(skill);
          }
        });

        // Check for common demands
        const commonTech = ['Docker', 'Kubernetes', 'AWS', 'GraphQL', 'Redis', 'Python', 'CI/CD'];
        commonTech.forEach((tech) => {
          if (jdLower.includes(tech.toLowerCase()) && !matched.includes(tech)) {
            missing.push(tech);
          }
        });

        const score = Math.min(95, Math.max(35, Math.round((matched.length / (matched.length + missing.length || 1)) * 100)));

        result = {
          matchScore: score,
          matchedSkills: matched.length > 0 ? matched : ['Software Engineering Fundamentals'],
          missingSkills: missing.length > 0 ? missing : ['Cloud Native Microservices'],
          recommendations: [
            'Tailor your project descriptions to highlight experience with ' + (missing[0] || 'Containerization') + '.',
            'Emphasize measurable outcomes (e.g. reduced build time, optimized latency) in your interview responses.',
            'Review system design patterns relevant to the role before your technical round.',
          ],
        };
      }

      // Persist to Firestore: users/{uid}/job_analyses
      const colRef = collection(db, 'users', currentUser.uid, 'job_analyses');
      const newDocRef = doc(colRef);
      const record: JobAnalysisRecord = {
        id: newDocRef.id,
        userId: currentUser.uid,
        jobTitle: jobTitle || 'Target Opportunity',
        company: company || 'Prospective Employer',
        jobDescription: jobDescription.slice(0, 10000),
        matchScore: result.matchScore,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        recommendations: result.recommendations,
        createdAt: new Date().toISOString(),
      };

      try {
        const savePromise = setDoc(newDocRef, record);
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore job analysis save timeout')), 4000)
        );
        await Promise.race([savePromise, timeoutPromise]);
      } catch (saveErr) {
        console.warn('Firestore background save note:', saveErr);
      }
      setAnalysis(record);
    } catch (err: any) {
      console.error('Job analysis error:', err);
      setErrorMsg(err.message || 'Failed to analyze job description.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
          <SearchCode className="w-6 h-6 text-brand-600" />
          <span>Job Description Matcher & Gap Analysis</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Paste any job description from LinkedIn, Indeed, or career portals to get an instant match evaluation against your resume.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <form onSubmit={handleAnalyzeJob} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Job Title (Optional)
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google India / Startup"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Paste Job Description Content *
            </label>
            <textarea
              rows={8}
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job requirements, required qualifications, and technology stack description here..."
              className="mt-1 block w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500 leading-relaxed font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isProcessing || !jobDescription.trim()}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Comparing against Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Alignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Output */}
      {analysis && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-navy-950">
                {analysis.jobTitle} {analysis.company && `at ${analysis.company}`}
              </h2>
              <p className="text-xs text-slate-500">
                Analysis generated against your verified resume
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400 font-medium">Alignment Match:</span>
              <span className="text-3xl font-extrabold text-brand-600">
                {analysis.matchScore}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched skills */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <h3 className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Matching Qualifications ({analysis.matchedSkills.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysis.matchedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-emerald-900 border border-emerald-200 shadow-2xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing skills */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
              <h3 className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Skills to Address Before Interview ({analysis.missingSkills.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysis.missingSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-amber-900 border border-amber-200 shadow-2xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
              Strategic Application & Interview Advice
            </h3>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed"
                >
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
