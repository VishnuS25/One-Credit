import React, { useState } from 'react';
import type { HistoryRecord } from '../types';
import {
  History,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
} from 'lucide-react';

interface NegotiationHistoryProps {
  history: HistoryRecord[];
}

export const NegotiationHistory: React.FC<NegotiationHistoryProps> = ({ history }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredHistory = history.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = 'ID,SessionID,Requester,Provider,Resource,Amount,Status,Duration,Rounds,Priority,Timestamp\n';
    const rows = history
      .map(
        (h) =>
          `"${h.id}","${h.sessionId}","${h.requesterId}","${h.providerId}","${h.resource}","${h.amount}${h.unit}","${h.status}","${h.duration}s","${h.rounds}","${h.priority}","${h.timestamp}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `p2p_negotiation_history_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="rounded-2xl glass-panel border border-yellow-500/20 overflow-hidden space-y-3 p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Negotiation Audit & Historical Deals Table
            </h2>
            <p className="text-xs text-slate-400">
              Complete decentralized ledger of bilateral resource trades
            </p>
          </div>
        </div>

        {/* Filter and Export */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-yellow-500 font-mono"
            >
              <option value="ALL">All Outcomes</option>
              <option value="ACCEPTED">Accepted Deals Only</option>
              <option value="REJECTED">Rejected Deals Only</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-700 hover:border-yellow-500/40 text-slate-300 hover:text-yellow-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Requester</th>
              <th className="py-2.5 px-3">Provider</th>
              <th className="py-2.5 px-3">Resource</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Rounds</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No completed negotiations recorded yet.
                </td>
              </tr>
            ) : (
              filteredHistory.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-900/60 transition-colors group"
                >
                  <td className="py-2.5 px-3 text-slate-400">{row.timestamp}</td>
                  <td className="py-2.5 px-3 font-semibold text-yellow-400">
                    {row.requesterId}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-cyan-400">
                    {row.providerId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{row.resource}</td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    {row.amount} {row.unit}
                    {row.returnResource && (
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ⇄ return: {row.returnAmount} {row.returnUnit}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{row.duration}s</td>
                  <td className="py-2.5 px-3 text-slate-400">{row.rounds}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        row.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300'
                          : row.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {row.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {row.status === 'ACCEPTED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> ACCEPTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <XCircle className="w-3 h-3" /> REJECTED
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
