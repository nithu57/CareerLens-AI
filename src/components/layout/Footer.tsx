import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & mission */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Career<span className="text-brand-400">Lens</span> AI
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent Career & Skill Gap Analyzer helping students, fresh graduates, and professionals navigate tech careers with verified market intelligence.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Firebase Protected & Isolated</span>
            </div>
          </div>

          {/* Platform Exploration */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Platform Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/career-explorer" className="hover:text-white transition-colors">
                  Career Explorer
                </Link>
              </li>
              <li>
                <Link to="/resume" className="hover:text-white transition-colors">
                  Resume AI Analyzer
                </Link>
              </li>
              <li>
                <Link to="/skill-gap" className="hover:text-white transition-colors">
                  Skill Gap Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Market Intelligence */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Market Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Live Job Discovery
                </Link>
              </li>
              <li>
                <Link to="/job-analysis" className="hover:text-white transition-colors">
                  Job Description Matcher
                </Link>
              </li>
              <li>
                <Link to="/market-insights" className="hover:text-white transition-colors">
                  Real-time Skill Demand
                </Link>
              </li>
              <li>
                <Link to="/salary-insights" className="hover:text-white transition-colors">
                  Compensation Benchmarks
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">
                  Verified Learning Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Trust & Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-white transition-colors">
                  Firebase Credentials & Status
                </Link>
              </li>
              <li>
                <a
                  href="https://ai.google.dev/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center space-x-1"
                >
                  <span>Google Gemini API</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} CareerLens AI. All rights reserved. Firebase project ID: <code className="text-slate-400">careerLens-ai-8beae</code>.
          </p>
          <p className="text-center md:text-right max-w-xl">
            Disclaimer: The Career Readiness Score is an explainable guidance metric derived from analyzed competencies, not a legal guarantee of employment. Job listings link directly to authorized external career portals.
          </p>
        </div>
      </div>
    </footer>
  );
};
