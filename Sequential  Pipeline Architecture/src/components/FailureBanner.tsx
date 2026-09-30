import React from 'react';
import type { PipelineAgentInfo, AgentId } from '../types';
import { RotateCcw, ShieldAlert } from 'lucide-react';

interface FailureBannerProps {
  failedAgent: PipelineAgentInfo | null;
  onRestoreAgent: (agentId: AgentId) => void;
}

export const FailureBanner: React.FC<FailureBannerProps> = ({
  failedAgent,
  onRestoreAgent,
}) => {
  if (!failedAgent) return null;

  return (
    <div className="bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border-2 border-rose-500 rounded-2xl p-4 sm:p-5 shadow-glow-rose text-white relative overflow-hidden animate-pulse">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500 text-black">
                PIPELINE STALL CRITICAL
              </span>
              <h3 className="text-base font-bold text-white">
                {failedAgent.name} ({failedAgent.title}) is Offline / Interrupted
              </h3>
            </div>
            <p className="text-xs text-rose-200/90 mt-1 max-w-2xl">
              <strong>Sequential Pipeline Fragility Demonstrated:</strong> Because execution follows a strict linear sequence without a central orchestrator or alternate routing, failure at Stage {failedAgent.stageNumber} starves all downstream stages (Stages {failedAgent.stageNumber + 1}–5).
            </p>
          </div>
        </div>

        <button
          onClick={() => onRestoreAgent(failedAgent.id)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs shadow-glow-emerald transition-all whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" />
          RESTORE {failedAgent.name.toUpperCase()}
        </button>
      </div>
    </div>
  );
};
