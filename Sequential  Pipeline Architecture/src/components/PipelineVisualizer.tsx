import React from 'react';
import type {
  PipelineDataPacket,
  PipelineAgentInfo,
  AgentId
} from '../types';
import {
  Search,
  BarChart3,
  Handshake,
  CheckCircle2,
  Cpu,
  Check,
  Zap,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

interface PipelineVisualizerProps {
  agents: PipelineAgentInfo[];
  activePacket: PipelineDataPacket | null;
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

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  agents,
  activePacket,
  onSelectAgent,
  selectedAgentId,
}) => {
  const currentStage = activePacket?.currentStage || 'IDLE';

  // Determine stage status
  const getStageStatus = (agentId: AgentId, _index: number) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent?.isFailed) return 'FAILED';

    if (!activePacket) return 'IDLE';
    if (activePacket.currentStage === 'HALTED') {
      const failedAgent = agents.find((a) => a.isFailed);
      if (failedAgent && failedAgent.id === agentId) return 'FAILED';
      // Check if downstream
      const stageIndex = agents.findIndex((a) => a.id === agentId);
      const failedIndex = agents.findIndex((a) => a.id === failedAgent?.id);
      if (stageIndex > failedIndex) return 'STARVED';
      if (stageIndex < failedIndex) return 'COMPLETED';
      return 'FAILED';
    }

    if (activePacket.currentStage === 'COMPLETED') return 'COMPLETED';
    if (activePacket.currentStage === agentId) return 'PROCESSING';

    const stageOrder: AgentId[] = ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'];
    const currentIdx = stageOrder.indexOf(activePacket.currentStage as AgentId);
    const thisIdx = stageOrder.indexOf(agentId);

    if (currentIdx !== -1) {
      if (thisIdx < currentIdx) return 'COMPLETED';
      if (thisIdx > currentIdx) return 'WAITING';
    }

    return 'IDLE';
  };

  return (
    <div className="bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl p-5 lg:p-6 shadow-2xl relative overflow-hidden">
      {/* Background glow lines */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-cyan-500/5 to-emerald-500/5 pointer-events-none" />

      {/* Title & Architecture Rule Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
              Live Sequential Pipeline Flow
              {activePacket && (
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ID: {activePacket.id.substring(0, 16)}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Strict unidirectional token passing — No bypass, no skips, no central coordinator.
            </p>
          </div>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2">
          {activePacket ? (
            <div className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-2 border ${
              activePacket.currentStage === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : activePacket.currentStage === 'HALTED'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-gold'
            }`}>
              {activePacket.currentStage === 'COMPLETED' ? (
                <>
                  <Check className="w-3.5 h-3.5" /> PIPELINE COMPLETED
                </>
              ) : activePacket.currentStage === 'HALTED' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" /> PIPELINE INTERRUPTED
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 animate-bounce" /> STAGE ACTIVE: {activePacket.currentStage.toUpperCase()}
                </>
              )}
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full text-xs font-mono bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> PIPELINE IDLE
            </div>
          )}
        </div>
      </div>

      {/* Main Flow Canvas */}
      <div className="relative py-6 px-2 overflow-x-auto">
        <div className="min-w-[860px] flex items-center justify-between gap-2 relative">
          {/* Request Origin Node */}
          <div className="flex flex-col items-center min-w-[100px] z-10">
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${
              activePacket
                ? 'bg-slate-800 text-white border-amber-400 shadow-glow-gold'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              <Sparkles className={`w-5 h-5 ${activePacket ? 'text-amber-400 animate-spin' : ''}`} />
              <span className="text-[10px] font-mono font-bold mt-1">REQUEST</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-2 text-center truncate max-w-[100px]">
              {activePacket ? `${activePacket.request.requiredAmount}% ${activePacket.request.resourceType}` : 'Ready'}
            </span>
          </div>

          {/* Connectors & 5 Agent Stages */}
          {agents.map((agent, index) => {
            const status = getStageStatus(agent.id, index);
            const isCurrent = activePacket?.currentStage === agent.id;
            const isSelected = selectedAgentId === agent.id;

            return (
              <React.Fragment key={agent.id}>
                {/* Connecting Bus / Conduit with animated flow particles */}
                <div className="flex-1 flex flex-col items-center relative mx-1">
                  <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 relative overflow-hidden">
                    {/* Animated flow bar */}
                    {status === 'PROCESSING' || (status === 'COMPLETED' && activePacket) ? (
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${
                          status === 'PROCESSING'
                            ? 'from-transparent via-amber-400 to-amber-500 animate-shimmer'
                            : 'from-emerald-500/40 via-emerald-400 to-emerald-500'
                        }`}
                        style={{ width: '100%' }}
                      />
                    ) : status === 'FAILED' || status === 'STARVED' ? (
                      <div className="absolute inset-0 bg-rose-500/20" />
                    ) : null}
                  </div>
                  {/* Directional arrow icon */}
                  <div className="text-[10px] text-slate-600 mt-1 flex items-center font-mono">
                    <ArrowRight className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-400 animate-pulse' : 'text-slate-700'}`} />
                  </div>
                </div>

                {/* Agent Stage Node */}
                <div
                  onClick={() => onSelectAgent(agent.id)}
                  className={`flex flex-col items-center min-w-[130px] cursor-pointer group transition-all duration-300 z-10`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center relative border transition-all duration-300 ${
                      status === 'FAILED'
                        ? 'bg-rose-950/70 border-rose-500 text-rose-400 shadow-glow-rose scale-105 animate-pulse'
                        : status === 'PROCESSING'
                        ? 'bg-amber-950/60 border-amber-400 text-amber-300 shadow-glow-gold scale-110 ring-4 ring-amber-400/20'
                        : status === 'COMPLETED'
                        ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-glow-emerald'
                        : status === 'STARVED'
                        ? 'bg-slate-950 border-rose-900/50 text-slate-600 border-dashed'
                        : 'bg-slate-900/90 border-slate-800 text-slate-400 group-hover:border-slate-700 group-hover:text-slate-200'
                    } ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950' : ''}`}
                  >
                    {/* Stage number badge */}
                    <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 font-mono text-[10px] font-bold text-slate-300 flex items-center justify-center">
                      {agent.stageNumber}
                    </span>

                    {/* Agent Icon */}
                    <div className="relative">
                      {status === 'FAILED' ? (
                        <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" />
                      ) : (
                        AGENT_ICONS[agent.id]
                      )}
                    </div>

                    <span className="text-[10px] font-mono font-bold mt-1 uppercase tracking-wider">
                      {agent.id.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Stage Label & Status text */}
                  <div className="mt-2.5 text-center">
                    <div className="text-xs font-semibold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                      {agent.title.replace(' Agent', '')}
                    </div>

                    {/* Dynamic Status badge */}
                    <div className="mt-1 flex justify-center">
                      {status === 'PROCESSING' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          ⚡ PROCESSING
                        </span>
                      )}
                      {status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ✓ COMPLETED
                        </span>
                      )}
                      {status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          ❌ FAILED
                        </span>
                      )}
                      {status === 'STARVED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-rose-400/80 border border-rose-900/40">
                          ⏸ STARVED
                        </span>
                      )}
                      {status === 'WAITING' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                          ○ WAITING
                        </span>
                      )}
                      {status === 'IDLE' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                          IDLE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Completed End Node */}
          <div className="flex-1 flex flex-col items-center relative mx-1">
            <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 relative overflow-hidden">
              {activePacket?.currentStage === 'COMPLETED' && (
                <div className="absolute inset-0 bg-emerald-500 animate-shimmer" />
              )}
            </div>
            <div className="text-[10px] text-slate-600 mt-1 flex items-center font-mono">
              <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[100px] z-10">
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${
              activePacket?.currentStage === 'COMPLETED'
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-glow-emerald'
                : activePacket?.currentStage === 'HALTED'
                ? 'bg-rose-950 border-rose-600 text-rose-400'
                : 'bg-slate-900 text-slate-600 border-slate-800'
            }`}>
              {activePacket?.currentStage === 'COMPLETED' ? (
                <Check className="w-6 h-6 text-emerald-400 animate-bounce" />
              ) : activePacket?.currentStage === 'HALTED' ? (
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              <span className="text-[9px] font-mono font-bold mt-0.5">
                {activePacket?.currentStage === 'COMPLETED' ? 'ALLOCATED' : activePacket?.currentStage === 'HALTED' ? 'HALTED' : 'FINISH'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-2 text-center">
              {activePacket?.currentStage === 'COMPLETED' ? '✓ Active Session' : 'Pipeline End'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Data Transmission summary bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Stage Handshake Rule:</span>
          <span className="text-slate-300 font-semibold">Agent N output becomes Agent (N+1) direct input</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500">Pipeline Protocol: <strong className="text-amber-400">Fixed Sequential MAS</strong></span>
          <span className="text-slate-500">State: <strong className="text-cyan-400">{currentStage.toUpperCase()}</strong></span>
        </div>
      </div>
    </div>
  );
};
