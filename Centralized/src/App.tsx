import React, { useEffect, useMemo, useState } from 'react';
import { AgentCardsGrid } from './components/AgentCardsGrid';
import { ArchitectureExplanation } from './components/ArchitectureExplanation';
import { CentralControllerPanel } from './components/CentralControllerPanel';
import { Header } from './components/Header';
import { LiveEventConsole } from './components/LiveEventConsole';
import { NegotiationHistoryTable } from './components/NegotiationHistoryTable';
import { NegotiationTurnsModal } from './components/NegotiationTurnsModal';
import { NetworkTopologyCanvas } from './components/NetworkTopologyCanvas';
import { ResourceRequestModal } from './components/ResourceRequestModal';
import { StatisticsPanel } from './components/StatisticsPanel';
import { CentralController } from './core/CentralController';
import { SimulationEngine } from './core/SimulationEngine';
import { NegotiationSession } from './core/types';

export const App: React.FC = () => {
  // Initialize Controller and Simulation Engine
  const [controller] = useState<CentralController>(() => new CentralController());
  const [engine] = useState<SimulationEngine>(() => new SimulationEngine(controller));

  // Force re-render state hook to synchronize with engine ticks & events
  const [, setTick] = useState<number>(0);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<string | undefined>(undefined);
  const [inspectedSession, setInspectedSession] = useState<NegotiationSession | null>(null);

  useEffect(() => {
    engine.setOnUpdate(() => {
      setTick((t) => t + 1);
    });

    // Auto-start simulation upon landing
    engine.start();

    return () => {
      engine.destroy();
    };
  }, [engine]);

  const handleOpenManualModal = (agentId?: string) => {
    setSelectedAgentForModal(agentId);
    setIsManualModalOpen(true);
  };

  const handleInjectLoad = (agentId: string) => {
    const agent = controller.getAgent(agentId);
    if (agent) {
      // Spike CPU and RAM to 85-95%
      agent.data.resources.cpu = Math.min(95, agent.data.resources.cpu + 35);
      agent.data.resources.ram = Math.min(95, agent.data.resources.ram + 30);
      agent.setStatus('REQUESTING', 'Urgent workload spike detected');

      controller.logEvent(
        agent.data.name,
        'Central Controller',
        'RESOURCE_REQUEST',
        `WORKLOAD SPIKE: ${agent.data.name}`,
        `Simulated high computational burst on ${agent.data.name}. Initiating urgent resource discovery request.`
      );

      const req = agent.generateAutonomousRequest();
      if (req) {
        req.priority = 'CRITICAL';
        controller.submitResourceRequest(
          req.requesterId,
          req.resourceType,
          Math.min(45, req.requiredAmount + 10),
          req.duration,
          'CRITICAL'
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Futuristic Command Header */}
      <Header engine={engine} onOpenManualModal={() => handleOpenManualModal()} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Central Controller Overview Hub */}
        <section>
          <CentralControllerPanel controller={controller} />
        </section>

        {/* Live Topology Canvas & Real-time Event Console Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Centralized Hub-and-Spoke Topology Canvas (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <NetworkTopologyCanvas
              controller={controller}
              visualPackets={engine.activeVisualPackets}
              onSelectAgent={(id) => handleOpenManualModal(id)}
            />
          </div>

          {/* Real-time Central Router Log Console (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <LiveEventConsole
              logs={controller.logs}
              onClear={() => {
                controller.logs = [];
                setTick((t) => t + 1);
              }}
            />
          </div>
        </section>

        {/* 5 Autonomous Agent Cards */}
        <section>
          <AgentCardsGrid
            agents={controller.getAgentDataList()}
            onRequestClick={(id) => handleOpenManualModal(id)}
            onInjectLoad={handleInjectLoad}
          />
        </section>

        {/* Real-time Telemetry & Performance Statistics */}
        <section>
          <StatisticsPanel
            metrics={controller.metrics}
            agentCount={controller.agents.size}
          />
        </section>

        {/* Negotiation & Counter-Offer Ledger History Table */}
        <section>
          <NegotiationHistoryTable
            sessions={controller.negotiationHistory}
            onInspectSession={(session) => setInspectedSession(session)}
          />
        </section>

        {/* Architectural Explanations & Principles */}
        <section>
          <ArchitectureExplanation />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#05070d] border-t border-slate-800/80 py-4 px-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Centralized MAS Simulator • Multi-Agent System Architecture</span>
          <span className="text-amber-400/80 font-bold">Strict Rule: Zero Direct Peer-to-Peer Communication</span>
          <span>Running locally on localhost:5173</span>
        </div>
      </footer>

      {/* Manual Request Modal */}
      <ResourceRequestModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        controller={controller}
        preselectedAgentId={selectedAgentForModal}
      />

      {/* Negotiation Turn Details Inspector */}
      <NegotiationTurnsModal
        session={inspectedSession}
        onClose={() => setInspectedSession(null)}
      />
    </div>
  );
};
