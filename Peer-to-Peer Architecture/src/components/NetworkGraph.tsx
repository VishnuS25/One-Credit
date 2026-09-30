import React, { useRef, useEffect, useState } from 'react';
import type { AgentModel, NetworkPacket } from '../types';
import { P2P_CONNECTIONS } from '../data/initialAgents';
import { Activity } from 'lucide-react';

interface NetworkGraphProps {
  agents: AgentModel[];
  packets: NetworkPacket[];
  onSelectAgent: (agent: AgentModel) => void;
  selectedAgentId?: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  agents,
  packets,
  onSelectAgent,
  selectedAgentId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);

  // Responsive Canvas Sizing and Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particleOffset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle background cyber grid
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Map agents to coordinates (normalized scale for canvas)
      const agentMap = new Map<string, { x: number; y: number; model: AgentModel }>();
      
      // Compute scaling coordinates
      const paddingX = 90;
      const paddingY = 80;
      const scaleX = (width - paddingX * 2) / 800;
      const scaleY = (height - paddingY * 2) / 450;

      agents.forEach((agent) => {
        const x = paddingX + agent.position.x * scaleX;
        const y = paddingY + agent.position.y * scaleY;
        agentMap.set(agent.id, { x, y, model: agent });
      });

      // 2. Draw P2P Direct Connection Edges
      particleOffset += 0.5;
      P2P_CONNECTIONS.forEach(([fromId, toId]) => {
        const nodeA = agentMap.get(fromId);
        const nodeB = agentMap.get(toId);
        if (!nodeA || !nodeB) return;

        // Check if there is active resource sharing between nodeA and nodeB
        const isSharing =
          nodeA.model.activeLeasesLent.some((l) => l.requesterId === toId) ||
          nodeA.model.activeLeasesBorrowed.some((l) => l.providerId === toId) ||
          nodeB.model.activeLeasesLent.some((l) => l.requesterId === fromId) ||
          nodeB.model.activeLeasesBorrowed.some((l) => l.providerId === fromId);

        // Check if there is active negotiation
        const isNegotiating =
          (nodeA.model.state === 'NEGOTIATING' || nodeA.model.state === 'REQUESTING' || nodeA.model.state === 'OFFERING') &&
          (nodeB.model.state === 'NEGOTIATING' || nodeB.model.state === 'REQUESTING' || nodeB.model.state === 'OFFERING');

        ctx.save();
        if (isSharing) {
          // Glowing Resource Beam
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 12;
          ctx.setLineDash([10, 6]);
          ctx.lineDashOffset = -particleOffset * 2;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();

          // Draw active energy particles along the beam
          const pT = ((particleOffset * 0.02) % 1);
          const px = nodeA.x + (nodeB.x - nodeA.x) * pT;
          const py = nodeA.y + (nodeB.y - nodeA.y) * pT;
          ctx.fillStyle = '#fef08a';
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (isNegotiating) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.setLineDash([6, 4]);
          ctx.lineDashOffset = -particleOffset;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
        } else {
          // Standard idle P2P mesh link
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 3. Draw Moving Network Packets (Direct P2P Messages)
      packets.forEach((packet) => {
        const fromNode = agentMap.get(packet.fromId);
        const toNode = agentMap.get(packet.toId);
        if (!fromNode || !toNode) return;

        const currentX = fromNode.x + (toNode.x - fromNode.x) * packet.progress;
        const currentY = fromNode.y + (toNode.y - fromNode.y) * packet.progress;

        let packetColor = '#eab308';
        if (packet.type === 'RESOURCE_REQUEST') packetColor = '#38bdf8';
        else if (packet.type === 'OFFER') packetColor = '#facc15';
        else if (packet.type === 'COUNTER_OFFER') packetColor = '#fb923c';
        else if (packet.type === 'ACCEPT') packetColor = '#4ade80';
        else if (packet.type === 'REJECT') packetColor = '#f43f5e';

        ctx.save();
        // Glow effect
        ctx.shadowColor = packetColor;
        ctx.shadowBlur = 14;
        ctx.fillStyle = packetColor;

        // Packet core
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Wave ripple ring
        ctx.strokeStyle = packetColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Message Tag Badge floating above packet
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        const label = packet.type.replace('_', ' ');
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = 'rgba(10, 13, 20, 0.85)';
        ctx.strokeStyle = packetColor;
        ctx.lineWidth = 1;
        ctx.roundRect(currentX - textWidth / 2 - 6, currentY - 24, textWidth + 12, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = packetColor;
        ctx.fillText(label, currentX - textWidth / 2, currentY - 12);
        ctx.restore();
      });

      // 4. Draw Agent Nodes
      agents.forEach((agent) => {
        const node = agentMap.get(agent.id);
        if (!node) return;

        const isHovered = hoveredAgentId === agent.id;
        const isSelected = selectedAgentId === agent.id;
        const radius = isSelected ? 34 : isHovered ? 32 : 28;

        ctx.save();

        // Outer Status Halo
        let haloColor = 'rgba(234, 179, 8, 0.2)';
        let haloGlow = 10;
        if (agent.state === 'SHARING') {
          haloColor = 'rgba(234, 179, 8, 0.8)';
          haloGlow = 20;
        } else if (agent.state === 'NEGOTIATING' || agent.state === 'OFFERING') {
          haloColor = 'rgba(6, 182, 212, 0.8)';
          haloGlow = 18;
        } else if (agent.state === 'ACCEPTED') {
          haloColor = 'rgba(16, 185, 129, 0.9)';
          haloGlow = 22;
        } else if (agent.state === 'REJECTED') {
          haloColor = 'rgba(244, 63, 94, 0.8)';
          haloGlow = 18;
        }

        // Halo ring
        ctx.strokeStyle = haloColor;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.shadowColor = haloColor;
        ctx.shadowBlur = haloGlow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Outer progress arc showing average resource utilization
        const avgUsed =
          (agent.resources.CPU.used +
            agent.resources.RAM.used +
            agent.resources.Storage.used +
            agent.resources.Bandwidth.used) / 4;
        const arcAngle = (avgUsed / 100) * (Math.PI * 2);

        ctx.strokeStyle = avgUsed > 80 ? '#f43f5e' : avgUsed > 60 ? '#facc15' : '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 8, -Math.PI / 2, -Math.PI / 2 + arcAngle);
        ctx.stroke();

        // Node Inner Circle Background
        ctx.shadowBlur = 10;
        ctx.shadowColor = agent.color;
        const grad = ctx.createRadialGradient(node.x, node.y, 5, node.x, node.y, radius);
        grad.addColorStop(0, '#1a2230');
        grad.addColorStop(1, '#0c1017');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#eab308' : agent.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node Letter
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${radius * 0.75}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(agent.avatar, node.x, node.y - 1);

        // Node Name & State Banner below
        ctx.font = 'bold 11px "Inter", sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(agent.name, node.x, node.y + radius + 18);

        // State Badge
        ctx.font = '9px "JetBrains Mono", monospace';
        let stateBg = '#1e293b';
        let stateTextColor = '#94a3b8';
        if (agent.state === 'SHARING') {
          stateBg = 'rgba(234, 179, 8, 0.2)';
          stateTextColor = '#facc15';
        } else if (agent.state === 'NEGOTIATING') {
          stateBg = 'rgba(6, 182, 212, 0.2)';
          stateTextColor = '#38bdf8';
        } else if (agent.state === 'ACCEPTED') {
          stateBg = 'rgba(16, 185, 129, 0.2)';
          stateTextColor = '#4ade80';
        } else if (agent.state === 'REJECTED') {
          stateBg = 'rgba(244, 63, 94, 0.2)';
          stateTextColor = '#fb7185';
        }

        const stateWidth = ctx.measureText(agent.state).width + 12;
        ctx.fillStyle = stateBg;
        ctx.strokeStyle = stateTextColor;
        ctx.lineWidth = 0.8;
        ctx.roundRect(node.x - stateWidth / 2, node.y + radius + 26, stateWidth, 14, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = stateTextColor;
        ctx.fillText(agent.state, node.x, node.y + radius + 36);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [agents, packets, hoveredAgentId, selectedAgentId]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = Math.max(380, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Mouse Hover / Click for Nodes
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const paddingX = 90;
    const paddingY = 80;
    const scaleX = (width - paddingX * 2) / 800;
    const scaleY = (height - paddingY * 2) / 450;

    for (const agent of agents) {
      const x = paddingX + agent.position.x * scaleX;
      const y = paddingY + agent.position.y * scaleY;
      const dist = Math.hypot(clickX - x, clickY - y);
      if (dist <= 35) {
        onSelectAgent(agent);
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const paddingX = 90;
    const paddingY = 80;
    const scaleX = (width - paddingX * 2) / 800;
    const scaleY = (height - paddingY * 2) / 450;

    let found: string | null = null;
    for (const agent of agents) {
      const x = paddingX + agent.position.x * scaleX;
      const y = paddingY + agent.position.y * scaleY;
      if (Math.hypot(mouseX - x, mouseY - y) <= 35) {
        found = agent.id;
        break;
      }
    }
    setHoveredAgentId(found);
  };

  return (
    <div className="relative rounded-2xl glass-panel border border-yellow-500/20 overflow-hidden flex flex-col h-[480px]">
      {/* Visual Header */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Live Peer-to-Peer Network Mesh Topology
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Decentralized Direct Links
          </span>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Negotiation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400" />
            <span>Resource Stream</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Agreement</span>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div ref={containerRef} className="relative flex-1 w-full h-full bg-[#06090e] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredAgentId(null)}
          className="w-full h-full block"
        />

        {/* Dynamic Overlay Helper */}
        <div className="absolute bottom-3 left-4 text-[10px] font-mono text-slate-400 pointer-events-none bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
          💡 Click any Agent Node to inspect telemetry & active leases
        </div>
      </div>
    </div>
  );
};
