import React, { useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Cpu,
  Layers,
  Radio,
  Server,
  Zap,
} from 'lucide-react';
import { CentralController } from '../core/CentralController';
import { ActiveVisualPacket, AgentData } from '../core/types';

interface NetworkTopologyCanvasProps {
  controller: CentralController;
  visualPackets: ActiveVisualPacket[];
  onSelectAgent?: (agentId: string) => void;
}

interface NodePosition {
  id: string;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color: string;
  isController?: boolean;
}

export const NetworkTopologyCanvas: React.FC<NetworkTopologyCanvasProps> = ({
  controller,
  visualPackets,
  onSelectAgent,
}) => {
  const isOnline = controller.metrics.status === 'ONLINE';
  const agents = controller.getAgentDataList();

  // Define Central Controller and Radial Agent Coordinates (in SVG 0-800, 0-540 space)
  const nodePositions: Record<string, { x: number; y: number; name: string; color: string }> = {
    'central-controller': { x: 400, y: 260, name: 'Central Controller', color: '#eab308' },
    'agent-a': { x: 400, y: 70, name: 'Agent A', color: '#38bdf8' },
    'agent-b': { x: 140, y: 200, name: 'Agent B', color: '#facc15' },
    'agent-c': { x: 660, y: 200, name: 'Agent C', color: '#4ade80' },
    'agent-d': { x: 230, y: 440, name: 'Agent D', color: '#c084fc' },
    'agent-e': { x: 570, y: 440, name: 'Agent E', color: '#fb7185' },
  };

  // Check active allocations for link highlight
  const activeLinks = useMemo(() => {
    const links = new Set<string>();
    controller.activeAllocations.forEach((alloc) => {
      links.add(`central-controller->${alloc.requesterId}`);
      links.add(`central-controller->${alloc.providerId}`);
      links.add(`${alloc.requesterId}->central-controller`);
      links.add(`${alloc.providerId}->central-controller`);
    });
    return links;
  }, [controller.activeAllocations]);

  return (
    <div className="w-full rounded-2xl glass-panel border border-slate-800 relative overflow-hidden p-4 shadow-2xl">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#080d1a]/50 to-[#070a13] pointer-events-none" />

      {/* Title & Legend Overlay */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              CENTRALIZED TOPOLOGY & LIVE PACKET FLOW
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Strict Hub-and-Spoke model: All agent transmissions transit exclusively through the Central Master.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Request</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Inquiry</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>Counter-Offer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Lease</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/10] max-h-[560px] flex items-center justify-center my-2">
        <svg
          viewBox="0 0 800 520"
          className="w-full h-full select-none"
          style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
        >
          <defs>
            {/* Glowing filter for lines and nodes */}
            <filter id="glow-gold-svg" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-cyan-svg" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Gradient definition for lines */}
            <linearGradient id="link-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="active-lease-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Central Radial Guide Rings */}
          <circle
            cx="400"
            cy="260"
            r="190"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="opacity-40"
          />
          <circle
            cx="400"
            cy="260"
            r="120"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="2 6"
            className="opacity-30"
          />

          {/* Lines connecting Central Controller to each Agent */}
          {['agent-a', 'agent-b', 'agent-c', 'agent-d', 'agent-e'].map((agentId) => {
            const pos = nodePositions[agentId];
            const center = nodePositions['central-controller'];
            const isLinkActive =
              activeLinks.has(`central-controller->${agentId}`) ||
              activeLinks.has(`${agentId}->central-controller`);

            return (
              <g key={`link-${agentId}`}>
                {/* Base communication wire */}
                <line
                  x1={center.x}
                  y1={center.y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={isOnline ? (isLinkActive ? '#10b981' : '#334155') : '#7f1d1d'}
                  strokeWidth={isLinkActive ? 3 : 1.5}
                  strokeDasharray={isLinkActive ? '6 4' : undefined}
                  className={isLinkActive ? 'animate-pulse' : ''}
                  opacity={isOnline ? (isLinkActive ? 0.9 : 0.4) : 0.2}
                />

                {/* Arrow markers indicating bidirectional route to controller */}
                {isOnline && (
                  <circle
                    cx={(center.x + pos.x) / 2}
                    cy={(center.y + pos.y) / 2}
                    r="2"
                    fill={isLinkActive ? '#10b981' : '#64748b'}
                    opacity="0.6"
                  />
                )}
              </g>
            );
          })}

          {/* Active Animated Visual Packets Traveling Along Centralized Wires */}
          {visualPackets.map((pkt) => {
            const start = nodePositions[pkt.fromId] || nodePositions['central-controller'];
            const end = nodePositions[pkt.toId] || nodePositions['central-controller'];

            const currentX = start.x + (end.x - start.x) * pkt.progress;
            const currentY = start.y + (end.y - start.y) * pkt.progress;

            return (
              <g key={pkt.id} transform={`translate(${currentX}, ${currentY})`}>
                {/* Packet Glow Aura */}
                <circle r="14" fill={pkt.color} opacity="0.25" className="animate-ping" />
                <circle r="8" fill={pkt.color} filter="url(#glow-cyan-svg)" />
                <circle r="4" fill="#ffffff" />

                {/* Packet Type Label Floating Tag */}
                <g transform="translate(12, -8)">
                  <rect
                    x="-4"
                    y="-12"
                    width={Math.max(70, pkt.label.length * 6.5 + 8)}
                    height="18"
                    rx="4"
                    fill="#090d16"
                    stroke={pkt.color}
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text
                    x="2"
                    y="0"
                    fill={pkt.color}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pkt.label}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Central Controller Center Node */}
          {(() => {
            const cPos = nodePositions['central-controller'];
            return (
              <g
                key="central-node"
                transform={`translate(${cPos.x}, ${cPos.y})`}
                className="cursor-pointer"
              >
                {/* Outer Glow Halo */}
                <circle
                  r={isOnline ? 64 : 58}
                  fill="none"
                  stroke={isOnline ? '#eab308' : '#ef4444'}
                  strokeWidth="2"
                  strokeDasharray={isOnline ? '8 4' : '4 4'}
                  className={isOnline ? 'animate-spin-slow' : 'animate-pulse'}
                  opacity="0.4"
                />

                {/* Inner Base */}
                <circle
                  r="48"
                  fill={isOnline ? '#101726' : '#2b0d10'}
                  stroke={isOnline ? '#eab308' : '#ef4444'}
                  strokeWidth="2.5"
                  filter={isOnline ? 'url(#glow-gold-svg)' : undefined}
                />

                {/* Core Icon / Text */}
                <foreignObject x="-40" y="-40" width="80" height="80">
                  <div className="w-full h-full flex flex-col items-center justify-center text-center select-none pointer-events-none">
                    <Server
                      className={`w-6 h-6 mb-0.5 ${
                        isOnline ? 'text-amber-400 animate-pulse' : 'text-red-400'
                      }`}
                    />
                    <span className="text-[9px] font-black text-white font-mono tracking-tight uppercase leading-none">
                      CENTRAL
                    </span>
                    <span className="text-[8px] font-bold text-amber-300 font-mono tracking-tighter leading-none">
                      CONTROLLER
                    </span>
                    <span
                      className={`text-[7px] font-mono px-1 rounded-sm mt-0.5 ${
                        isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/30 text-red-300'
                      }`}
                    >
                      {controller.metrics.status}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })()}

          {/* Agent Nodes (A, B, C, D, E) */}
          {agents.map((agent) => {
            const pos = nodePositions[agent.id] || { x: 100, y: 100, name: agent.name, color: '#38bdf8' };
            const isSharing = agent.status === 'SHARING';
            const isNegotiating = agent.status === 'NEGOTIATING';
            const isRequesting = agent.status === 'REQUESTING';
            const isProviding = agent.status === 'PROVIDING';

            let ringColor = '#334155';
            if (isSharing) ringColor = '#10b981';
            else if (isNegotiating) ringColor = '#c084fc';
            else if (isRequesting) ringColor = '#38bdf8';
            else if (isProviding) ringColor = '#facc15';

            return (
              <g
                key={agent.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer group"
                onClick={() => onSelectAgent && onSelectAgent(agent.id)}
              >
                {/* Active Status Pulse Halo */}
                {(isSharing || isNegotiating || isRequesting) && (
                  <circle
                    r="44"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="1.5"
                    className="animate-ping"
                    opacity="0.3"
                  />
                )}

                {/* Node Outer Ring */}
                <circle
                  r="36"
                  fill="#0b1120"
                  stroke={ringColor}
                  strokeWidth="2"
                  className="group-hover:stroke-amber-400 transition-colors"
                />

                {/* Agent Card in ForeignObject */}
                <foreignObject x="-34" y="-34" width="68" height="68">
                  <div className="w-full h-full flex flex-col items-center justify-center text-center select-none">
                    <span
                      className="text-[11px] font-black font-mono tracking-tight"
                      style={{ color: pos.color }}
                    >
                      {agent.name}
                    </span>
                    <span
                      className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full mt-0.5 uppercase tracking-tighter ${
                        isSharing
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isNegotiating
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : isRequesting
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : isProviding
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {agent.status}
                    </span>
                    <div className="text-[7px] text-slate-400 font-mono mt-0.5">
                      CPU {agent.resources.cpu}%
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Rule Reminder */}
      <div className="relative z-10 text-center py-1 bg-slate-950/70 rounded-lg border border-slate-800/60 text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
        <span className="text-amber-400 font-bold">STRICT ARCHITECTURE RULE:</span>
        <span>Agent A ➜ Central Controller ➜ Agent B (No Direct Peer-to-Peer Routing)</span>
      </div>
    </div>
  );
};
