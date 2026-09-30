import { Agent } from './Agent';
import { DecisionEngine, ProviderEvaluation } from './DecisionEngine';
import { NegotiationEngine, NegotiationResult } from './NegotiationEngine';
import {
  AgentData,
  ControllerMetrics,
  MessagePacket,
  NegotiationSession,
  NegotiationTurn,
  PriorityLevel,
  ResourceAllocated,
  ResourceRequest,
  ResourceType,
  SystemLogEvent,
} from './types';

export class CentralController {
  public agents: Map<string, Agent> = new Map();
  public decisionEngine: DecisionEngine = new DecisionEngine();
  public negotiationEngine: NegotiationEngine = new NegotiationEngine();

  // Internal Manager States
  public requestQueue: ResourceRequest[] = [];
  public activeAllocations: Map<string, ResourceAllocated> = new Map();
  public completedAllocations: ResourceAllocated[] = [];
  public activeNegotiations: Map<string, NegotiationSession> = new Map();
  public negotiationHistory: NegotiationSession[] = [];
  public logs: SystemLogEvent[] = [];

  // Metrics
  public metrics: ControllerMetrics = {
    status: 'ONLINE',
    activeRequests: 0,
    activeNegotiations: 0,
    resourcesAllocatedCount: 0,
    successfulNegotiations: 0,
    failedNegotiations: 0,
    totalResourcesShared: 0,
    totalDecisions: 0,
    averageNegotiationTimeMs: 1450,
    uptimeSeconds: 0,
    downtimeSeconds: 0,
    spofIncidents: 0,
    queueLength: 0,
  };

  private messageCallback?: (packet: MessagePacket) => void;
  private logCallback?: (log: SystemLogEvent) => void;
  private stateChangeCallback?: () => void;

  constructor() {
    this.initDefaultAgents();
  }

  public setCallbacks(
    onMessage: (packet: MessagePacket) => void,
    onLog: (log: SystemLogEvent) => void,
    onStateChange: () => void
  ) {
    this.messageCallback = onMessage;
    this.logCallback = onLog;
    this.stateChangeCallback = onStateChange;
  }

  private notify() {
    this.updateMetricsSummary();
    if (this.stateChangeCallback) {
      this.stateChangeCallback();
    }
  }

  public initDefaultAgents() {
    this.agents.clear();
    this.agents.set('agent-a', new Agent('agent-a', 'Agent A', '#38bdf8', { cpu: 70, ram: 45, storage: 80, bandwidth: 60 }, 'BALANCED'));
    this.agents.set('agent-b', new Agent('agent-b', 'Agent B', '#facc15', { cpu: 35, ram: 30, storage: 45, bandwidth: 25 }, 'COOPERATIVE'));
    this.agents.set('agent-c', new Agent('agent-c', 'Agent C', '#4ade80', { cpu: 85, ram: 75, storage: 60, bandwidth: 80 }, 'GREEDY'));
    this.agents.set('agent-d', new Agent('agent-d', 'Agent D', '#c084fc', { cpu: 25, ram: 40, storage: 35, bandwidth: 30 }, 'BALANCED'));
    this.agents.set('agent-e', new Agent('agent-e', 'Agent E', '#fb7185', { cpu: 40, ram: 20, storage: 50, bandwidth: 45 }, 'COOPERATIVE'));
  }

  public getAgentDataList(): AgentData[] {
    return Array.from(this.agents.values()).map((a) => a.data);
  }

