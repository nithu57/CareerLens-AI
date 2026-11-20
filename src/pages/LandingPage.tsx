import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Map,
  Bot,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  BarChart3,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does CareerLens AI analyze my resume?',
      a: 'When you upload your PDF resume, CareerLens AI securely parses the text and extracts your education, technical competencies, frameworks, work history, and projects. It compares this evidence against target-role competencies and job market requirements to calculate an explainable readiness score.',
    },
    {
      q: 'Where does the job and market data come from?',
      a: 'We retrieve genuine job postings and market trends via authorized external provider APIs such as Adzuna and verified company career portals. Every listing links directly to the original provider or employer application page. We do not fabricate listings or scrape websites in violation of terms.',
    },
    {
      q: 'What is the Career Readiness Score?',
      a: 'The Career Readiness Score is an explainable weighted ratio: (Weighted Matched Competencies / Total Required Competency Weight) × 100. It highlights your alignment with core role competencies and indicates which missing skills to prioritize. It is a guidance metric, not a legal guarantee of employment.',
    },
    {
      q: 'Is my resume data private and secure?',
      a: 'Yes. Resumes are stored in your own isolated path in Firebase Cloud Storage, protected by fine-grained security rules. Only your authenticated account can access, read, or delete your documents. We provide complete user account and data deletion workflows in Settings.',
    },
    {
      q: 'How does LensBot AI Career Mentor work?',
      a: 'LensBot uses Google Gemini API through secured backend Cloud Functions. It maintains context of your target role, verified resume analysis, and learning roadmap to offer tailored mock interview questions, portfolio suggestions, and step-by-step technical guidance.',
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
              <span>Intelligent Career & Skill Gap Analyzer</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy-950 leading-tight">
              Your Career. Your Skills. <br className="hidden sm:inline" />
              <span className="text-brand-600">Your Next Opportunity.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Analyze your resume, identify missing skills, discover real job opportunities, and build a personalized learning roadmap with AI-powered career intelligence.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/resume"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>Analyze My Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/jobs"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Explore Live Jobs</span>
              </Link>
            </div>

            {/* Trust badge */}
            <div className="pt-6 flex items-center justify-center space-x-6 text-xs text-slate-500">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>User-Isolated Firebase Storage</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-brand-600" />
                <span>Google Gemini API Powered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Explainable Scoring Engine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Integrated Capabilities
            </h2>
            <p className="text-3xl font-extrabold text-navy-950 tracking-tight">
              Everything You Need to Bridge the Tech Skill Gap
            </p>
            <p className="text-sm text-slate-600 mt-3">
              A complete suite of career intelligence tools built for students, graduates, and professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy-950 mb-2">
                  Resume AI Analysis & Text Extraction
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload your PDF resume. Our pipeline extracts your verifiable education, frameworks, projects, and work history, validating the structured output against strict schemas without hallucinating qualifications.
                </p>
              </div>
              <Link
                to="/resume"
                className="mt-5 text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <span>Upload & Analyze</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy-950 mb-2">
                  Explainable Skill-Gap Engine
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compare your verified competencies against 11 target technology roles. View transparent readiness scores, category breakdowns (Matched, Needs Improvement, Missing), and weighted evaluations.
                </p>
              </div>
              <Link
                to="/skill-gap"
                className="mt-5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>Inspect Skill Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy-950 mb-2">
                  Live Job Discovery & Matching
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Search genuine jobs across Indian tech hubs (Bengaluru, Hyderabad, Pune, etc.) and Remote positions via authorized Adzuna API feeds. Match job requirements instantly against your resume.
                </p>
              </div>
              <Link
                to="/jobs"
                className="mt-5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                <span>Search Live Openings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Map className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy-950 mb-2">
                  Personalized Learning Roadmap
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Generate a structured 4-to-8 week milestone plan tailored to your target role, missing skills, and weekly study hours. Track your completion with real-time Firestore synchronization.
                </p>
              </div>
              <Link
                to="/roadmap"
                className="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>View Learning Plan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy-950 mb-2">
                  LensBot AI Career Mentor
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Engage with an intelligent career mentor that understands your profile, scores, and target role. Conduct mock interviews, receive portfolio advice, and get technical concepts explained.
                </p>
              </div>
              <Link
                to="/lensbot"
                className="mt-5 text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
              >
                <span>Talk with LensBot</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy-950 mb-2">
                  Real-time Skill Demand & Salary Data
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explore top requested skills by role, 30-day and 90-day demand trajectories, sample sizes, and reliable compensation bands across Indian technology hubs.
                </p>
              </div>
              <Link
                to="/market-insights"
                className="mt-5 text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
              >
                <span>Explore Market Trends</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Step-by-Step Architecture
            </h2>
            <p className="text-3xl font-extrabold text-navy-950 tracking-tight">
              How CareerLens AI Works
            </p>
            <p className="text-sm text-slate-600 mt-3">
              From raw resume upload to landing role-aligned interviews with transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-4xl font-extrabold text-brand-200 select-none">01</span>
              <h3 className="text-base font-bold text-navy-950 mt-3 mb-2">
                Upload & Verify Resume
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your PDF resume to isolated Firebase Storage. Text extraction parses competencies, which you can review and correct.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-4xl font-extrabold text-brand-200 select-none">02</span>
              <h3 className="text-base font-bold text-navy-950 mt-3 mb-2">
                Evaluate Skill Gap
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your target role (e.g. Full-Stack, AI Engineer). The engine calculates a weighted Readiness Score and isolates missing competencies.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-4xl font-extrabold text-brand-200 select-none">03</span>
              <h3 className="text-base font-bold text-navy-950 mt-3 mb-2">
                Match Live Openings
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore real postings from Adzuna API and career portals. Compare job requirements directly against your profile.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-4xl font-extrabold text-brand-200 select-none">04</span>
              <h3 className="text-base font-bold text-navy-950 mt-3 mb-2">
                Learn & Mentor with AI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Follow your weekly roadmap with official docs and video resources. Practice technical mock interviews with LensBot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enterprise-Grade Privacy Principles</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
                Your Data Remains Exclusively Yours
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We believe career data is personal. CareerLens AI strictly isolates resume uploads in user-scoped Firebase Cloud Storage and Cloud Firestore paths. Private backend secrets are managed via Google Cloud Secret Manager. No automated scraping of unauthorized portals, no selling user data, and full account deletion with one click.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-slate-700">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strict PDF MIME Validation</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Untrusted Input Sanitization</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Hardened Firestore Rules</span>
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <Link
                to="/privacy"
                className="px-6 py-3 rounded-xl font-semibold text-sm text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors inline-block"
              >
                Read Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Transparency & Answers
            </h2>
            <p className="text-3xl font-extrabold text-navy-950 tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-semibold text-slate-900 bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 py-4 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-br from-brand-900 via-navy-900 to-navy-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Accelerate Your Tech Career?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Join students, fresh graduates, and professionals using CareerLens AI to analyze resumes, bridge critical skill gaps, and explore real job opportunities.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl font-semibold text-sm text-navy-950 bg-white hover:bg-slate-100 shadow-md transition-all"
            >
              Get Started for Free
            </Link>
            <Link
              to="/features"
              className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
