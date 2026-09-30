import React, { useState } from 'react';
import type { AgentModel, ResourceType, Priority } from '../types';
import {
  Cpu,
  Database,
  HardDrive,
  Wifi,
  Send,
  Zap,
} from 'lucide-react';

interface ResourceRequestPanelProps {
  agents: AgentModel[];
  onSubmitRequest: (params: {
    requesterId: string;
    targetPeerId: string;
    resourceType: ResourceType;
    amount: number;
    duration: number;
    priority: Priority;
  }) => void;
}

export const ResourceRequestPanel: React.FC<ResourceRequestPanelProps> = ({
  agents,
  onSubmitRequest,
}) => {
  const [requesterId, setRequesterId] = useState<string>(agents[0]?.id || 'agent-a');
  const [targetPeerId, setTargetPeerId] = useState<string>('auto');
  const [resourceType, setResourceType] = useState<ResourceType>('CPU');
  const [amount, setAmount] = useState<number>(20);
  const [duration, setDuration] = useState<number>(10);
  const [priority, setPriority] = useState<Priority>('HIGH');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest({
      requesterId,
      targetPeerId,
      resourceType,
      amount,
      duration,
      priority,
    });
  };

  const loadPreset = (
    res: ResourceType,
    amt: number,
    dur: number,
    pri: Priority,
    from: string,
    to: string = 'auto'
  ) => {
    setResourceType(res);
    setAmount(amt);
    setDuration(dur);
    setPriority(pri);
    setRequesterId(from);
    setTargetPeerId(to);
  };

  const getResourceUnit = (res: ResourceType) => {
    return res === 'Bandwidth' ? 'Mbps' : '%';
  };

  return (
    <div className="rounded-2xl glass-panel border border-yellow-500/20 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Manual Resource Request Panel
            </h2>
            <p className="text-xs text-slate-400">
              Dispatch a direct P2P negotiation request between autonomous agents
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
          Direct P2P Dispatch
        </span>
      </div>

      {/* Preset Quick Buttons */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Quick Preset Scenarios:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => loadPreset('CPU', 25, 10, 'HIGH', 'agent-a', 'agent-b')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-yellow-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-yellow-400">
              <Cpu className="w-3 h-3" /> Compute Burst
            </div>
            <div className="text-[10px] text-slate-400 font-mono">25% CPU • 10s</div>
          </button>

          <button
            type="button"
            onClick={() => loadPreset('RAM', 30, 8, 'CRITICAL', 'agent-b', 'agent-e')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
              <Database className="w-3 h-3" /> Memory Cache
            </div>
            <div className="text-[10px] text-slate-400 font-mono">30% RAM • 8s</div>
          </button>

          <button
            type="button"
            onClick={() => loadPreset('Storage', 35, 12, 'MEDIUM', 'agent-c', 'auto')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <HardDrive className="w-3 h-3" /> Data Storage
            </div>
            <div className="text-[10px] text-slate-400 font-mono">35% Storage • 12s</div>
          </button>

          <button
            type="button"
            onClick={() => loadPreset('Bandwidth', 40, 10, 'HIGH', 'agent-d', 'auto')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
              <Wifi className="w-3 h-3" /> Bandwidth Surge
            </div>
            <div className="text-[10px] text-slate-400 font-mono">40 Mbps • 10s</div>
          </button>
        </div>
      </div>

      {/* Main Request Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Requesting Agent */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Requesting Agent (Requester)</label>
            <select
              id="select-requester"
              value={requesterId}
              onChange={(e) => setRequesterId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-yellow-500"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>

          {/* Target Peer */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Peer Agent</label>
            <select
              id="select-target-peer"
              value={targetPeerId}
              onChange={(e) => setTargetPeerId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-yellow-300 focus:outline-none focus:border-yellow-500"
            >
              <option value="auto">⚡ Auto-Discover Best Peer in Mesh</option>
              {agents
                .filter((a) => a.id !== requesterId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    Direct to {a.name} ({a.role})
                  </option>
                ))}
            </select>
          </div>

          {/* Resource Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Resource Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['CPU', 'RAM', 'Storage', 'Bandwidth'] as ResourceType[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setResourceType(res)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-[11px] font-medium border transition-all ${
                    resourceType === res
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-sm shadow-yellow-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {res === 'CPU' && <Cpu className="w-3.5 h-3.5 mb-1" />}
                  {res === 'RAM' && <Database className="w-3.5 h-3.5 mb-1" />}
                  {res === 'Storage' && <HardDrive className="w-3.5 h-3.5 mb-1" />}
                  {res === 'Bandwidth' && <Wifi className="w-3.5 h-3.5 mb-1" />}
                  <span>{res}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Required Amount</span>
              <span className="font-mono text-yellow-400 font-bold">
                {amount} {getResourceUnit(resourceType)}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5{getResourceUnit(resourceType)}</span>
              <span>30{getResourceUnit(resourceType)}</span>
              <span>60{getResourceUnit(resourceType)}</span>
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Lease Duration</span>
              <span className="font-mono text-yellow-400 font-bold">{duration} seconds</span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>3s</span>
              <span>15s</span>
              <span>30s</span>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Negotiation Priority</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Priority[]).map((pri) => (
                <button
                  key={pri}
                  type="button"
                  onClick={() => setPriority(pri)}
                  className={`py-2 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                    priority === pri
                      ? pri === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : pri === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pri}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex justify-end">
          <button
            id="btn-start-negotiation"
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4 fill-current" />
            START NEGOTIATION
          </button>
        </div>
      </form>
    </div>
  );
};
