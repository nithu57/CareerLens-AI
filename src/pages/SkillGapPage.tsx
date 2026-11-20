import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getLatestResumeAnalysis, ROLE_COMPETENCY_WEIGHTS, calculateReadinessScore } from '@/services/resumeService';
import { ResumeAnalysisRecord, RoleType } from '@/types';

export const SkillGapPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [analysis, setAnalysis] = useState<ResumeAnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const targetRole = userProfile?.targetRole || 'Full-Stack Developer';

  useEffect(() => {
    if (!currentUser) return;
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const record = await getLatestResumeAnalysis(currentUser.uid);
        setAnalysis(record);
      } catch (err) {
        console.error('Error fetching analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [currentUser]);

  const matchedSkills = analysis?.skillBreakdown.matched || ['JavaScript/TypeScript', 'React'];
  const needsImprovementSkills = analysis?.skillBreakdown.needsImprovement || ['Docker / Containers'];
  const missingSkills = analysis?.skillBreakdown.missing || ['Cloud Deployment', 'CI/CD Pipelines'];
  const requiresVerification = analysis?.skillBreakdown.requiresVerification || ['Production Architecture'];

  const scoreDetails = calculateReadinessScore(targetRole, matchedSkills, needsImprovementSkills);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
              <GitCompare className="w-6 h-6 text-brand-600" />
              <span>Skill Gap & Competency Matrix</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Explainable competency evaluation for <span className="font-semibold text-slate-800">{targetRole}</span>.
            </p>
          </div>
          <Link
            to="/resume"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors inline-flex items-center space-x-1.5 self-start"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Update / Re-analyze Resume</span>
          </Link>
        </div>
      </div>

      {/* Formula Explanation Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2 text-navy-950 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Explainable Readiness Mathematical Formulation</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-xs text-brand-700 font-bold">
          Readiness Score = ( Weighted Matched Competencies / Total Required Competency Weight ) × 100
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Matched Weight: 100%</span>
            Full credit assigned to confirmed competencies with evidence in resume projects or work experience.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Needs Improvement: 50%</span>
            Partial credit assigned to skills mentioned in foundational context or undergoing active study.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Missing Evidence: 0%</span>
            Skills not yet demonstrated in resume. Not treated as permanently absent, but flagged for learning roadmap.
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Notice: The readiness score is an objective educational guidance metric, not a legal or hiring guarantee of employment.
          </span>
        </div>
      </div>

      {/* Competency Score Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Readiness Index
          </span>
          <div className="text-4xl font-extrabold text-navy-950">
            {scoreDetails.score}%
          </div>
          <p className="text-xs text-slate-500">
            Weighted Score: {scoreDetails.matchedWeight.toFixed(1)} / {scoreDetails.totalWeight} required points
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <div className="text-center">
            <span className="text-2xl font-bold text-emerald-600 block">{matchedSkills.length}</span>
            <span className="text-slate-500 text-[11px]">Matched</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-blue-600 block">{needsImprovementSkills.length}</span>
            <span className="text-slate-500 text-[11px]">In Progress</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-amber-600 block">{missingSkills.length}</span>
            <span className="text-slate-500 text-[11px]">Skill Gaps</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-slate-500 block">{requiresVerification.length}</span>
            <span className="text-slate-500 text-[11px]">Unverified</span>
          </div>
        </div>

        <Link
          to="/roadmap"
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors flex items-center space-x-1.5 shadow-sm shrink-0"
        >
          <span>Bridge Gaps in Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 Categorized Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Matched */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 space-y-3 shadow-subtle">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs border-b border-emerald-100 pb-2">
            <CheckCircle className="w-4 h-4" />
            <span>Matched ({matchedSkills.length})</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Demonstrated proficiency verified from your resume.
          </p>
          <div className="space-y-1.5">
            {matchedSkills.map((skill, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Needs Improvement */}
        <div className="bg-white rounded-2xl border border-blue-200 p-5 space-y-3 shadow-subtle">
          <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs border-b border-blue-100 pb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Needs Improvement ({needsImprovementSkills.length})</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Mentioned in resume; needs deeper production projects.
          </p>
          <div className="space-y-1.5">
            {needsImprovementSkills.length > 0 ? (
              needsImprovementSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200"
                >
                  {skill}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No items flagged.</p>
            )}
          </div>
        </div>

        {/* 3. Missing */}
        <div className="bg-white rounded-2xl border border-amber-200 p-5 space-y-3 shadow-subtle">
          <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs border-b border-amber-100 pb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Missing Evidence ({missingSkills.length})</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Key role requirements not found in available text.
          </p>
          <div className="space-y-1.5">
            {missingSkills.map((skill, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Requires Verification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-subtle">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs border-b border-slate-100 pb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Requires Verification ({requiresVerification.length})</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Advanced concepts evaluated in technical interviews.
          </p>
          <div className="space-y-1.5">
            {requiresVerification.map((skill, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
