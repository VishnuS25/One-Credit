import React, { useState } from 'react';
import {
  Workflow,
  Activity,
  Volume2,
  VolumeX,
  FastForward,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Server
} from 'lucide-react';
import { toggleSound, isSoundEnabled } from '../utils/audio';

interface HeaderProps {
  isPaused: boolean;
  autoSimActive: boolean;
  simSpeed: number;
  activeLeasesCount: number;
  totalRequests: number;
  onTogglePause: () => void;
  onToggleAutoSim: () => void;
  onReset: () => void;
  onSetSpeed: (speed: number) => void;
  hasFailedAgent: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isPaused,
  autoSimActive,
  simSpeed,
  activeLeasesCount,
  totalRequests,
  onTogglePause,
  onToggleAutoSim,
  onReset,
  onSetSpeed,
  hasFailedAgent,
}) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  return (
    <header className="bg-cyber-card/90 backdrop-blur-xl border-b border-cyber-border sticky top-0 z-50 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Architecture Badge */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center shadow-glow-gold">
              <Workflow className="w-6 h-6 text-black" />
            </div>
            {hasFailedAgent && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Sequential Pipeline Multi-Agent System
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  MAS Pipeline v2.4
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Autonomous Sequential Resource Sharing & Bargaining Architecture
              <span className="text-slate-600">•</span>
              <span className="text-amber-400/90 font-mono text-[11px]">No Central Controller</span>
            </p>
          </div>
        </div>

        {/* Center / Right: Status badges & quick controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Leases & Total requests chips */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Active Leases:</span>
            <span className="font-mono font-bold text-cyan-300">{activeLeasesCount}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Total Runs:</span>
            <span className="font-mono font-bold text-amber-300">{totalRequests}</span>
          </div>

          {/* Speed selector */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            <FastForward className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {[0.5, 1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-all ${
                  simSpeed === spd
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={`Simulation Speed: ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            className={`p-2 rounded-lg border transition-all ${
              soundOn
                ? 'bg-slate-900 text-amber-400 border-amber-500/30 hover:bg-slate-800'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={soundOn ? 'Mute Audio Effects' : 'Enable Audio Feedback'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Auto Simulation Toggle */}
          <button
            onClick={onToggleAutoSim}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              autoSimActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-glow-cyan animate-pulse'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-cyan-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {autoSimActive ? 'Auto: RUNNING' : 'Auto Sim'}
          </button>

          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-glow-gold'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/80 text-rose-400 border border-slate-800 hover:bg-rose-950/30 hover:border-rose-500/40 transition-all"
            title="Reset All Simulation States"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET
          </button>
        </div>
      </div>
    </header>
  );
};
