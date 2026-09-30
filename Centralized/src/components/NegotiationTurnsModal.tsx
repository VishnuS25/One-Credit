import React from 'react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  GitBranch,
  MessageSquare,
  Scale,
  Server,
  X,
  XCircle,
} from 'lucide-react';
import { NegotiationSession } from '../core/types';

interface NegotiationTurnsModalProps {
  session: NegotiationSession | null;
  onClose: () => void;
}

export const NegotiationTurnsModal: React.FC<NegotiationTurnsModalProps> = ({
  session,
  onClose,
}) => {
  if (!session) return null;

  const isAccepted = session.status === 'ACCEPTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl glass-panel border border-amber-500/40 p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-mono tracking-wide">
                NEGOTIATION SESSION INSPECTOR
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Session ID: {session.id} • Mediated by Central Controller
              </p>
            </div>
          </div>

          {/* Quick Summary Chips */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Resource: <strong className="text-white">{session.resourceType}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Requested: <strong className="text-cyan-400">{session.requestedAmount}%</strong> for{' '}
              <strong className="text-cyan-400">{session.requestedDuration}s</strong>
            </span>
            {isAccepted && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                Agreed: <strong>{session.currentAmount}%</strong> for{' '}
                <strong>{session.currentDuration}s</strong>
              </span>
            )}
            <span
              className={`px-2.5 py-1 rounded-lg border uppercase font-bold ${
                isAccepted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}
            >
              {session.status}
            </span>
          </div>
        </div>

        {/* Turn-by-Turn Dialogue Stream */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2 font-mono text-xs">
          {session.turns.map((turn, idx) => {
            const isControllerSender = turn.sender === 'Central Controller';
            const isControllerReceiver = turn.receiver === 'Central Controller';

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 relative hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-amber-400 border border-slate-700">
                      {turn.round}
                    </span>
                    <span className={isControllerSender ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                      {turn.sender}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className={isControllerReceiver ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                      {turn.receiver}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                      turn.action === 'ACCEPT'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : turn.action === 'COUNTER_OFFER'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : turn.action === 'REJECT'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    {turn.action}
                  </span>
                </div>

                <div className="text-slate-200 text-xs pl-7 leading-relaxed">
                  {turn.comment}
                </div>

                {turn.offeredAmount > 0 && (
                  <div className="mt-2 pl-7 flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Proposed Amount: <strong className="text-amber-400">{turn.offeredAmount}%</strong></span>
                    <span>Duration: <strong className="text-cyan-400">{turn.offeredDuration}s</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
