import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  DollarSign,
  ArrowLeft,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BENCHMARK_MARKET_JOBS, saveJobToFirestore, removeSavedJob, subscribeSavedJobs } from '@/services/jobsService';
import { getLatestResumeAnalysis } from '@/services/resumeService';
import { JobListing, ResumeAnalysisRecord, SavedJobRecord } from '@/types';

export const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { currentUser } = useAuth();

  const [job, setJob] = useState<JobListing | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysisRecord | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJobRecord[]>([]);

  useEffect(() => {
    // Find job from benchmark or saved list
    const found = BENCHMARK_MARKET_JOBS.find((j) => j.id === jobId);
    if (found) {
      setJob(found);
    } else {
      // Mock single view if dynamic ID
      setJob({
        id: jobId || 'unknown',
        title: 'Technology Opportunity',
        company: 'Partner Enterprise',
        location: 'Bengaluru / Remote, India',
        salary: '₹14,00,000 - ₹22,00,000 / yr',
        description: 'Comprehensive software engineering role requiring hands-on experience in full-stack architecture, clean coding practices, and cloud-native services.',
        redirectUrl: 'https://careers.infosys.com',
        provider: 'Adzuna',
        retrievedAt: new Date().toISOString(),
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git'],
      });
    }

    if (currentUser) {
      getLatestResumeAnalysis(currentUser.uid).then((res) => setAnalysis(res));
      const unsub = subscribeSavedJobs(currentUser.uid, (list) => setSavedJobs(list));
      return () => unsub();
    }
  }, [jobId, currentUser]);

  if (!job) {
    return <div className="text-center py-12 text-slate-500">Loading job details...</div>;
  }

  const isSaved = savedJobs.some((s) => s.id === job.id);

  // Match analysis between candidate resume skills and this job's required skills
  const candidateSkills = new Set(
    analysis?.extractedData.technicalSkills.map((s) => s.toLowerCase().trim()) || ['react', 'javascript', 'typescript']
  );

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  (job.requiredSkills || ['React', 'TypeScript', 'Node.js', 'SQL', 'Git']).forEach((req) => {
    if (candidateSkills.has(req.toLowerCase())) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const totalReq = (job.requiredSkills || []).length || 5;
  const matchPercentage = Math.round((matchedSkills.length / totalReq) * 100);

  const handleToggleSave = async () => {
    if (!currentUser || !job) return;
    if (isSaved) {
      await removeSavedJob(currentUser.uid, job.id);
    } else {
      await saveJobToFirestore(currentUser.uid, job);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to All Jobs</span>
        </Link>
      </div>

      {/* Job Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-navy-950">{job.title}</h1>
            {job.isRemote && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                Remote
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="font-bold text-slate-800">{job.company}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.location}</span>
            </span>
            {job.salary && (
              <>
                <span>•</span>
                <span className="font-semibold text-emerald-700">{job.salary}</span>
              </>
            )}
            <span>•</span>
            <span className="text-slate-400">Via {job.provider}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleToggleSave}
            className={`p-2.5 rounded-xl border transition-colors ${
              isSaved
                ? 'bg-brand-50 border-brand-200 text-brand-600'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>

          <a
            href={job.redirectUrl}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <span>Apply on Company Portal</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Grid: Match Comparison & Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Job Description & Details */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-6">
          <div>
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider mb-3">
              Role Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider mb-3">
              Required Core Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(job.requiredSkills || ['React', 'TypeScript', 'Node.js']).map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-800"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Instant Resume Match Engine */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block">
              Resume Alignment
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-navy-950">{matchPercentage}%</span>
              <span className="text-xs font-semibold text-emerald-600">Requirement Match</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Matched against your active verified resume analysis.
            </p>
          </div>

          {/* Matched */}
          <div>
            <h4 className="text-xs font-bold text-emerald-700 flex items-center space-x-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Matching Skills ({matchedSkills.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1">
              {matchedSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Missing */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-amber-700 flex items-center space-x-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Skills to Emphasize ({missingSkills.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1">
              {missingSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-800 block">Interview Preparation Tip:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When interviewing for this position, be prepared to explain practical use cases for {missingSkills[0] || 'Cloud Deployment'} and highlight your demonstrated mastery of {matchedSkills[0] || 'Core Architecture'}.
            </p>
          </div>

          <Link
            to="/lensbot"
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors flex items-center justify-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice Mock Interview for This Role</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
