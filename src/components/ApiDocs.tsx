import React, { useState, useEffect } from 'react';
import { BookOpen, Key, Link as LinkIcon, Lock, Globe, Terminal } from 'lucide-react';

interface RouteDoc {
  path: string;
  method: string;
  description: string;
  reqBody?: string;
  secure?: boolean;
}

export default function ApiDocs() {
  const [specs, setSpecs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const res = await fetch('/api/specs');
        const data = await res.json();
        setSpecs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen size={20} className="text-indigo-600" />
          System REST API Documentation & Specifications
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Review request parameters, schema structures, secure token scopes, and programmatically integrate coordinates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: specs and protocols */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Key size={16} className="text-indigo-600" />
              API Security Scope
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Secure routes require appending valid Bearer JSON Web Tokens inside request header coordinates. Extract your credentials using the 
              registrations or login endpoints.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-indigo-700 overflow-x-auto whitespace-pre">
              Authorization: Bearer &lt;JWT_TOKEN&gt;
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Globe size={16} className="text-indigo-600" />
              Developer Metrics
            </h4>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase">Framework Protocol</span>
                <span className="text-slate-800 font-mono">RESTful HTTP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase">Encoding Standard</span>
                <span className="text-slate-800 font-mono">UTF-8 JSON</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase">Response timings</span>
                <span className="text-indigo-700 font-mono">&lt; 15ms average</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: endpoints catalog */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-750 uppercase tracking-wide px-1 flex items-center gap-1.5">
            <Terminal size={16} className="text-indigo-600" />
            Active Route Registers
          </h3>

          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
              Fetching catalog...
            </div>
          ) : specs && specs.routes ? (
            <div className="space-y-4">
              {specs.routes.map((route: RouteDoc, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-slate-300 transition duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                        route.method === 'GET'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : route.method === 'POST'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : route.method === 'PUT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {route.method}
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-800">
                        {route.path}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {route.secure && (
                        <span className="bg-red-50 text-red-700 border border-red-100 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase">
                          <Lock size={10} />
                          JWT secure
                        </span>
                      )}
                      <span className="bg-slate-50 text-slate-500 border border-slate-150 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase">
                        Spec v1.2
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs mt-2 font-medium">
                    {route.description}
                  </p>

                  {route.reqBody && (
                    <div className="mt-3">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payload coordinates</label>
                      <pre className="bg-slate-900 text-indigo-400 text-xs rounded-lg p-2.5 font-mono overflow-x-auto">
                        {route.reqBody}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
              No catalog specifications registered.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
