import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  Layers,
  Radio,
  Search,
  Terminal,
  Trash2,
  Zap,
} from 'lucide-react';
import { SystemLogEvent } from '../core/types';

interface LiveEventConsoleProps {
  logs: SystemLogEvent[];
  onClear: () => void;
}

export const LiveEventConsole: React.FC<LiveEventConsoleProps> = ({ logs, onClear }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((l) => {
    if (filterType !== 'ALL' && l.type !== filterType) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        l.sender.toLowerCase().includes(q) ||
        l.receiver.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'RESOURCE_REQUEST':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'PROVIDER_REQUEST':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'OFFER':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'COUNTER_OFFER':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'OFFER_ACCEPTED':
      case 'RESOURCE_ALLOCATED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'RESOURCE_RELEASED':
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
      case 'NEGOTIATION_FAILED':
      case 'CONTROLLER_FAILURE':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="w-full rounded-2xl glass-panel border border-slate-800 flex flex-col h-[460px] shadow-2xl overflow-hidden">
      {/* Console Top Toolbar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            LIVE EVENT CONSOLE (CENTRAL ROUTER LOG)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {filteredLogs.length} Events
          </span>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-[11px] font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 w-36 sm:w-44"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">All Types</option>
            <option value="RESOURCE_REQUEST">Requests</option>
            <option value="PROVIDER_REQUEST">Inquiries</option>
            <option value="OFFER">Offers</option>
            <option value="COUNTER_OFFER">Counter-Offers</option>
            <option value="RESOURCE_ALLOCATED">Allocations</option>
            <option value="RESOURCE_RELEASED">Releases</option>
            <option value="NEGOTIATION_FAILED">Failures</option>
          </select>

          {/* Clear Button */}
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
            title="Clear Log Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs select-text">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 py-12">
            <Radio className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
            <p className="text-xs">Awaiting centralized MAS message packets...</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2.5 rounded-xl border transition-all ${
                log.isFailure
                  ? 'bg-red-950/20 border-red-900/50 hover:border-red-500/60'
                  : log.isSuccess
                  ? 'bg-emerald-950/20 border-emerald-900/50 hover:border-emerald-500/60'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Top row: Timestamp, Routing, and Tag */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <div className="flex items-center gap-1 font-semibold text-slate-200">
                    <span className={log.sender.includes('Controller') ? 'text-amber-400' : 'text-cyan-400'}>
                      {log.sender}
                    </span>
                    <span className="text-slate-500">➜</span>
                    <span className={log.receiver.includes('Controller') ? 'text-amber-400' : 'text-cyan-400'}>
                      {log.receiver}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getTypeBadge(
                    log.type
                  )}`}
                >
                  {log.type.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Summary */}
              <div className="text-xs font-semibold text-slate-100 mb-0.5">
                {log.summary}
              </div>

              {/* Detail narrative */}
              <div className="text-[11px] text-slate-400 leading-relaxed">
                {log.details}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
