import React from 'react';
import type { ProviderNode, ResourceType } from '../types';
import {
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Database
} from 'lucide-react';

interface ProviderDashboardProps {
  providers: ProviderNode[];
  highlightedProviderId?: string | null;
}

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  CPU: <Cpu className="w-3.5 h-3.5" />,
  RAM: <Database className="w-3.5 h-3.5" />,
  Storage: <HardDrive className="w-3.5 h-3.5" />,
  Bandwidth: <Wifi className="w-3.5 h-3.5" />,
};

const RESOURCE_COLORS: Record<ResourceType, string> = {
  CPU: '#06b6d4',      // Cyan
  RAM: '#eab308',      // Gold
  Storage: '#a855f7',  // Purple
  Bandwidth: '#10b981' // Emerald
};

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  providers,
  highlightedProviderId,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Dynamic Resource Providers (5 Nodes)</h3>
            <p className="text-xs text-slate-400">
              Autonomous edge and datacenter providers with dynamic capacity, workload & live locking.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {providers.map((provider) => {
          const isHighlighted = highlightedProviderId === provider.id;
          const isProviding = provider.status === 'PROVIDING RESOURCE';

          return (
            <div
              key={provider.id}
              className={`bg-cyber-card/80 backdrop-blur-xl border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                isProviding
                  ? 'border-emerald-500/60 bg-emerald-950/20 shadow-glow-emerald'
                  : isHighlighted
                  ? 'border-amber-400 bg-amber-950/20 shadow-glow-gold'
                  : 'border-cyber-border hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Name, Avatar, Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                      {provider.avatar}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight leading-tight">
                        {provider.name.split(' (')[0]}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {provider.region}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isProviding
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {provider.status === 'PROVIDING RESOURCE' ? 'ALLOCATED' : 'IDLE'}
                  </span>
                </div>

                {/* Workload & Reliability chips */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-[10px] font-mono">
                  <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-500">Load:</span>
                    <span className={`font-bold ${provider.currentWorkload > 70 ? 'text-rose-400' : 'text-amber-300'}`}>
                      {provider.currentWorkload}%
                    </span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-500">Reliability:</span>
                    <span className="text-emerald-400 font-bold">{provider.reliability}%</span>
                  </div>
                </div>

                {/* Dynamic Resource Meters (CPU, RAM, Storage, Bandwidth) */}
                <div className="space-y-2">
                  {(['CPU', 'RAM', 'Storage', 'Bandwidth'] as ResourceType[]).map((res) => {
                    const avail = provider.available[res];
                    const color = RESOURCE_COLORS[res];

                    return (
                      <div key={res} className="space-y-1 text-[11px] font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            {RESOURCE_ICONS[res]}
                            {res}
                          </span>
                          <span className="font-bold text-white">{avail}%</span>
                        </div>

                        {/* Progress meter */}
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 relative">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${avail}%`,
                              backgroundColor: color,
                              boxShadow: isProviding ? `0 0 8px ${color}` : undefined,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom stats footer */}
              <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Latency: <strong className="text-slate-300">{provider.baseLatencyMs}ms</strong></span>
                <span>Served: <strong className="text-cyan-400">{provider.totalAllocationsServed}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
