import React, { useState } from 'react';
import type { ResourceType, Priority, ResourceRequest } from '../types';
import {
  Sparkles,
  Sliders,
  Zap
} from 'lucide-react';

interface RequestPanelProps {
  onStartPipeline: (request?: Partial<ResourceRequest>) => void;
  autoSimActive: boolean;
  onToggleAutoSim: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  isBusy: boolean;
}

const PRESETS = [
  {
    title: 'AI Model Training',
    desc: 'Heavy compute cluster',
    requester: 'Agent-PyTorch-Cluster',
    resourceType: 'CPU' as ResourceType,
    requiredAmount: 35,
    durationSeconds: 15,
    priority: 'HIGH' as Priority,
    icon: '🧠',
  },
  {
    title: 'Distributed Storage Sync',
    desc: 'Bulk backup snapshot',
    requester: 'Agent-VaultSync',
    resourceType: 'Storage' as ResourceType,
    requiredAmount: 45,
    durationSeconds: 20,
    priority: 'MEDIUM' as Priority,
    icon: '💾',
  },
  {
    title: 'Realtime 8K Video Stream',
    desc: 'Ultra-low latency pipe',
    requester: 'Agent-MediaBridge',
    resourceType: 'Bandwidth' as ResourceType,
    requiredAmount: 50,
    durationSeconds: 12,
    priority: 'HIGH' as Priority,
    icon: '📡',
  },
  {
    title: 'Critical DB Buffer Cache',
    desc: 'High memory caching node',
    requester: 'Agent-RedisMaster',
    resourceType: 'RAM' as ResourceType,
    requiredAmount: 30,
    durationSeconds: 18,
    priority: 'CRITICAL' as Priority,
    icon: '⚡',
  },
];

export const RequestPanel: React.FC<RequestPanelProps> = ({
  onStartPipeline,
  autoSimActive,
  onToggleAutoSim,
  isBusy,
}) => {
  const [requester, setRequester] = useState('Agent-Alpha');
  const [resourceType, setResourceType] = useState<ResourceType>('CPU');
  const [requiredAmount, setRequiredAmount] = useState(25);
  const [durationSeconds, setDurationSeconds] = useState(12);
  const [priority, setPriority] = useState<Priority>('HIGH');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartPipeline({
      requester,
      resourceType,
      requiredAmount,
      durationSeconds,
      priority,
    });
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setRequester(preset.requester);
    setResourceType(preset.resourceType);
    setRequiredAmount(preset.requiredAmount);
    setDurationSeconds(preset.durationSeconds);
    setPriority(preset.priority);
  };

  const handleRandomize = () => {
    const types: ResourceType[] = ['CPU', 'RAM', 'Storage', 'Bandwidth'];
    const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const requesters = ['Agent-Gamma', 'Agent-Nexus', 'Agent-Vortex', 'Agent-CyberX', 'Agent-Echo'];

    setRequester(requesters[Math.floor(Math.random() * requesters.length)]);
    setResourceType(types[Math.floor(Math.random() * types.length)]);
    setRequiredAmount(Math.floor(Math.random() * 40) + 15);
    setDurationSeconds(Math.floor(Math.random() * 20) + 8);
    setPriority(priorities[Math.floor(Math.random() * priorities.length)]);
  };

  return (
    <div className="bg-cyber-card/80 backdrop-blur-xl border border-cyber-border rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Pipeline Request Generator</h3>
            <p className="text-[11px] text-slate-400">Configure parameters or trigger automated simulation workflows.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRandomize}
          className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" /> Randomize
        </button>
      </div>

      {/* Preset Badges */}
      <div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
          Quick Preset Scenarios
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{preset.icon}</span>
                <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                  {preset.title}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                {preset.requiredAmount}% {preset.resourceType} • {preset.durationSeconds}s
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Request Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Requester field */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
              Requester Node
            </label>
            <input
              type="text"
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:border-amber-400 focus:outline-none transition-colors"
              placeholder="e.g. Agent-Alpha"
              required
            />
          </div>

          {/* Resource Type */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as ResourceType)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:border-amber-400 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="CPU">CPU</option>
              <option value="RAM">RAM</option>
              <option value="Storage">Storage</option>
              <option value="Bandwidth">Bandwidth</option>
            </select>
          </div>

          {/* Required Amount */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-400 uppercase">Demand Amount</span>
              <span className="text-amber-400 font-bold">{requiredAmount}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              step="5"
              value={requiredAmount}
              onChange={(e) => setRequiredAmount(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-950 cursor-pointer h-1.5 rounded-lg"
            />
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-400 uppercase">Duration</span>
              <span className="text-emerald-400 font-bold">{durationSeconds}s</span>
            </div>
            <input
              type="range"
              min="3"
              max="45"
              step="1"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-950 cursor-pointer h-1.5 rounded-lg"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
              Priority SLA
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:border-amber-400 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="LOW">LOW (Best Effort)</option>
              <option value="MEDIUM">MEDIUM (Standard)</option>
              <option value="HIGH">HIGH (Guaranteed)</option>
              <option value="CRITICAL">CRITICAL (Strict SLA)</option>
            </select>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            disabled={isBusy}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all shadow-lg ${
              isBusy
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black hover:brightness-110 shadow-glow-gold'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            START PIPELINE
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleAutoSim}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                autoSimActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {autoSimActive ? 'STOP AUTO SIMULATION' : 'START AUTO SIMULATION'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
