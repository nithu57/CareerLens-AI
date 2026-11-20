import React, { useState, useEffect } from 'react';
import {
  Map,
  CheckCircle2,
  Clock,
  BookOpen,
  FolderGit2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserRoadmap,
  generatePersonalizedRoadmap,
  toggleMilestoneCompletion,
  subscribeUserRoadmap,
} from '@/services/roadmapService';
import { getLatestResumeAnalysis } from '@/services/resumeService';
import { RoadmapMilestone, RoleType } from '@/types';

export const RoadmapPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 1: true });
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const targetRole = userProfile?.targetRole || 'Full-Stack Developer';

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    // Subscribe to real-time roadmap milestones
    const unsub = subscribeUserRoadmap(currentUser.uid, async (list) => {
      if (list.length === 0) {
        // Automatically generate initial roadmap if none exists
        try {
          const analysis = await getLatestResumeAnalysis(currentUser.uid);
          const missing = analysis?.skillBreakdown.missing || [];
          const generated = await generatePersonalizedRoadmap(
            currentUser.uid,
            targetRole,
            missing,
            userProfile?.weeklyHours || 12,
            true
          );
          setMilestones(generated);
        } catch (e) {
          console.error('Error generating roadmap:', e);
        }
      } else {
        setMilestones(list);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser, targetRole]);

  const toggleExpand = (weekNum: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const handleToggleComplete = async (milestoneId: string, currentStatus: boolean) => {
    if (!currentUser) return;
    const newStatus = !currentStatus;

    // Optimistically update local UI state immediately
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              completed: newStatus,
              completedAt: newStatus ? new Date().toISOString() : undefined,
            }
          : m
      )
    );

    try {
      await toggleMilestoneCompletion(currentUser.uid, milestoneId, newStatus);
    } catch (err) {
      console.error('Milestone toggle error:', err);
      // Revert if error occurs
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId
            ? {
                ...m,
                completed: currentStatus,
                completedAt: currentStatus ? new Date().toISOString() : undefined,
              }
            : m
        )
      );
    }
  };

  const handleRegenerate = async (reset: boolean = false) => {
    if (!currentUser) return;
    setIsGenerating(true);
    try {
      const analysis = await getLatestResumeAnalysis(currentUser.uid);
      const missing = analysis?.skillBreakdown.missing || [];
      const updated = await generatePersonalizedRoadmap(
        currentUser.uid,
        targetRole,
        missing,
        userProfile?.weeklyHours || 12,
        !reset
      );
      setMilestones(updated);
    } catch (e) {
      console.error('Failed to regenerate roadmap:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
            <Map className="w-6 h-6 text-brand-600" />
            <span>Personalized Learning Roadmap</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic milestone progression tailored to your target role (<strong className="text-slate-700">{targetRole}</strong>) and verified skill gaps.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => handleRegenerate(false)}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Regenerate (Keep Progress)</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Curriculum Completion
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-navy-950">{progressPercent}%</span>
            <span className="text-xs font-semibold text-brand-600">
              ({completedCount} of {milestones.length} Milestones)
            </span>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-1">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-brand-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right">
            Synced real-time with your profile
          </p>
        </div>
      </div>

      {/* Milestones Accordion */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading your roadmap...</div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => {
            const isExpanded = expandedWeeks[milestone.weekNumber] ?? true;

            return (
              <div
                key={milestone.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  milestone.completed
                    ? 'border-slate-200 bg-slate-50/50'
                    : 'border-slate-200 shadow-subtle'
                }`}
              >
                {/* Milestone Bar */}
                <div
                  onClick={() => toggleExpand(milestone.weekNumber)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-4">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() =>
                        handleToggleComplete(milestone.id, milestone.completed)
                      }
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer shrink-0"
                    />

                    <div className="min-w-0">
                      <h3
                        className={`text-sm font-bold truncate ${
                          milestone.completed ? 'line-through text-slate-500' : 'text-navy-950'
                        }`}
                      >
                        {milestone.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>~{milestone.estimatedHours} hrs study</span>
                        </span>
                        <span>•</span>
                        <span>{milestone.objectives.length} Objectives</span>
                        <span>•</span>
                        <span>{milestone.actionItems.length} Checklist Tasks</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        milestone.completed
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-brand-50 text-brand-700'
                      }`}
                    >
                      {milestone.completed ? 'Completed' : 'Active'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-5 text-xs text-slate-700">
                    {/* Objectives */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
                        Learning Objectives
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                        {milestone.objectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Items Checklist */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
                        Action Items & Practical Tasks
                      </h4>
                      <div className="space-y-1.5">
                        {milestone.actionItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <span className="text-brand-600 font-bold shrink-0">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Practical Exercises */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
                        Practical Hands-on Exercises
                      </h4>
                      <div className="space-y-1.5">
                        {milestone.practicalExercises.map((ex, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-indigo-950"
                          >
                            {ex}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Portfolio Project */}
                    {milestone.portfolioProject && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                        <div className="flex items-center space-x-2 text-brand-700 font-bold">
                          <FolderGit2 className="w-4 h-4" />
                          <span>Deliverable Portfolio Project: {milestone.portfolioProject.title}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {milestone.portfolioProject.description}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          <strong>Deliverable:</strong> {milestone.portfolioProject.deliverable}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {milestone.portfolioProject.techStack.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white text-slate-700 border border-slate-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verified Learning Resources */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
                        Verified Official Resources & Documentation
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {milestone.verifiedResources.map((res) => (
                          <a
                            key={res.id}
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{res.title}</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Completion Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500">
                        {milestone.completed
                          ? `✓ Completed ${milestone.completedAt ? 'on ' + new Date(milestone.completedAt).toLocaleDateString() : 'and saved'}`
                          : 'Complete the checklist tasks and deliverable to finish this milestone.'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(milestone.id, milestone.completed)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          milestone.completed
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{milestone.completed ? 'Mark as Incomplete' : 'Mark Week Complete'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