  public getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  public logEvent(
    sender: string,
    receiver: string,
    type: MessagePacket['type'],
    summary: string,
    details: string,
    isSuccess?: boolean,
    isFailure?: boolean
  ) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    
    const event: SystemLogEvent = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      isoTime: Date.now(),
      sender,
      receiver,
      type,
      summary,
      details,
      isSuccess,
      isFailure,
    };

    this.logs.unshift(event);
    if (this.logs.length > 300) {
      this.logs.pop();
    }

    if (this.logCallback) {
      this.logCallback(event);
    }
  }

  public emitPacket(packet: MessagePacket) {
    if (this.messageCallback) {
      this.messageCallback(packet);
    }
  }

  // ==========================================
  // FAILURE SIMULATION & RESILIENCE (SPOF)
  // ==========================================

  public simulateFailure() {
    this.metrics.status = 'OFFLINE';
    this.metrics.spofIncidents++;

    // When central controller goes down, all agents transition to WAITING/OFFLINE
    this.agents.forEach((agent) => {
      agent.setStatus('WAITING', 'Master Controller Unreachable (SPOF outage)');
    });

    this.logEvent(
      'System Fault Injection',
      'Central Controller',
      'CONTROLLER_FAILURE',
      'CENTRAL CONTROLLER FAILURE SIMULATED',
      'Single Point of Failure triggered. Master node is OFFLINE. All resource discovery and negotiations halted.',
      false,
      true
    );

    this.emitPacket({
      id: `pkt-fail-${Date.now()}`,
      timestamp: Date.now(),
      from: 'System Fault Injection',
      to: 'Central Controller',
      type: 'CONTROLLER_FAILURE',
      details: 'CRITICAL ALERT: Central Controller Failure',
    });

    this.notify();
  }

  public restoreController() {
    this.metrics.status = 'ONLINE';

    // Restore agents
    this.agents.forEach((agent) => {
      if (agent.data.status === 'WAITING' || agent.data.status === 'OFFLINE') {
        agent.setStatus('IDLE', 'Controller connection re-established');
      }
    });

    this.logEvent(
      'System Recovery',
      'Central Controller',
      'CONTROLLER_RESTORED',
      'CENTRAL CONTROLLER RESTORED',
      'Master node is back ONLINE. Restoring agent state telemetry and request processing.',
      true,
      false
    );

    this.emitPacket({
      id: `pkt-restore-${Date.now()}`,
      timestamp: Date.now(),
      from: 'System Recovery',
      to: 'Central Controller',
      type: 'CONTROLLER_RESTORED',
      details: 'Central Controller back online.',
    });

    this.notify();
  }

  // ==========================================
  // WORKFLOW: REQUEST -> NEGOTIATION -> ALLOCATION
  // ==========================================

  public submitResourceRequest(
    requesterId: string,
    resourceType: ResourceType,
    amount: number,
    duration: number,
    priority: PriorityLevel = 'HIGH'
  ): { success: boolean; message: string; requestId?: string } {
    if (this.metrics.status === 'OFFLINE') {
      this.logEvent(
        'Request Manager',
        'Requester',
        'CONTROLLER_FAILURE',
        'REQUEST REJECTED: Controller is OFFLINE',
        'Cannot submit request: Central Controller is in failure state (SPOF).',
        false,
        true
      );
      return {
        success: false,
        message: 'Central Controller is OFFLINE. Cannot process request.',
      };
    }

    const requester = this.agents.get(requesterId);
    if (!requester) {
      return { success: false, message: 'Invalid requester agent' };
    }

    const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const request: ResourceRequest = {
      id: requestId,
      requesterId,
      resourceType,
      requiredAmount: amount,
      duration,
      priority,
      timestamp: Date.now(),
      status: 'QUEUED',
    };

    this.requestQueue.push(request);
    requester.setStatus('REQUESTING', `Requesting ${amount}% ${resourceType}`);

    // Packet 1: Requester -> Central Controller (RESOURCE_REQUEST)
    this.emitPacket({
      id: `pkt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      from: requester.data.name,
      to: 'Central Controller',
      type: 'RESOURCE_REQUEST',
      resourceType,
      amount,
      duration,
      priority,
      details: `Requesting ${amount}% ${resourceType} for ${duration}s`,
      requestId,
    });

    this.logEvent(
      requester.data.name,
      'Central Controller',
      'RESOURCE_REQUEST',
      `RESOURCE REQUEST: ${amount}% ${resourceType}`,
      `Agent ${requester.data.name} requested ${amount}% ${resourceType} for ${duration}s (Priority: ${priority}). Queued in Central Request Manager.`
    );

    this.notify();

    // Process queued request asynchronously to allow visual flow
    setTimeout(() => {
      this.processNextRequest(request);
    }, 600);

    return { success: true, message: 'Request submitted successfully', requestId };
  }

  private processNextRequest(request: ResourceRequest) {
    if (this.metrics.status === 'OFFLINE') return;

    const requester = this.agents.get(request.requesterId);
    if (!requester) return;

    requester.setStatus('WAITING', 'Central Controller searching providers...');

    // 1. Resource Manager & Decision Engine Search
    const agentDataMap = new Map<string, AgentData>();
    this.agents.forEach((a, k) => agentDataMap.set(k, a.data));

    const bestCandidate = this.decisionEngine.selectBestProvider(request, agentDataMap);
    this.metrics.totalDecisions++;

    if (!bestCandidate) {
      // No provider available
      request.status = 'REJECTED';
      request.reason = 'No suitable provider with available capacity';
      requester.setStatus('REJECTED', 'No provider found');
      this.metrics.failedNegotiations++;

      this.emitPacket({
        id: `pkt-reject-${Date.now()}`,
        timestamp: Date.now(),
        from: 'Central Controller',
        to: requester.data.name,
        type: 'NEGOTIATION_FAILED',
        details: 'No available resource provider could satisfy request.',
        requestId: request.id,
      });

      this.logEvent(
        'Central Controller',
        requester.data.name,
        'NEGOTIATION_FAILED',
        `REQUEST REJECTED: No provider available`,
        `Decision Engine evaluated all registered agents. Zero candidates meet minimal criteria for ${request.requiredAmount}% ${request.resourceType}.`,
        false,
        true
      );

      this.notify();
      setTimeout(() => {
        if (requester.data.status === 'REJECTED') {
          requester.setStatus('IDLE');
          this.notify();
        }
      }, 3000);
      return;
    }

    const provider = this.agents.get(bestCandidate.agentId);
    if (!provider) return;

    request.status = 'NEGOTIATING';
    request.selectedProvider = provider.data.id;
    requester.setStatus('NEGOTIATING', `Controller negotiating with ${provider.data.name}`);
    provider.setStatus('NEGOTIATING', `Evaluating request from ${requester.data.name}`);

    // Packet 2: Central Controller -> Provider (PROVIDER_REQUEST)
    this.emitPacket({
      id: `pkt-prov-req-${Date.now()}`,
      timestamp: Date.now(),
      from: 'Central Controller',
      to: provider.data.name,
      type: 'PROVIDER_REQUEST',
      resourceType: request.resourceType,
      amount: request.requiredAmount,
      duration: request.duration,
      priority: request.priority,
      details: `Inquiring availability for ${request.requiredAmount}% ${request.resourceType}`,
      requestId: request.id,
    });

    this.logEvent(
      'Central Controller',
      provider.data.name,
      'PROVIDER_REQUEST',
      `PROVIDER INQUIRY: ${provider.data.name}`,
      `Controller selected ${provider.data.name} (Score: ${bestCandidate.score}). Inquiring ${request.requiredAmount}% ${request.resourceType}.`
    );

    this.notify();

    // Step 2: Negotiation Execution
    setTimeout(() => {
      this.executeNegotiationStep(request, requester, provider, bestCandidate);
    }, 800);
  }

  private executeNegotiationStep(
    request: ResourceRequest,
    requester: Agent,
    provider: Agent,
    evaluation: ProviderEvaluation
  ) {
    if (this.metrics.status === 'OFFLINE') return;

    this.metrics.activeNegotiations++;
    const negResult: NegotiationResult = this.negotiationEngine.executeNegotiation(
      request,
      requester.data,
      provider.data
    );

    // Record session
    this.activeNegotiations.set(negResult.session.id, negResult.session);
    this.negotiationHistory.unshift(negResult.session);
    if (this.negotiationHistory.length > 50) {
      this.negotiationHistory.pop();
    }

    // Packet 3: Provider -> Central Controller (OFFER or COUNTER_OFFER)
    const isCounter = negResult.agreedAmount !== request.requiredAmount;
    const packetType = isCounter ? 'COUNTER_OFFER' : 'OFFER';

    this.emitPacket({
      id: `pkt-offer-${Date.now()}`,
      timestamp: Date.now(),
      from: provider.data.name,
      to: 'Central Controller',
      type: packetType,
      resourceType: request.resourceType,
      amount: negResult.agreedAmount,
      duration: negResult.agreedDuration,
      details: isCounter
        ? `Counter-Offer: ${negResult.agreedAmount}% ${request.resourceType} for ${negResult.agreedDuration}s`
        : `Offer: Direct accept of full ${negResult.agreedAmount}% ${request.resourceType}`,
      requestId: request.id,
    });

    this.logEvent(
      provider.data.name,
      'Central Controller',
      packetType,
      isCounter ? `COUNTER-OFFER: ${negResult.agreedAmount}%` : `OFFER ACCEPTED: ${negResult.agreedAmount}%`,
      negResult.session.turns[2]?.comment || `Provider response dispatched to Central Controller.`
    );

    this.notify();

    // Step 3: Controller forwards decision to Requester
    setTimeout(() => {
      if (this.metrics.status === 'OFFLINE') return;

      this.metrics.activeNegotiations = Math.max(0, this.metrics.activeNegotiations - 1);

      if (negResult.finalDecision === 'ACCEPTED') {
        this.metrics.successfulNegotiations++;
        request.status = 'ALLOCATED';
        request.agreedAmount = negResult.agreedAmount;
        request.agreedDuration = negResult.agreedDuration;

        requester.setStatus('ACCEPTED', `Secured ${negResult.agreedAmount}% ${request.resourceType}`);
        provider.setStatus('PROVIDING', `Lending ${negResult.agreedAmount}% ${request.resourceType} to ${requester.data.name}`);

        // Packet 4: Central Controller -> Requester (OFFER_ACCEPTED)
        this.emitPacket({
          id: `pkt-accepted-${Date.now()}`,
          timestamp: Date.now(),
          from: 'Central Controller',
          to: requester.data.name,
          type: 'OFFER_ACCEPTED',
          resourceType: request.resourceType,
          amount: negResult.agreedAmount,
          duration: negResult.agreedDuration,
          details: `Agreement secured: ${provider.data.name} providing ${negResult.agreedAmount}% for ${negResult.agreedDuration}s`,
          requestId: request.id,
        });

        this.logEvent(
          'Central Controller',
          requester.data.name,
          'OFFER_ACCEPTED',
          `AGREEMENT REACHED: ${requester.data.name} ⟷ ${provider.data.name}`,
          `Central Controller finalized mediated lease: ${provider.data.name} supplies ${negResult.agreedAmount}% ${request.resourceType} to ${requester.data.name}.`,
          true
        );

        // Step 4: Finalize Resource Allocation & Lease Lock
        this.allocateResource(
          request.id,
          requester,
          provider,
          request.resourceType,
          negResult.agreedAmount,
          negResult.agreedDuration
        );
      } else {
        this.metrics.failedNegotiations++;
        request.status = 'FAILED';
        requester.setStatus('REJECTED', 'Counter-offer rejected');
        provider.setStatus('IDLE');

        // Packet 4: Central Controller -> Requester (NEGOTIATION_FAILED)
        this.emitPacket({
          id: `pkt-failed-${Date.now()}`,
          timestamp: Date.now(),
          from: 'Central Controller',
          to: requester.data.name,
          type: 'NEGOTIATION_FAILED',
          details: 'Negotiation failed: terms could not be reconciled.',
          requestId: request.id,
        });

        this.logEvent(
          'Central Controller',
          requester.data.name,
          'NEGOTIATION_FAILED',
          `NEGOTIATION FAILED: Incompatible terms`,
          `No agreement reached between ${requester.data.name} and ${provider.data.name}. Terms rejected.`,
          false,
          true
        );

        setTimeout(() => {
          if (requester.data.status === 'REJECTED') {
            requester.setStatus('IDLE');
            this.notify();
          }
        }, 3000);
      }

      this.notify();
    }, 900);
  }

  // ==========================================
  // ALLOCATION MANAGER & LEASE LIFECYCLE
  // ==========================================

  private allocateResource(
    requestId: string,
    requester: Agent,
    provider: Agent,
    resourceType: ResourceType,
    amount: number,
    duration: number
  ) {
    const allocationId = `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const allocation: ResourceAllocated = {
      id: allocationId,
      requesterId: requester.data.id,
      providerId: provider.data.id,
      resourceType,
      amount,
      duration,
      remainingDuration: duration,
      startedAt: Date.now(),
      status: 'ACTIVE',
    };

    // Lock resources in agents
    provider.applyLeaseOut(resourceType, amount);
    requester.applyLeaseIn(resourceType, amount);

    requester.setStatus('SHARING', `Sharing active (+${amount}% ${resourceType})`);
    requester.data.successCount++;

    this.activeAllocations.set(allocationId, allocation);
    this.metrics.resourcesAllocatedCount++;
    this.metrics.totalResourcesShared += amount;

    // Log allocation
    this.logEvent(
      'Central Controller',
      'Allocation Manager',
      'RESOURCE_ALLOCATED',
      `RESOURCE ALLOCATED: ${amount}% ${resourceType}`,
      `Active Lease #${allocationId}: ${provider.data.name} ──[${amount}% ${resourceType}]──► ${requester.data.name} (${duration}s lease).`,
      true
    );

    this.notify();
  }

  public releaseResource(allocationId: string) {
    const allocation = this.activeAllocations.get(allocationId);
    if (!allocation) return;

    const requester = this.agents.get(allocation.requesterId);
    const provider = this.agents.get(allocation.providerId);

    if (requester) {
      requester.removeLeaseIn(allocation.resourceType, allocation.amount);
      if (requester.data.status === 'SHARING') {
        requester.setStatus('COMPLETED', 'Task finished');
        setTimeout(() => {
          if (requester.data.status === 'COMPLETED') {
            requester.setStatus('IDLE');
            this.notify();
          }
        }, 2000);
      }
    }

    if (provider) {
      provider.removeLeaseOut(allocation.resourceType, allocation.amount);
      if (provider.data.status === 'PROVIDING') {
        provider.setStatus('IDLE');
      }
    }

    allocation.status = 'RELEASED';
    allocation.remainingDuration = 0;
    this.activeAllocations.delete(allocationId);
    this.completedAllocations.unshift(allocation);

    // Emit packet from Central Controller to both notifying release
    this.emitPacket({
      id: `pkt-rel-${Date.now()}`,
      timestamp: Date.now(),
      from: 'Central Controller',
      to: requester ? requester.data.name : 'Requester',
      type: 'RESOURCE_RELEASED',
      resourceType: allocation.resourceType,
      amount: allocation.amount,
      details: `Lease expired. Releasing ${allocation.amount}% ${allocation.resourceType} back to ${provider?.data.name || 'Provider'}.`,
    });

    this.logEvent(
      'Central Controller',
      'Allocation Manager',
      'RESOURCE_RELEASED',
      `RESOURCE RELEASED: ${allocation.amount}% ${allocation.resourceType}`,
      `Lease #${allocationId} ended. ${allocation.amount}% ${allocation.resourceType} unlocked and returned to ${provider?.data.name || 'Provider'}.`,
      true
    );

    this.notify();
  }

  // ==========================================
  // TICK CYCLE (Called per simulation second)
  // ==========================================

  public tickSecond() {
    if (this.metrics.status === 'OFFLINE') {
      this.metrics.downtimeSeconds++;
      return;
    }

    this.metrics.uptimeSeconds++;

    // 1. Update active allocation timers
    const toRelease: string[] = [];
    this.activeAllocations.forEach((alloc, id) => {
      alloc.remainingDuration -= 1;
      if (alloc.remainingDuration <= 0) {
        toRelease.push(id);
      } else if (alloc.remainingDuration <= 2) {
        alloc.status = 'EXPIRING';
      }
    });

    // Release expired
    toRelease.forEach((id) => this.releaseResource(id));

    // 2. Agents update internal background loads
    this.agents.forEach((agent) => {
      agent.updateInternalLoad();
    });

    this.updateMetricsSummary();
    this.notify();
  }

  private updateMetricsSummary() {
    this.metrics.activeRequests = this.requestQueue.filter(
      (r) => r.status === 'QUEUED' || r.status === 'SEARCHING' || r.status === 'NEGOTIATING'
    ).length;
    this.metrics.queueLength = this.requestQueue.length;
    this.metrics.resourcesAllocatedCount = this.activeAllocations.size;
  }

  public resetAll() {
    this.activeAllocations.clear();
    this.completedAllocations = [];
    this.requestQueue = [];
    this.activeNegotiations.clear();
    this.negotiationHistory = [];
    this.logs = [];
    this.metrics = {
      status: 'ONLINE',
      activeRequests: 0,
      activeNegotiations: 0,
      resourcesAllocatedCount: 0,
      successfulNegotiations: 0,
      failedNegotiations: 0,
      totalResourcesShared: 0,
      totalDecisions: 0,
      averageNegotiationTimeMs: 1450,
      uptimeSeconds: 0,
      downtimeSeconds: 0,
      spofIncidents: 0,
      queueLength: 0,
    };
    this.initDefaultAgents();
    this.logEvent(
      'System Controller',
      'Central Controller',
      'HEARTBEAT',
      'SYSTEM INITIALIZED',
      'Centralized Multi-Agent Resource Sharing System ready. All agent registries synced.'
    );
    this.notify();
  }
}
