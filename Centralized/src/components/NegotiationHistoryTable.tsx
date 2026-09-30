import React from 'react';
import {
  Activity,
  CheckCircle,
  Clock,
  ExternalLink,
  GitBranch,
  History,
  Layers,
  Scale,
  XCircle,
} from 'lucide-react';
import { NegotiationSession } from '../core/types';

interface NegotiationHistoryTableProps {
  sessions: NegotiationSession[];
  onInspectSession: (session: NegotiationSession) => void;
}

export const NegotiationHistoryTable: React.FC<NegotiationHistoryTableProps> = ({
  sessions,
  onInspectSession,
}) => {
  return (
    <div className="w-full rounded-2xl glass-panel border border-slate-800 p-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            NEGOTIATION & COUNTER-OFFER LEDGER
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          All mediated exchanges through Central Controller
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-950/40">
              <th className="py-2.5 px-3">Requester</th>
              <th className="py-2.5 px-3">Provider</th>
              <th className="py-2.5 px-3">Resource</th>
              <th className="py-2.5 px-3">Requested ➜ Agreed</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Rounds</th>
              <th className="py-2.5 px-3">Outcome</th>
              <th className="py-2.5 px-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No negotiations recorded yet. Start simulation or dispatch a request.
                </td>
              </tr>
            ) : (
              sessions.map((sess) => {
                const isAccepted = sess.status === 'ACCEPTED';
                const isCounter = sess.currentAmount !== sess.requestedAmount && isAccepted;
                const requesterName = sess.turns[0]?.sender || sess.requesterId;
                const providerName = sess.turns[1]?.receiver || sess.providerId;

                return (
                  <tr
                    key={sess.id}
                    className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                    onClick={() => onInspectSession(sess)}
                  >
                    {/* Requester */}
                    <td className="py-2.5 px-3 font-bold text-cyan-400">
                      {requesterName}
                    </td>

                    {/* Provider */}
                    <td className="py-2.5 px-3 font-bold text-amber-400">
                      {providerName}
                    </td>

                    {/* Resource */}
                    <td className="py-2.5 px-3 text-slate-200">
                      {sess.resourceType}
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-3">
                      <span className="text-slate-400">{sess.requestedAmount}%</span>
                      {isAccepted && (
                        <span className={`ml-1.5 font-bold ${isCounter ? 'text-purple-400' : 'text-emerald-400'}`}>
                          ➜ {sess.currentAmount}%
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-2.5 px-3 text-slate-300">
                      {sess.currentDuration || sess.requestedDuration}s
                    </td>

                    {/* Rounds */}
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {sess.turns.length} turns
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          isAccepted
                            ? isCounter
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border-red-500/40'
                        }`}
                      >
                        {isAccepted ? (
                          isCounter ? (
                            <>
                              <GitBranch className="w-3 h-3" /> COUNTER-AGREED
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" /> ACCEPTED
                            </>
                          )
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> REJECTED
                          </>
                        )}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectSession(sess);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                        title="View negotiation dialogue turns"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
