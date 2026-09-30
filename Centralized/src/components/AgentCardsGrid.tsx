import React from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  Cpu,
  Database,
  HardDrive,
  PlusCircle,
  Radio,
  Send,
  Zap,
} from 'lucide-react';
import { AgentData, ResourceType } from '../core/types';

interface AgentCardsGridProps {
  agents: AgentData[];
  onRequestClick: (agentId: string) => void;
  onInjectLoad: (agentId: string) => void;
}

export const AgentCardsGrid: React.FC<AgentCardsGridProps> = ({
  agents,
  onRequestClick,
  onInjectLoad,
}) => {
  const getResourceColor = (val: number) => {
    if (val >= 85) return 'bg-red-500 text-red-400';
    if (val >= 65) return 'bg-amber-500 text-amber-400';
    if (val >= 40) return 'bg-cyan-500 text-cyan-400';
    return 'bg-emerald-500 text-emerald-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SHARING':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse';
      case 'PROVIDING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'NEGOTIATING':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50 animate-pulse';
      case 'REQUESTING':
      case 'WAITING':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'ACCEPTED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'REJECTED':
      case 'OFFLINE':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            AUTONOMOUS AGENTS (5 ACTIVE NODES)
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Each node manages local workloads & requests aid via Central Master
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {agents.map((agent) => {
          const res = agent.resources;
          const leasedInKeys = Object.keys(agent.leasedIn) as ResourceType[];
          const leasedOutKeys = Object.keys(agent.leasedOut) as ResourceType[];

          return (
            <div
              key={agent.id}
              className="rounded-xl glass-panel border border-slate-800 hover:border-amber-500/40 p-4 transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shadow-md"
                      style={{ backgroundColor: agent.color }}
                    />
                    <h4 className="font-mono font-black text-sm text-white tracking-wide">
                      {agent.name}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                      agent.status
                    )}`}
                  >
                    {agent.status}
                  </span>
                </div>

                {/* Current Task & Status Narrative */}
                <div className="my-2.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>Active Task:</span>
                    <span className="text-amber-400/90 font-semibold">{agent.strategy}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {agent.currentTask}
                  </div>
                  {agent.negotiationStatus && (
                    <div className="text-[10px] text-cyan-300/90 font-mono mt-1 pt-1 border-t border-slate-800/40 truncate">
                      ↳ {agent.negotiationStatus}
                    </div>
                  )}
                </div>

                {/* Resource Utilization Meters */}
                <div className="space-y-2 my-3">
                  {/* CPU */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-cyan-400" /> CPU
                      </span>
                      <span className="font-bold text-slate-200">{res.cpu}%</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          getResourceColor(res.cpu).split(' ')[0]
                        }`}
                        style={{ width: `${res.cpu}%` }}
                      />
                    </div>
                  </div>

                  {/* RAM */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-purple-400" /> RAM
                      </span>
                      <span className="font-bold text-slate-200">{res.ram}%</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          getResourceColor(res.ram).split(' ')[0]
                        }`}
                        style={{ width: `${res.ram}%` }}
                      />
                    </div>
                  </div>

                  {/* Storage */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-amber-400" /> Storage
                      </span>
                      <span className="font-bold text-slate-200">{res.storage}%</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          getResourceColor(res.storage).split(' ')[0]
                        }`}
                        style={{ width: `${res.storage}%` }}
                      />
                    </div>
                  </div>

                  {/* Bandwidth */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-emerald-400" /> Bandwidth
                      </span>
                      <span className="font-bold text-slate-200">{res.bandwidth}%</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          getResourceColor(res.bandwidth).split(' ')[0]
                        }`}
                        style={{ width: `${res.bandwidth}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Leases info tags */}
                {(leasedInKeys.length > 0 || leasedOutKeys.length > 0) && (
                  <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-1 text-[10px] font-mono">
                    {leasedInKeys.map((k) => (
                      <div key={`in-${k}`} className="text-emerald-400 flex items-center gap-1">
                        <ArrowDownLeft className="w-3 h-3" /> Borrowing +{agent.leasedIn[k]}% {k}
                      </div>
                    ))}
                    {leasedOutKeys.map((k) => (
                      <div key={`out-${k}`} className="text-amber-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Lending -{agent.leasedOut[k]}% {k}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5">
                <button
                  onClick={() => onRequestClick(agent.id)}
                  className="flex-1 py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold rounded-lg border border-amber-500/30 flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Send className="w-3 h-3" /> Request
                </button>
                <button
                  onClick={() => onInjectLoad(agent.id)}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] rounded-lg border border-slate-700 flex items-center justify-center gap-1 transition-all active:scale-95"
                  title="Inject sudden workload spike to trigger request"
                >
                  <Zap className="w-3 h-3 text-amber-400" /> Spike
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
