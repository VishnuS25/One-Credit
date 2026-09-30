import React from 'react';
import {
  BookOpen,
  Workflow,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  AlertTriangle
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">
            MAS Architecture Deep-Dive: Sequential Pipeline Architecture
          </h3>
          <p className="text-xs text-slate-400">
            Theoretical principles, stage-to-stage data flow, and comparative analysis of Multi-Agent System architectures.
          </p>
        </div>
      </div>

      {/* 6 Core Architectural Principles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Sequential Processing */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
            <Workflow className="w-4 h-4" /> 1. Sequential Processing
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Execution proceeds in a strictly ordered, deterministic pipeline: Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5. No agent executes out of order or bypasses intermediary stages.
          </p>
        </div>

        {/* 2. Specialized Agents */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
            <Cpu className="w-4 h-4" /> 2. Specialized Agents
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Each agent maintains high cohesion and single responsibility: Discovery scans pools, Evaluation ranks vectors, Negotiation bargains terms, Decision validates SLAs, and Allocation commits leases.
          </p>
        </div>

        {/* 3. Data Flow Token Passing */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold">
            <Layers className="w-4 h-4" /> 3. Data Flow Enrichment
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The output token of Agent <em>N</em> becomes the direct immutable input payload for Agent <em>N+1</em>. State evolves progressively without a shared global mutator.
          </p>
        </div>

        {/* 4. No Central Controller */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4" /> 4. Decentralized Handoff
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            There is no master controller dispatching subtasks or polling agents. Each agent autonomously processes its batch and invokes the next downstream peer upon completion.
          </p>
        </div>

        {/* 5. Stage Dependency */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-bold">
            <Zap className="w-4 h-4" /> 5. Strict Inter-Stage Dependency
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every downstream stage fundamentally requires the processed output of all upstream stages. Agent 4 cannot make an SLA decision without Agent 3's negotiation contract.
          </p>
        </div>

        {/* 6. Failure Propagation */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
            <AlertTriangle className="w-4 h-4" /> 6. Failure Propagation (Bottleneck)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The defining trade-off of pipeline architectures: an unhandled failure or delay at any single stage instantly stalls all downstream nodes due to lack of token delivery.
          </p>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Architecture Comparison Matrix
        </h4>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-3">Architectural Dimension</th>
                <th className="p-3 text-amber-400 bg-amber-950/20">Sequential / Pipeline</th>
                <th className="p-3 text-slate-400">Centralized (Master-Worker)</th>
                <th className="p-3 text-slate-400">Peer-to-Peer (Decentralized)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/50 text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-white">Central Controller</td>
                <td className="p-3 text-emerald-400 font-bold bg-amber-950/10">❌ No (Autonomous Handshake)</td>
                <td className="p-3 text-slate-400">✅ Yes (Master Orchestrator)</td>
                <td className="p-3 text-slate-400">❌ No (Fully Distributed)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Processing Flow</td>
                <td className="p-3 text-amber-400 font-bold bg-amber-950/10">Sequential (Stage-by-Stage)</td>
                <td className="p-3 text-slate-400">Hub & Spoke / Directed</td>
                <td className="p-3 text-slate-400">Mesh / Dynamic Event Driven</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Communication Protocol</td>
                <td className="p-3 text-amber-400 font-bold bg-amber-950/10">Fixed Stage-to-Stage Conduit</td>
                <td className="p-3 text-slate-400">Worker ⇄ Master Bus</td>
                <td className="p-3 text-slate-400">Arbitrary Peer-to-Peer Gossiping</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Agent Responsibility</td>
                <td className="p-3 text-cyan-400 font-bold bg-amber-950/10">Specialized Stage Functional Unit</td>
                <td className="p-3 text-slate-400">Task Executor or Subordinate</td>
                <td className="p-3 text-slate-400">Full-Stack Autonomous Agent</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Decision Making</td>
                <td className="p-3 text-purple-400 font-bold bg-amber-950/10">Distributed across Stage 3 & 4</td>
                <td className="p-3 text-slate-400">Concentrated in Master Node</td>
                <td className="p-3 text-slate-400">Consensus / Local Heuristics</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Parallel Throughput</td>
                <td className="p-3 text-amber-400 font-bold bg-amber-950/10">Pipelined (Assembly-Line Parallel)</td>
                <td className="p-3 text-slate-400">High (Worker Pool Scaling)</td>
                <td className="p-3 text-slate-400">Extremely High (Swarm Parallel)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Failure Impact</td>
                <td className="p-3 text-rose-400 font-bold bg-amber-950/10">High (Single stage halts downstream)</td>
                <td className="p-3 text-slate-400">Critical (Master is Single Point)</td>
                <td className="p-3 text-slate-400">Low (Self-healing Redundancy)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Resource Sharing Model</td>
                <td className="p-3 text-emerald-400 font-bold bg-amber-950/10">Pipeline-controlled Verification</td>
                <td className="p-3 text-slate-400">Master-Brokered Allocations</td>
                <td className="p-3 text-slate-400">Bilateral P2P Negotiation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
