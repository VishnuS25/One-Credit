import React from 'react';
import {
  Activity,
  AlertTriangle,
  Cpu,
  FastForward,
  Layers,
  Network,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SimulationEngine } from '../core/SimulationEngine';

interface HeaderProps {
  engine: SimulationEngine;
  onOpenManualModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ engine, onOpenManualModal }) => {
  const isOnline = engine.controller.metrics.status === 'ONLINE';
  const isRunning = engine.isRunning;
  const isAuto = engine.isAutoGenerating;

  return (
    <header className="w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-40 px-4 lg:px-8 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding & Subtitle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 via-cyan-500/10 to-transparent border border-amber-500/40 shadow-lg shadow-amber-500/10">
            <Network className="w-6 h-6 text-amber-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2 font-mono">
                CENTRALIZED <span className="text-amber-400">MAS</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40">
                  v2.4 Core
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Centralized Multi-Agent Resource Sharing & Negotiation System
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto">
          {/* Failure Injection Button */}
          {isOnline ? (
            <button
              onClick={() => engine.controller.simulateFailure()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-semibold border border-red-600/50 shadow-lg shadow-red-950/50 transition-all active:scale-95 group"
              title="Demonstrate Single Point of Failure (SPOF)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 group-hover:animate-bounce" />
              SIMULATE FAILURE
            </button>
          ) : (
            <button
              onClick={() => engine.controller.restoreController()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-500/60 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 animate-pulse"
              title="Restore Master Central Controller"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              RESTORE CONTROLLER
            </button>
          )}

          {/* Simulation Play / Pause */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-700/60">
            <button
              onClick={() => (isRunning ? engine.pause() : engine.start())}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                isRunning
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'PAUSE' : 'START SIMULATION'}
            </button>

            <button
              onClick={() => engine.step()}
              disabled={isRunning || !isOnline}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              title="Step Single Tick"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => engine.reset()}
              className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Auto Traffic Generator Toggle */}
          <button
            onClick={() => engine.toggleAutoGeneration()}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isAuto
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Automatically spawn agent resource demands"
          >
            <Zap className={`w-3.5 h-3.5 ${isAuto ? 'text-cyan-400 animate-spin-slow' : 'text-slate-500'}`} />
            Auto Gen: {isAuto ? 'ON' : 'OFF'}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-700/60 text-xs font-mono text-slate-300">
            <span className="text-[10px] text-slate-500 mr-1">SPD</span>
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => engine.setSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  engine.simulationSpeed === spd
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Manual Request Launcher */}
          <button
            onClick={onOpenManualModal}
            disabled={!isOnline}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            GENERATE REQUEST
          </button>
        </div>
      </div>
    </header>
  );
};
