import type {
  AgentModel,
  MessageType,
  NegotiationMessage,
  ActiveLease,
  NegotiationSession,
  SimulationEventLog,
  NetworkPacket,
  GlobalSimulationStats,
  HistoryRecord,
  ResourceType,
  Priority,
} from '../types';
import { INITIAL_AGENTS } from '../data/initialAgents';
import { Agent } from '../agents/Agent';

export type SimulationListener = (state: {
  agents: AgentModel[];
  logs: SimulationEventLog[];
  packets: NetworkPacket[];
  stats: GlobalSimulationStats;
  history: HistoryRecord[];
  isRunning: boolean;
  speed: number;
}) => void;

export class SimulationEngine {
  private agents: Map<string, Agent> = new Map();
  private logs: SimulationEventLog[] = [];
  private packets: NetworkPacket[] = [];
  private history: HistoryRecord[] = [];
  private listeners: Set<SimulationListener> = new Set();

  private isRunning: boolean = false;
  private speed: number = 1; // 1x, 2x, 5x
  private loopIntervalId: any = null;
  private autoTriggerTimer: any = null;
  private soundEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  private stats: GlobalSimulationStats = {
    activeAgents: INITIAL_AGENTS.length,
    activeNegotiations: 0,
    successfulAgreements: 0,
    failedNegotiations: 0,
    resourcesShared: 0,
    totalMessagesSent: 0,
    averageNegotiationTime: 2.1,
    networkEfficiency: 98.4,
  };

  constructor() {
    this.initAgents();
  }

  private initAgents(): void {
    this.agents.clear();
    for (const data of INITIAL_AGENTS) {
      const agent = new Agent(
        data,
        (msg, summary) => this.handleAgentSendMessage(msg, summary),
        (lease, session) => this.handleDealCompleted(lease, session),
        (session, reason) => this.handleDealFailed(session, reason)
      );
      this.agents.set(agent.id, agent);
    }
  }

  public subscribe(listener: SimulationListener): () => void {
    this.listeners.add(listener);
    this.emitState();
    return () => this.listeners.delete(listener);
  }

  private emitState(): void {
    const agentsList = Array.from(this.agents.values()).map((a) => a.toModel());
    const state = {
      agents: agentsList,
      logs: [...this.logs],
      packets: [...this.packets],
      stats: { ...this.stats },
      history: [...this.history],
      isRunning: this.isRunning,
      speed: this.speed,
    };
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  /**
   * Called when an agent sends a message directly to another peer
   */
  private handleAgentSendMessage(msg: NegotiationMessage, summary: string): void {
    this.stats.totalMessagesSent++;
    const sender = this.agents.get(msg.from);
    const receiver = this.agents.get(msg.to);
    const fromName = sender ? sender.name : msg.from;
    const toName = receiver ? receiver.name : msg.to;

    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    let level: SimulationEventLog['level'] = 'info';
    if (msg.type === 'ACCEPT') level = 'success';
    else if (msg.type === 'REJECT') level = 'error';
    else if (msg.type === 'COUNTER_OFFER') level = 'warning';
    else if (msg.type === 'OFFER') level = 'negotiation';

    const logEntry: SimulationEventLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: Date.now(),
      timeString: timeStr,
      from: fromName,
      to: toName,
      type: msg.type,
      summary,
      details: JSON.stringify(msg.payload, null, 2),
      sessionId: msg.sessionId,
      level,
    };

    this.logs.unshift(logEntry);
    if (this.logs.length > 200) this.logs.pop();

    // Create visual packet animation between peers
    const packet: NetworkPacket = {
      id: `packet-${Date.now()}-${Math.random()}`,
      fromId: msg.from,
      toId: msg.to,
      progress: 0,
      type: msg.type,
      summary,
      createdAt: Date.now(),
    };
    this.packets.push(packet);

    // Play subtle audio blip
    this.playBlip(msg.type);

    // Realistic P2P network delivery latency (simulated direct peer transmission)
    const transmissionLatency = Math.max(250, 600 / this.speed);
    setTimeout(() => {
      // Deliver message directly to target peer
      if (receiver) {
        receiver.receiveMessage(msg);
      }
      this.emitState();
    }, transmissionLatency);

    this.updateActiveNegotiations();
    this.emitState();
  }

  private handleDealCompleted(lease: ActiveLease, session: NegotiationSession): void {
    this.stats.successfulAgreements++;
    this.stats.resourcesShared += lease.amount;

    const requester = this.agents.get(session.requesterId);
    const provider = this.agents.get(session.providerId);

    const historyRecord: HistoryRecord = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sessionId: session.id,
      requesterId: requester ? requester.name : session.requesterId,
      providerId: provider ? provider.name : session.providerId,
      resource: session.resourceType,
      amount: lease.amount,
      unit: this.getUnit(session.resourceType),
      returnResource: lease.returnOffering?.resourceType,
      returnAmount: lease.returnOffering?.amount,
      returnUnit: lease.returnOffering ? this.getUnit(lease.returnOffering.resourceType) : undefined,
      status: 'ACCEPTED',
      duration: session.duration,
      rounds: session.round,
      priority: session.priority,
      timestamp: new Date().toLocaleTimeString(),
    };

