import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  ResourceType,
  Priority,
  AgentId,
  ProviderNode,
  PipelineAgentInfo,
  ResourceRequest,
  PipelineDataPacket,
  ActiveLease,
  EventLogItem,
  PipelineStats,
} from '../types';
import { INITIAL_PROVIDERS, INITIAL_AGENTS } from './initialData';
import {
  executeResourceDiscovery,
  executeResourceEvaluation,
  executeResourceNegotiation,
  executeResourceDecision,
  executeResourceAllocation,
} from './agentLogic';
import { playStepSound, playSuccessSound, playFailSound } from '../utils/audio';
import confetti from 'canvas-confetti';

const STAGE_ORDER: AgentId[] = ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'];

export function usePipelineEngine() {
  const [providers, setProviders] = useState<ProviderNode[]>(INITIAL_PROVIDERS);
  const [agents, setAgents] = useState<PipelineAgentInfo[]>(INITIAL_AGENTS);
  const [activePacket, setActivePacket] = useState<PipelineDataPacket | null>(null);
  const [packetHistory, setPacketHistory] = useState<PipelineDataPacket[]>([]);
  const [activeLeases, setActiveLeases] = useState<ActiveLease[]>([]);
  const [logs, setLogs] = useState<EventLogItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [autoSimActive, setAutoSimActive] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 0.5, 1, 2, 4
  const [stats, setStats] = useState<PipelineStats>({
    totalRequests: 0,
    completedRequests: 0,
    failedRequests: 0,
    successfulNegotiations: 0,
    failedNegotiations: 0,
    avgPipelineDurationMs: 0,
    avgNegotiationDurationMs: 0,
    totalResourcesAllocatedUnits: 0,
    activeLeasesCount: 0,
  });

  const pipelineTimerRef = useRef<any>(null);
  const autoSimTimerRef = useRef<any>(null);
  const providersRef = useRef<ProviderNode[]>(providers);
  const agentsRef = useRef<PipelineAgentInfo[]>(agents);
  const activePacketRef = useRef<PipelineDataPacket | null>(activePacket);
  const isPausedRef = useRef<boolean>(isPaused);
  const simSpeedRef = useRef<number>(simSpeed);

  providersRef.current = providers;
  agentsRef.current = agents;
  activePacketRef.current = activePacket;
  isPausedRef.current = isPaused;
  simSpeedRef.current = simSpeed;

  const addLog = useCallback((
    source: EventLogItem['source'],
    type: EventLogItem['type'],
    title: string,
    details: string,
    stage?: AgentId,
    dataSnippet?: any
  ) => {
    const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const newLog: EventLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      source,
      stage,
      type,
      title,
      details,
      dataSnippet,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 199)]); // Keep latest 200
  }, []);

  // Update lease timers and release expired allocations
  useEffect(() => {
    const leaseInterval = setInterval(() => {
      setActiveLeases((prevLeases) => {
        if (prevLeases.length === 0) return prevLeases;

        const updated: ActiveLease[] = [];
        const expired: ActiveLease[] = [];

        prevLeases.forEach((lease) => {
          const nextRemaining = lease.remainingSeconds - 1;
          if (nextRemaining <= 0) {
            expired.push({ ...lease, remainingSeconds: 0, status: 'EXPIRED' });
          } else {
            updated.push({ ...lease, remainingSeconds: nextRemaining });
          }
        });

        // If any expired, restore provider resources
        if (expired.length > 0) {
          expired.forEach((expLease) => {
            setProviders((prevProviders) =>
              prevProviders.map((p) => {
                if (p.id === expLease.providerId) {
                  const restored = Math.min(100, p.available[expLease.resourceType] + expLease.amount);
                  const nextWorkload = Math.max(10, p.currentWorkload - 12);
                  return {
                    ...p,
                    available: {
                      ...p.available,
                      [expLease.resourceType]: restored,
                    },
                    currentWorkload: nextWorkload,
                    status: 'IDLE',
                  };
                }
                return p;
              })
            );

            addLog(
              'AGENT_5',
              'INFO',
              `Lease Expired: ${expLease.providerName}`,
              `Allocated ${expLease.amount}% ${expLease.resourceType} released back to provider pool. Session finished.`,
              'agent-5'
            );
          });
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(leaseInterval);
  }, [addLog]);

  // Keep stats in sync with active leases
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      activeLeasesCount: activeLeases.length,
    }));
  }, [activeLeases]);

  // Reset agent statuses to IDLE when no packet is processing
  const resetAgentStatuses = useCallback(() => {
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        status: a.isFailed ? 'FAILED' : 'IDLE',
        currentTaskDescription: a.isFailed ? '⚠️ NODE OFFLINE / INTERRUPTED' : 'Ready for input',
      }))
    );
  }, []);

  // Handle stage failure due to agent downtime
  const handleStageFailure = useCallback((agentId: AgentId, packet: PipelineDataPacket, reason: string) => {
    playFailSound();

    const updatedPacket: PipelineDataPacket = {
      ...packet,
      currentStage: 'HALTED',
      isTerminated: true,
      terminationReason: reason,
      history: [
        ...packet.history,
        {
          stage: agentId,
          enteredAt: Date.now(),
          status: 'FAILED',
          note: `PIPELINE STALLED: ${reason}`,
        },
      ],
    };

    setActivePacket(updatedPacket);

    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          return {
            ...a,
            status: 'FAILED',
            failedOperations: a.failedOperations + 1,
            currentTaskDescription: `❌ STALLED: ${reason}`,
          };
        }
        // Downstream agents are marked as WAITING / STALLED
        const aIndex = STAGE_ORDER.indexOf(a.id);
        const fIndex = STAGE_ORDER.indexOf(agentId);
        if (aIndex > fIndex) {
          return {
            ...a,
            status: 'WAITING',
            currentTaskDescription: `⏸ Starved: Upstream node ${agentId} failed to deliver payload.`,
          };
        }
        return a;
      })
    );

    setStats((prev) => ({
      ...prev,
      failedRequests: prev.failedRequests + 1,
    }));

    addLog(
      'PIPELINE',
      'ERROR',
      `⚠️ PIPELINE INTERRUPTED: ${agentId.toUpperCase()} UNAVAILABLE`,
      `Data packet stalled at ${agentId}. Pipeline sequential execution interrupted. Downstream stages cannot proceed.`,
      agentId
    );
  }, [addLog]);

  // Handle standard rejection / early exit
  const handlePipelineEnd = useCallback((
    packet: PipelineDataPacket,
    reason: string,
    stage: AgentId
  ) => {
    playFailSound();

    const updatedPacket: PipelineDataPacket = {
      ...packet,
      currentStage: 'HALTED',
      isTerminated: true,
      terminationReason: reason,
      history: [
        ...packet.history,
        {
          stage,
          enteredAt: Date.now(),
          status: 'FAILED',
          note: reason,
        },
      ],
    };

    setActivePacket(updatedPacket);
    setPacketHistory((prev) => [updatedPacket, ...prev.slice(0, 49)]);

    setStats((prev) => ({
      ...prev,
      failedRequests: prev.failedRequests + 1,
    }));

    addLog(
      'PIPELINE',
      'WARNING',
      `Pipeline Terminated at ${stage.toUpperCase()}`,
      reason,
      stage
    );

    setTimeout(() => {
      resetAgentStatuses();
    }, 2500);
  }, [addLog, resetAgentStatuses]);

  // Execute Stage 5: Resource Allocation
  const runStage5 = useCallback((packet: PipelineDataPacket) => {
    const agent = agentsRef.current.find((a) => a.id === 'agent-5');
    if (agent?.isFailed) {
      handleStageFailure('agent-5', packet, 'Resource Allocation Agent is offline / unreachable.');
      return;
    }

    if (!packet.decisionResult || !packet.negotiationResult) return;

    playStepSound(5);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === 'agent-5'
          ? { ...a, status: 'PROCESSING', currentTaskDescription: `Atomically reserving capacity on ${packet.negotiationResult?.providerName}...` }
          : a
      )
    );

    addLog(
      'AGENT_5',
      'INFO',
      'Agent 5 → Atomic Resource Allocation',
      `Reserving ${packet.negotiationResult.agreedAmount}% ${packet.request.resourceType} from ${packet.negotiationResult.providerName}`,
      'agent-5'
    );

    const delay = Math.round(1200 / simSpeedRef.current);

    pipelineTimerRef.current = setTimeout(() => {
      if (isPausedRef.current) return;

      const { allocation, lease } = executeResourceAllocation(
        packet.decisionResult!,
        packet.negotiationResult!,
        packet.request
      );

      if (lease) {
        // Deduct from provider
        setProviders((prevProviders) =>
          prevProviders.map((p) => {
            if (p.id === lease.providerId) {
              const currentAvail = p.available[packet.request.resourceType];
              const nextAvail = Math.max(0, currentAvail - lease.amount);
              const nextWorkload = Math.min(95, p.currentWorkload + 15);
              return {
                ...p,
                available: {
                  ...p.available,
                  [packet.request.resourceType]: nextAvail,
                },
                currentWorkload: nextWorkload,
                status: 'PROVIDING RESOURCE',
                totalAllocationsServed: p.totalAllocationsServed + 1,
              };
            }
            return p;
          })
        );

        // Add to active leases
        setActiveLeases((prev) => [lease, ...prev]);

        // Trigger confetti celebration!
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#eab308', '#06b6d4', '#10b981'],
        });

        playSuccessSound();
      }

      const updatedPacket: PipelineDataPacket = {
        ...packet,
        currentStage: 'COMPLETED',
        allocationResult: allocation,
        history: [
          ...packet.history,
          {
            stage: 'Agent 5 - Allocation',
            enteredAt: Date.now() - delay,
            completedAt: Date.now(),
            status: 'SUCCESS',
            note: `Successfully allocated lease ${lease?.id} (${allocation.allocatedAmount}% for ${allocation.durationSeconds}s).`,
          },
        ],
      };

      setActivePacket(updatedPacket);
      setPacketHistory((prev) => [updatedPacket, ...prev.slice(0, 49)]);

      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === 'agent-5') {
            return {
              ...a,
              status: 'COMPLETED',
              requestsProcessed: a.requestsProcessed + 1,
              successfulOperations: a.successfulOperations + 1,
              currentTaskDescription: `Resource active. Lease ${lease?.id} running.`,
            };
          }
          return a;
        })
      );

      setStats((prev) => ({
        ...prev,
        completedRequests: prev.completedRequests + 1,
        totalResourcesAllocatedUnits: prev.totalResourcesAllocatedUnits + allocation.allocatedAmount,
      }));

      addLog(
        'AGENT_5',
        'SUCCESS',
        'Agent 5 → RESOURCE_ALLOCATED (Pipeline Completed)',
        `Active session running on ${allocation.providerName}. Lease ID: ${allocation.leaseId}`,
        'agent-5',
        allocation
      );

      // Return agents to IDLE after a short pause
      setTimeout(() => {
        resetAgentStatuses();
      }, 2500);
    }, delay);
  }, [addLog, handleStageFailure, resetAgentStatuses]);

  // Execute Stage 4: Decision Making
  const runStage4 = useCallback((packet: PipelineDataPacket) => {
    const agent = agentsRef.current.find((a) => a.id === 'agent-4');
    if (agent?.isFailed) {
      handleStageFailure('agent-4', packet, 'Decision Agent is offline / unresponsive.');
      return;
    }

    if (!packet.negotiationResult) return;

    playStepSound(4);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === 'agent-4'
          ? { ...a, status: 'PROCESSING', currentTaskDescription: 'Verifying SLA compliance & policy constraints...' }
          : a.id === 'agent-5' ? { ...a, status: 'WAITING', currentTaskDescription: 'Awaiting formal decision...' }
          : a
      )
    );

    addLog(
      'AGENT_4',
      'INFO',
      'Agent 4 → SLA Verification & Decision',
      `Validating negotiated parameters against policy requirements for ${packet.request.priority} priority.`,
      'agent-4'
    );

    const delay = Math.round(1100 / simSpeedRef.current);

    pipelineTimerRef.current = setTimeout(() => {
      if (isPausedRef.current) return;

      const decision = executeResourceDecision(packet.negotiationResult!, packet.request);
      const isAccepted = decision.decision === 'ACCEPT';

      const updatedPacket: PipelineDataPacket = {
        ...packet,
        currentStage: 'agent-5',
        decisionResult: decision,
        history: [
          ...packet.history,
          {
            stage: 'Agent 4 - Decision',
            enteredAt: Date.now() - delay,
            completedAt: Date.now(),
            status: isAccepted ? 'SUCCESS' : 'FAILED',
            note: `Decision: ${decision.decision} (${decision.reason})`,
          },
        ],
      };

      setActivePacket(updatedPacket);

      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === 'agent-4') {
            return {
              ...a,
              status: isAccepted ? 'COMPLETED' : 'IDLE',
              requestsProcessed: a.requestsProcessed + 1,
              successfulOperations: isAccepted ? a.successfulOperations + 1 : a.successfulOperations,
              failedOperations: !isAccepted ? a.failedOperations + 1 : a.failedOperations,
              currentTaskDescription: `Formal Decision: ${decision.decision}. Passing to Allocation Agent.`,
            };
          }
          return a;
        })
      );

      addLog(
        'AGENT_4',
        isAccepted ? 'SUCCESS' : 'WARNING',
        `Agent 4 → Agent 5: DECISION_${decision.decision}`,
        decision.reason,
        'agent-4',
        decision
      );

      if (!isAccepted) {
        handlePipelineEnd(packet, decision.reason, 'agent-4');
        return;
      }

      // Transition to Stage 5
      runStage5(updatedPacket);
    }, delay);
  }, [addLog, handlePipelineEnd, handleStageFailure, runStage5]);

  // Execute Stage 3: Negotiation
  const runStage3 = useCallback((packet: PipelineDataPacket) => {
    const agent = agentsRef.current.find((a) => a.id === 'agent-3');
    if (agent?.isFailed) {
      handleStageFailure('agent-3', packet, 'Negotiation Agent is offline / unresponsive.');
      return;
    }

    if (!packet.evaluationResult?.selectedProvider) return;

    const targetProviderId = packet.evaluationResult.selectedProvider.providerId;
    const targetProvider = providersRef.current.find((p) => p.id === targetProviderId);

    if (!targetProvider) return;

    playStepSound(3);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === 'agent-3'
          ? { ...a, status: 'PROCESSING', currentTaskDescription: `Initiating bargaining protocol with ${targetProvider.name}...` }
          : a.id === 'agent-4' ? { ...a, status: 'WAITING', currentTaskDescription: 'Awaiting negotiation outcome...' }
          : a
      )
    );

    addLog(
      'AGENT_3',
      'NEGOTIATION',
      `Agent 3 ⇄ ${targetProvider.name}: PROTOCOL START`,
      `Opening multi-round bargaining for ${packet.request.requiredAmount}% ${packet.request.resourceType}`,
      'agent-3'
    );

    const delay = Math.round(1800 / simSpeedRef.current);

    pipelineTimerRef.current = setTimeout(() => {
      if (isPausedRef.current) return;

      const negotiation = executeResourceNegotiation(packet.evaluationResult!, packet.request, targetProvider);

      // Log intermediate rounds
      negotiation.rounds.forEach((rnd) => {
        addLog(
          rnd.sender === 'Agent-3' ? 'AGENT_3' : 'PROVIDER',
          rnd.type === 'ACCEPT' ? 'SUCCESS' : rnd.type === 'REJECT' ? 'WARNING' : 'INFO',
          `Round ${rnd.roundNumber} [${rnd.sender}]: ${rnd.type}`,
          rnd.message,
          'agent-3'
        );
      });

      const isSuccess = negotiation.status === 'ACCEPTED' || negotiation.status === 'COUNTER_ACCEPTED';

      setStats((prev) => ({
        ...prev,
        successfulNegotiations: isSuccess ? prev.successfulNegotiations + 1 : prev.successfulNegotiations,
        failedNegotiations: !isSuccess ? prev.failedNegotiations + 1 : prev.failedNegotiations,
      }));

      const updatedPacket: PipelineDataPacket = {
        ...packet,
        currentStage: 'agent-4',
        negotiationResult: negotiation,
        history: [
          ...packet.history,
          {
            stage: 'Agent 3 - Negotiation',
            enteredAt: Date.now() - delay,
            completedAt: Date.now(),
            status: isSuccess ? 'SUCCESS' : 'FAILED',
            note: `${negotiation.status}: ${negotiation.summary}`,
          },
        ],
      };

      setActivePacket(updatedPacket);

      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === 'agent-3') {
            return {
              ...a,
              status: isSuccess ? 'COMPLETED' : 'IDLE',
              requestsProcessed: a.requestsProcessed + 1,
              successfulOperations: isSuccess ? a.successfulOperations + 1 : a.successfulOperations,
              failedOperations: !isSuccess ? a.failedOperations + 1 : a.failedOperations,
              currentTaskDescription: `Negotiation result: ${negotiation.status}. Forwarding contract to Agent 4.`,
            };
          }
          return a;
        })
      );

      addLog(
        'AGENT_3',
        'DATA_TRANSFER',
        `Agent 3 → Agent 4: NEGOTIATION_${negotiation.status}`,
        `Transferred negotiated terms (${negotiation.agreedAmount}% for ${negotiation.agreedDuration}s) to Decision Agent.`,
        'agent-3',
        negotiation
      );

      // Transition to Stage 4
      runStage4(updatedPacket);
    }, delay);
  }, [addLog, handleStageFailure, runStage4]);

  // Execute Stage 2: Evaluation
  const runStage2 = useCallback((packet: PipelineDataPacket) => {
    const agent = agentsRef.current.find((a) => a.id === 'agent-2');
    if (agent?.isFailed) {
      handleStageFailure('agent-2', packet, 'Resource Evaluation Agent is offline / unreachable.');
      return;
    }

    if (!packet.discoveryResult) return;

    playStepSound(2);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === 'agent-2'
          ? { ...a, status: 'PROCESSING', currentTaskDescription: 'Executing multi-criteria utility scoring & ranking...' }
          : a.id === 'agent-3' ? { ...a, status: 'WAITING', currentTaskDescription: 'Awaiting ranked candidate...' }
          : a
      )
    );

    addLog(
      'AGENT_2',
      'INFO',
      'Agent 2 → Resource Evaluation',
      `Evaluating ${packet.discoveryResult.candidates.length} candidates across headroom, reliability, latency, and workload.`,
      'agent-2'
    );

    const delay = Math.round(1300 / simSpeedRef.current);

    pipelineTimerRef.current = setTimeout(() => {
      if (isPausedRef.current) return;

      const evaluation = executeResourceEvaluation(packet.discoveryResult!, packet.request);
      const topCand = evaluation.selectedProvider;

      if (!topCand) {
        // No suitable provider found
        handlePipelineEnd(
          packet,
          'Agent 2 could not identify any suitable provider meeting minimum threshold.',
          'agent-2'
        );
        return;
      }

      const updatedPacket: PipelineDataPacket = {
        ...packet,
        currentStage: 'agent-3',
        evaluationResult: evaluation,
        history: [
          ...packet.history,
          {
            stage: 'Agent 2 - Evaluation',
            enteredAt: Date.now() - delay,
            completedAt: Date.now(),
            status: 'SUCCESS',
            note: `Top candidate ranked: ${topCand.providerName} (Score: ${topCand.suitabilityScore}/100)`,
          },
        ],
      };

      setActivePacket(updatedPacket);

      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === 'agent-2') {
            return {
              ...a,
              status: 'COMPLETED',
              requestsProcessed: a.requestsProcessed + 1,
              successfulOperations: a.successfulOperations + 1,
              currentTaskDescription: `Ranked #${topCand.rank}: ${topCand.providerName} (Score: ${topCand.suitabilityScore}). Passed to Agent 3.`,
            };
          }
          return a;
        })
      );

      addLog(
        'AGENT_2',
        'DATA_TRANSFER',
        `Agent 2 → Agent 3: BEST_PROVIDER (${topCand.providerName})`,
        `Forwarded candidate ${topCand.providerName} (Score ${topCand.suitabilityScore}) to Negotiation Agent.`,
        'agent-2',
        evaluation
      );

      // Transition to Stage 3
      runStage3(updatedPacket);
    }, delay);
  }, [addLog, handlePipelineEnd, handleStageFailure, runStage3]);

  // Execute Stage 1: Discovery
  const runStage1 = useCallback((packet: PipelineDataPacket) => {
    const agent = agentsRef.current.find((a) => a.id === 'agent-1');
    if (agent?.isFailed) {
      handleStageFailure('agent-1', packet, 'Resource Discovery Agent is offline / unreachable.');
      return;
    }

    playStepSound(1);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === 'agent-1'
          ? { ...a, status: 'PROCESSING', currentTaskDescription: `Scanning providers for ${packet.request.requiredAmount}% ${packet.request.resourceType}...` }
          : a.id === 'agent-2' ? { ...a, status: 'WAITING', currentTaskDescription: 'Awaiting discovery vectors...' }
          : a
      )
    );

    addLog(
      'AGENT_1',
      'INFO',
      'Agent 1 → Resource Discovery',
      `Scanning provider pool for ${packet.request.resourceType} >= ${packet.request.requiredAmount}% (Priority: ${packet.request.priority})`,
      'agent-1',
      { request: packet.request }
    );

    const delay = Math.round(1200 / simSpeedRef.current);

    pipelineTimerRef.current = setTimeout(() => {
      if (isPausedRef.current) return;

      const discovery = executeResourceDiscovery(packet.request, providersRef.current);
      const viableCount = discovery.candidates.filter((c) => c.meetsRequirement).length;

      const updatedPacket: PipelineDataPacket = {
        ...packet,
        currentStage: 'agent-2',
        discoveryResult: discovery,
        history: [
          ...packet.history,
          {
            stage: 'Agent 1 - Discovery',
            enteredAt: Date.now() - delay,
            completedAt: Date.now(),
            status: 'SUCCESS',
            note: `Discovered ${viableCount} eligible providers matching criteria.`,
          },
        ],
      };

      setActivePacket(updatedPacket);

      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === 'agent-1') {
            return {
              ...a,
              status: 'COMPLETED',
              requestsProcessed: a.requestsProcessed + 1,
              successfulOperations: a.successfulOperations + 1,
              currentTaskDescription: `Discovered ${viableCount} matching providers. Forwarding to Agent 2.`,
            };
          }
          return a;
        })
      );

      addLog(
        'AGENT_1',
        'DATA_TRANSFER',
        'Agent 1 → Agent 2: DISCOVERY_RESULT',
        `Forwarded ${discovery.candidates.length} candidate vectors to Evaluation Agent.`,
        'agent-1',
        discovery
      );

      // Transition to Stage 2
      runStage2(updatedPacket);
    }, delay);
  }, [addLog, handleStageFailure, runStage2]);

  // Start a new request through the pipeline
  const startPipeline = useCallback((req: Partial<ResourceRequest> = {}) => {
    if (activePacketRef.current && activePacketRef.current.currentStage !== 'COMPLETED' && activePacketRef.current.currentStage !== 'HALTED') {
      addLog('PIPELINE', 'WARNING', 'Pipeline Busy', 'A request is currently traversing the pipeline.');
      return;
    }

    const defaultRequest: ResourceRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      requester: req.requester || `Agent-${['Alpha', 'Beta', 'X', 'Z'][Math.floor(Math.random() * 4)]}`,
      resourceType: req.resourceType || (['CPU', 'RAM', 'Storage', 'Bandwidth'][Math.floor(Math.random() * 4)] as ResourceType),
      requiredAmount: req.requiredAmount || Math.floor(Math.random() * 30) + 15,
      durationSeconds: req.durationSeconds || Math.floor(Math.random() * 15) + 10,
      priority: req.priority || (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as Priority),
      timestamp: Date.now(),
    };

    const initialPacket: PipelineDataPacket = {
      id: `packet-${Date.now()}`,
      currentStage: 'agent-1',
      request: defaultRequest,
      history: [
        {
          stage: 'Request Submitted',
          enteredAt: Date.now(),
          status: 'SUCCESS',
          note: `New ${defaultRequest.priority} priority request for ${defaultRequest.requiredAmount}% ${defaultRequest.resourceType}.`,
        },
      ],
      isTerminated: false,
    };

    setActivePacket(initialPacket);
    setStats((prev) => ({ ...prev, totalRequests: prev.totalRequests + 1 }));

    addLog(
      'PIPELINE',
      'INFO',
      'Pipeline Started',
      `Processing Request: ${defaultRequest.requester} requesting ${defaultRequest.requiredAmount}% ${defaultRequest.resourceType} for ${defaultRequest.durationSeconds}s`
    );

    runStage1(initialPacket);
  }, [addLog, runStage1]);

  // Inject failure into an agent
  const toggleAgentFailure = useCallback((agentId: AgentId) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          const nextFailed = !a.isFailed;
          if (nextFailed) {
            addLog(
              'SYSTEM',
              'ERROR',
              `AGENT FAILURE SIMULATED: ${a.name} (${a.title})`,
              `Node ${a.name} is now OFFLINE. All pipeline traffic reaching this stage will stall.`,
              agentId
            );
          } else {
            addLog(
              'SYSTEM',
              'SUCCESS',
              `AGENT RESTORED: ${a.name}`,
              `Node ${a.name} has been recovered and is ready to resume pipeline operations.`,
              agentId
            );
          }
          return {
            ...a,
            isFailed: nextFailed,
            status: nextFailed ? 'FAILED' : 'IDLE',
            currentTaskDescription: nextFailed ? '⚠️ NODE OFFLINE / CRASHED' : 'Node restored. Ready.',
          };
        }
        return a;
      })
    );
  }, [addLog]);

  // Restore agent and resume pipeline if halted at that agent
  const restoreAgent = useCallback((agentId: AgentId) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? { ...a, isFailed: false, status: 'IDLE', currentTaskDescription: 'Node restored. Ready.' }
          : a
      )
    );

    addLog(
      'SYSTEM',
      'SUCCESS',
      `Agent Restored: ${agentId}`,
      `Agent node ${agentId} is now back online. Resuming operations.`,
      agentId
    );

    // If current packet was halted at this agent, resume execution
    if (activePacketRef.current && activePacketRef.current.isTerminated && activePacketRef.current.currentStage === 'HALTED') {
      const packet = { ...activePacketRef.current, isTerminated: false };
      setActivePacket(packet);

      if (agentId === 'agent-1') runStage1(packet);
      else if (agentId === 'agent-2') runStage2(packet);
      else if (agentId === 'agent-3') runStage3(packet);
      else if (agentId === 'agent-4') runStage4(packet);
      else if (agentId === 'agent-5') runStage5(packet);
    }
  }, [addLog, runStage1, runStage2, runStage3, runStage4, runStage5]);

  // Auto simulation loop
  const toggleAutoSim = useCallback(() => {
    setAutoSimActive((prev) => {
      const next = !prev;
      if (next) {
        addLog('SYSTEM', 'SUCCESS', 'Auto Simulation Activated', 'Autonomous request generator started.');
      } else {
        addLog('SYSTEM', 'INFO', 'Auto Simulation Stopped', 'Autonomous request generator paused.');
      }
      return next;
    });
  }, [addLog]);

  useEffect(() => {
    if (!autoSimActive) {
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
      return;
    }

    autoSimTimerRef.current = setInterval(() => {
      // Trigger a request if pipeline is not busy
      if (!activePacketRef.current || activePacketRef.current.currentStage === 'COMPLETED' || activePacketRef.current.currentStage === 'HALTED') {
        startPipeline();
      }
    }, 7000 / simSpeed);

    return () => {
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    };
  }, [autoSimActive, simSpeed, startPipeline]);

  // Pause / Resume
  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      addLog('SYSTEM', next ? 'WARNING' : 'INFO', next ? 'Pipeline Paused' : 'Pipeline Resumed', `Execution is now ${next ? 'frozen' : 'active'}.`);
      return next;
    });
  }, [addLog]);

  // Reset System
  const resetSystem = useCallback(() => {
    if (pipelineTimerRef.current) clearTimeout(pipelineTimerRef.current);
    if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);

    setProviders(INITIAL_PROVIDERS);
    setAgents(INITIAL_AGENTS);
    setActivePacket(null);
    setPacketHistory([]);
    setActiveLeases([]);
    setIsPaused(false);
    setAutoSimActive(false);
    setStats({
      totalRequests: 0,
      completedRequests: 0,
      failedRequests: 0,
      successfulNegotiations: 0,
      failedNegotiations: 0,
      avgPipelineDurationMs: 0,
      avgNegotiationDurationMs: 0,
      totalResourcesAllocatedUnits: 0,
      activeLeasesCount: 0,
    });

    addLog('SYSTEM', 'INFO', 'System Reset', 'All pipeline states, provider capacities, and counters reset to initial default.');
  }, [addLog]);

  // Release a lease early
  const releaseLease = useCallback((leaseId: string) => {
    setActiveLeases((prevLeases) => {
      const target = prevLeases.find((l) => l.id === leaseId);
      if (!target) return prevLeases;

      // Restore provider capacity
      setProviders((prevProviders) =>
        prevProviders.map((p) => {
          if (p.id === target.providerId) {
            const restored = Math.min(100, p.available[target.resourceType] + target.amount);
            return {
              ...p,
              available: {
                ...p.available,
                [target.resourceType]: restored,
              },
              status: 'IDLE',
            };
          }
          return p;
        })
      );

      addLog(
        'AGENT_5',
        'INFO',
        `Early Lease Release: ${target.providerName}`,
        `Manual early release executed for ${target.amount}% ${target.resourceType}. Capacity restored.`,
        'agent-5'
      );

      return prevLeases.filter((l) => l.id !== leaseId);
    });
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    providers,
    agents,
    activePacket,
    packetHistory,
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
    setProviders,
  };
}
