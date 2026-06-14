import React, { useState, useEffect } from 'react';
import { History, Calendar, HelpCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Analysis } from '../types';

interface HistoryLogsProps {
  token: string;
}

export default function HistoryLogs({ token }: HistoryLogsProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAnalyses(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <History size={20} className="text-indigo-600" />
          AI Analysis Log Archives
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Review previous fundamental audits and security assessments triggered on your profile.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <RefreshCw className="animate-spin mb-3 text-indigo-600" size={32} />
          <p className="text-sm font-medium">Reconstructing archives history...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8">
          <History className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800">No Audits Mapped Yet</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            Run single fundamental audits on the Market Dashboard tab to seed your audit logs archive.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden hover:border-slate-300 transition duration-150"
            >
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-md text-xs uppercase shadow-2xs font-mono">
                    {item.ticker}
                  </span>
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold uppercase">
                      <Calendar size={12} />
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 font-medium mt-0.5">
                      <HelpCircle size={12} className="text-slate-400" />
                      Focus: <span className="text-slate-800 italic font-semibold">"{item.query}"</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id={`toggleExpandBtn-${item.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500"
                >
                  {expandedId === item.id ? (
                    <>
                      <EyeOff size={14} />
                      Close Audit Report
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      Expand Audit Report
                    </>
                  )}
                </button>
              </div>

              {expandedId === item.id && (
                <div className="px-5 pb-5 border-t border-slate-50 pt-4 bg-slate-50/50">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                    {item.analysis}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
