import React from 'react';
import type { NegotiationResult, ResourceRequest } from '../types';
import {
  Handshake,
  X,
  Bot,
  Server
} from 'lucide-react';

interface NegotiationModalProps {
  negotiation: NegotiationResult | null;
  request: ResourceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  negotiation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !negotiation) return null;

  const isAccepted = negotiation.status === 'ACCEPTED' || negotiation.status === 'COUNTER_ACCEPTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-cyber-card border border-purple-500/40 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-glow-purple overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Agent 3 ⇄ Provider Negotiation Protocol
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isAccepted
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}>
                  {negotiation.status}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Target Node: <strong className="text-white">{negotiation.providerName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Round by Round Dialogue */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {negotiation.rounds.map((round) => {
            const isAgent = round.sender === 'Agent-3';
            const isAccept = round.type === 'ACCEPT';
            const isCounter = round.type === 'COUNTER_OFFER';
            const isReject = round.type === 'REJECT';

            return (
              <div
                key={round.roundNumber}
                className={`p-3.5 rounded-xl border transition-all ${
                  isAccept
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : isReject
                    ? 'bg-rose-950/30 border-rose-500/40'
                    : isCounter
                    ? 'bg-purple-950/30 border-purple-500/40'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                {/* Round Header */}
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                      R{round.roundNumber}
                    </span>
                    <span className="font-bold text-white flex items-center gap-1">
                      {isAgent ? <Bot className="w-3.5 h-3.5 text-amber-400" /> : <Server className="w-3.5 h-3.5 text-cyan-400" />}
                      {round.sender}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isAccept ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700' :
                    isReject ? 'bg-rose-900/60 text-rose-300 border-rose-700' :
                    isCounter ? 'bg-purple-900/60 text-purple-300 border-purple-700' :
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {round.type}
                  </span>
                </div>

                {/* Message text */}
                <p className="text-xs font-mono text-slate-200 mb-2 leading-relaxed">
                  {round.message}
                </p>

                {/* Proposed specs & utilities */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Proposed Capacity</span>
                    <span className="text-cyan-300 font-bold">{round.proposedAmount}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Proposed Duration</span>
                    <span className="text-emerald-300 font-bold">{round.proposedDuration}s</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Agent Utility (Uₐ)</span>
                    <span className="text-amber-300 font-bold">{Math.round(round.agentUtility * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Provider Utility (Uₚ)</span>
                    <span className="text-purple-300 font-bold">{Math.round(round.providerUtility * 100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Outcome: <strong className={isAccepted ? 'text-emerald-400' : 'text-rose-400'}>{negotiation.summary}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
