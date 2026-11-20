import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Check,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { generatePersonalizedRoadmap } from '@/services/roadmapService';
import { ROLE_COMPETENCY_WEIGHTS } from '@/services/resumeService';
import { BENCHMARK_MARKET_SNAPSHOTS } from '@/services/marketService';
import { RoleType } from '@/types';

const ROLES: RoleType[] = [
  'Full-Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Flutter Developer',
  'Software Engineer',
  'Data Analyst',
  'Data Scientist',
  'AI Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'DevOps Engineer',
];

const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  'Full-Stack Developer': 'Architects and builds complete client-server web applications, integrating responsive frontends, backend APIs, and scalable databases.',
  'Frontend Developer': 'Crafts high-performance, accessible, and responsive user interfaces with modern JavaScript/TypeScript, React, and CSS frameworks.',
  'Backend Developer': 'Designs robust server architectures, RESTful/GraphQL microservices, database schemas, and secure authentication systems.',
  'Flutter Developer': 'Builds smooth, cross-platform native iOS, Android, and web mobile applications using Dart and the Flutter framework.',
  'Software Engineer': 'Applies computer science fundamentals, data structures, algorithms, and clean architecture to solve complex distributed systems challenges.',
  'Data Analyst': 'Transforms raw business and transactional data into actionable executive insights through advanced SQL, Python, and BI dashboards.',
  'Data Scientist': 'Develops predictive statistical models, machine learning algorithms, and exploratory data analyses to drive business decisions.',
  'AI Engineer': 'Deploys Large Language Models (LLMs), RAG vector architectures, autonomous agents, and multimodal AI pipelines into production.',
  'Cloud Engineer': 'Provisions, monitors, and optimizes secure cloud infrastructure on AWS, Google Cloud, or Azure using Infrastructure as Code (Terraform).',
  'Cybersecurity Analyst': 'Detects vulnerabilities, configures SIEM log monitoring, hardens networks, and responds to digital security incidents.',
  'DevOps Engineer': 'Automates continuous integration and continuous deployment (CI/CD) pipelines, manages Kubernetes clusters, and guarantees system reliability.',
};

export const CareerExplorerPage: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleType>(
    userProfile?.targetRole || 'Full-Stack Developer'
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleSelectTargetRole = async (role: RoleType) => {
    setSelectedRole(role);
    if (!currentUser) return;

    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      await updateUserProfile(currentUser.uid, { targetRole: role });
      // Regenerate dynamic roadmap for the newly selected role
      await generatePersonalizedRoadmap(
        currentUser.uid,
        role,
        [],
        userProfile?.weeklyHours || 10,
        true
      );
      await refreshProfile();
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update target role:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const activeSnapshot = BENCHMARK_MARKET_SNAPSHOTS[selectedRole];
  const activeCompetencies = ROLE_COMPETENCY_WEIGHTS[selectedRole] || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
          <Compass className="w-6 h-6 text-brand-600" />
          <span>Technology Career Explorer</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore core competencies, market demand indices, and compensation distributions across 11 key engineering roles.
        </p>
      </div>

      {updateSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Target role updated to <strong>{selectedRole}</strong>! Your learning roadmap and skill gap matrix have been synchronized.
          </span>
        </div>
      )}

      {/* Main Grid: Role Selector & Detailed Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role List Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-4 space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Target Careers ({ROLES.length})
          </h3>
          <div className="space-y-1">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role;
              const isCurrentTarget = userProfile?.targetRole === role;

              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{role}</span>
                  {isCurrentTarget && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Role Spotlight */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
                <span>Domain Focus</span>
              </div>
              <h2 className="text-2xl font-extrabold text-navy-950">{selectedRole}</h2>
            </div>

            <button
              onClick={() => handleSelectTargetRole(selectedRole)}
              disabled={isUpdating || userProfile?.targetRole === selectedRole}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
                userProfile?.targetRole === selectedRole
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              {userProfile?.targetRole === selectedRole ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Your Current Target Role</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Set as My Target Role</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {ROLE_DESCRIPTIONS[selectedRole]}
          </p>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 block">Median Compensation</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                ₹{((activeSnapshot?.medianSalary || 1500000) / 100000).toFixed(1)} Lakhs / yr
              </span>
              <span className="text-[10px] text-slate-400">Indian Tech Hubs</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 block">Sample Observability</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {activeSnapshot?.sampleSize || 1000}+ Vacancies
              </span>
              <span className="text-[10px] text-slate-400">Adzuna Tech Index</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 block">Readiness Formula Weight</span>
              <span className="text-base font-bold text-brand-600 mt-0.5 block">
                10 Core Competencies
              </span>
              <span className="text-[10px] text-slate-400">Weighted Scale</span>
            </div>
          </div>

          {/* Required Competencies Breakdown */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>Evaluated Competencies & Weights</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(activeCompetencies).map(([comp, weight]) => (
                <div
                  key={comp}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 truncate mr-2">{comp}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0">
                    Weight: {weight} / 5
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links to actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
            <Link
              to="/skill-gap"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View Your Skill Gap for {selectedRole}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Explore Live {selectedRole} Openings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
