import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { searchJobs, saveJobToFirestore, removeSavedJob, subscribeSavedJobs } from '@/services/jobsService';
import { JobListing, SavedJobRecord } from '@/types';

const INDIAN_HUBS = [
  'All Locations',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Mumbai',
  'Delhi-NCR',
  'Remote',
];

export const JobsPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();

  const [roleQuery, setRoleQuery] = useState<string>(userProfile?.targetRole || 'Full-Stack Developer');
  const [locationQuery, setLocationQuery] = useState('All Locations');
  const [keywordQuery, setKeywordQuery] = useState('');
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJobRecord[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [sourceName, setSourceName] = useState<string>('Verified Market Benchmarks');
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    executeSearch();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeSavedJobs(currentUser.uid, (list) => {
      setSavedJobs(list);
    });
    return () => unsub();
  }, [currentUser]);

  const executeSearch = async () => {
    setLoading(true);
    try {
      const loc = locationQuery === 'All Locations' ? '' : locationQuery;
      const res = await searchJobs({
        role: roleQuery,
        location: loc,
        keywords: keywordQuery,
        isRemote: isRemoteOnly,
      });

      setJobs(res.jobs);
      setTotalResults(res.totalResults);
      setSourceName(res.source);
      setIsLiveApi(res.isLiveApi);
    } catch (err) {
      console.error('Job search failure:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSaved = (jobId: string) => savedJobs.some((s) => s.id === jobId);

  const handleToggleSave = async (job: JobListing) => {
    if (!currentUser) return;
    try {
      if (isSaved(job.id)) {
        await removeSavedJob(currentUser.uid, job.id);
      } else {
        await saveJobToFirestore(currentUser.uid, job);
      }
    } catch (err) {
      console.error('Save job error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            <span>Live Job Discovery & Matching</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Genuine career opportunities from authorized feeds. Links open directly on employer or provider application pages.
          </p>
        </div>

        {/* Source transparency pill */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-500">Data Feed:</span>
          <span
            className={`px-2.5 py-1 rounded-full font-semibold border ${
              isLiveApi
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {sourceName}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Role */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Role / Title
            </label>
            <input
              type="text"
              value={roleQuery}
              onChange={(e) => setRoleQuery(e.target.value)}
              placeholder="e.g. Full-Stack Developer"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Location
            </label>
            <select
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            >
              {INDIAN_HUBS.map((hub) => (
                <option key={hub} value={hub}>
                  {hub}
                </option>
              ))}
            </select>
          </div>

          {/* Keyword */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Keywords / Tech Stack
            </label>
            <input
              type="text"
              value={keywordQuery}
              onChange={(e) => setKeywordQuery(e.target.value)}
              placeholder="React, Node, Python, Docker"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Search Trigger */}
          <div className="flex items-end">
            <button
              onClick={executeSearch}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Jobs</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Remote Checkbox & Summary */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isRemoteOnly}
              onChange={(e) => setIsRemoteOnly(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
            <span>Show Remote positions only</span>
          </label>

          <span className="text-slate-400">
            Showing {jobs.length} verified listings
          </span>
        </div>
      </div>

      {/* Jobs Listing Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
            <p className="text-xs text-slate-500">Searching verified tech listings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-4 shadow-subtle">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-950">No exact matching jobs in verified benchmarks</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Try selecting "All Locations", unchecking the remote filter, or explore live postings on major job boards.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setRoleQuery('Full-Stack Developer');
                  setLocationQuery('All Locations');
                  setKeywordQuery('');
                  setIsRemoteOnly(false);
                  searchJobs({ role: 'Full-Stack Developer', location: '', keywords: '', isRemote: false }).then(
                    (r) => {
                      setJobs(r.jobs);
                      setTotalResults(r.totalResults);
                    }
                  );
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors cursor-pointer"
              >
                Show All Benchmarks
              </button>

              <a
                href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(roleQuery)}&location=${encodeURIComponent(locationQuery === 'All Locations' ? 'India' : locationQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <span>Search on LinkedIn Jobs</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        ) : (
          jobs.map((job) => {
            const saved = isSaved(job.id);
            return (
              <div
                key={job.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-base font-bold text-navy-950 hover:text-brand-600 transition-colors"
                      >
                        {job.title}
                      </Link>
                      {job.isRemote && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                          Remote
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </span>
                      {job.salary && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-emerald-700">{job.salary}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleToggleSave(job)}
                      className={`p-2 rounded-xl border transition-colors ${
                        saved
                          ? 'bg-brand-50 border-brand-200 text-brand-600'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={saved ? 'Remove from saved' : 'Save job'}
                    >
                      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Inspect Match
                    </Link>

                    <a
                      href={job.redirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors flex items-center space-x-1 shadow-sm"
                    >
                      <span>Apply on Portal</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Required skills */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Provider: {job.provider}</span>
                  <span>Retrieved: {new Date(job.retrievedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
