import type {
  ResourceType,
  NegotiationMessage,
  NegotiationSession,
  ResourceRequirement,
  ActiveLease,
} from '../types';
import { ResourceManager } from './ResourceManager';
import { DecisionEngine } from './DecisionEngine';

export interface OutboundMessageEvent {
  message: NegotiationMessage;
  summary: string;
}

export class NegotiationEngine {
  private agentId: string;
  private resourceManager: ResourceManager;
  private decisionEngine: DecisionEngine;
  private onSendMessage: (msg: NegotiationMessage, summary: string) => void;
  private onDealCompleted: (lease: ActiveLease, session: NegotiationSession) => void;
  private onDealFailed: (session: NegotiationSession, reason: string) => void;

  private activeSessions: Map<string, NegotiationSession> = new Map();

  constructor(
    agentId: string,
    resourceManager: ResourceManager,
    decisionEngine: DecisionEngine,
    onSendMessage: (msg: NegotiationMessage, summary: string) => void,
    onDealCompleted: (lease: ActiveLease, session: NegotiationSession) => void,
    onDealFailed: (session: NegotiationSession, reason: string) => void
  ) {
    this.agentId = agentId;
    this.resourceManager = resourceManager;
    this.decisionEngine = decisionEngine;
    this.onSendMessage = onSendMessage;
    this.onDealCompleted = onDealCompleted;
    this.onDealFailed = onDealFailed;
  }

  /**
   * Start an initial negotiation request as the Requester
   */
  public initiateRequest(
    targetPeerId: string,
    requirement: ResourceRequirement
  ): string {
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const session: NegotiationSession = {
      id: sessionId,
      requesterId: this.agentId,
      providerId: targetPeerId,
      resourceType: requirement.resourceType,
      amount: requirement.amount,
      duration: requirement.duration,
      priority: requirement.priority,
      round: 1,
      status: 'INITIATED',
      history: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.activeSessions.set(sessionId, session);

    const message: NegotiationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      from: this.agentId,
      to: targetPeerId,
      type: 'RESOURCE_REQUEST',
      sessionId,
      payload: {
        requirement,
      },
    };

    session.history.push(message);

    const summary = `Requests ${requirement.amount} ${this.getUnit(requirement.resourceType)} for ${requirement.duration}s [${requirement.priority}]`;
    this.onSendMessage(message, summary);

    return sessionId;
  }

  /**
   * Process incoming messages from other peer agents
   */
  public handleIncomingMessage(msg: NegotiationMessage): void {
    switch (msg.type) {
      case 'RESOURCE_REQUEST':
        this.handleResourceRequest(msg);
        break;
      case 'OFFER':
        this.handleOffer(msg);
        break;
      case 'COUNTER_OFFER':
        this.handleCounterOffer(msg);
        break;
      case 'ACCEPT':
        this.handleAccept(msg);
        break;
      case 'REJECT':
        this.handleReject(msg);
        break;
      default:
        break;
    }
  }

