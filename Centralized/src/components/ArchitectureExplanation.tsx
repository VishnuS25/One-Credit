import React from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Network,
  Scale,
  Server,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export const ArchitectureExplanation: React.FC = () => {
  return (
    <div className="w-full rounded-2xl glass-panel border border-slate-800 p-6 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            CENTRALIZED MULTI-AGENT ARCHITECTURE (MAS) SPECIFICATION
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/30">
          Core Principles & Design Patterns
        </span>
      </div>

      {/* Visual Hierarchy Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Diagram Card */}
        <div className="lg:col-span-6 bg-slate-950/90 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto shadow-inner">
          <div className="text-[11px] text-amber-400 font-bold mb-2">
            // CENTRALIZED TOPOLOGY & COMMUNICATION BUS
          </div>
          <pre className="text-[11px] sm:text-xs leading-relaxed text-cyan-300">
{`                    ┌─────────────────────────────────┐
                    │       CENTRAL CONTROLLER        │
                    │ ─────────────────────────────── │
                    │ • Resource Manager (Registry)   │
                    │ • Request Manager  (Queue)      │
                    │ • Decision Engine  (Evaluation) │
                    │ • Negotiation Mgr  (Mediation)  │
                    │ • Allocation Mgr   (Lease Lock) │
                    └────────────────┬────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
      ┌─────────┐               ┌─────────┐               ┌─────────┐
      │ Agent A │               │ Agent B │               │ Agent C │
      └─────────┘               └─────────┘               └─────────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     │
                              ┌──────┴──────┐
                              ▼             ▼
                         ┌─────────┐   ┌─────────┐
                         │ Agent D │   │ Agent E │
                         └─────────┘   └─────────┘`}
          </pre>
        </div>

        {/* 5 Architecture Pillar Badges */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-mono font-black text-amber-300 uppercase">
                1. Single Central Controller
              </h5>
              <p className="text-[11px] text-slate-400">
                A single dedicated master node coordinates the entire system, maintaining the global telemetry registry.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-mono font-black text-purple-300 uppercase">
                2. Centralized Decision Making
              </h5>
              <p className="text-[11px] text-slate-400">
                The Decision Engine evaluates all candidate agents globally using multi-criteria optimization.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-mono font-black text-cyan-300 uppercase">
                3. Centralized Resource Management
              </h5>
              <p className="text-[11px] text-slate-400">
                Dynamic capacity tracking for CPU, RAM, Storage, and Bandwidth with guaranteed lock prevention.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-mono font-black text-emerald-300 uppercase">
                4. Agent-to-Agent Routing Through Controller
              </h5>
              <p className="text-[11px] text-slate-400">
                Zero peer-to-peer bypasses: Agent A ➜ Central Controller ➜ Agent B (Strictly Mediated).
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-900/50 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-mono font-black text-red-400 uppercase">
                5. Single Point of Failure (SPOF)
              </h5>
              <p className="text-[11px] text-red-200/70">
                If the Master Controller goes offline, all resource negotiation ceases and agents enter WAITING state.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Request & Counter-Offer Workflow Steps */}
      <div className="pt-4 border-t border-slate-800">
        <h4 className="text-xs font-mono font-black text-slate-200 uppercase mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-amber-400" />
          End-to-End Negotiation & Allocation Workflow
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-amber-400 font-bold mb-1">Step 1</div>
            <div className="text-slate-200 font-semibold mb-1">Resource Request</div>
            <p className="text-[11px] text-slate-400">Agent A sends request to Central Controller.</p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-cyan-400 font-bold mb-1">Step 2</div>
            <div className="text-slate-200 font-semibold mb-1">Provider Search</div>
            <p className="text-[11px] text-slate-400">Controller discovers all available candidates.</p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-purple-400 font-bold mb-1">Step 3</div>
            <div className="text-slate-200 font-semibold mb-1">Decision Engine</div>
            <p className="text-[11px] text-slate-400">Selects best candidate (e.g. Agent B) via score.</p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-pink-400 font-bold mb-1">Step 4</div>
            <div className="text-slate-200 font-semibold mb-1">Counter-Offer</div>
            <p className="text-[11px] text-slate-400">Mediated proposals & capacity concessions.</p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">Step 5</div>
            <div className="text-slate-200 font-semibold mb-1">Resource Allocation</div>
            <p className="text-[11px] text-slate-400">Time-based lease locked; sharing begins.</p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-blue-400 font-bold mb-1">Step 6</div>
            <div className="text-slate-200 font-semibold mb-1">Auto-Release</div>
            <p className="text-[11px] text-slate-400">Lease expires; resources restored safely.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
