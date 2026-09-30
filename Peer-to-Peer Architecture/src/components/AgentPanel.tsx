import React from 'react';
import type { AgentModel, StrategyType } from '../types';
import { AgentCard } from './AgentCard';
import { Users } from 'lucide-react';

interface AgentPanelProps {
  agents: AgentModel[];
  selectedAgentId?: string;
  onSelectAgent: (agent: AgentModel) => void;
  onChangeStrategy: (agentId: string, strategy: StrategyType) => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onChangeStrategy,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-yellow-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Autonomous Peer Agents ({agents.length})
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Independent State Machines & Resource Managers
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={selectedAgentId === agent.id}
            onSelect={onSelectAgent}
            onChangeStrategy={onChangeStrategy}
          />
        ))}
      </div>
    </div>
  );
};
