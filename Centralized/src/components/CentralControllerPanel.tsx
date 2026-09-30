import React from 'react';
import {
  Activity,
  AlertOctagon,
  Award,
  CheckCircle2,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Radio,
  Scale,
  Server,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CentralController } from '../core/CentralController';

interface CentralControllerPanelProps {
  controller: CentralController;
}

export const CentralControllerPanel: React.FC<CentralControllerPanelProps> = ({ controller }) => {
  const metrics = controller.metrics;
  const isOnline = metrics.status === 'ONLINE';

  return (
    <div className="w-full">
      {/* Critical SPOF Warning Banner when OFFLINE */}
      {!isOnline && (
        <div className="mb-6 p-4 rounded-xl glass-panel-danger border-2 border-red-500/80 animate-pulse-slow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/40 text-red-400">
                <AlertOctagon className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-red-300 font-mono tracking-wide">
                  ⚠ CENTRAL CONTROLLER FAILURE (SINGLE POINT OF FAILURE)
                </h3>
                <p className="text-xs sm:text-sm text-red-200/80 font-medium">
                  Resource negotiation unavailable. All 5 agents depend strictly on the Central Controller.
                </p>
                <p className="text-xs text-red-400/90 mt-1 font-mono">
                  All decentralized communications are blocked by design. System is stalled until Controller is restored.
                </p>
              </div>
            </div>
            <button
              onClick={() => controller.restoreController()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-lg shadow-lg shadow-emerald-600/30 tracking-wider whitespace-nowrap active:scale-95 transition-all"
            >
              RESTORE CONTROLLER
            </button>
          </div>
        </div>
      )}

      {/* Main Controller Hub Card */}
      <div className={`p-5 rounded-2xl glass-panel border transition-all duration-500 ${
        isOnline ? 'border-amber-500/30 glow-gold' : 'border-red-500/40 glow-red'
      }`}>
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
              isOnline
                ? 'bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-transparent border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-red-500/20 border-red-500/50 shadow-md shadow-red-500/20'
            }`}>
              <Server className={`w-7 h-7 ${isOnline ? 'text-amber-400' : 'text-red-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-mono tracking-tight">
                  CENTRAL CONTROLLER
                </h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                  isOnline
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
                  {metrics.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Master Node • Centralized Mediation & Resource Orchestrator
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Active Requests</span>
              <span className="text-sm font-mono font-bold text-cyan-400">{metrics.activeRequests}</span>
            </div>
            <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Active Negotiations</span>
              <span className="text-sm font-mono font-bold text-amber-400">{metrics.activeNegotiations}</span>
            </div>
            <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Allocations Live</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{metrics.resourcesAllocatedCount}</span>
            </div>
            <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Decisions Made</span>
              <span className="text-sm font-mono font-bold text-purple-400">{metrics.totalDecisions}</span>
            </div>
          </div>
        </div>

        {/* 6 Sub-Managers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          {/* 1. Resource Manager */}
          <div className="bg-[#0c1324]/80 p-3.5 rounded-xl border border-slate-800/80 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-slate-200 font-mono">Resource Manager</h4>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {controller.agents.size} Registered
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Maintains global capacity registry of CPU, RAM, Storage & Bandwidth for all 5 agents.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Sync Status:</span>
              <span className={isOnline ? 'text-emerald-400' : 'text-red-400'}>
                {isOnline ? 'REAL-TIME 100%' : 'DISCONNECTED'}
              </span>
            </div>
          </div>

          {/* 2. Request Manager */}
          <div className="bg-[#0c1324]/80 p-3.5 rounded-xl border border-slate-800/80 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200 font-mono">Request Manager</h4>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
                Queue: {controller.requestQueue.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Receives, validates, priority-sorts, and dispatches incoming resource demands from agents.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Priority Logic:</span>
              <span className="text-cyan-300">CRITICAL ➜ HIGH ➜ MED</span>
            </div>
          </div>

          {/* 3. Decision Engine */}
          <div className="bg-[#0c1324]/80 p-3.5 rounded-xl border border-slate-800/80 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-slate-200 font-mono">Decision Engine</h4>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono border border-purple-500/30">
                Multi-Criteria
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Evaluates available providers via spare capacity, reliability factor, and system load balancing.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Scoring Factors:</span>
              <span className="text-purple-300">Capacity + Reliability + Load</span>
            </div>
          </div>

          {/* 4. Negotiation Manager */}
          <div className="bg-[#0c1324]/80 p-3.5 rounded-xl border border-slate-800/80 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-slate-200 font-mono">Negotiation Manager</h4>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/30">
                Counter-Offers Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Acts as proxy intermediary between requester and candidate. Generates & reconciles counter-proposals.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Agreements / Fails:</span>
              <span className="text-amber-300 font-bold">
                {metrics.successfulNegotiations} / {metrics.failedNegotiations}
              </span>
            </div>
          </div>

          {/* 5. Allocation Manager */}
          <div className="bg-[#0c1324]/80 p-3.5 rounded-xl border border-slate-800/80 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 font-mono">Allocation Manager</h4>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/30">
                TTL Leases
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Locks provider capacity, provisions virtual lease tokens, and auto-releases resources upon expiry.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Total Units Shared:</span>
              <span className="text-emerald-300 font-bold">{metrics.totalResourcesShared}% Units</span>
            </div>
          </div>

          {/* 6. Monitoring Manager */}
          <div className="bg-[#0c1324]/80 p-3.5 rounded-xl border border-slate-800/80 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-slate-200 font-mono">Monitoring Manager</h4>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono border border-blue-500/30">
                Telemetry Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Continuous heartbeat tracking, latency benchmarks, event logs, and single point of failure alarms.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>SPOF Incidents:</span>
              <span className="text-red-400 font-bold">{metrics.spofIncidents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
