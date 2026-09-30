import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { SimulationEngine } from './simulation/SimulationEngine';
import type {
  AgentModel,
  SimulationEventLog,
  NetworkPacket,
  GlobalSimulationStats,
  HistoryRecord,
  StrategyType,
  ResourceType,
  Priority,
} from './types';
import { Header } from './components/Header';
import { Statistics } from './components/Statistics';
import { NetworkGraph } from './components/NetworkGraph';
import { AgentPanel } from './components/AgentPanel';
import { NegotiationConsole } from './components/NegotiationConsole';
import { ResourceRequestPanel } from './components/ResourceRequestPanel';
import { NegotiationHistory } from './components/NegotiationHistory';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { INITIAL_AGENTS } from './data/initialAgents';

export const App: React.FC = () => {
  const engine = useMemo(() => new SimulationEngine(), []);

  const [agents, setAgents] = useState<AgentModel[]>(INITIAL_AGENTS);
  const [logs, setLogs] = useState<SimulationEventLog[]>([]);
  const [packets, setPackets] = useState<NetworkPacket[]>([]);
  const [stats, setStats] = useState<GlobalSimulationStats>({
    activeAgents: INITIAL_AGENTS.length,
    activeNegotiations: 0,
    successfulAgreements: 0,
    failedNegotiations: 0,
    resourcesShared: 0,
    totalMessagesSent: 0,
    averageNegotiationTime: 2.4,
    networkEfficiency: 100,
  });
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [selectedAgent, setSelectedAgent] = useState<AgentModel | null>(null);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);

  // Subscribe to simulation engine updates
  useEffect(() => {
    const prevSuccessCount = { current: 0 };

    const unsubscribe = engine.subscribe((state) => {
      setAgents(state.agents);
      setLogs(state.logs);
      setPackets(state.packets);
      setStats(state.stats);
      setHistory(state.history);
      setIsRunning(state.isRunning);
      setSpeed(state.speed);

      // Trigger celebratory confetti on new successful agreement
      if (state.stats.successfulAgreements > prevSuccessCount.current) {
        prevSuccessCount.current = state.stats.successfulAgreements;
        try {
          confetti({
            particleCount: 35,
            spread: 55,
            origin: { y: 0.75, x: 0.5 },
            colors: ['#eab308', '#06b6d4', '#10b981', '#facc15'],
            disableForReducedMotion: true,
          });
        } catch {
          // ignore if canvas not ready
        }
      }

      // Update selected agent modal if open
      if (selectedAgent) {
        const updated = state.agents.find((a) => a.id === selectedAgent.id);
        if (updated) setSelectedAgent(updated);
      }
    });

    return () => unsubscribe();
  }, [engine, selectedAgent]);

  // Controls Handlers
  const handleTogglePlay = () => {
    if (isRunning) {
      engine.pause();
    } else {
      engine.start();
    }
  };

  const handleReset = () => {
    engine.reset();
  };

  const handleTriggerRandom = () => {
    engine.triggerAutonomousNegotiation();
  };

  const handleChangeSpeed = (newSpeed: number) => {
    engine.setSpeed(newSpeed);
  };

  const handleToggleSound = () => {
    const isEnabled = engine.toggleSound();
    setSoundEnabled(isEnabled);
  };

  const handleClearLogs = () => {
    engine.clearLogs();
  };

  const handleChangeStrategy = (agentId: string, strategy: StrategyType) => {
    engine.setAgentStrategy(agentId, strategy);
  };

  const handleManualRequest = (params: {
    requesterId: string;
    targetPeerId: string;
    resourceType: ResourceType;
    amount: number;
    duration: number;
    priority: Priority;
  }) => {
    engine.createManualRequest(params);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-yellow-500/30 selection:text-yellow-200">
      
      {/* Top Navigation Header */}
      <Header
        isRunning={isRunning}
        speed={speed}
        stats={stats}
        soundEnabled={soundEnabled}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        onTriggerRandom={handleTriggerRandom}
        onChangeSpeed={handleChangeSpeed}
        onToggleSound={handleToggleSound}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Dynamic Global Telemetry Statistics Row */}
        <Statistics stats={stats} />

        {/* Central Visualization Section: Network Graph + Live Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Central P2P Mesh Network Canvas */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <NetworkGraph
              agents={agents}
              packets={packets}
              onSelectAgent={(agent) => setSelectedAgent(agent)}
              selectedAgentId={selectedAgent?.id}
            />
          </div>

          {/* Live Negotiation Console Log */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <NegotiationConsole
              logs={logs}
              onClearLogs={handleClearLogs}
            />
          </div>
        </div>

        {/* Peer Agents Resource Cards Grid */}
        <AgentPanel
          agents={agents}
          selectedAgentId={selectedAgent?.id}
          onSelectAgent={(agent) => setSelectedAgent(agent)}
          onChangeStrategy={handleChangeStrategy}
        />

        {/* Interactive Bottom Control Panel: Manual Request Form + History Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Manual Request Panel */}
          <div className="lg:col-span-5 space-y-4">
            <ResourceRequestPanel
              agents={agents}
              onSubmitRequest={handleManualRequest}
            />
          </div>

          {/* Historical Ledger Audit Table */}
          <div className="lg:col-span-7 space-y-4">
            <NegotiationHistory history={history} />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06080d] py-6 px-4 lg:px-8 text-center text-xs text-slate-500 font-mono space-y-1">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Peer-to-Peer Multi-Agent Architecture • Decentralized Resource Sharing & Negotiation</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Zero Central Controller • Distributed Decision Engines • Direct Bilateral Protocols • Localhost MAS Simulation
        </p>
      </footer>

      {/* Architecture Explanation Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Agent Detail Inspection Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onChangeStrategy={handleChangeStrategy}
      />
    </div>
  );
};

export default App;
