import React from 'react';
import type { GlobalSimulationStats } from '../types';
import {
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Share2,
  Clock,
} from 'lucide-react';

interface StatisticsProps {
  stats: GlobalSimulationStats;
}

export const Statistics: React.FC<StatisticsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Active Agents */}
      <div className="rounded-xl glass-panel p-3.5 border border-yellow-500/20 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Active Agents</span>
          <Users className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono text-white">{stats.activeAgents}</span>
          <span className="text-[10px] text-emerald-400 font-mono">100% P2P</span>
        </div>
      </div>

      {/* Active Negotiations */}
      <div className="rounded-xl glass-panel p-3.5 border border-cyan-500/20 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Active Negotiations</span>
          <MessageSquare className="w-4 h-4 text-cyan-400 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono text-cyan-300">{stats.activeNegotiations}</span>
          <span className="text-[10px] text-slate-400 font-mono">in flight</span>
        </div>
      </div>

      {/* Successful Agreements */}
      <div className="rounded-xl glass-panel p-3.5 border border-emerald-500/20 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Successful Deals</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono text-emerald-400">{stats.successfulAgreements}</span>
          <span className="text-[10px] text-emerald-500/80 font-mono">agreed</span>
        </div>
      </div>

      {/* Failed Negotiations */}
      <div className="rounded-xl glass-panel p-3.5 border border-rose-500/20 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Failed Deals</span>
          <XCircle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono text-rose-400">{stats.failedNegotiations}</span>
          <span className="text-[10px] text-rose-500/80 font-mono">rejected</span>
        </div>
      </div>

      {/* Resources Shared */}
      <div className="rounded-xl glass-panel p-3.5 border border-amber-500/20 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Resources Shared</span>
          <Share2 className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono text-amber-300">{stats.resourcesShared}</span>
          <span className="text-[10px] text-slate-400 font-mono">total units</span>
        </div>
      </div>

      {/* Average Negotiation Time */}
      <div className="rounded-xl glass-panel p-3.5 border border-purple-500/20 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Avg Negot. Latency</span>
          <Clock className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono text-purple-300">
            {stats.averageNegotiationTime}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">sec</span>
        </div>
      </div>
    </div>
  );
};
