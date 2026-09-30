import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Cpu,
  HardDrive,
  Radio,
  Send,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { CentralController } from '../core/CentralController';
import { AgentData, PriorityLevel, ResourceType } from '../core/types';

interface ResourceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  controller: CentralController;
  preselectedAgentId?: string;
}

export const ResourceRequestModal: React.FC<ResourceRequestModalProps> = ({
  isOpen,
  onClose,
  controller,
  preselectedAgentId,
}) => {
  const agents = controller.getAgentDataList();

  const [requesterId, setRequesterId] = useState<string>(preselectedAgentId || agents[0]?.id || 'agent-a');
  const [resourceType, setResourceType] = useState<ResourceType>('CPU');
  const [amount, setAmount] = useState<number>(25);
  const [duration, setDuration] = useState<number>(10);
  const [priority, setPriority] = useState<PriorityLevel>('HIGH');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = controller.submitResourceRequest(
      requesterId,
      resourceType,
      amount,
      duration,
      priority
    );

    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl glass-panel border border-amber-500/40 p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-mono tracking-wide">
              DISPATCH RESOURCE REQUEST
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Request mediated exclusively via Central Controller
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* 1. Requesting Agent */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
              REQUESTING AGENT
            </label>
            <select
              value={requesterId}
              onChange={(e) => setRequesterId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Current: CPU {a.resources.cpu}%, RAM {a.resources.ram}%) - Strategy: {a.strategy}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Resource Type */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
              RESOURCE TYPE
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['CPU', 'RAM', 'Storage', 'Bandwidth'] as ResourceType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setResourceType(type)}
                  className={`py-2 px-2 rounded-lg font-mono text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                    resourceType === type
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {type === 'CPU' && <Cpu className="w-4 h-4" />}
                  {type === 'RAM' && <Activity className="w-4 h-4" />}
                  {type === 'Storage' && <HardDrive className="w-4 h-4" />}
                  {type === 'Bandwidth' && <Radio className="w-4 h-4" />}
                  <span>{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Required Amount & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono font-bold text-slate-300">AMOUNT</label>
                <span className="text-xs font-mono font-black text-amber-400">{amount}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>5%</span>
                <span>80%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono font-bold text-slate-300">DURATION</label>
                <span className="text-xs font-mono font-black text-cyan-400">{duration}s</span>
              </div>
              <input
                type="range"
                min="4"
                max="30"
                step="2"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>4s</span>
                <span>30s</span>
              </div>
            </div>
          </div>

          {/* 4. Priority */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
              PRIORITY LEVEL
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as PriorityLevel[]).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setPriority(lvl)}
                  className={`py-1.5 px-2 rounded-lg font-mono text-[11px] font-bold border transition-all ${
                    priority === lvl
                      ? lvl === 'CRITICAL'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : lvl === 'HIGH'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : lvl === 'MEDIUM'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-700 border-slate-500 text-slate-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-90 text-slate-950 font-mono font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-wider active:scale-[0.98] transition-all"
            >
              <Send className="w-4 h-4" />
              START RESOURCE REQUEST
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
