import React, { useState, useEffect } from 'react';
import { Briefcase, Download, Plus, Pencil, Trash2, Sliders, Sparkles, RefreshCw, Info } from 'lucide-react';
import { PortfolioAnalytics } from '../types';

interface PortfolioProps {
  token: string;
  addTickerTrigger?: string;
}

export default function Portfolio({ token, addTickerTrigger = '' }: PortfolioProps) {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Edit Modal Controls
  const [showAddForm, setShowAddForm] = useState(false);
  const [ticker, setTicker] = useState(addTickerTrigger || '');
  const [shares, setShares] = useState('10');
  const [buyPrice, setBuyPrice] = useState('150');
  const [formError, setFormError] = useState('');

  const [showEditForm, setShowEditForm] = useState<string | null>(null); // holdingId
  const [editShares, setEditShares] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // AI Optimizer States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState('');

  const fetchPortfolio = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portfolio', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch portfolio.');
      setHoldings(data.holdings || []);
      setAnalytics(data.analytics || null);
    } catch (err: any) {
      setError(err.message || 'Error occurred loading portfolio holdings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [token]);

  useEffect(() => {
    if (addTickerTrigger) {
      setTicker(addTickerTrigger);
      // Auto pre-fill standard buy price
      const fillBuyPrice = async () => {
        try {
          const res = await fetch(`/api/stocks/${addTickerTrigger}`);
          const data = await res.json();
          if (res.ok && data.price) {
            setBuyPrice(data.price.toString());
          }
        } catch { /* ignore */ }
      };
      fillBuyPrice();
      setShowAddForm(true);
    }
  }, [addTickerTrigger]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!ticker) {
      setFormError('Ticker cannot be empty.');
      return;
    }
    if (parseFloat(shares) <= 0 || parseFloat(buyPrice) < 0) {
      setFormError('Invalid share count or buy price values.');
      return;
    }

    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticker: ticker.toUpperCase().trim(),
          shares,
          buyPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit holding coordinate.');

      // Clear states and refresh
      setTicker('');
      setShares('10');
      setBuyPrice('150');
      setShowAddForm(false);
      fetchPortfolio();
    } catch (err: any) {
      setFormError(err.message || 'Position upload failed.');
    }
  };

  const handleEditSubmit = async (holdingId: string) => {
    try {
      const res = await fetch(`/api/portfolio/${holdingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shares: editShares,
          buyPrice: editPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to edit position shares.');

      setShowEditForm(null);
      fetchPortfolio();
    } catch (err: any) {
      alert(err.message || 'Modification failed.');
    }
  };

  const handleDelete = async (holdingId: string, tickerName: string) => {
    if (!window.confirm(`Dismantle and sell all shares of ${tickerName}?`)) return;

    try {
      const res = await fetch(`/api/portfolio/${holdingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchPortfolio();
    } catch (err: any) {
      alert(err.message || 'Delete operation failed.');
    }
  };

  const triggerAIOptimizer = async () => {
    setAiLoading(true);
    setAiRecommendation('');
    try {
      const res = await fetch('/api/portfolio/optimize', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request optimization.');
      setAiRecommendation(data.recommendation);
    } catch (err: any) {
      setAiRecommendation(`Unable to trigger optimizer: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Securely trigger file download attachment with auth bearer token!
  const triggerReportDownload = async () => {
    try {
      const response = await fetch('/api/portfolio/report', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Could not request attachment report.');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI_Portfolio_Report_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Download export failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Upper header action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase size={22} className="text-indigo-600" />
            Active Portfolio Manager
          </h2>
          <p className="text-slate-500 text-sm mt-1">Audit active security holdings, average costs indices, and yields.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="downloadReportBtn"
            onClick={triggerReportDownload}
            disabled={holdings.length === 0}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Download size={14} />
            Export Audit Record
          </button>
          <button
            id="triggerAddHoldingBtn"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus size={14} />
            Add Position
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
          <Info size={16} />
          {error}
        </div>
      )}

      {/* Form add container */}
      {showAddForm && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner relative max-w-2xl">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Integrate Position Coordinates</h4>
          {formError && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 text-xs border border-red-100 rounded-lg">
              {formError}
            </div>
          )}
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Stock Ticker</label>
              <input
                id="addHoldTickerInput"
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase().trim())}
                placeholder="e.g. MSFT"
                className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500 bg-white font-mono uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Share Holdings</label>
              <input
                id="addHoldSharesInput"
                type="number"
                step="any"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500 bg-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Average Buy Price ($)</label>
              <input
                id="addHoldPriceInput"
                type="number"
                step="any"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500 bg-white font-mono"
                required
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                id="confirmAddPositionBtn"
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Commit Tranche
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <RefreshCw className="animate-spin mb-3 text-indigo-600" size={32} />
          <p className="text-sm font-medium">Re-calculating index aggregates...</p>
        </div>
      ) : holdings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8">
          <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800">Your Investment Box is Empty</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            Add holdings using our forms or go to the dashboard and trigger additions on single securities.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            Add First Security
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Totals Banner Panel */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                <div className="text-xs text-slate-400 font-semibold uppercase">Total Asset Value</div>
                <div id="totalPortfolioValue" className="text-2xl font-black text-slate-900 font-mono mt-1">
                  ${analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                <div className="text-xs text-slate-400 font-semibold uppercase">Capital Cost Basis</div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  ${analytics.totalCostBasis.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                <div className="text-xs text-slate-400 font-semibold uppercase">Absolutes Gain/Loss</div>
                <div className={`text-2xl font-black font-mono mt-1 ${
                  analytics.overallProfitOrLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {analytics.overallProfitOrLoss >= 0 ? '+' : ''}${analytics.overallProfitOrLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                <div className="text-xs text-slate-400 font-semibold">OVERALL PERFORMANCE</div>
                <div className={`text-2xl font-black font-mono mt-1 ${
                  analytics.overallProfitOrLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {analytics.overallChangePct >= 0 ? '+' : ''}{analytics.overallChangePct}%
                </div>
              </div>
            </div>
          )}

          {/* Table index layout */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase font-black tracking-wide">
                    <th className="py-4 px-6">Holding Index</th>
                    <th className="py-4 px-3">Agg. Quantity</th>
                    <th className="py-4 px-3">Avg Cost</th>
                    <th className="py-4 px-3">Live Quote</th>
                    <th className="py-4 px-3">Position Value</th>
                    <th className="py-4 px-3">Weighted Rate</th>
                    <th className="py-4 px-3">Sectors Allocation</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-medium">
                  {holdings.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm text-xs font-bold">
                            {h.ticker}
                          </span>
                          <span className="text-slate-700 text-xs ml-1.5 font-semibold hidden sm:inline">
                            {h.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 font-mono font-bold text-slate-600">{h.shares}</td>
                      <td className="py-4 px-3 font-mono text-slate-500">${h.buyPrice.toFixed(2)}</td>
                      <td className="py-4 px-3 font-mono font-bold text-slate-800">${h.currentPrice.toFixed(2)}</td>
                      <td className="py-4 px-3 font-mono font-black text-slate-900">${h.totalValue.toFixed(2)}</td>
                      <td className="py-4 px-3">
                        <span className={`font-bold font-mono text-xs ${
                          h.profitOrLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {h.percentProfitOrLoss >= 0 ? '+' : ''}{h.percentProfitOrLoss.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-500 text-xs font-semibold">{h.sector}</td>
                      <td className="py-4 px-6 text-right">
                        {showEditForm === h.id ? (
                          <div className="flex gap-1.5 items-center justify-end bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                            <input
                              type="number"
                              value={editShares}
                              onChange={(e) => setEditShares(e.target.value)}
                              placeholder="Qty"
                              className="w-12 border rounded-sm p-0.5 text-xs font-mono bg-white"
                            />
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              placeholder="Cost"
                              className="w-14 border rounded-sm p-0.5 text-xs font-mono bg-white"
                            />
                            <button
                              onClick={() => handleEditSubmit(h.id)}
                              className="text-xs bg-emerald-600 text-white font-bold rounded-sm px-1.5 py-0.5"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setShowEditForm(null)}
                              className="text-xs bg-slate-400 text-white font-bold rounded-sm px-1.5"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => {
                                setEditShares(h.shares.toString());
                                setEditPrice(h.buyPrice.toString());
                                setShowEditForm(h.id);
                              }}
                              className="p-1 px-2 border border-slate-200 hover:indigo-500 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                              title="Edit position shares"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(h.id, h.ticker)}
                              className="p-1 px-2 border border-rose-200 rounded-md text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition"
                              title="Remove position"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Advisor Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 text-white space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold text-indigo-400 flex items-center gap-1.5 tracking-wide">
                  <Sparkles size={18} />
                  AI Portfolio Advisor Optimizer
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Applies mathematical allocation models and generative analysis to optimize diversification ratios.
                </p>
              </div>

              <button
                id="evaluatePortfolioBtn"
                onClick={triggerAIOptimizer}
                disabled={aiLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    Synthesizing Allocation Index...
                  </>
                ) : (
                  <>
                    <Sliders size={14} />
                    Assess Allocation
                  </>
                )}
              </button>
            </div>

            {aiRecommendation && (
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs leading-relaxed max-h-96 overflow-y-auto">
                <div className="bg-slate-950 p-4 border border-indigo-900/40 rounded-xl font-sans text-slate-200 whitespace-pre-wrap">
                  {aiRecommendation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
