import type {
  AgentModel,
  AgentState,
  StrategyType,
  ResourceRequirement,
  NegotiationMessage,
  ActiveLease,
  NegotiationSession,
} from '../types';
import { ResourceManager } from './ResourceManager';
import { DecisionEngine } from './DecisionEngine';
import { NegotiationEngine } from './NegotiationEngine';

export class Agent {
  public id: string;
  public name: string;
  public avatar: string;
  public color: string;
  public role: string;
  public position: { x: number; y: number };
  public state: AgentState = 'IDLE';
  public strategy: StrategyType;
  public reliabilityScore: number;
  public stats = {
    requestsInitiated: 0,
    requestsReceived: 0,
    successfulDeals: 0,
    rejectedDeals: 0,
    counterOffersMade: 0,
    resourcesSharedUnits: 0,
  };

  public resourceManager: ResourceManager;
  public decisionEngine: DecisionEngine;
  public negotiationEngine: NegotiationEngine;

  private onSendMessageCallback: (msg: NegotiationMessage, summary: string) => void;
  private onDealCompletedCallback: (lease: ActiveLease, session: NegotiationSession) => void;
  private onDealFailedCallback: (session: NegotiationSession, reason: string) => void;

  constructor(
    data: AgentModel,
    onSendMessage: (msg: NegotiationMessage, summary: string) => void,
    onDealCompleted: (lease: ActiveLease, session: NegotiationSession) => void,
    onDealFailed: (session: NegotiationSession, reason: string) => void
  ) {
    this.id = data.id;
    this.name = data.name;
    this.avatar = data.avatar;
    this.color = data.color;
    this.role = data.role;
    this.position = { ...data.position };
    this.strategy = data.strategy;
    this.reliabilityScore = data.reliabilityScore;
    this.stats = { ...data.stats };

    this.onSendMessageCallback = onSendMessage;
    this.onDealCompletedCallback = onDealCompleted;
    this.onDealFailedCallback = onDealFailed;

    this.resourceManager = new ResourceManager(data.resources);
    this.decisionEngine = new DecisionEngine(this.id, this.strategy, this.resourceManager);
    this.negotiationEngine = new NegotiationEngine(
      this.id,
      this.resourceManager,
      this.decisionEngine,
      (msg, summary) => {
        this.updateStateFromOutbound(msg);
        this.onSendMessageCallback(msg, summary);
      },
      (lease, session) => {
        this.stats.successfulDeals++;
        this.stats.resourcesSharedUnits += lease.amount;
        this.setState('SHARING');
        this.onDealCompletedCallback(lease, session);
      },
      (session, reason) => {
        this.stats.rejectedDeals++;
        this.setState('REJECTED');
        setTimeout(() => {
          if (this.state === 'REJECTED') this.setState('IDLE');
        }, 2000);
        this.onDealFailedCallback(session, reason);
      }
    );
  }

  public setState(newState: AgentState): void {
    this.state = newState;
  }

  public setStrategy(newStrategy: StrategyType): void {
    this.strategy = newStrategy;
    this.decisionEngine.setStrategy(newStrategy);
  }

  /**
   * Directly receives a message from another peer agent
   */
  public receiveMessage(msg: NegotiationMessage): void {
    if (msg.type === 'RESOURCE_REQUEST') {
      this.stats.requestsReceived++;
      this.setState('OFFERING');
    } else if (msg.type === 'COUNTER_OFFER') {
      this.stats.counterOffersMade++;
      this.setState('NEGOTIATING');
    } else if (msg.type === 'OFFER') {
      this.setState('NEGOTIATING');
    } else if (msg.type === 'ACCEPT') {
      this.setState('ACCEPTED');
    }

    this.negotiationEngine.handleIncomingMessage(msg);
  }

  /**
   * Initiates a resource request to a chosen peer
   */
  public requestResource(
    targetPeerId: string,
    requirement: ResourceRequirement
  ): string {
    this.stats.requestsInitiated++;
    this.setState('REQUESTING');
    return this.negotiationEngine.initiateRequest(targetPeerId, requirement);
  }

  private updateStateFromOutbound(msg: NegotiationMessage): void {
    switch (msg.type) {
      case 'RESOURCE_REQUEST':
        this.setState('REQUESTING');
        break;
      case 'OFFER':
      case 'COUNTER_OFFER':
        this.setState('NEGOTIATING');
        break;
      case 'ACCEPT':
        this.setState('ACCEPTED');
        break;
      case 'REJECT':
        this.setState('REJECTED');
        break;
    }
  }

  /**
   * Autonomous cycle tick: ticks lease expiration, updates states, and returns expired leases
   */
  public tick(deltaSec: number): {
    expiredLent: ActiveLease[];
    expiredBorrowed: ActiveLease[];
  } {
    const results = this.resourceManager.tickLeases(deltaSec);

    // If no active leases and not negotiating, state returns to IDLE
    const hasLent = this.resourceManager.getActiveLent().length > 0;
    const hasBorrowed = this.resourceManager.getActiveBorrowed().length > 0;
    const hasActiveSessions = this.negotiationEngine.getAllSessions().length > 0;

    if (hasLent || hasBorrowed) {
      this.setState('SHARING');
    } else if (!hasActiveSessions && (this.state === 'SHARING' || this.state === 'COMPLETED' || this.state === 'ACCEPTED')) {
      this.setState('IDLE');
    }

    return results;
  }

  /**
   * Serializes current live model snapshot for UI React state
   */
  public toModel(): AgentModel {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      color: this.color,
      role: this.role,
      position: { ...this.position },
      resources: this.resourceManager.getSnapshot(),
      state: this.state,
      strategy: this.strategy,
      reliabilityScore: this.reliabilityScore,
      activeLeasesBorrowed: this.resourceManager.getActiveBorrowed(),
      activeLeasesLent: this.resourceManager.getActiveLent(),
      stats: { ...this.stats },
    };
  }

  public reset(initialData: AgentModel): void {
    this.resourceManager.reset(initialData.resources);
    this.state = 'IDLE';
    this.strategy = initialData.strategy;
    this.stats = { ...initialData.stats };
  }
}
