import React from 'react';
import type { ActiveLease } from '../types';
import {
  Clock,
  Unlock,
  Server,
  Zap,
  Radio
} from 'lucide-react';

interface ActiveLeasesPanelProps {
  leases: ActiveLease[];
  onReleaseLease: (leaseId: string) => void;
}

export const ActiveLeasesPanel: React.FC<ActiveLeasesPanelProps> = ({
  leases,
  onReleaseLease,
}) => {
  return (
    <div className="bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Active Resource Leases & Sharing Sessions
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {leases.length} Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Live capacity holds locked by Agent 5. Sessions count down and auto-release back to providers.
            </p>
          </div>
        </div>
      </div>

      {/* Leases List */}
      {leases.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs font-mono">
          No active resource leases. Run the pipeline to allocate capacity.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {leases.map((lease) => {
            const percentRemaining = (lease.remainingSeconds / lease.durationSeconds) * 100;

            return (
              <div
                key={lease.id}
                className="bg-slate-900/80 border border-emerald-500/40 rounded-xl p-3.5 shadow-glow-emerald flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-cyan-400" />
                      {lease.providerName.split(' (')[0]}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" /> RUNNING
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono mb-3">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Requester:</span>
                      <span className="text-white font-semibold">{lease.requester}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Allocated Amount:</span>
                      <span className="text-cyan-300 font-bold">{lease.amount}% {lease.resourceType}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Time Remaining:</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {lease.remainingSeconds}s / {lease.durationSeconds}s
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-1000"
                      style={{ width: `${percentRemaining}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onReleaseLease(lease.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 text-[11px] font-mono transition-colors"
                >
                  <Unlock className="w-3 h-3" /> Release Capacity Early
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
