import React from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Percent,
  Radio,
  Scale,
  ShieldAlert,
  Users,
  Zap,
} from 'lucide-react';
import { ControllerMetrics } from '../core/types';

interface StatisticsPanelProps {
  metrics: ControllerMetrics;
  agentCount: number;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ metrics, agentCount }) => {
  const totalAgreements = metrics.successfulNegotiations + metrics.failedNegotiations;
  const successRate = totalAgreements > 0
    ? Math.round((metrics.successfulNegotiations / totalAgreements) * 100)
    : 100;

  return (
    <div className="w-full rounded-2xl glass-panel border border-slate-800 p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            CENTRALIZED TELEMETRY & SYSTEM ANALYTICS
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Real-time Performance Metrics</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Total Agents */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Total Agents</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-black text-white">{agentCount}</div>
          <span className="text-[10px] text-slate-500 font-mono">Agent A to E</span>
        </div>

        {/* Active Requests */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Active Requests</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-black text-cyan-400">{metrics.activeRequests}</div>
          <span className="text-[10px] text-slate-500 font-mono">In Controller Queue</span>
        </div>

        {/* Active Negotiations */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Negotiations</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-black text-amber-400">{metrics.activeNegotiations}</div>
          <span className="text-[10px] text-slate-500 font-mono">Counter-Offers Live</span>
        </div>

        {/* Successful Agreements */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Agreed Deals</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-black text-emerald-400">
            {metrics.successfulNegotiations}
          </div>
          <span className="text-[10px] text-emerald-500/80 font-mono">{successRate}% Success Rate</span>
        </div>

        {/* Failed Agreements */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Failed Deals</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-xl font-mono font-black text-red-400">
            {metrics.failedNegotiations}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">No mutual match</span>
        </div>

        {/* Resources Shared */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Shared Units</span>
            <Percent className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-black text-emerald-300">
            {metrics.totalResourcesShared}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Total Volume</span>
        </div>

        {/* Controller Decisions */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Decisions</span>
            <Scale className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-mono font-black text-purple-300">
            {metrics.totalDecisions}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Optimization runs</span>
        </div>

        {/* Avg Negotiation Time */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>Avg Latency</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-black text-amber-300">
            {(metrics.averageNegotiationTimeMs / 1000).toFixed(1)}s
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Hub roundtrip</span>
        </div>
      </div>
    </div>
  );
};
