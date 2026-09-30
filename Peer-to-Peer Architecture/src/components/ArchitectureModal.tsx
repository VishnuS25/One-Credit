import React from 'react';
import {
  Network,
  X,
  GitFork,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0a0d14] border border-yellow-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Peer-to-Peer Multi-Agent Architecture & Decision Pipeline
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Decentralized MAS Design • Zero Single Point of Failure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
          
          {/* Key Principles Badge Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-yellow-500/20 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
              <div>
                <div className="text-yellow-400 font-bold text-xs">NO CENTRAL CONTROLLER</div>
                <div className="text-[10px] text-slate-400">Pure peer-to-peer mesh topology</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <div>
                <div className="text-cyan-400 font-bold text-xs">DISTRIBUTED DECISIONS</div>
                <div className="text-[10px] text-slate-400">Autonomous strategy-based logic</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-emerald-400 font-bold text-xs">DIRECT P2P COMMS</div>
                <div className="text-[10px] text-slate-400">Bilateral message negotiations</div>
              </div>
            </div>
          </div>

          {/* ASCII Architecture Diagram Box */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-2">
              <GitFork className="w-4 h-4" />
              Decentralized Mesh Topology Diagram
            </h3>
            <div className="p-4 rounded-xl bg-[#04060a] border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <pre className="text-yellow-300/90 leading-tight">
{`┌──────────────┐         P2P Direct Channel        ┌──────────────┐
│   Agent A    │◄─────────────────────────────────►│   Agent B    │
│ [Compute 80%]│                                   │ [Memory 85%] │
└───────┬──────┘                                   └───────┬──────┘
        │   ▲                                         ▲   │
        │   │             Full Mesh Interconnect      │   │
        ▼   │                                         │   ▼
┌───────┴──────┐                                   ┌──────┴───────┐
│   Agent C    │◄─────────────────────────────────►│   Agent D    │
│ [Storage 90%]│         P2P Direct Channel        │[Bandwidth85%]│
└───────┬──────┘                                   └───────┬──────┘
        │                                                  │
        └─────────────────►   Agent E   ◄──────────────────┘
                           [Edge Hybrid]
                   (Zero Central Master Server)`}
              </pre>
            </div>
          </div>

          {/* Autonomous Agent Perception & Decision Pipeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Autonomous Agent Decision Lifecycle
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-center font-mono text-[10px]">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-yellow-400 font-bold">1. Perception</span>
                <span className="text-slate-400 text-[9px] mt-0.5">Detects local load & resource scarcity</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-cyan-400 font-bold">2. Peer Discovery</span>
                <span className="text-slate-400 text-[9px] mt-0.5">Locates best available peer in mesh</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-amber-400 font-bold">3. Evaluation</span>
                <span className="text-slate-400 text-[9px] mt-0.5">Calculates opportunity cost & buffer</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-orange-400 font-bold">4. Negotiation</span>
                <span className="text-slate-400 text-[9px] mt-0.5">Offer / Counter-offer exchange</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-emerald-400 font-bold">5. Allocation</span>
                <span className="text-slate-400 text-[9px] mt-0.5">Converts locked capacity to lease</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                <span className="text-purple-400 font-bold">6. Release</span>
                <span className="text-slate-400 text-[9px] mt-0.5">Auto-expires & returns resources</span>
              </div>
            </div>
          </div>

          {/* AI Integration Abstraction */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Future AI / LLM Integration Architecture
            </h4>
            <p className="text-[11px] text-slate-400">
              The project is structured with strict interface boundaries (<code>NegotiationEngine</code>, <code>DecisionEngine</code>, <code>ResourceManager</code>, <code>SimulationEngine</code>). To connect an external LLM API (e.g. Gemini, OpenAI, Claude), the <code>DecisionEngine</code> can be substituted with an asynchronous backend proxy endpoint without modifying UI or P2P state machines, keeping API keys securely on the server.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-yellow-500 text-slate-950 font-bold text-xs hover:bg-yellow-400 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
