import React from 'react';
import type { AgentModel, ResourceType, StrategyType } from '../types';
import {
  Cpu,
  Database,
  HardDrive,
  Wifi,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Settings2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AgentCardProps {
  agent: AgentModel;
  isSelected?: boolean;
  onSelect: (agent: AgentModel) => void;
  onChangeStrategy: (agentId: string, strategy: StrategyType) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isSelected,
  onSelect,
  onChangeStrategy,
}) => {
  const getStatusBadge = () => {
    switch (agent.state) {
      case 'SHARING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 animate-pulse">
            SHARING
          </span>
        );
      case 'NEGOTIATING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
            NEGOTIATING
          </span>
        );
      case 'OFFERING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            OFFERING
          </span>
        );
      case 'REQUESTING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            REQUESTING
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            ACCEPTED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            REJECTED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            IDLE
          </span>
        );
    }
  };

  const renderResourceBar = (type: ResourceType, icon: React.ReactNode) => {
    const data = agent.resources[type];
    const usedPct = Math.min(100, Math.round((data.used / data.capacity) * 100));
    const lockedPct = Math.min(100 - usedPct, Math.round((data.locked / data.capacity) * 100));

    let barColor = 'bg-emerald-500';
    if (usedPct > 80) barColor = 'bg-rose-500';
    else if (usedPct > 60) barColor = 'bg-yellow-500';

    return (
      <div key={type} className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            {icon}
            <span>{type}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className={usedPct > 75 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
              {data.used}{data.unit}
            </span>
            {data.locked > 0 && (
              <span className="text-amber-400 text-[10px]">(+{data.locked} lk)</span>
            )}
            <span className="text-slate-500">/ {data.capacity}{data.unit}</span>
          </div>
        </div>

        {/* Multi-segment visual bar */}
        <div className="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden flex relative border border-slate-700/50">
          {/* Used Segment */}
          <div
            className={`h-full transition-all duration-300 ${barColor}`}
            style={{ width: `${usedPct}%` }}
          />
          {/* Locked Segment */}
          {lockedPct > 0 && (
            <div
              className="h-full bg-amber-400/80 transition-all duration-300 animate-pulse"
              style={{ width: `${lockedPct}%` }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={() => onSelect(agent)}
      className={`rounded-xl p-4 transition-all cursor-pointer glass-panel relative border ${
        isSelected
          ? 'border-yellow-500 ring-1 ring-yellow-500/50 bg-slate-900/90'
          : 'border-slate-800/80 hover:border-yellow-500/40 hover:bg-slate-900/70'
      }`}
    >
      {/* Top Card Bar */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-md"
            style={{
              backgroundColor: `${agent.color}20`,
              color: agent.color,
              border: `1.5px solid ${agent.color}50`,
            }}
          >
            {agent.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-wide">{agent.name}</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {agent.reliabilityScore}% rel
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{agent.role}</p>
          </div>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {/* Resource Bars */}
      <div className="space-y-2.5 my-3 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
        {renderResourceBar('CPU', <Cpu className="w-3.5 h-3.5 text-yellow-400" />)}
        {renderResourceBar('RAM', <Database className="w-3.5 h-3.5 text-cyan-400" />)}
        {renderResourceBar('Storage', <HardDrive className="w-3.5 h-3.5 text-emerald-400" />)}
        {renderResourceBar('Bandwidth', <Wifi className="w-3.5 h-3.5 text-rose-400" />)}
      </div>

      {/* Active Leases Telemetry */}
      {(agent.activeLeasesLent.length > 0 || agent.activeLeasesBorrowed.length > 0) && (
        <div className="mb-3 space-y-1 bg-yellow-500/5 border border-yellow-500/20 p-2 rounded-lg">
          <div className="text-[10px] font-mono font-semibold text-yellow-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Active Leases
          </div>
          {agent.activeLeasesLent.map((lease) => (
            <div key={lease.id} className="text-[10px] font-mono flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-amber-400" />
                Lent {lease.amount}{lease.resourceType}
              </span>
              <span className="bg-amber-500/20 px-1 rounded">{Math.max(0, Math.ceil(lease.remainingTime))}s</span>
            </div>
          ))}
          {agent.activeLeasesBorrowed.map((lease) => (
            <div key={lease.id} className="text-[10px] font-mono flex items-center justify-between text-cyan-300">
              <span className="flex items-center gap-1">
                <ArrowDownLeft className="w-3 h-3 text-cyan-400" />
                Borrowed {lease.amount}{lease.resourceType}
              </span>
              <span className="bg-cyan-500/20 px-1 rounded">{Math.max(0, Math.ceil(lease.remainingTime))}s</span>
            </div>
          ))}
        </div>
      )}

      {/* Strategy selector & Stats Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Settings2 className="w-3 h-3 text-slate-500" />
          <select
            value={agent.strategy}
            onChange={(e) => onChangeStrategy(agent.id, e.target.value as StrategyType)}
            className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-mono text-yellow-300 focus:outline-none focus:border-yellow-500 cursor-pointer"
          >
            <option value="BALANCED">BALANCED</option>
            <option value="GENEROUS">GENEROUS</option>
            <option value="GREEDY">GREEDY</option>
            <option value="CONSERVATIVE">CONSERVATIVE</option>
          </select>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span className="flex items-center gap-0.5 text-emerald-400" title="Successful deals">
            <CheckCircle2 className="w-3 h-3" /> {agent.stats.successfulDeals}
          </span>
          <span className="flex items-center gap-0.5 text-rose-400" title="Rejected deals">
            <XCircle className="w-3 h-3" /> {agent.stats.rejectedDeals}
          </span>
        </div>
      </div>
    </div>
  );
};
