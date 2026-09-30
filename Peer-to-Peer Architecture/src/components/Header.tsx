import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Network,
  Info,
} from 'lucide-react';
import type { GlobalSimulationStats } from '../types';

interface HeaderProps {
  isRunning: boolean;
  speed: number;
  stats: GlobalSimulationStats;
  soundEnabled: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onTriggerRandom: () => void;
  onChangeSpeed: (speed: number) => void;
  onToggleSound: () => void;
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  speed,
  stats,
  soundEnabled,
  onTogglePlay,
  onReset,
  onTriggerRandom,
  onChangeSpeed,
  onToggleSound,
  onOpenArchitecture,
}) => {
  return (
    <header className="border-b border-yellow-500/20 bg-[#0a0d14]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title & Architecture Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-500/30 text-yellow-400 shadow-lg shadow-yellow-500/10">
            <Network className="w-6 h-6 animate-pulse" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0d14] animate-ping" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0d14]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                P2P Multi-Agent Resource Sharing
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 tracking-wider uppercase">
                  P2P MESH
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Autonomous Negotiating Agents using Peer-to-Peer Architecture
            </p>
          </div>
        </div>

        {/* Distributed Consensus Status Badges */}
        <div className="hidden xl:flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Master Controller: <strong className="text-rose-400">NONE (100% P2P)</strong></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-yellow-400">⚡</span>
            <span>Agreements: <strong className="text-yellow-400">{stats.successfulAgreements}</strong></span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Start/Pause */}
          <button
            id="btn-toggle-simulation"
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-semibold hover:from-yellow-400 hover:to-amber-400 shadow-yellow-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                PAUSE
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                START SIMULATION
              </>
            )}
          </button>

          {/* Autonomous Request Trigger */}
          <button
            id="btn-generate-request"
            onClick={onTriggerRandom}
            title="Trigger an autonomous P2P negotiation burst"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/90 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            GENERATE REQUEST
          </button>

          {/* Reset */}
          <button
            id="btn-reset-simulation"
            onClick={onReset}
            title="Reset All Agent Resources and History"
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Controls */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-1 rounded transition-all ${
                  speed === s
                    ? 'bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Audio Effects' : 'Enable Audio Effects'}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled
                ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                : 'text-slate-500 bg-slate-900/80 border-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Architecture Modal Trigger */}
          <button
            id="btn-open-architecture"
            onClick={onOpenArchitecture}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all"
          >
            <Info className="w-3.5 h-3.5" />
            Architecture
          </button>
        </div>
      </div>
    </header>
  );
};
