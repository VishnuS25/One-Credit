import React from 'react';
import type { PipelineAgentInfo, AgentId } from '../types';
import {
  Search,
  BarChart3,
  Handshake,
  CheckCircle2,
  Cpu,
  AlertTriangle,
  RotateCcw,
  Zap,
  ShieldAlert,
  Bot
} from 'lucide-react';

interface AgentDashboardProps {
  agents: PipelineAgentInfo[];
  onToggleFailure: (agentId: AgentId) => void;
  onRestoreAgent: (agentId: AgentId) => void;
  onSelectAgent: (agentId: AgentId) => void;
  selectedAgentId?: AgentId | null;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  'agent-1': <Search className="w-5 h-5" />,
  'agent-2': <BarChart3 className="w-5 h-5" />,
  'agent-3': <Handshake className="w-5 h-5" />,
  'agent-4': <CheckCircle2 className="w-5 h-5" />,
  'agent-5': <Cpu className="w-5 h-5" />,
};

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  agents,
  onToggleFailure,
  onRestoreAgent,
  onSelectAgent,
  selectedAgentId,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Pipeline Agent Fleet (5 Specialized Nodes)</h3>
            <p className="text-xs text-slate-400">
              Each autonomous agent specializes in one pipeline phase. Fail any node to observe sequential disruption.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 5 Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          const isProcessing = agent.status === 'PROCESSING';
          const isFailed = agent.isFailed;

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`bg-cyber-card/80 backdrop-blur-xl border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                isFailed
                  ? 'border-rose-500/80 bg-rose-950/20 shadow-glow-rose'
                  : isProcessing
                  ? 'border-amber-400 bg-amber-950/20 shadow-glow-gold ring-1 ring-amber-400/40'
                  : 'border-cyber-border hover:border-slate-700'
              } ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
            >
              {/* Top Row: Icon, Stage #, Status badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white border"
                      style={{
                        backgroundColor: isFailed ? '#881337' : `${agent.color}20`,
                        borderColor: isFailed ? '#f43f5e' : `${agent.color}60`,
                        color: isFailed ? '#fda4af' : agent.color,
                      }}
                    >
                      {isFailed ? <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" /> : AGENT_ICONS[agent.id]}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                        Stage {agent.stageNumber}
                      </span>
                      <h4 className="text-xs font-bold text-white tracking-tight leading-tight">
                        {agent.name}
                      </h4>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isFailed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                        FAILED
                      </span>
                    ) : isProcessing ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        <Zap className="w-2.5 h-2.5" /> ACTIVE
                      </span>
                    ) : agent.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        DONE
                      </span>
                    ) : agent.status === 'WAITING' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        WAITING
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                        IDLE
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtitle / Role */}
                <p className="text-[11px] font-semibold text-slate-300 line-clamp-1 mb-1">
                  {agent.title}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {agent.description}
                </p>

                {/* Live Task Description ticker */}
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 mb-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Current Task</span>
                  <p className="text-[11px] font-mono text-amber-300/90 truncate mt-0.5">
                    {agent.currentTaskDescription}
                  </p>
                </div>

                {/* Agent Performance Metrics */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono mb-3">
                  <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block">Processed</span>
                    <span className="text-white font-bold">{agent.requestsProcessed}</span>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block">Success Ops</span>
                    <span className="text-emerald-400 font-bold">{agent.successfulOperations}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Simulate Failure / Restore Agent */}
              <div className="pt-2 border-t border-slate-800/80 mt-auto">
                {isFailed ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestoreAgent(agent.id);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold transition-all shadow-glow-emerald"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> RESTORE AGENT
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFailure(agent.id);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 text-[11px] font-mono transition-all"
                  >
                    <ShieldAlert className="w-3 h-3 text-rose-400" /> Simulate Failure
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
