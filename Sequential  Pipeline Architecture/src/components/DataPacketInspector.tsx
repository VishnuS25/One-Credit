import React, { useState } from 'react';
import type { PipelineDataPacket } from '../types';
import {
  FileJson,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  CornerDownRight
} from 'lucide-react';

interface DataPacketInspectorProps {
  activePacket: PipelineDataPacket | null;
}

export const DataPacketInspector: React.FC<DataPacketInspectorProps> = ({ activePacket }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');

  const handleCopy = () => {
    if (!activePacket) return;
    navigator.clipboard.writeText(JSON.stringify(activePacket, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activePacket) {
    return (
      <div className="bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[360px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
          <FileJson className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-300">Data Packet Inspector Inactive</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Launch a pipeline request to observe the JSON data token as it is enriched and mutated across each specialized agent stage.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl p-5 shadow-2xl flex flex-col h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileJson className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Pipeline Data Token Inspector
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                {activePacket.currentStage.toUpperCase()}
              </span>
            </h3>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('structured')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                viewMode === 'structured'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Visual Flow
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                viewMode === 'raw'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw JSON
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy Raw JSON"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto max-h-[460px] custom-scrollbar mt-3 space-y-3 pr-1">
        {viewMode === 'raw' ? (
          <pre className="text-[11px] font-mono p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-amber-300/90 overflow-x-auto">
            {JSON.stringify(activePacket, null, 2)}
          </pre>
        ) : (
          <>
            {/* Step 0: Request Ingestion */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5" /> 0. RESOURCE_REQUEST (Input Token)
                </span>
                <span className="text-[10px] text-slate-500">ID: {activePacket.request.id}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">Requester</span>
                  <span className="text-white font-semibold">{activePacket.request.requester}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">Resource Demand</span>
                  <span className="text-cyan-300 font-semibold">{activePacket.request.requiredAmount}% {activePacket.request.resourceType}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">Duration</span>
                  <span className="text-emerald-300 font-semibold">{activePacket.request.durationSeconds} seconds</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">Priority Level</span>
                  <span className={`font-semibold ${
                    activePacket.request.priority === 'CRITICAL' ? 'text-rose-400' :
                    activePacket.request.priority === 'HIGH' ? 'text-amber-400' : 'text-slate-300'
                  }`}>
                    {activePacket.request.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 1 Discovery Result */}
            {activePacket.discoveryResult && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-amber-500/20">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> 1. DISCOVERY_RESULT (from Agent 1)
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-semibold">
                    {activePacket.discoveryResult.candidates.filter((c) => c.meetsRequirement).length} Viable Found
                  </span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  {activePacket.discoveryResult.candidates.map((cand) => (
                    <div
                      key={cand.providerId}
                      className={`flex items-center justify-between p-1.5 px-2 rounded ${
                        cand.meetsRequirement
                          ? 'bg-slate-950/80 border border-slate-800 text-slate-200'
                          : 'bg-slate-950/40 border border-slate-900 text-slate-600'
                      }`}
                    >
                      <span className="font-semibold">{cand.providerName}</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span>Avail: <strong className={cand.meetsRequirement ? 'text-cyan-400' : 'text-slate-500'}>{cand.availablePercent}%</strong></span>
                        <span>Load: {cand.currentWorkload}%</span>
                        <span>{cand.meetsRequirement ? '✓ Eligible' : '✕ Insufficient'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stage 2 Evaluation Result */}
            {activePacket.evaluationResult && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-cyan-500/20">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> 2. EVALUATION_RESULT (from Agent 2)
                  </span>
                  <span className="text-[10px] text-cyan-400/90 font-semibold">
                    Best: {activePacket.evaluationResult.selectedProvider?.providerName}
                  </span>
                </div>
                <div className="space-y-1 text-xs font-mono">
                  {activePacket.evaluationResult.rankedProviders.slice(0, 3).map((item) => (
                    <div
                      key={item.providerId}
                      className={`flex items-center justify-between p-1.5 px-2.5 rounded ${
                        item.rank === 1
                          ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-200'
                          : 'bg-slate-950/60 border border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                          #{item.rank}
                        </span>
                        <span className="font-semibold">{item.providerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 font-bold">Score: {item.suitabilityScore}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stage 3 Negotiation Result */}
            {activePacket.negotiationResult && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-purple-500/20">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 3. NEGOTIATION_RESULT (from Agent 3)
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    activePacket.negotiationResult.status === 'ACCEPTED' || activePacket.negotiationResult.status === 'COUNTER_ACCEPTED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {activePacket.negotiationResult.status}
                  </span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800/80 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Target Provider:</span>
                    <span className="text-white font-semibold">{activePacket.negotiationResult.providerName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Agreed Capacity:</span>
                    <span className="text-cyan-400 font-semibold">{activePacket.negotiationResult.agreedAmount}% {activePacket.request.resourceType}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Agreed Duration:</span>
                    <span className="text-emerald-400 font-semibold">{activePacket.negotiationResult.agreedDuration} seconds</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Bargaining Rounds:</span>
                    <span className="text-purple-400 font-semibold">{activePacket.negotiationResult.rounds.length} rounds completed</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 4 Decision Result */}
            {activePacket.decisionResult && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-amber-500/20">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> 4. FORMAL_DECISION (from Agent 4)
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    activePacket.decisionResult.decision === 'ACCEPT'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    DECISION: {activePacket.decisionResult.decision}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300 bg-slate-950/80 p-2 rounded border border-slate-800">
                  {activePacket.decisionResult.reason}
                </p>
              </div>
            )}

            {/* Stage 5 Allocation Result */}
            {activePacket.allocationResult && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-emerald-500/30 shadow-glow-emerald">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 5. ALLOCATION_RESULT (from Agent 5)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    STATUS: {activePacket.allocationResult.status}
                  </span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lease Handle:</span>
                    <span className="text-amber-300 font-semibold">{activePacket.allocationResult.leaseId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Provider Locked:</span>
                    <span className="text-white font-semibold">{activePacket.allocationResult.providerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Committed Amount:</span>
                    <span className="text-emerald-400 font-semibold">{activePacket.allocationResult.allocatedAmount}% {activePacket.request.resourceType}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Interruption / Termination Notice if Halted */}
            {activePacket.isTerminated && (
              <div className="p-3 bg-rose-950/50 rounded-xl border border-rose-500/40 text-xs font-mono">
                <div className="flex items-center gap-2 text-rose-300 font-bold mb-1">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  PIPELINE HALTED / UNABLE TO PROCEED
                </div>
                <p className="text-rose-200/90 mt-1">{activePacket.terminationReason}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
