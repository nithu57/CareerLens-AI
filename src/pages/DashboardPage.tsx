import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Compass,
  Briefcase,
  GitCompare,
  TrendingUp,
  Map,
  Bot,
  CheckCircle,
  ArrowRight,
  Sparkles,
  AlertCircle,
  BookOpen,
  RefreshCw,
  Award,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getLatestResumeAnalysis } from '@/services/resumeService';
import { subscribeUserRoadmap, toggleMilestoneCompletion } from '@/services/roadmapService';
import { subscribeSavedJobs } from '@/services/jobsService';
import { getMarketSnapshot } from '@/services/marketService';
import { getConfidenceScore, recalculateConfidenceScore } from '@/services/confidenceService';
import { ResumeAnalysisRecord, RoadmapMilestone, SavedJobRecord, MarketSnapshot, RoleType, ConfidenceScoreData } from '@/types';

export const DashboardPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [latestAnalysis, setLatestAnalysis] = useState<ResumeAnalysisRecord | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapMilestone[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJobRecord[]>([]);
  const [marketSnapshot, setMarketSnapshot] = useState<MarketSnapshot | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<ConfidenceScoreData | null>(null);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const targetRole = userProfile?.targetRole || 'Full-Stack Developer';

  useEffect(() => {
    if (!currentUser) return;

    let unsubRoadmap: (() => void) | undefined;
    let unsubSavedJobs: (() => void) | undefined;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch latest resume analysis
        const analysis = await getLatestResumeAnalysis(currentUser.uid);
        setLatestAnalysis(analysis);

        // 2. Load market snapshot for user's target role
        const snapshot = await getMarketSnapshot(targetRole);
        setMarketSnapshot(snapshot);

        // 3. Fetch persistent Confidence Score from MongoDB backend
        const conf = await getConfidenceScore();
        setConfidenceScore(conf);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // 3. Real-time listeners for roadmap and saved jobs
    unsubRoadmap = subscribeUserRoadmap(currentUser.uid, (milestones) => {
      setRoadmap(milestones);
    });

    unsubSavedJobs = subscribeSavedJobs(currentUser.uid, (jobs) => {
      setSavedJobs(jobs);
    });

    return () => {
      if (unsubRoadmap) unsubRoadmap();
      if (unsubSavedJobs) unsubSavedJobs();
    };
  }, [currentUser, targetRole]);

  // Recalculate score permanently on MongoDB backend
  const handleRecalculateConfidence = async () => {
    setIsRecalculating(true);
    try {
      const updated = await recalculateConfidenceScore();
      if (updated) {
        setConfidenceScore(updated);
      }
    } catch (err) {
      console.error('Failed to recalculate confidence score:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Compute readiness score
  const readinessScore = latestAnalysis?.readinessScore || 62;
  const matchedSkillsCount = latestAnalysis?.skillBreakdown.matched.length || userProfile?.technicalSkills?.length || 4;
  const missingSkillsCount = latestAnalysis?.skillBreakdown.missing.length || 3;
  const completedMilestones = roadmap.filter((m) => m.completed).length;
  const totalMilestones = roadmap.length || 4;

  // Radar chart data comparing candidate proficiency vs target role benchmark
  const radarData = [
    { subject: 'Frontend', Candidate: 85, MarketBenchmark: 90 },
    { subject: 'Backend', Candidate: 70, MarketBenchmark: 85 },
    { subject: 'Databases', Candidate: 65, MarketBenchmark: 80 },
    { subject: 'Cloud / DevOps', Candidate: 45, MarketBenchmark: 75 },
    { subject: 'Architecture', Candidate: 50, MarketBenchmark: 70 },
    { subject: 'Testing & QA', Candidate: 60, MarketBenchmark: 65 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-brand-900 via-navy-900 to-navy-950 rounded-2xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Role: {targetRole}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {userProfile?.displayName || 'Developer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your career intelligence hub is active. Review your readiness score, track milestone progress, or explore live job postings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to="/resume"
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-navy-950 bg-white hover:bg-slate-100 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Analyze Resume</span>
          </Link>
          <Link
            to="/lensbot"
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask LensBot</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Readiness Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Career Readiness Score</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-navy-950">{readinessScore}%</span>
              <span className="text-[11px] font-semibold text-emerald-600">Weighted Match</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Guidance index for {targetRole}</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-600 flex items-center justify-center font-bold text-xs text-brand-700">
            {readinessScore}
          </div>
        </div>

        {/* Metric 2: Matched Skills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Matched Competencies</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-emerald-600">{matchedSkillsCount}</span>
              <span className="text-[11px] text-slate-400">Verified</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Found in resume & profile</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Missing Skills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Priority Skill Gaps</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-amber-600">{missingSkillsCount}</span>
              <span className="text-[11px] text-slate-400">Needs Focus</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Target in learning roadmap</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <GitCompare className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Roadmap Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Learning Roadmap</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-brand-600">
                {completedMilestones}/{totalMilestones}
              </span>
              <span className="text-[11px] text-slate-400">Milestones</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {Math.round((completedMilestones / totalMilestones) * 100)}% curriculum complete
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Map className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Permanent Backend & MongoDB Confidence Score Intelligence Section */}
      {confidenceScore && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-navy-950">Career Confidence Score</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  MongoDB Synced
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Centralized multi-modal confidence index evaluating your skills, resume, roadmap progress, and mock interviews.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRecalculateConfidence}
                disabled={isRecalculating}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
                <span>{isRecalculating ? 'Calculating...' : 'Recalculate Score'}</span>
              </button>
            </div>
          </div>

          {/* Core Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100/60">
            {/* Overall Score */}
            <div className="flex items-center space-x-4 md:border-r md:border-slate-200/60 pr-4">
              <div className="relative w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                <span className="text-2xl font-black">{confidenceScore.overallConfidenceScore}%</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Overall Confidence</p>
                <p className="text-sm font-bold text-navy-950">
                  {confidenceScore.overallConfidenceScore >= 75
                    ? 'Strong Alignment'
                    : confidenceScore.overallConfidenceScore >= 55
                    ? 'Advancing Readiness'
                    : 'Foundational Phase'}
                </p>
                <p className="text-[10px] text-slate-400">
                  Target: {targetRole}
                </p>
              </div>
            </div>

            {/* Score Comparison & Delta */}
            <div className="flex items-center space-x-3 md:border-r md:border-slate-200/60 pr-4">
              <div className={`p-2.5 rounded-xl ${confidenceScore.scoreChange >= 0 ? 'bg-emerald-100/70 text-emerald-700' : 'bg-rose-100/70 text-rose-700'}`}>
                {confidenceScore.scoreChange >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Score Improvement</p>
                <div className="flex items-baseline space-x-1.5">
                  <span className={`text-base font-bold ${confidenceScore.scoreChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {confidenceScore.scoreChange >= 0 ? `+${confidenceScore.scoreChange}%` : `${confidenceScore.scoreChange}%`}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (Previous: {confidenceScore.previousScore}%)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Compared to last calculation</p>
              </div>
            </div>

            {/* Calculation Method */}
            <div className="flex items-center space-x-3 md:border-r md:border-slate-200/60 pr-4">
              <div className="p-2.5 rounded-xl bg-blue-100/70 text-blue-700">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Algorithm Engine</p>
                <p className="text-xs font-bold text-navy-950 truncate">Multi-Modal Weighted</p>
                <p className="text-[10px] text-slate-400">5 Evaluated Verticals</p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex flex-col justify-center">
              <p className="text-xs font-medium text-slate-500">Last Evaluated</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {new Date(confidenceScore.lastCalculatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Stored permanently in MongoDB</p>
            </div>
          </div>

          {/* Breakdown Bars Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Confidence Score Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Technical Skills */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Technical Skills</span>
                  <span className="text-navy-950">{confidenceScore.technicalSkillsScore}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${confidenceScore.technicalSkillsScore}%` }} />
                </div>
                <p className="text-[10px] text-slate-400">Weight: 25%</p>
              </div>

              {/* Resume ATS */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Resume Alignment</span>
                  <span className="text-navy-950">{confidenceScore.resumeScore}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-600 h-full rounded-full transition-all duration-500" style={{ width: `${confidenceScore.resumeScore}%` }} />
                </div>
                <p className="text-[10px] text-slate-400">Weight: 25%</p>
              </div>

              {/* Mock Interview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Mock Interview</span>
                  <span className="text-navy-950">{confidenceScore.mockInterviewScore}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-violet-600 h-full rounded-full transition-all duration-500" style={{ width: `${confidenceScore.mockInterviewScore}%` }} />
                </div>
                <p className="text-[10px] text-slate-400">Weight: 15%</p>
              </div>

              {/* Roadmap Progress */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Roadmap Progress</span>
                  <span className="text-navy-950">{confidenceScore.roadmapProgressScore}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${confidenceScore.roadmapProgressScore}%` }} />
                </div>
                <p className="text-[10px] text-slate-400">Weight: 20%</p>
              </div>

              {/* Education & Experience */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Edu & Experience</span>
                  <span className="text-navy-950">{confidenceScore.educationExperienceScore}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full transition-all duration-500" style={{ width: `${confidenceScore.educationExperienceScore}%` }} />
                </div>
                <p className="text-[10px] text-slate-400">Weight: 15%</p>
              </div>
            </div>
          </div>

          {/* Qualitative Insights Grid: Strengths, Weaknesses, Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Verified Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {confidenceScore.strengths && confidenceScore.strengths.length > 0 ? (
                  confidenceScore.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Continue activities to earn verified strengths</li>
                )}
              </ul>
            </div>

            {/* Areas for Growth / Weaknesses */}
            <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Areas for Growth</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {confidenceScore.weaknesses && confidenceScore.weaknesses.length > 0 ? (
                  confidenceScore.weaknesses.map((weak, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{weak}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">No major vulnerabilities identified</li>
                )}
              </ul>
            </div>

            {/* Personalized Recommendations */}
            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-800">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Strategic Recommendations</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {confidenceScore.recommendations && confidenceScore.recommendations.length > 0 ? (
                  confidenceScore.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Target next milestone to elevate your score</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Roadmap Preview & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current Learning Plan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
                <Map className="w-4 h-4 text-brand-600" />
                <span>Your Dynamic Learning Roadmap</span>
              </h2>
              <p className="text-xs text-slate-500">
                Custom {totalMilestones}-week progression tailored to {targetRole}
              </p>
            </div>
            <Link
              to="/roadmap"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>Full Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {roadmap.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Map className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                No active learning roadmap generated yet.
              </p>
              <Link
                to="/roadmap"
                className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
              >
                Generate 4-to-8 Week Plan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {roadmap.slice(0, 3).map((milestone) => (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-xl border transition-all ${
                    milestone.completed
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={(e) => {
                          if (currentUser) {
                            toggleMilestoneCompletion(
                              currentUser.uid,
                              milestone.id,
                              e.target.checked
                            );
                          }
                        }}
                        className="mt-1 w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                      />
                      <div>
                        <h4
                          className={`text-xs font-bold ${
                            milestone.completed ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {milestone.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Estimated: {milestone.estimatedHours} hrs · {milestone.actionItems.length} action items
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {milestone.verifiedResources.slice(0, 2).map((res) => (
                            <a
                              key={res.id}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              <BookOpen className="w-3 h-3 text-slate-500" />
                              <span className="truncate max-w-[150px]">{res.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        milestone.completed
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-brand-50 text-brand-700'
                      }`}
                    >
                      {milestone.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Competency Radar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy-950 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-brand-600" />
                <span>Competency Radar</span>
              </h3>
              <Link to="/skill-gap" className="text-xs text-brand-600 font-semibold hover:underline">
                Details
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Candidate profile vs {targetRole} market requirements
            </p>

            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                  <Radar
                    name="Candidate"
                    dataKey="Candidate"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Market Benchmark"
                    dataKey="MarketBenchmark"
                    stroke="#94a3b8"
                    fill="#cbd5e1"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
              <span>Your Verified Profile</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span>Role Benchmark</span>
            </span>
          </div>
        </div>
      </div>

      {/* Saved Jobs & Quick Mentorship Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Jobs summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-navy-950 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Saved Job Opportunities</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tracked applications from Adzuna and verified career portals
              </p>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>Explore Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {savedJobs.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-500">No saved jobs yet.</p>
              <Link
                to="/jobs"
                className="text-xs font-semibold text-brand-600 hover:underline inline-block"
              >
                Browse live technology openings
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedJobs.slice(0, 3).map((record) => (
                <div
                  key={record.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {record.job.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {record.job.company} · {record.job.location}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 shrink-0">
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LensBot Quick Mentor Callout */}
        <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-100 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 text-xs font-bold mb-1">
              <Bot className="w-4 h-4" />
              <span>LensBot AI Mentor Ready</span>
            </div>
            <h3 className="text-base font-bold text-navy-950">
              Need technical interview coaching or portfolio advice?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              LensBot is synced with your verified profile and missing skills. Practice role-specific behavioral or technical interview questions, get portfolio architecture advice, or clarify complex concepts.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to={`/lensbot?mode=mock-interview&role=${encodeURIComponent(targetRole)}`}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors inline-flex items-center space-x-1.5 shadow-sm"
            >
              <span>Launch Mock Interview Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
