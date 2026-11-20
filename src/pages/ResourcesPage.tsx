import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Video,
  FileCode,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  discoverResources,
  saveResourceToFirestore,
  removeSavedResource,
  toggleSavedResourceCompleted,
  subscribeSavedResources,
  VERIFIED_RESOURCE_CATALOG,
} from '@/services/resourceService';
import { getLatestResumeAnalysis } from '@/services/resumeService';
import { LearningResourceItem, SavedResourceRecord } from '@/types';

const TOPIC_FILTERS = [
  'All Topics',
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'SQL',
  'Docker',
  'Kubernetes',
  'Firestore',
  'Gemini API',
  'Full-Stack Developer',
];

export const ResourcesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<LearningResourceItem[]>(VERIFIED_RESOURCE_CATALOG);
  const [savedResources, setSavedResources] = useState<SavedResourceRecord[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'saved'>('catalog');

  useEffect(() => {
    if (!currentUser) return;

    // Load user's missing skills from resume analysis
    getLatestResumeAnalysis(currentUser.uid).then((analysis) => {
      if (analysis) {
        setMissingSkills(analysis.skillBreakdown.missing || []);
      }
    });

    const unsub = subscribeSavedResources(currentUser.uid, (list) => {
      setSavedResources(list);
    });

    return () => unsub();
  }, [currentUser]);

  const handleSearch = async () => {
    const topic = selectedTopic === 'All Topics' ? '' : selectedTopic;
    const res = await discoverResources(searchQuery, topic);
    setResources(res.resources);
  };

  const isSaved = (resId: string) => savedResources.some((s) => s.id === resId);

  const handleToggleSave = async (resource: LearningResourceItem) => {
    if (!currentUser) return;
    try {
      if (isSaved(resource.id)) {
        await removeSavedResource(currentUser.uid, resource.id);
      } else {
        await saveResourceToFirestore(currentUser.uid, resource);
      }
    } catch (e) {
      console.error('Toggle save error:', e);
    }
  };

  const handleToggleComplete = async (resourceId: string, currentVal: boolean) => {
    if (!currentUser) return;
    try {
      await toggleSavedResourceCompleted(currentUser.uid, resourceId, !currentVal);
    } catch (e) {
      console.error('Toggle complete error:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-brand-600" />
            <span>Verified Learning Resource Catalog</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curated official documentation and YouTube educational tutorials mapped to missing competencies.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === 'catalog'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === 'saved'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Resources ({savedResources.length})
          </button>
        </div>
      </div>

      {/* Recommended for Your Skill Gaps banner */}
      {missingSkills.length > 0 && activeTab === 'catalog' && (
        <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-4 flex items-start space-x-3 text-xs">
          <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-brand-900">
              Recommended for your verified skill gaps:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingSkills.map((s, idx) => {
                const isSelected = selectedTopic.toLowerCase() === s.toLowerCase();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={async () => {
                      const nextTopic = isSelected ? 'All Topics' : s;
                      setSelectedTopic(nextTopic);
                      setSearchQuery('');
                      const r = await discoverResources('', nextTopic === 'All Topics' ? '' : nextTopic);
                      setResources(r.resources);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300'
                        : 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-100 hover:border-brand-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {activeTab === 'catalog' && (
        <div className="space-y-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search tutorial or framework (e.g. React, Docker, Python)..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                const t = e.target.value === 'All Topics' ? '' : e.target.value;
                discoverResources(searchQuery, t).then((r) => setResources(r.resources));
              }}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-brand-500"
            >
              {selectedTopic && !TOPIC_FILTERS.includes(selectedTopic) && (
                <option value={selectedTopic}>{selectedTopic}</option>
              )}
              {TOPIC_FILTERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              Search
            </button>
          </div>

          {selectedTopic !== 'All Topics' && (
            <div className="flex items-center space-x-2 text-xs px-1 text-slate-600">
              <span>
                Filtered by skill gap: <strong className="text-brand-700">{selectedTopic}</strong>
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={async () => {
                  setSelectedTopic('All Topics');
                  setSearchQuery('');
                  const r = await discoverResources('', '');
                  setResources(r.resources);
                }}
                className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resource Cards Grid */}
      {activeTab === 'catalog' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-navy-950">No resources found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No catalog items matched your current filter. Click below to reset to all verified tutorials.
              </p>
              <button
                type="button"
                onClick={async () => {
                  setSelectedTopic('All Topics');
                  setSearchQuery('');
                  const r = await discoverResources('', '');
                  setResources(r.resources);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
              >
                Show All Resources
              </button>
            </div>
          ) : (
            resources.map((res) => {
            const saved = isSaved(res.id);

            return (
              <div
                key={res.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {res.type === 'video' ? (
                        <Video className="w-3 h-3 text-rose-500 mr-1" />
                      ) : (
                        <FileCode className="w-3 h-3 text-brand-600 mr-1" />
                      )}
                      <span>{res.provider}</span>
                    </span>

                    <button
                      onClick={() => handleToggleSave(res)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        saved
                          ? 'bg-brand-50 border-brand-200 text-brand-600'
                          : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                      title={saved ? 'Remove from saved' : 'Save resource'}
                    >
                      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-navy-950 leading-snug">
                    {res.title}
                  </h3>

                  {res.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Topic: {res.topic}
                  </span>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                </div>
              </div>
            );
          }))}
        </div>
      ) : (
        /* Saved Resources View */
        <div className="space-y-3">
          {savedResources.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-500">You have not saved any learning resources yet.</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Browse catalog to bookmark tutorials & documentation
              </button>
            </div>
          ) : (
            savedResources.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleComplete(item.id, item.completed)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <h4
                      className={`text-xs font-bold truncate ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {item.resource.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {item.resource.provider} · Topic: {item.resource.topic}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <a
                    href={item.resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-500 hover:text-brand-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleToggleSave(item.resource)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove from saved"
                  >
                    <BookmarkCheck className="w-4 h-4 text-brand-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
