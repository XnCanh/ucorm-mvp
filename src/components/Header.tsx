'use client';

import React from 'react';
import { Sparkles, Database, Cpu, MapPin, Key } from 'lucide-react';

interface HeaderProps {
  dbSource: 'Supabase' | 'Local DB (JSON)';
  apiKeysStatus: {
    gemini: boolean;
    openai: boolean;
    google: boolean;
  };
}

export default function Header({ dbSource, apiKeysStatus }: HeaderProps) {
  return (
    <header className="glass-panel border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl ai-gradient-bg shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                AI-Powered <span className="ai-gradient-text">ORM</span>
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                MVP 0
              </span>
            </div>
            <p className="text-xs text-gray-400">Nền tảng quản trị đánh giá và tự động sinh phản hồi bằng AI</p>
          </div>
        </div>

        {/* System Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* DB Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            dbSource === 'Supabase' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <Database className="h-3.5 w-3.5" />
            <span>Database: <strong className="font-bold">{dbSource}</strong></span>
          </div>

          {/* AI Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-gray-300 border border-gray-800">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span className="flex items-center gap-1">
              AI: 
              {apiKeysStatus.gemini && (
                <span className="font-semibold text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded text-[10px] border border-indigo-500/20">Gemini</span>
              )}
              {apiKeysStatus.openai && (
                <span className="font-semibold text-purple-300 bg-purple-500/10 px-1 py-0.5 rounded text-[10px] border border-purple-500/20">OpenAI</span>
              )}
              {!apiKeysStatus.gemini && !apiKeysStatus.openai && (
                <span className="font-bold text-amber-400 animate-pulse bg-amber-500/10 px-1 py-0.5 rounded text-[10px] border border-amber-500/20">Mock Fallback</span>
              )}
            </span>
          </div>

          {/* Maps Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
            apiKeysStatus.google
              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
              : 'bg-gray-900 text-gray-400 border border-gray-800'
          }`}>
            <MapPin className="h-3.5 w-3.5 text-sky-400" />
            <span>Google Maps: <strong className="font-semibold">{apiKeysStatus.google ? 'API Online' : 'Mock Demo'}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
}
