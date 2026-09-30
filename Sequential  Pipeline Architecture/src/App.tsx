import { useState } from 'react';
import { usePipelineEngine } from './simulation/usePipelineEngine';
import { Header } from './components/Header';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { DataPacketInspector } from './components/DataPacketInspector';
import { AgentDashboard } from './components/AgentDashboard';
import { ProviderDashboard } from './components/ProviderDashboard';
import { RequestPanel } from './components/RequestPanel';
import { EventConsole } from './components/EventConsole';
import { StatisticsPanel } from './components/StatisticsPanel';
import { ActiveLeasesPanel } from './components/ActiveLeasesPanel';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { FailureBanner } from './components/FailureBanner';
import { NegotiationModal } from './components/NegotiationModal';
import type { AgentId } from './types';

export function App() {
  const {
    providers,
    agents,
    activePacket,
    activeLeases,
    logs,
    isPaused,
    autoSimActive,
    simSpeed,
    stats,
    startPipeline,
    toggleAgentFailure,
    restoreAgent,
    toggleAutoSim,
    togglePause,
    resetSystem,
    releaseLease,
    clearLogs,
    setSimSpeed,
  } = usePipelineEngine();

  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);

  const failedAgent = agents.find((a) => a.isFailed) || null;
  const isPipelineBusy = Boolean(
    activePacket &&
    activePacket.currentStage !== 'COMPLETED' &&
    activePacket.currentStage !== 'HALTED'
  );

  const handleSelectAgent = (agentId: AgentId) => {
    setSelectedAgentId(agentId);
    if (agentId === 'agent-3' && activePacket?.negotiationResult) {
      setIsNegotiationModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <Header
        isPaused={isPaused}
        autoSimActive={autoSimActive}
        simSpeed={simSpeed}
        activeLeasesCount={activeLeases.length}
        totalRequests={stats.totalRequests}
        onTogglePause={togglePause}
        onToggleAutoSim={toggleAutoSim}
        onReset={resetSystem}
        onSetSpeed={setSimSpeed}
        hasFailedAgent={Boolean(failedAgent)}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Failure / Interruption Banner */}
        <FailureBanner failedAgent={failedAgent} onRestoreAgent={restoreAgent} />

        {/* 1. Core Visual Pipeline */}
        <section>
          <PipelineVisualizer
            agents={agents}
            activePacket={activePacket}
            onSelectAgent={handleSelectAgent}
            selectedAgentId={selectedAgentId}
          />
        </section>

        {/* 2. Interactive Workspaces: Controls & Telemetry Left, Inspector & Console Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Request Generator, Active Leases, Stats (7 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <RequestPanel
              onStartPipeline={startPipeline}
              autoSimActive={autoSimActive}
              onToggleAutoSim={toggleAutoSim}
              isPaused={isPaused}
              onTogglePause={togglePause}
              onReset={resetSystem}
              isBusy={isPipelineBusy}
            />

            <ActiveLeasesPanel
              leases={activeLeases}
              onReleaseLease={releaseLease}
            />

            <StatisticsPanel stats={stats} />
          </div>

          {/* Right Column: Data Packet Inspector & Live Event Console (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <DataPacketInspector activePacket={activePacket} />

            <EventConsole logs={logs} onClearLogs={clearLogs} />
          </div>
        </div>

        {/* 3. 5 Pipeline Agent Fleet Cards */}
        <section>
          <AgentDashboard
            agents={agents}
            onToggleFailure={toggleAgentFailure}
            onRestoreAgent={restoreAgent}
            onSelectAgent={handleSelectAgent}
            selectedAgentId={selectedAgentId}
          />
        </section>

        {/* 4. Dynamic Resource Providers Cards */}
        <section>
          <ProviderDashboard
            providers={providers}
            highlightedProviderId={activePacket?.negotiationResult?.providerId}
          />
        </section>

        {/* 5. Architecture Explanation & Comparative Matrix */}
        <section>
          <ArchitectureGuide />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-4 lg:px-8 text-center text-xs font-mono text-slate-500 mt-12">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-slate-400">Sequential Pipeline Multi-Agent Resource Sharing & Negotiation Simulator</span>
          </div>
          <div>
            Built with React, TypeScript, and Tailwind CSS • Academic & Engineering Grade MAS Simulation
          </div>
        </div>
      </footer>

      {/* Negotiation Round Modal */}
      <NegotiationModal
        isOpen={isNegotiationModalOpen}
        onClose={() => setIsNegotiationModalOpen(false)}
        negotiation={activePacket?.negotiationResult || null}
        request={activePacket?.request || null}
      />
    </div>
  );
}

export default App;
