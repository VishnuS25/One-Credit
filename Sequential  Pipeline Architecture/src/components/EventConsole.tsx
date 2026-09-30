import React, { useState, useMemo } from 'react';
import type { EventLogItem } from '../types';
import {
  Terminal,
  Trash2,
  Download,
  Search
} from 'lucide-react';

interface EventConsoleProps {
  logs: EventLogItem[];
  onClearLogs: () => void;
}

export const EventConsole: React.FC<EventConsoleProps> = ({ logs, onClearLogs }) => {
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSource =
        filterSource === 'ALL' ||
        (filterSource === 'PIPELINE' && log.source === 'PIPELINE') ||
        (filterSource === 'AGENT_1' && log.source === 'AGENT_1') ||
        (filterSource === 'AGENT_2' && log.source === 'AGENT_2') ||
        (filterSource === 'AGENT_3' && log.source === 'AGENT_3') ||
        (filterSource === 'AGENT_4' && log.source === 'AGENT_4') ||
        (filterSource === 'AGENT_5' && log.source === 'AGENT_5') ||
        (filterSource === 'PROVIDER' && log.source === 'PROVIDER') ||
        (filterSource === 'ERROR' && log.type === 'ERROR');

      const matchesSearch =
        searchQuery === '' ||
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSource && matchesSearch;
    });
  }, [logs, filterSource, searchQuery]);

  const handleExportLogs = () => {
    const textData = logs
      .map((l) => `[${l.timestamp}] [${l.source}] [${l.type}] ${l.title} - ${l.details}`)
      .join('\n');
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline_events_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl p-5 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Live Event Console
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {filteredLogs.length} Events
              </span>
            </h3>
          </div>
        </div>

        {/* Filter buttons & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs font-mono text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none w-36 sm:w-44"
            />
          </div>

          <button
            onClick={handleExportLogs}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Export Logs"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear Event Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-b border-slate-800/60 custom-scrollbar text-[10px] font-mono">
        {[
          { id: 'ALL', label: 'ALL' },
          { id: 'PIPELINE', label: 'PIPELINE' },
          { id: 'AGENT_1', label: 'AGENT 1' },
          { id: 'AGENT_2', label: 'AGENT 2' },
          { id: 'AGENT_3', label: 'AGENT 3' },
          { id: 'AGENT_4', label: 'AGENT 4' },
          { id: 'AGENT_5', label: 'AGENT 5' },
          { id: 'PROVIDER', label: 'PROVIDERS' },
          { id: 'ERROR', label: 'ERRORS' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterSource(tab.id)}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
              filterSource === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto max-h-[440px] custom-scrollbar space-y-2 mt-2 font-mono text-xs pr-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-xs">
            No events recorded matching criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isError = log.type === 'ERROR';
            const isSuccess = log.type === 'SUCCESS';
            const isWarning = log.type === 'WARNING';
            const isTransfer = log.type === 'DATA_TRANSFER';

            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  isError
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : isSuccess
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : isTransfer
                    ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400/90 font-bold">[{log.timestamp}]</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
                      {log.source}
                    </span>
                  </div>
                  <span className={`font-bold ${
                    isError ? 'text-rose-400' : isSuccess ? 'text-emerald-400' : isTransfer ? 'text-cyan-400' : 'text-slate-500'
                  }`}>
                    {log.type}
                  </span>
                </div>

                <div className="font-semibold text-white text-[11px] leading-tight">
                  {log.title}
                </div>
                <div className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                  {log.details}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
