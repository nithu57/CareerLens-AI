import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  BarChart2,
  Search,
  Map,
  Bot,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            Deep-Dive Capabilities
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-950 tracking-tight">
            Comprehensive Career Intelligence
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Every feature in CareerLens AI is designed with technical rigor, transparent scoring, and verified industry data to give you an unfair advantage in the tech job market.
          </p>
        </div>

        {/* Feature 1: Resume Analysis */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-subtle grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-navy-950">
              1. Resume Parsing & Verifiable Extraction
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We extract text from your PDF resumes and analyze qualifications without hallucinating accomplishments. You retain full control to inspect, confirm, and update every parsed item before skill scoring.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Client-side PDF.js parsing + secure Google Gemini backend analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Separation of confirmed qualifications from unverified claims</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Full resume replacement and permanent deletion workflows</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/resume"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <span>Upload a Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 font-mono text-xs text-slate-700 space-y-3">
            <div className="text-slate-400 text-[11px] border-b border-slate-200 pb-2">
              // Structured Resume Extraction Output
            </div>
            <div className="space-y-1">
              <span className="text-brand-600 font-bold">"technicalSkills":</span> [
              <span className="text-slate-800"> "React", "TypeScript", "Node.js", "Cloud Firestore"</span> ]
            </div>
            <div className="space-y-1">
              <span className="text-indigo-600 font-bold">"matchedCompetencies":</span> [
              <span className="text-slate-800"> "Frontend Architecture", "REST APIs"</span> ]
            </div>
            <div className="space-y-1">
              <span className="text-rose-600 font-bold">"missingCompetencies":</span> [
              <span className="text-slate-800"> "Docker / Containers", "CI/CD Pipelines"</span> ]
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              Output validated against strict Zod / JSON schema definitions.
            </div>
          </div>
        </div>

        {/* Feature 2: Explainable Skill-Gap Engine */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-subtle grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Mathematical Readiness Formula
            </h4>
            <div className="p-4 bg-white border border-slate-200 rounded-xl font-mono text-xs text-center text-brand-700 font-bold">
              Readiness Score = ( Σ W_matched / Σ W_required ) × 100
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every target role defines 10 core weighted competencies. Matched skills receive 100% weight, emerging competencies receive 50% partial credit, and unconfirmed skills receive 0% without disqualifying the candidate.
            </p>
          </div>
          <div className="order-1 lg:order-2 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-navy-950">
              2. Explainable Skill-Gap Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No black-box algorithms. We calculate transparent readiness scores across 11 high-demand roles, categorizing every skill into Matched, Needs Improvement, Missing, or Requires Verification.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Configurable competency weights based on real market demand</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Clear indication that score is a guidance metric, not employment probability</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/skill-gap"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>View Skill Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature 3: Live Job Discovery & Job Description Matcher */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-subtle grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-navy-950">
              3. Genuine Job Discovery & Job Matcher
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Access real vacancies directly from authorized provider APIs. Compare your resume against any retrieved job or paste any job description from LinkedIn/Indeed to receive an instant match analysis.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct link to original application portals (no scraping violations)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Specific coverage of Indian tech hubs (Bengaluru, Hyderabad, Pune, etc.) & Remote</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Save jobs and track application lifecycle in Firestore</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/jobs"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <span>Search Live Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800">Job Description Matcher Preview</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                85% Match
              </span>
            </div>
            <p className="text-xs text-slate-600">
              "You match 6 of 7 critical requirements for Senior Full Stack Developer at Infosys. Prioritize reviewing Kubernetes deployment to maximize your interview conversion."
            </p>
          </div>
        </div>

        {/* Feature 4: Personalized Roadmap & LensBot AI */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-subtle grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-purple-700 text-xs font-bold">
              <Bot className="w-4 h-4" />
              <span>LensBot AI Prompt Sample</span>
            </div>
            <p className="text-xs text-slate-700 italic">
              "Conduct a mock technical interview for a Full-Stack Developer position focusing on Redis caching and distributed locks."
            </p>
            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600">
              LensBot evaluates your explanation, scores conceptual depth, and references official documentation.
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-navy-950">
              4. Personalized Roadmaps & LensBot AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bridge your skill gaps with dynamic 4-to-8 week milestone curriculums. Use verified official documentation and YouTube courses. Ask LensBot to conduct role-specific mock interviews and suggest portfolio projects.
            </p>
            <div className="pt-2 flex items-center space-x-4">
              <Link
                to="/roadmap"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1"
              >
                <span>Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/lensbot"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center space-x-1"
              >
                <span>LensBot AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
