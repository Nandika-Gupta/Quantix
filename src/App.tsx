import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Briefcase, BarChart3, Scale, History, BookOpen, LogOut, User as UserIcon } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import Analytics from './components/Analytics';
import Comparison from './components/Comparison';
import HistoryLogs from './components/HistoryLogs';
import ApiDocs from './components/ApiDocs';

type TabType = 'dashboard' | 'portfolio' | 'analytics' | 'comparison' | 'history' | 'api-docs';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [addHoldingTicker, setAddHoldingTicker] = useState('');

  useEffect(() => {
    // Attempt to verify token on boot
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('jwt_token');
      if (!savedToken) return;

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setToken(savedToken);
        } else {
          // Token invalid, clear storage
          handleSignOut();
        }
      } catch {
        // Fallback or network error, let guest browse
        if (savedToken.startsWith('GUEST_TOKEN_SESSION_')) {
          try {
            const guestPayload = JSON.parse(atob(savedToken.split('GUEST_TOKEN_SESSION_')[1]));
            setUser(guestPayload);
            setToken(savedToken);
          } catch {
            handleSignOut();
          }
        } else {
          handleSignOut();
        }
      }
    };
    verifyToken();
  }, []);

  const handleLoginSuccess = (newToken: string, userInfo: { id: string; email: string; name: string }) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
    setUser(userInfo);
    setActiveTab('dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  // Navigates to portfolio tab pre-filled with the ticker
  const handleAddToPortfolioTrigger = (ticker: string) => {
    setAddHoldingTicker(ticker);
    setActiveTab('portfolio');
  };

  if (!token || !user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Professional Navigation Bar */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Branding Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs">
                <Shield size={20} />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wide uppercase font-sans">
                  QUANTIX PLATFORM
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                  AI Financial Suite
                </p>
              </div>
            </div>

            {/* Profile greeting and logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-700 font-medium">
                <UserIcon size={14} className="text-indigo-400" />
                <span>
                  Welcome, <span className="font-bold text-slate-200">{user.name}</span>
                </span>
              </div>
              <button
                id="signoutBtn"
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Sign out of account"
              >
                <LogOut size={18} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Layout containing Side Navigation and Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-6 p-4 sm:p-6 lg:p-8">
        
        {/* Left Hand Navigation rail (Sticky scroll) */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-1 shadow-xs sticky top-20">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2 leading-none">
              Suite Applications
            </h3>

            {[
              { id: 'dashboard', label: 'Market Dashboard', icon: LayoutDashboard },
              { id: 'portfolio', label: 'My Portfolio', icon: Briefcase },
              { id: 'analytics', label: 'Risk Analytics', icon: BarChart3 },
              { id: 'comparison', label: 'Asset Compare', icon: Scale },
              { id: 'history', label: 'Audit Archives', icon: History },
              { id: 'api-docs', label: 'Developers API', icon: BookOpen },
            ].map((nav) => {
              const Icon = nav.icon;
              return (
                <button
                  key={nav.id}
                  id={`tabLink-${nav.id}`}
                  onClick={() => {
                    setActiveTab(nav.id as TabType);
                    if (nav.id !== 'portfolio') {
                      setAddHoldingTicker(''); // Clear transfer state
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-200 uppercase ${
                    activeTab === nav.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  {nav.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Dynamic Display Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard token={token} onAddToPortfolio={handleAddToPortfolioTrigger} />
          )}
          {activeTab === 'portfolio' && (
            <Portfolio token={token} addTickerTrigger={addHoldingTicker} />
          )}
          {activeTab === 'analytics' && (
            <Analytics token={token} />
          )}
          {activeTab === 'comparison' && (
            <Comparison token={token} />
          )}
          {activeTab === 'history' && (
            <HistoryLogs token={token} />
          )}
          {activeTab === 'api-docs' && (
            <ApiDocs />
          )}
        </main>

      </div>

      {/* Humble Standard Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Quantix AI Suite © 2026 — Powered by React, Vite, Node.js, and Google Gemini
        </div>
      </footer>
    </div>
  );
}
