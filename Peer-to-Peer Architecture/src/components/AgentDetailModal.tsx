import React from 'react';
import type { AgentModel, StrategyType, ResourceType } from '../types';
import {
  X,
  Cpu,
  Database,
  HardDrive,
  Wifi,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
} from 'lucide-react';

interface AgentDetailModalProps {
  agent: AgentModel | null;
  onClose: () => void;
  onChangeStrategy: (agentId: string, strategy: StrategyType) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onChangeStrategy,
}) => {
  if (!agent) return null;

  const renderResourceDetails = (type: ResourceType, icon: React.ReactNode) => {
    const data = agent.resources[type];
    const usedPct = Math.round((data.used / data.capacity) * 100);
    const lockedPct = Math.round((data.locked / data.capacity) * 100);
    const available = Math.max(0, data.capacity - (data.used + data.locked));

    return (
      <div key={type} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            {icon}
            <span>{type}</span>
          </div>
          <span className="font-mono text-yellow-400 font-bold">
            {data.used} / {data.capacity} {data.unit}
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
          <div
            className={`h-full ${
              usedPct > 80 ? 'bg-rose-500' : usedPct > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${usedPct}%` }}
          />
          {lockedPct > 0 && (
            <div
              className="h-full bg-amber-400/80 animate-pulse"
              style={{ width: `${lockedPct}%` }}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Available: <strong className="text-emerald-400">{available}{data.unit}</strong></span>
          {data.locked > 0 && (
            <span>Locked: <strong className="text-amber-400">{data.locked}{data.unit}</strong></span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0a0d14] border border-yellow-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg"
              style={{
                backgroundColor: `${agent.color}20`,
                color: agent.color,
                border: `2px solid ${agent.color}60`,
              }}
            >
              {agent.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{agent.name} Telemetry Node</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {agent.reliabilityScore}% Reliability
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{agent.role} • Current State: <strong className="text-yellow-400">{agent.state}</strong></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] text-xs">
          
          {/* Strategy Selection */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-yellow-400" />
                Negotiation Strategy & Decision Policy
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Controls barter compensation requirements, safety margins, and counter-offer thresholds.
              </div>
            </div>

            <select
              value={agent.strategy}
              onChange={(e) => onChangeStrategy(agent.id, e.target.value as StrategyType)}
              className="bg-slate-950 border border-yellow-500/40 rounded-lg px-3 py-1.5 text-xs font-mono text-yellow-300 focus:outline-none focus:border-yellow-400 font-bold"
            >
              <option value="BALANCED">BALANCED</option>
              <option value="GENEROUS">GENEROUS</option>
              <option value="GREEDY">GREEDY</option>
              <option value="CONSERVATIVE">CONSERVATIVE</option>
            </select>
          </div>

          {/* Resource Meters */}
          <div>
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2.5">
              Live Resource Capacity & Utilization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderResourceDetails('CPU', <Cpu className="w-4 h-4 text-yellow-400" />)}
              {renderResourceDetails('RAM', <Database className="w-4 h-4 text-cyan-400" />)}
              {renderResourceDetails('Storage', <HardDrive className="w-4 h-4 text-emerald-400" />)}
              {renderResourceDetails('Bandwidth', <Wifi className="w-4 h-4 text-rose-400" />)}
            </div>
          </div>

          {/* Active Leases */}
          <div>
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              Active Bilateral Leases ({agent.activeLeasesLent.length + agent.activeLeasesBorrowed.length})
            </h3>
            {agent.activeLeasesLent.length === 0 && agent.activeLeasesBorrowed.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-center text-slate-500 text-xs">
                No active leases currently held by this peer.
              </div>
            ) : (
              <div className="space-y-2">
                {agent.activeLeasesLent.map((lease) => (
                  <div
                    key={lease.id}
                    className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-amber-300 font-bold">Lent {lease.amount}{lease.resourceType}</span>
                        <span className="text-slate-400 text-[10px] block">To Peer: {lease.requesterId}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400">{Math.max(0, Math.ceil(lease.remainingTime))}s remaining</span>
                      <span className="text-[10px] text-slate-500 block">Duration: {lease.duration}s</span>
                    </div>
                  </div>
                ))}

                {agent.activeLeasesBorrowed.map((lease) => (
                  <div
                    key={lease.id}
                    className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="text-cyan-300 font-bold">Borrowed {lease.amount}{lease.resourceType}</span>
                        <span className="text-slate-400 text-[10px] block">From Peer: {lease.providerId}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-cyan-400">{Math.max(0, Math.ceil(lease.remainingTime))}s remaining</span>
                      <span className="text-[10px] text-slate-500 block">Duration: {lease.duration}s</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agent Historical Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Requests Sent</span>
              <span className="text-base font-bold text-slate-200">{agent.stats.requestsInitiated}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Requests Received</span>
              <span className="text-base font-bold text-slate-200">{agent.stats.requestsReceived}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Deals Agreed</span>
              <span className="text-base font-bold text-emerald-400">{agent.stats.successfulDeals}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Deals Rejected</span>
              <span className="text-base font-bold text-rose-400">{agent.stats.rejectedDeals}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
