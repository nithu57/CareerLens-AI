import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Info,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { getMarketSnapshot, HISTORICAL_DEMAND_TRENDS, BENCHMARK_MARKET_SNAPSHOTS } from '@/services/marketService';
import { MarketSnapshot, RoleType } from '@/types';

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

export const MarketInsightsPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleType>('Full-Stack Developer');
  const [snapshot, setSnapshot] = useState<MarketSnapshot>(
    BENCHMARK_MARKET_SNAPSHOTS['Full-Stack Developer']
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSnapshot = async () => {
      setLoading(true);
      try {
        const data = await getMarketSnapshot(selectedRole);
        setSnapshot(data);
      } catch (err) {
        console.error('Snapshot fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSnapshot();
  }, [selectedRole]);

  // Tech stack comparison data
  const frameworkComparison = [
    { name: 'React', Demand: 92, JobCount: 420 },
    { name: 'Node.js', Demand: 84, JobCount: 380 },
    { name: 'Python', Demand: 88, JobCount: 395 },
    { name: 'TypeScript', Demand: 94, JobCount: 435 },
    { name: 'Docker', Demand: 72, JobCount: 310 },
    { name: 'Kubernetes', Demand: 64, JobCount: 260 },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-brand-600" />
            <span>Real-time Skill-Demand Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated competency demand metrics and technology trends derived from verified market observations.
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <label className="text-xs font-semibold text-slate-700">Filter Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as RoleType)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-brand-700 bg-white shadow-sm focus:ring-1 focus:ring-brand-500"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metadata & Observation Specs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 font-medium block">Observation Window</span>
          <span className="font-bold text-slate-900 mt-0.5 block">{snapshot.observationPeriod}</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Dataset Sample Size</span>
          <span className="font-bold text-slate-900 mt-0.5 block">{snapshot.sampleSize} Vacancies</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Primary Data Source</span>
          <span className="font-bold text-brand-600 mt-0.5 block truncate">{snapshot.source}</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Last Refreshed</span>
          <span className="font-bold text-slate-900 mt-0.5 block">
            {new Date(snapshot.lastRefreshed).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Chart 1: Top Requested Skills for Role */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              <span>Most Frequently Requested Skills for {selectedRole}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Percentage of analyzed vacancies requiring explicit demonstrated proficiency
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            N = {snapshot.sampleSize}
          </span>
        </div>

        <div className="w-full h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={snapshot.topSkills}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
                width={120}
              />
              <Tooltip
                formatter={(val: any) => [`${val}% of vacancies`, 'Requirement Frequency']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="percentage" fill="#0270c3" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: 90-Day Trend Trajectories */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>90-Day Technology Adoption & Trend Trajectory</span>
          </h2>
          <p className="text-xs text-slate-500">
            Demand index tracking changes across quarterly hiring cycles
          </p>
        </div>

        <div className="w-full h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HISTORICAL_DEMAND_TRENDS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[30, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="TypeScript"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#colorTs)"
              />
              <Area
                type="monotone"
                dataKey="Python"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorPy)"
              />
              <Area
                type="monotone"
                dataKey="AI_LLMs"
                name="AI & LLMs"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorAi)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Technology Comparison */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>Cross-Technology Demand Comparison</span>
          </h2>
          <p className="text-xs text-slate-500">
            Comparative index across major frontend, backend, and containerization frameworks
          </p>
        </div>

        <div className="w-full h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={frameworkComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [`${val}`, 'Demand Index']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="Demand" fill="#0270c3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