    this.history.unshift(historyRecord);
    if (this.history.length > 50) this.history.pop();

    // Recalculate average negotiation duration
    const negTime = (Date.now() - session.createdAt) / 1000;
    this.stats.averageNegotiationTime =
      Math.round(((this.stats.averageNegotiationTime * 0.8) + (negTime * 0.2)) * 10) / 10;

    // Recalculate P2P efficiency
    const totalDeals = this.stats.successfulAgreements + this.stats.failedNegotiations;
    if (totalDeals > 0) {
      this.stats.networkEfficiency =
        Math.round((this.stats.successfulAgreements / totalDeals) * 1000) / 10;
    }

    this.playSuccessChime();
    this.updateActiveNegotiations();
    this.emitState();
  }

  private handleDealFailed(session: NegotiationSession, _reason: string): void {
    this.stats.failedNegotiations++;

    const requester = this.agents.get(session.requesterId);
    const provider = this.agents.get(session.providerId);

    const historyRecord: HistoryRecord = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sessionId: session.id,
      requesterId: requester ? requester.name : session.requesterId,
      providerId: provider ? provider.name : session.providerId,
      resource: session.resourceType,
      amount: session.amount,
      unit: this.getUnit(session.resourceType),
      status: 'REJECTED',
      duration: session.duration,
      rounds: session.round,
      priority: session.priority,
      timestamp: new Date().toLocaleTimeString(),
    };

    this.history.unshift(historyRecord);
    if (this.history.length > 50) this.history.pop();

    // Recalculate P2P efficiency
    const totalDeals = this.stats.successfulAgreements + this.stats.failedNegotiations;
    if (totalDeals > 0) {
      this.stats.networkEfficiency =
        Math.round((this.stats.successfulAgreements / totalDeals) * 1000) / 10;
    }

    this.updateActiveNegotiations();
    this.emitState();
  }

  private updateActiveNegotiations(): void {
    let count = 0;
    for (const agent of this.agents.values()) {
      count += agent.negotiationEngine.getAllSessions().length;
    }
    // Each session is shared between 2 agents, divide by 2
    this.stats.activeNegotiations = Math.ceil(count / 2);
  }

  /**
   * Main simulation tick loop running every 100ms
   */
  private startSimulationLoop(): void {
    if (this.loopIntervalId) clearInterval(this.loopIntervalId);

    const tickIntervalMs = 100;
    this.loopIntervalId = setInterval(() => {
      const deltaSec = (tickIntervalMs / 1000) * this.speed;

      // 1. Tick all agents to decrement lease timers and release expired allocations
      for (const agent of this.agents.values()) {
        const { expiredLent } = agent.tick(deltaSec);

        for (const exp of expiredLent) {
          this.logs.unshift({
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            timestamp: Date.now(),
            timeString: new Date().toLocaleTimeString(),
            from: this.getAgentName(exp.providerId),
            to: this.getAgentName(exp.requesterId),
            type: 'RESOURCE_RELEASE',
            summary: `Lease expired: ${exp.amount} ${this.getUnit(exp.resourceType)} released back to provider.`,
            details: `Lease ID: ${exp.id}`,
            sessionId: exp.sessionId,
            level: 'info',
          });
        }
      }

      // 2. Animate packets
      if (this.packets.length > 0) {
        const packetSpeed = 0.04 * this.speed;
        this.packets = this.packets
          .map((p) => ({ ...p, progress: p.progress + packetSpeed }))
          .filter((p) => p.progress < 1);
      }

      this.updateActiveNegotiations();
      this.emitState();
    }, tickIntervalMs);
  }

  /**
   * Autonomous Request Generator: periodically identifies agents in need and initiates peer negotiation
   */
  private startAutoGenerator(): void {
    if (this.autoTriggerTimer) clearTimeout(this.autoTriggerTimer);

    const scheduleNext = () => {
      if (!this.isRunning) return;

      const delay = (Math.floor(Math.random() * 3500) + 2500) / this.speed;
      this.autoTriggerTimer = setTimeout(() => {
        if (this.isRunning) {
          this.triggerAutonomousNegotiation();
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();
  }

  public triggerAutonomousNegotiation(): void {
    const agentList = Array.from(this.agents.values());
    if (agentList.length < 2) return;

    // Pick an agent that is IDLE or COMPLETED
    const eligibleRequesters = agentList.filter(
      (a) => a.state === 'IDLE' || a.state === 'COMPLETED'
    );
    if (eligibleRequesters.length === 0) return;

    const requester = eligibleRequesters[Math.floor(Math.random() * eligibleRequesters.length)];

    // Pick a candidate resource type where requester might have high utilization or need
    const resourceTypes: ResourceType[] = ['CPU', 'RAM', 'Storage', 'Bandwidth'];
    const selectedResource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];

    // Pick a target peer that is NOT the requester
    const candidatePeers = agentList.filter((a) => a.id !== requester.id);
    
    // Sort peers by who has highest available of that resource (intelligent P2P discovery)
    candidatePeers.sort(
      (a, b) => b.resourceManager.getAvailable(selectedResource) - a.resourceManager.getAvailable(selectedResource)
    );

    const targetPeer = candidatePeers[0]; // best peer found in P2P mesh
    if (!targetPeer) return;

    const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    const amount = Math.floor(Math.random() * 25) + 15; // 15 to 40%
    const duration = Math.floor(Math.random() * 8) + 6; // 6 to 14 seconds

    requester.requestResource(targetPeer.id, {
      resourceType: selectedResource,
      amount,
      duration,
      priority,
    });

    this.emitState();
  }

  /**
   * Manual Request initiated by user from UI
   */
  public createManualRequest(params: {
    requesterId: string;
    targetPeerId: string;
    resourceType: ResourceType;
    amount: number;
    duration: number;
    priority: Priority;
  }): void {
    const requester = this.agents.get(params.requesterId);
    if (!requester) return;

    let targetPeerId = params.targetPeerId;

    // If 'auto-discover' selected, pick the peer with highest available resource
    if (targetPeerId === 'auto' || !targetPeerId) {
      const candidatePeers = Array.from(this.agents.values()).filter((a) => a.id !== params.requesterId);
      candidatePeers.sort(
        (a, b) => b.resourceManager.getAvailable(params.resourceType) - a.resourceManager.getAvailable(params.resourceType)
      );
      if (candidatePeers.length > 0) {
        targetPeerId = candidatePeers[0].id;
      }
    }

    requester.requestResource(targetPeerId, {
      resourceType: params.resourceType,
      amount: params.amount,
      duration: params.duration,
      priority: params.priority,
    });

    this.emitState();
  }

  public start(): void {
    this.isRunning = true;
    this.startSimulationLoop();
    this.startAutoGenerator();
    this.emitState();
  }

  public pause(): void {
    this.isRunning = false;
    if (this.autoTriggerTimer) clearTimeout(this.autoTriggerTimer);
    this.emitState();
  }

  public reset(): void {
    this.pause();
    this.initAgents();
    this.logs = [];
    this.packets = [];
    this.history = [];
    this.stats = {
      activeAgents: INITIAL_AGENTS.length,
      activeNegotiations: 0,
      successfulAgreements: 0,
      failedNegotiations: 0,
      resourcesShared: 0,
      totalMessagesSent: 0,
      averageNegotiationTime: 2.4,
      networkEfficiency: 100,
    };
    this.startSimulationLoop();
    this.emitState();
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
    if (this.isRunning) {
      this.startSimulationLoop();
      this.startAutoGenerator();
    }
    this.emitState();
  }

  public clearLogs(): void {
    this.logs = [];
    this.emitState();
  }

  public setAgentStrategy(agentId: string, strategy: any): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.setStrategy(strategy);
      this.emitState();
    }
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  private getAgentName(id: string): string {
    return this.agents.get(id)?.name || id;
  }

  private getUnit(type: ResourceType): string {
    switch (type) {
      case 'CPU':
      case 'RAM':
      case 'Storage':
        return '%';
      case 'Bandwidth':
        return ' Mbps';
    }
  }

  /**
   * Sound synthesis effects using Web Audio API
   */
  private playBlip(type: MessageType): void {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) this.audioCtx = new AudioContextClass();
      }
      if (!this.audioCtx || this.audioCtx.state === 'suspended') {
        this.audioCtx?.resume();
      }
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      let freq = 520;
      if (type === 'ACCEPT') freq = 880;
      else if (type === 'REJECT') freq = 240;
      else if (type === 'COUNTER_OFFER') freq = 660;
      else if (type === 'OFFER') freq = 580;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch {
      // Audio playback silently ignored if blocked by autoplay policy
    }
  }

  private playSuccessChime(): void {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) this.audioCtx = new AudioContextClass();
      }
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

      notes.forEach((f, i) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.frequency.setValueAtTime(f, now + i * 0.06);
        gain.gain.setValueAtTime(0.05, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
    } catch {
      // ignored
    }
  }
}
