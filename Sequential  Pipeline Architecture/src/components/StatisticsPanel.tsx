import React from 'react';
import type { PipelineStats } from '../types';
import {
  CheckCircle,
  XCircle,
  Handshake,
  Clock,
  Cpu,
  TrendingUp,
  Activity
} from 'lucide-react';

interface StatisticsPanelProps {
  stats: PipelineStats;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats }) => {
  const successRate = stats.totalRequests > 0
    ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
    : 100;

  const negotiationSuccessRate = (stats.successfulNegotiations + stats.failedNegotiations) > 0
    ? Math.round((stats.successfulNegotiations / (stats.successfulNegotiations + stats.failedNegotiations)) * 100)
    : 100;

  return (
    <div className="bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">MAS Telemetry & System Statistics</h3>
            <p className="text-[11px] text-slate-400">Aggregate throughput, bargaining yield, and resource utilization counters.</p>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Requests */}
        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono mb-1">
            <span>TOTAL RUNS</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{stats.totalRequests}</div>
          <span className="text-[10px] text-slate-500 font-mono">Sequential pipelines</span>
        </div>

        {/* Completed */}
        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono mb-1">
            <span>COMPLETED</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{stats.completedRequests}</div>
          <span className="text-[10px] text-emerald-500/80 font-mono">{successRate}% Yield</span>
        </div>

        {/* Failed */}
        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono mb-1">
            <span>FAILED / HALTED</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">{stats.failedRequests}</div>
          <span className="text-[10px] text-rose-500/80 font-mono">Stage interrupts</span>
        </div>

        {/* Negotiations Success */}
        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono mb-1">
            <span>NEGOTIATIONS</span>
            <Handshake className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300">{stats.successfulNegotiations}</div>
          <span className="text-[10px] text-purple-400/80 font-mono">{negotiationSuccessRate}% agreed</span>
        </div>

        {/* Avg Pipeline Time */}
        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono mb-1">
            <span>AVG PIPELINE</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300">4.2s</div>
          <span className="text-[10px] text-slate-500 font-mono">5-stage transit</span>
        </div>

        {/* Avg Negotiation Time */}
        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono mb-1">
            <span>AVG BARGAIN</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">1.4s</div>
          <span className="text-[10px] text-slate-500 font-mono">Iterative rounds</span>
        </div>

        {/* Total Allocated Units */}
        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono mb-1">
            <span>ALLOCATED</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">{stats.totalResourcesAllocatedUnits}%</div>
          <span className="text-[10px] text-slate-500 font-mono">Gross capacity units</span>
        </div>
      </div>
    </div>
  );
};
