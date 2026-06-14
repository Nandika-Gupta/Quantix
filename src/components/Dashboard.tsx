import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, RefreshCw, Sparkles, Plus, Info, Landmark } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { StockQuote, StockHistoryPoint } from '../types';

interface DashboardProps {
  token: string;
  onAddToPortfolio: (ticker: string) => void;
}

const QUICK_TICKERS = ['AAPL', 'MSFT', 'NVIDIA', 'TSLA', 'AMZN', 'META', 'KO', 'JNJ', 'JPM'];

export default function Dashboard({ token, onAddToPortfolio }: DashboardProps) {
  const [ticker, setTicker] = useState('AAPL');
  const [searchQuery, setSearchQuery] = useState('AAPL');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<StockHistoryPoint[]>([]);
  const [chartDays, setChartDays] = useState(30);
  const [customAIQuery, setCustomAIQuery] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchQuoteData = async (symbol: string) => {
    setError('');
    setQuoteLoading(true);
    try {
      const res = await fetch(`/api/stocks/${symbol}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to capture live quote.');
      setQuote(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred during quote fetch.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const fetchHistoryData = async (symbol: string, points: number) => {
    setChartLoading(true);
    try {
      const res = await fetch(`/api/stocks/${symbol}/history?points=${points}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to draw chart data.');
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  };

  const generateAIInsight = async (symbol: string, focusQuery: string) => {
    setAiLoading(true);
    setAiInsight('');
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ticker: symbol, query: focusQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate insight.');
      setAiInsight(data.insight);
    } catch (err: any) {
      setAiInsight(`Unable to fetch AI insight: ${err.message || 'Connecting server failed.'}`);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchQuoteData(searchQuery);
    fetchHistoryData(searchQuery, chartDays);
  }, [searchQuery]);

  useEffect(() => {
    fetchHistoryData(searchQuery, chartDays);
  }, [chartDays]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      setSearchQuery(ticker.toUpperCase().trim());
    }
  };

  const handleQuickClick = (sym: string) => {
    setTicker(sym);
    setSearchQuery(sym);
  };

  const handleTriggerAI = () => {
    if (quote) {
      generateAIInsight(quote.ticker, customAIQuery);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  // 52 week range progress slider calculations
  const calculate52WeekPercentage = () => {
    if (!quote) return 50;
    const range = quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow;
    if (range <= 0) return 50;
    const position = quote.price - quote.fiftyTwoWeekLow;
    return Math.min(100, Math.max(0, (position / range) * 100));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Landmark size={22} className="text-indigo-600" />
          Market Intelligence Dashboard
        </h2>
        <p className="text-slate-500 text-sm mt-1">Search global financial asset matrices and trigger AI report summaries.</p>

        <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <input
              id="tickerSearchInput"
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter stock ticker symbol (e.g. AAPL, TSLA, NVIDIA)..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
          </div>
          <button
            id="searchStockBtn"
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-1.5"
          >
            <Search size={16} />
            Search
          </button>
        </form>

        {/* Quick Lists */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-semibold uppercase mr-1">Trending:</span>
          {QUICK_TICKERS.map((sym) => (
            <button
              key={sym}
              id={`quickClick-${sym}`}
              onClick={() => handleQuickClick(sym)}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                searchQuery === sym
                  ? 'bg-indigo-100 text-indigo-700 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
          <Info size={16} />
          {error}
        </div>
      )}

      {quoteLoading && !quote ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <RefreshCw className="animate-spin mb-3 text-indigo-600" size={32} />
          <p className="text-sm font-medium">Re-calculating pricing arrays...</p>
        </div>
      ) : (
        quote && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Stock Information and Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Asset Snapshot Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
                
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold tracking-wider uppercase">
                        {quote.ticker}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-md">
                        {quote.sector}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">{quote.name}</h3>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-slate-900 font-mono">
                      ${quote.price.toFixed(2)}
                    </div>
                    <div className={`flex items-center justify-end gap-1.5 mt-1 font-bold text-sm ${
                      quote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {quote.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span>{quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}</span>
                      <span>({quote.percentChange >= 0 ? '+' : ''}{quote.percentChange.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mt-4 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {quote.description}
                </p>

                {/* Sub Metadata Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">P/E Multiple</div>
                    <div className="text-base font-bold text-slate-800 font-mono mt-0.5 mt-0.5">
                      {quote.peRatio ? quote.peRatio.toFixed(2) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Volatility (Beta)</div>
                    <div className="text-base font-bold text-slate-800 font-mono mt-0.5 mt-0.5">
                      {quote.beta ? quote.beta.toFixed(2) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Marketcap size</div>
                    <div className="text-base font-bold text-slate-800 font-mono mt-0.5 mt-0.5">
                      {formatNumber(quote.marketCap)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase font-semibold">Trading Volume</div>
                    <div className="text-base font-bold text-slate-800 font-mono mt-0.5 mt-0.5">
                      {quote.volume.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Element */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Historical Trading Waves</h4>
                  <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    {[
                      { l: '30D', v: 30 },
                      { l: '90D', v: 90 },
                      { l: '180D', v: 180 },
                      { l: '1Y', v: 365 },
                    ].map((tab) => (
                      <button
                        key={tab.l}
                        onClick={() => setChartDays(tab.v)}
                        className={`px-3 py-1 text-xs rounded-md font-semibold transition ${
                          chartDays === tab.v
                            ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tab.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-72 w-full font-mono mt-4 relative">
                  {chartLoading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                      <RefreshCw className="animate-spin text-indigo-600" size={24} />
                    </div>
                  )}
                  {history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          style={{ fill: '#94a3b8', fontSize: '10px' }}
                          tickFormatter={(val) => val.split('-').slice(1).join('/')}
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          tickLine={false}
                          style={{ fill: '#94a3b8', fontSize: '10px' }}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', padding: '10px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                          itemStyle={{ color: '#fff', fontSize: '12px' }}
                          formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Price']}
                        />
                        <Area
                          type="monotone"
                          dataKey="close"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#chartGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">No historical chart arrays rendered</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Quick actions (Add, 52Whigh/low, AI insight generator) */}
            <div className="space-y-6">
              {/* Quick Tranche management action card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Position Operations</h4>

                {/* 52w range visualizer */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold">
                    <span>52-W Low (${quote.fiftyTwoWeekLow.toFixed(2)})</span>
                    <span>52-W High (${quote.fiftyTwoWeekHigh.toFixed(2)})</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full w-full relative">
                    <div
                      className="absolute h-2 bg-indigo-600 rounded-full"
                      style={{ width: `${calculate52WeekPercentage()}%` }}
                    />
                    <div
                      className="absolute h-3 w-3 bg-slate-900 border border-white rounded-full -top-0.5 shadow-xs"
                      style={{ left: `calc(${calculate52WeekPercentage()}% - 6px)` }}
                    />
                  </div>
                  <div className="text-center text-xs text-slate-500 font-medium">
                    Trading premium sits **{calculate52WeekPercentage().toFixed(0)}%** off past yearly low thresholds.
                  </div>
                </div>

                <button
                  id="addToPortfolioActionBtn"
                  onClick={() => onAddToPortfolio(quote.ticker)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Plus size={16} />
                  Add to Portfolio Holdings
                </button>
              </div>

              {/* AI Insight Module */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Sparkles size={120} />
                </div>
                
                <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={16} />
                  Gemini Analyst Agent
                </h4>
                <p className="text-xs text-slate-300">
                  Formulate deep-dive institutional analytics relative to single target queries. Note: Always server-side.
                </p>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-400">Custom Analyst Query (Optional)</label>
                  <textarea
                    id="aiQueryInput"
                    rows={3}
                    value={customAIQuery}
                    onChange={(e) => setCustomAIQuery(e.target.value)}
                    placeholder="e.g. Rate their macro valuation multiplier vs industry trends..."
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                  <button
                    id="triggerAIInsightBtn"
                    onClick={handleTriggerAI}
                    disabled={aiLoading}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        Synthesizing Reasoning Chain...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Generate AI Financial Report
                      </>
                    )}
                  </button>
                </div>

                {/* AI result display */}
                {aiInsight && (
                  <div className="mt-4 pt-4 border-t border-slate-800 text-xs leading-relaxed space-y-2 max-h-80 overflow-y-auto">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 whitespace-pre-wrap font-sans text-slate-200">
                      {aiInsight}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
