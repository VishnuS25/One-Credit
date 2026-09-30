import React, { useState, useRef, useEffect } from 'react';
import type { SimulationEventLog, MessageType } from '../types';
import {
  Terminal,
  Trash2,
  Filter,
  Search,
  ArrowRight,
} from 'lucide-react';

interface NegotiationConsoleProps {
  logs: SimulationEventLog[];
  onClearLogs: () => void;
}

export const NegotiationConsole: React.FC<NegotiationConsoleProps> = ({
  logs,
  onClearLogs,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterAgent, setFilterAgent] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<SimulationEventLog | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'ALL' && log.type !== filterType) return false;
    if (filterAgent !== 'ALL' && log.from !== filterAgent && log.to !== filterAgent) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matches =
        log.summary.toLowerCase().includes(term) ||
        log.from.toLowerCase().includes(term) ||
        log.to.toLowerCase().includes(term) ||
        log.type.toLowerCase().includes(term);
      if (!matches) return false;
    }
    return true;
  });

  const getBadgeForType = (type: MessageType) => {
    switch (type) {
      case 'RESOURCE_REQUEST':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            REQUEST
          </span>
        );
      case 'OFFER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            OFFER
          </span>
        );
      case 'COUNTER_OFFER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
            COUNTER
          </span>
        );
      case 'ACCEPT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ACCEPT
          </span>
        );
      case 'REJECT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            REJECT
          </span>
        );
      case 'RESOURCE_ALLOCATE':
      case 'RESOURCE_RELEASE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {type === 'RESOURCE_ALLOCATE' ? 'ALLOCATED' : 'RELEASED'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl glass-panel border border-yellow-500/20 overflow-hidden flex flex-col h-[480px]">
      {/* Console Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-yellow-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Negotiation Console & Event Log
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-clear-log"
            onClick={onClearLogs}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-lg transition-all"
            title="Clear all console logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            CLEAR LOG
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Message Type Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-yellow-500"
            >
              <option value="ALL">All Message Types</option>
              <option value="RESOURCE_REQUEST">REQUEST</option>
              <option value="OFFER">OFFER</option>
              <option value="COUNTER_OFFER">COUNTER OFFER</option>
              <option value="ACCEPT">ACCEPT</option>
              <option value="REJECT">REJECT</option>
              <option value="RESOURCE_RELEASE">RELEASE</option>
            </select>
          </div>

          {/* Agent Filter */}
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-yellow-500"
          >
            <option value="ALL">All Agents</option>
            <option value="Agent A">Agent A</option>
            <option value="Agent B">Agent B</option>
            <option value="Agent C">Agent C</option>
            <option value="Agent D">Agent D</option>
            <option value="Agent E">Agent E</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-yellow-500 w-32 focus:w-44 transition-all"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-xs bg-[#070a0f]"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <Terminal className="w-8 h-8 stroke-[1.5] text-slate-600" />
            <p className="text-xs">No negotiation events recorded yet.</p>
            <span className="text-[10px] text-slate-600">
              Click &apos;START SIMULATION&apos; or &apos;GENERATE REQUEST&apos; to begin P2P message exchange.
            </span>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-yellow-500/40 hover:bg-slate-900/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2 flex-wrap">
                {/* Timestamp */}
                <span className="text-[11px] text-slate-500 font-mono">[{log.timeString}]</span>

                {/* Agents Channel */}
                <div className="flex items-center gap-1 text-slate-300 font-semibold">
                  <span className="text-yellow-400">{log.from}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="text-cyan-400">{log.to}</span>
                </div>

                {/* Type Badge */}
                {getBadgeForType(log.type)}

                {/* Summary Text */}
                <span className="text-slate-300 text-xs tracking-tight group-hover:text-white transition-colors">
                  {log.summary}
                </span>
              </div>

              <span className="text-[10px] text-slate-600 group-hover:text-yellow-400/80 transition-colors self-end sm:self-auto font-sans">
                inspect &rsaquo;
              </span>
            </div>
          ))
        )}
      </div>

      {/* Inspector Modal if selected */}
      {selectedLog && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/95 flex items-start justify-between gap-2 animate-fadeIn text-xs font-mono">
          <div className="space-y-1 w-full overflow-hidden">
            <div className="flex items-center gap-2 text-yellow-400 font-bold">
              <span>Inspect Event Payload:</span>
              <span className="text-slate-400 font-normal">Session {selectedLog.sessionId}</span>
            </div>
            <pre className="text-[11px] text-emerald-400 bg-slate-900 p-2 rounded max-h-24 overflow-y-auto">
              {selectedLog.details}
            </pre>
          </div>
          <button
            onClick={() => setSelectedLog(null)}
            className="text-slate-500 hover:text-white px-2 py-1 bg-slate-800 rounded text-[10px]"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
