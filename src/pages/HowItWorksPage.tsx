import React from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  FileSearch,
  Sparkles,
  TrendingUp,
  MapPin,
  Bot,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Profile Onboarding & Target Role Selection',
      icon: UploadCloud,
      desc: 'Create an account and choose from 11 verified industry roles (e.g., Full-Stack Developer, AI Engineer, Flutter Developer). Specify your experience level, weekly availability, and preferred tech hubs.',
      actionLink: '/register',
      actionText: 'Get Started',
    },
    {
      num: '02',
      title: 'PDF Resume Upload & Text Extraction',
      icon: FileSearch,
      desc: 'Upload your PDF resume. Our client-side and backend parsing pipeline extracts education, tools, work history, and projects. You can inspect the extracted data to correct any scanning errors.',
      actionLink: '/resume',
      actionText: 'Upload Resume',
    },
    {
      num: '03',
      title: 'Explainable Skill Gap & Readiness Scoring',
      icon: Sparkles,
      desc: 'Your confirmed competencies are evaluated against target role benchmarks using our weighted readiness scoring formula. View exactly which skills are matched, which need improvement, and which are missing.',
      actionLink: '/skill-gap',
      actionText: 'View Skill Matrix',
    },
    {
      num: '04',
      title: 'Genuine Job Discovery & Match Analysis',
      icon: MapPin,
      desc: 'Search genuine vacancies via authorized job feeds (Adzuna) or paste specific job descriptions from any career portal to see your instant match percentage and custom recommendations.',
      actionLink: '/jobs',
      actionText: 'Explore Jobs',
    },
    {
      num: '05',
      title: 'Dynamic Personalized Learning Roadmap',
      icon: TrendingUp,
      desc: 'Follow a custom 4-to-8 week milestone plan with practical exercises, portfolio project specifications, and verified official documentation links. Check off milestones with real-time sync.',
      actionLink: '/roadmap',
      actionText: 'View Roadmap',
    },
    {
      num: '06',
      title: 'AI Mentorship & Mock Interviews with LensBot',
      icon: Bot,
      desc: 'Ask LensBot technical questions, practice realistic mock interviews for your target role, and refine your portfolio projects with context-aware AI guidance powered by Google Gemini.',
      actionLink: '/lensbot',
      actionText: 'Talk to LensBot',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            Architecture & Workflow
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-950 tracking-tight">
            How CareerLens AI Works
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            A transparent, step-by-step methodology built on verified evidence, real job market data, and user data privacy.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-extrabold text-brand-200 select-none">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-navy-950 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-100 mt-6">
                  <Link
                    to={step.actionLink}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>{step.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Transparency Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Transparent Career Intelligence Principles</h4>
            <p className="text-amber-800 leading-relaxed">
              CareerLens AI never guarantees employment, fabricates job opportunities, or invents resume qualifications. The Career Readiness Score is designed as an explainable guidance index to direct your learning efforts where they will have the highest market impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
