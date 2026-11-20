import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  MapPin,
  Briefcase,
  AlertCircle,
  Info,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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

export const SalaryInsightsPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleType>('Full-Stack Developer');
  const snapshot = BENCHMARK_MARKET_SNAPSHOTS[selectedRole];

  const bands = snapshot?.salaryBands || [];

  const chartData = bands.map((band) => ({
    name: band.level.split(' ')[0],
    Min: Math.round(band.min / 100000),
    Median: Math.round(band.median / 100000),
    Max: Math.round(band.max / 100000),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Compensation & Salary Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirical compensation ranges across experience tiers and Indian technology hubs.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <label className="text-xs font-semibold text-slate-700">Role:</label>
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

      {/* Salary Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {selectedRole} Market Median
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-navy-950">
            ₹{((snapshot?.medianSalary || 1600000) / 100000).toFixed(1)} Lakhs / yr
          </div>
          <p className="text-xs text-slate-500">
            Based on {snapshot.sampleSize} analyzed postings across Bengaluru, Hyderabad, Pune, Mumbai, and Remote.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-600 shrink-0">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Observation Period</span>
          </div>
          <p>{snapshot.observationPeriod} · Verified Tech Portals</p>
        </div>
      </div>

      {/* Experience Tier Salary Distribution */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-navy-950">
            Compensation Range by Experience Band (in ₹ Lakhs/year)
          </h2>
          <p className="text-xs text-slate-500">
            Showing Minimum, Median, and Maximum benchmark percentiles
          </p>
        </div>

        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11 }} />
              <YAxis unit="L" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [`₹${val} Lakhs`, '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="Min" name="Lower Band (25th %ile)" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Median" name="Median Compensation" fill="#0270c3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Max" name="Upper Band (90th %ile)" fill="#074c82" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
            Detailed Band Breakdown ({selectedRole})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-6 py-3">Experience Band</th>
                <th className="px-6 py-3">Lower Range</th>
                <th className="px-6 py-3">Median Salary</th>
                <th className="px-6 py-3">Top Tier</th>
                <th className="px-6 py-3">Currency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bands.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{b.level}</td>
                  <td className="px-6 py-3.5">₹{(b.min / 100000).toFixed(1)}L</td>
                  <td className="px-6 py-3.5 font-semibold text-emerald-700">
                    ₹{(b.median / 100000).toFixed(1)}L
                  </td>
                  <td className="px-6 py-3.5">₹{(b.max / 100000).toFixed(1)}L</td>
                  <td className="px-6 py-3.5 text-slate-400">{b.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start space-x-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Compensation Disclaimer:</span>
          <p className="text-slate-500 leading-relaxed mt-0.5">
            Salary ranges are aggregated strictly from verified provider disclosures and benchmark tech surveys. Figures reflect total fixed cost-to-company (CTC) and do not account for variable equity, stock grants, or individual negotiation.
          </p>
        </div>
      </div>
    </div>
  );
};
