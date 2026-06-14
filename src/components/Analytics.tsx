import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shield, Sparkles, RefreshCw, Layers, Compass, TrendingUp } from 'lucide-react';
import { PortfolioAnalytics } from '../types';

interface AnalyticsProps {
  token: string;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function Analytics({ token }: AnalyticsProps) {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/portfolio', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setHoldings(data.holdings || []);
          setAnalytics(data.analytics || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 font-sans">
        <RefreshCw className="animate-spin mb-3 text-indigo-600" size={32} />
        <p className="text-sm font-medium">Computing asset correlations...</p>
      </div>
    );
  }

  if (!analytics || holdings.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center border font-sans max-w-xl mx-auto mt-12 py-16">
        <Shield className="mx-auto text-slate-300 mb-4" size={48} />
        <h3 className="text-lg font-bold text-slate-800">Operational Records Missing</h3>
        <p className="text-slate-500 text-xs mt-1">
          You need to add at least 1 position inside your portfolio prior to generating risk rating scores and diversification allocations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      {/* Header banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Layers size={22} className="text-indigo-600" />
          Quantitative Portfolio Risk Audit & Analysis
        </h2>
        <p className="text-slate-500 text-sm mt-1">Audit aggregate volatility metrics, index allocations, and concentration risks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk profile rating score */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield size={14} className="text-indigo-500" />
              Composite Risk Score Index
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">Calculated based on average betas and capital allocations.</p>
          </div>

          <div className="py-8 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* Score circle */}
              <svg className="w-36 h-36">
                <circle
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="62"
                  cx="72"
                  cy="72"
                />
                <circle
                  className="text-indigo-600 transition-all duration-1000"
                  strokeWidth="10"
                  strokeDasharray={389}
                  strokeDashoffset={389 - (389 * analytics.riskScore) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="62"
                  cx="72"
                  cy="72"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">{analytics.riskScore}</span>
                <span className="text-slate-400 text-sm font-semibold">/100</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase rounded-lg tracking-wider">
                {analytics.riskLevel}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100 text-xs text-slate-600 font-medium">
            Weighted portfolio beta index resolves to **{analytics.portfolioBeta}**, meaning this asset holds a volatility weighting{' '}
            {analytics.portfolioBeta > 1.0 ? 'higher' : 'lower'} than standard index performance ratios.
          </div>
        </div>

        {/* Sector Asset Allocation details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <Compass size={14} className="text-indigo-500" />
            Sector Industry Diversification
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Pie chart */}
            <div className="h-56 w-full font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.sectorAllocation}
                    dataKey="value"
                    nameKey="sector"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={55}
                    paddingAngle={4}
                  >
                    {analytics.sectorAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', padding: '10px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`$${parseFloat(val).toLocaleString()}`, 'Allocated']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* List labels */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
              {analytics.sectorAllocation.map((s, idx) => (
                <div key={s.sector} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600 font-semibold">{s.sector}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">{s.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Concentrations Index */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
          <TrendingUp size={14} className="text-indigo-500" />
          Leading Position Weights & Concentrations (Max single weighting: {analytics.holdingsAllocation[0]?.percentage || 0}%)
        </h4>

        <div className="h-64 w-full font-mono mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.holdingsAllocation} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
              <XAxis type="number" tickFormatter={(v) => `${v}%`} style={{ fill: '#94a3b8', fontSize: '10px' }} tickLine={false} />
              <YAxis dataKey="ticker" type="category" style={{ fill: '#475569', fontSize: '12px', fontWeight: 'bold' }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', padding: '10px' }}
                itemStyle={{ color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${parseFloat(val).toFixed(2)}%`, 'Weighting']}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {analytics.holdingsAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-400 text-center font-semibold mt-4 uppercase">
          Recommendation check: Keep single-asset weights under 25% of total value to neutralize correlation dependencies.
        </p>
      </div>
    </div>
  );
}