  private handleResourceRequest(msg: NegotiationMessage): void {
    const requirement = msg.payload.requirement;
    if (!requirement) return;

    const session: NegotiationSession = {
      id: msg.sessionId,
      requesterId: msg.from,
      providerId: this.agentId,
      resourceType: requirement.resourceType,
      amount: requirement.amount,
      duration: requirement.duration,
      priority: requirement.priority,
      round: 1,
      status: 'INITIATED',
      history: [msg],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.activeSessions.set(msg.sessionId, session);

    // Evaluate request
    const result = this.decisionEngine.evaluateRequest(requirement);

    if (result.decision === 'OFFER' && result.offer) {
      // Tentatively lock required resource so it isn't double-allocated
      this.resourceManager.lockResource(
        result.offer.providedResource.resourceType,
        result.offer.providedResource.amount
      );

      session.status = 'OFFERED';
      session.currentOffer = result.offer;
      session.updatedAt = Date.now();

      const responseMsg: NegotiationMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        from: this.agentId,
        to: msg.from,
        type: 'OFFER',
        sessionId: msg.sessionId,
        payload: {
          offer: result.offer,
        },
      };

      session.history.push(responseMsg);
      const returnDesc = result.offer.requiredReturn 
        ? ` (demands return: ${result.offer.requiredReturn.amount} ${this.getUnit(result.offer.requiredReturn.resourceType)})`
        : ' (zero barter cost)';
      const summary = `Offers ${result.offer.providedResource.amount} ${this.getUnit(result.offer.providedResource.resourceType)}${returnDesc}`;
      this.onSendMessage(responseMsg, summary);
    } else {
      // Reject request
      session.status = 'REJECTED';
      session.updatedAt = Date.now();

      const responseMsg: NegotiationMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        from: this.agentId,
        to: msg.from,
        type: 'REJECT',
        sessionId: msg.sessionId,
        payload: {
          reason: result.reason,
        },
      };

      session.history.push(responseMsg);
      this.onSendMessage(responseMsg, `Rejects request: ${result.reason}`);
      this.onDealFailed(session, result.reason);
      this.activeSessions.delete(msg.sessionId);
    }
  }

  private handleOffer(msg: NegotiationMessage): void {
    const session = this.activeSessions.get(msg.sessionId);
    if (!session) return;
    session.history.push(msg);

    const offer = msg.payload.offer;
    if (!offer) return;

    session.currentOffer = offer;
    session.round = offer.counterRound;

    const requirement: ResourceRequirement = {
      resourceType: session.resourceType,
      amount: session.amount,
      duration: session.duration,
      priority: session.priority,
    };

    const evaluation = this.decisionEngine.evaluateOffer(requirement, offer);

    if (evaluation.decision === 'ACCEPT') {
      session.status = 'ACCEPTED';
      session.updatedAt = Date.now();

      const acceptMsg: NegotiationMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        from: this.agentId,
        to: msg.from,
        type: 'ACCEPT',
        sessionId: msg.sessionId,
        payload: {
          offer,
        },
      };

      session.history.push(acceptMsg);
      this.onSendMessage(acceptMsg, `Accepts terms: ${offer.providedResource.amount} ${this.getUnit(session.resourceType)} for ${offer.providedResource.duration}s`);

      // Requester activates borrowed lease
      const lease: ActiveLease = {
        id: `lease-${session.id}`,
        sessionId: session.id,
        requesterId: this.agentId,
        providerId: msg.from,
        resourceType: offer.providedResource.resourceType,
        amount: offer.providedResource.amount,
        duration: offer.providedResource.duration,
        remainingTime: offer.providedResource.duration,
        startTime: Date.now(),
        returnOffering: offer.requiredReturn,
        status: 'ACTIVE',
      };

      this.resourceManager.acceptBorrowedResource(lease);
      this.onDealCompleted(lease, session);
    } else if (evaluation.decision === 'COUNTER_OFFER' && evaluation.offer) {
      session.status = 'COUNTERED';
      session.round = evaluation.offer.counterRound;
      session.currentOffer = evaluation.offer;
      session.updatedAt = Date.now();

      const counterMsg: NegotiationMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        from: this.agentId,
        to: msg.from,
        type: 'COUNTER_OFFER',
        sessionId: msg.sessionId,
        payload: {
          offer: evaluation.offer,
        },
      };

      session.history.push(counterMsg);
      const returnDesc = evaluation.offer.requiredReturn 
        ? ` + offering ${evaluation.offer.requiredReturn.amount} ${this.getUnit(evaluation.offer.requiredReturn.resourceType)}` 
        : '';
      this.onSendMessage(counterMsg, `Counters [Round ${evaluation.offer.counterRound}]: ${evaluation.offer.providedResource.amount} ${this.getUnit(session.resourceType)}${returnDesc}`);
    } else {
      // Reject
      session.status = 'REJECTED';
      session.updatedAt = Date.now();

      const rejectMsg: NegotiationMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        from: this.agentId,
        to: msg.from,
        type: 'REJECT',
        sessionId: msg.sessionId,
        payload: {
          reason: evaluation.reason,
        },
      };

      session.history.push(rejectMsg);
      this.onSendMessage(rejectMsg, `Rejects offer: ${evaluation.reason}`);
      this.onDealFailed(session, evaluation.reason);
      this.activeSessions.delete(session.id);
    }
  }

  private handleCounterOffer(msg: NegotiationMessage): void {
    const session = this.activeSessions.get(msg.sessionId);
    if (!session) return;
    session.history.push(msg);

    const offer = msg.payload.offer;
    if (!offer) return;

    session.currentOffer = offer;
    session.round = offer.counterRound;

    // Check if we are provider responding to requester's counter
    if (session.providerId === this.agentId) {
      // Re-evaluate counter offer as Provider
      // Release prior locked amount and relock counter amount if changed
      this.resourceManager.unlockResource(session.resourceType, session.amount);
      const canLock = this.resourceManager.lockResource(offer.providedResource.resourceType, offer.providedResource.amount);

      if (!canLock) {
        session.status = 'REJECTED';
        const rejectMsg: NegotiationMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          from: this.agentId,
          to: msg.from,
          type: 'REJECT',
          sessionId: msg.sessionId,
          payload: { reason: 'Capacity locked out during counter negotiation.' },
        };
        session.history.push(rejectMsg);
        this.onSendMessage(rejectMsg, 'Rejects counter: Capacity unavailable');
        this.onDealFailed(session, 'Capacity unavailable');
        this.activeSessions.delete(session.id);
        return;
      }

      // Provider accepts if round <= maxRounds or sends final counter
      if (offer.counterRound <= offer.maxRounds) {
        session.status = 'ACCEPTED';
        const acceptMsg: NegotiationMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          from: this.agentId,
          to: msg.from,
          type: 'ACCEPT',
          sessionId: msg.sessionId,
          payload: { offer },
        };
        session.history.push(acceptMsg);
        this.onSendMessage(acceptMsg, `Accepts counter-offer: ${offer.providedResource.amount} ${this.getUnit(session.resourceType)}`);

        // Provider allocates lent resource
        const lease: ActiveLease = {
          id: `lease-${session.id}`,
          sessionId: session.id,
          requesterId: session.requesterId,
          providerId: this.agentId,
          resourceType: offer.providedResource.resourceType,
          amount: offer.providedResource.amount,
          duration: offer.providedResource.duration,
          remainingTime: offer.providedResource.duration,
          startTime: Date.now(),
          returnOffering: offer.requiredReturn,
          status: 'ACTIVE',
        };

        this.resourceManager.allocateLentResource(lease);
        this.onDealCompleted(lease, session);
      } else {
        // Exceeded rounds
        this.resourceManager.unlockResource(offer.providedResource.resourceType, offer.providedResource.amount);
        session.status = 'REJECTED';
        const rejectMsg: NegotiationMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          from: this.agentId,
          to: msg.from,
          type: 'REJECT',
          sessionId: msg.sessionId,
          payload: { reason: 'Negotiation round threshold exceeded.' },
        };
        session.history.push(rejectMsg);
        this.onSendMessage(rejectMsg, 'Rejects: Negotiation round threshold reached without consensus');
        this.onDealFailed(session, 'Threshold exceeded');
        this.activeSessions.delete(session.id);
      }
    } else {
      // We are requester receiving counter-offer
      this.handleOffer(msg);
    }
  }

  private handleAccept(msg: NegotiationMessage): void {
    const session = this.activeSessions.get(msg.sessionId);
    if (!session) return;
    session.history.push(msg);
    session.status = 'ACCEPTED';
    session.updatedAt = Date.now();

    const offer = msg.payload.offer || session.currentOffer;
    if (!offer) return;

    if (session.providerId === this.agentId) {
      // Allocate provider resource
      const lease: ActiveLease = {
        id: `lease-${session.id}`,
        sessionId: session.id,
        requesterId: session.requesterId,
        providerId: this.agentId,
        resourceType: offer.providedResource.resourceType,
        amount: offer.providedResource.amount,
        duration: offer.providedResource.duration,
        remainingTime: offer.providedResource.duration,
        startTime: Date.now(),
        returnOffering: offer.requiredReturn,
        status: 'ACTIVE',
      };

      this.resourceManager.allocateLentResource(lease);
      this.onDealCompleted(lease, session);
    }
  }

  private handleReject(msg: NegotiationMessage): void {
    const session = this.activeSessions.get(msg.sessionId);
    if (session) {
      session.history.push(msg);
      session.status = 'REJECTED';
      session.updatedAt = Date.now();

      // If we are provider, release any tentative locked capacity
      if (session.providerId === this.agentId) {
        const amount = session.currentOffer?.providedResource.amount ?? session.amount;
        this.resourceManager.unlockResource(session.resourceType, amount);
      }

      this.onDealFailed(session, msg.payload.reason || 'Negotiation cancelled');
      this.activeSessions.delete(session.id);
    }
  }

  public getSession(sessionId: string): NegotiationSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  public getAllSessions(): NegotiationSession[] {
    return Array.from(this.activeSessions.values());
  }

  public cleanSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
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
}
