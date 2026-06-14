import React, { useState, useEffect } from 'react';
import { Scale, RefreshCw, Sparkles, TrendingUp, TrendingDown, Info, Trash } from 'lucide-react';
import { StockQuote } from '../types';

interface ComparisonProps {
  token: string;
}

export default function Comparison({ token }: ComparisonProps) {
  const [tickers, setTickers] = useState<string[]>(['AAPL', 'MSFT']);
  const [newTicker, setNewTicker] = useState('');
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI comparison outcome state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState('');

  const fetchComparisonQuotes = async (symbols: string[]) => {
    if (symbols.length === 0) {
      setQuotes([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stocks/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers: symbols }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to compare tickers.');
      setQuotes(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred retrieving comparative specs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonQuotes(tickers);
  }, []);

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = newTicker.toUpperCase().trim();
    if (!symbol) return;
    if (tickers.includes(symbol)) {
      setNewTicker('');
      return;
    }
    if (tickers.length >= 5) {
      alert('Side-by-side comparison limit is capped at a maximum of 5 securities.');
      return;
    }

    const updated = [...tickers, symbol];
    setTickers(updated);
    setNewTicker('');
    fetchComparisonQuotes(updated);
  };

  const handleRemoveTicker = (sym: string) => {
    const updated = tickers.filter(t => t !== sym);
    setTickers(updated);
    fetchComparisonQuotes(updated);
  };

  const triggerAIComparison = async () => {
    if (tickers.length < 2) {
      alert('Minimum of 2 securities is necessary for comparison analyses.');
      return;
    }
    setAiLoading(true);
    setAiReport('');
    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tickers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request comparative report.');
      setAiReport(data.compInsight);
    } catch (err: any) {
      setAiReport(`AI generation failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const formatLargeNum = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    return `$${(num / 1e6).toFixed(2)}M`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      {/* Header card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Scale size={20} className="text-indigo-600" />
          Head-to-Head Asset Compare
        </h2>
        <p className="text-slate-500 text-sm mt-1">Conduct granular comparative analysis on various symbols and secure allocations verdict summaries.</p>

        {/* Input tray */}
        <form onSubmit={handleAddTicker} className="mt-4 flex gap-2 max-w-md">
          <input
            id="compTickerInput"
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            placeholder="Add ticker (e.g. TSLA, BRK_B)..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono uppercase focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
          <button
            id="addCompTickerBtn"
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            Add Asset
          </button>
        </form>

        {/* Action tags */}
        <div className="flex flex-wrap gap-2 mt-3.5">
          {tickers.map(t => (
            <span key={t} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 pl-3 pr-2 py-1 rounded-full text-xs font-bold uppercase border border-indigo-100">
              {t}
              <button
                type="button"
                id={`removeComp-${t}`}
                onClick={() => handleRemoveTicker(t)}
                className="hover:bg-indigo-200 p-0.5 rounded-full duration-150"
              >
                <Trash size={12} className="text-indigo-650" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
          <Info size={16} />
          {error}
        </div>
      )}

      {loading && quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <RefreshCw className="animate-spin mb-3 text-indigo-600" size={32} />
          <p className="text-sm font-medium">Re-calculating pricing comparisons...</p>
        </div>
      ) : (
        quotes.length > 0 && (
          <div className="space-y-6">
            {/* Table layout comparing columns */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-xs text-slate-400 font-bold uppercase">
                      <th className="py-4 px-6">Metrics Comparison</th>
                      {quotes.map(q => (
                        <th key={q.ticker} className="py-4 px-6 text-center font-bold">
                          <span className="font-mono bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-md text-xs uppercase shadow-2xs">
                            {q.ticker}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-sm">
                    <tr>
                      <td className="py-4 px-6 font-bold text-slate-500 uppercase text-xs">Asset Name</td>
                      {quotes.map(q => (
                        <td key={q.ticker} className="py-4 px-6 text-center text-slate-800 font-bold">{q.name}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-bold text-slate-500 uppercase text-xs">Current Pricing</td>
                      {quotes.map(q => (
                        <td key={q.ticker} className="py-4 px-6 text-center text-slate-900 font-mono font-bold">${q.price.toFixed(2)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-bold text-slate-500 uppercase text-xs">Volatility (Beta)</td>
                      {quotes.map(q => (
                        <td key={q.ticker} className="py-4 px-6 text-center text-slate-600 font-mono font-semibold">{q.beta ? q.beta.toFixed(2) : 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-bold text-slate-500 uppercase text-xs">P/E Premium multiple</td>
                      {quotes.map(q => (
                        <td key={q.ticker} className="py-4 px-6 text-center text-slate-600 font-mono font-semibold">{q.peRatio ? q.peRatio.toFixed(2) : 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-bold text-slate-500 uppercase text-xs">Relative Change (%)</td>
                      {quotes.map(q => (
                        <td key={q.ticker} className="py-4 px-6 text-center">
                          <span className={`font-mono font-bold ${
                            q.percentChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {q.percentChange >= 0 ? '+' : ''}{q.percentChange.toFixed(2)}%
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-bold text-slate-500 uppercase text-xs">Macro Cap Size</td>
                      {quotes.map(q => (
                        <td key={q.ticker} className="py-4 px-6 text-center text-slate-700 font-mono font-semibold">{formatLargeNum(q.marketCap)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-bold text-slate-500 uppercase text-xs">Sector Industry</td>
                      {quotes.map(q => (
                        <td key={q.ticker} className="py-4 px-6 text-center text-slate-500 text-xs font-semibold">{q.sector}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI compare verdict section */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-bold text-indigo-400 flex items-center gap-1.5 font-sans tracking-wide">
                    <Sparkles size={18} />
                    AI Comparison Analyzer
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5 font-sans">
                    Fuses quantitative indicators of selected assets to formulate comparative allocation verdicts.
                  </p>
                </div>

                <button
                  id="compareAIReportBtn"
                  onClick={triggerAIComparison}
                  disabled={aiLoading || tickers.length < 2}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      Synthesizing Valuation Divergence...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Synthesize Comparative Analysis
                    </>
                  )}
                </button>
              </div>

              {aiReport && (
                <div className="mt-4 pt-4 border-t border-slate-850 text-xs leading-relaxed max-h-96 overflow-y-auto font-sans">
                  <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 text-slate-200 whitespace-pre-wrap">
                    {aiReport}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
