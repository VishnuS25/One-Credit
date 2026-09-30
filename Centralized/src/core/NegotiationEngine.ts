import { AgentData, NegotiationSession, NegotiationTurn, ResourceRequest, ResourceType } from './types';

export interface NegotiationResult {
  session: NegotiationSession;
  finalDecision: 'ACCEPTED' | 'REJECTED';
  agreedAmount: number;
  agreedDuration: number;
  turns: NegotiationTurn[];
  summary: string;
}

export class NegotiationEngine {
  /**
   * Mediates the negotiation between Requester and Provider through the Central Controller.
   * Enforces realistic multi-turn counter-offer mechanics.
   */
  public executeNegotiation(
    request: ResourceRequest,
    requester: AgentData,
    provider: AgentData
  ): NegotiationResult {
    const turns: NegotiationTurn[] = [];
    const sessionId = `neg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const resKey = request.resourceType.toLowerCase() as keyof typeof provider.resources;
    
    // Calculate provider's available capacity
    const currentUsage = provider.resources[resKey] || 0;
    const leasedOut = provider.leasedOut[request.resourceType] || 0;
    const providerSpare = Math.max(0, 100 - (currentUsage + leasedOut));

    let round = 1;
    let agreedAmount = 0;
    let agreedDuration = 0;
    let finalDecision: 'ACCEPTED' | 'REJECTED' = 'REJECTED';

    // Initial Ask from Requester mediated by Controller
    turns.push({
      round: round++,
      sender: requester.name,
      receiver: 'Central Controller',
      action: 'OFFER',
      offeredAmount: request.requiredAmount,
      offeredDuration: request.duration,
      comment: `Requested ${request.requiredAmount}% ${request.resourceType} for ${request.duration}s (Priority: ${request.priority})`,
      timestamp: Date.now(),
    });

    // Round 2: Controller queries Provider
    turns.push({
      round: round++,
      sender: 'Central Controller',
      receiver: provider.name,
      action: 'OFFER',
      offeredAmount: request.requiredAmount,
      offeredDuration: request.duration,
      comment: `Can you supply ${request.requiredAmount}% ${request.resourceType} for ${request.duration}s to ${requester.name}?`,
      timestamp: Date.now(),
    });

    // Case 1: Provider has equal or more spare capacity than requested
    if (providerSpare >= request.requiredAmount) {
      agreedAmount = request.requiredAmount;
      agreedDuration = request.duration;
      finalDecision = 'ACCEPTED';

      turns.push({
        round: round++,
        sender: provider.name,
        receiver: 'Central Controller',
        action: 'ACCEPT',
        offeredAmount: agreedAmount,
        offeredDuration: agreedDuration,
        comment: `Direct Accept: Full capacity of ${agreedAmount}% ${request.resourceType} available for ${agreedDuration}s.`,
        timestamp: Date.now(),
      });

      turns.push({
        round: round++,
        sender: 'Central Controller',
        receiver: requester.name,
        action: 'ACCEPT',
        offeredAmount: agreedAmount,
        offeredDuration: agreedDuration,
        comment: `Agreement Reached: ${provider.name} accepted initial request of ${agreedAmount}% ${request.resourceType}.`,
        timestamp: Date.now(),
      });
    } 
    // Case 2: Provider has partial spare capacity (Counter-Offer Required)
    else if (providerSpare >= 5) {
      // Provider offers whatever it safely can (up to spare, preserving 5% safety margin)
      const providerOfferAmount = Math.min(request.requiredAmount, Math.max(5, Math.floor(providerSpare - 2)));
      // Duration compromise if duration is high (> 8s)
      const providerOfferDuration = request.duration > 8 ? Math.max(5, request.duration - 2) : request.duration;

      // Provider sends counter-offer to Central Controller
      turns.push({
        round: round++,
        sender: provider.name,
        receiver: 'Central Controller',
        action: 'COUNTER_OFFER',
        offeredAmount: providerOfferAmount,
        offeredDuration: providerOfferDuration,
        comment: `Counter-Offer: Only ${providerOfferAmount}% available (instead of ${request.requiredAmount}%). Proposing ${providerOfferAmount}% for ${providerOfferDuration}s.`,
        timestamp: Date.now(),
      });

      // Controller evaluates whether counter-offer is acceptable to Requester
      // Evaluation based on priority and strategy
      const satisfactionRatio = providerOfferAmount / request.requiredAmount;
      const minAcceptableRatio = 
        request.priority === 'CRITICAL' ? 0.4 :
        requester.strategy === 'COOPERATIVE' ? 0.5 :
        requester.strategy === 'GREEDY' ? 0.75 : 0.6;

      if (satisfactionRatio >= minAcceptableRatio) {
        // Central Controller presents Counter-Offer to Requester, Requester Accepts
        agreedAmount = providerOfferAmount;
        agreedDuration = providerOfferDuration;
        finalDecision = 'ACCEPTED';

        turns.push({
          round: round++,
          sender: 'Central Controller',
          receiver: requester.name,
          action: 'COUNTER_OFFER',
          offeredAmount: agreedAmount,
          offeredDuration: agreedDuration,
          comment: `Forwarding Counter-Offer from ${provider.name}: ${agreedAmount}% ${request.resourceType} for ${agreedDuration}s.`,
          timestamp: Date.now(),
        });

        turns.push({
          round: round++,
          sender: requester.name,
          receiver: 'Central Controller',
          action: 'ACCEPT',
          offeredAmount: agreedAmount,
          offeredDuration: agreedDuration,
          comment: `Counter-Offer Accepted: ${satisfactionRatio >= 0.7 ? 'Acceptable compromise.' : 'Accepted due to priority constraint.'}`,
          timestamp: Date.now(),
        });
      } else {
        // Requester rejects counter-offer as insufficient
        finalDecision = 'REJECTED';
        turns.push({
          round: round++,
          sender: 'Central Controller',
          receiver: requester.name,
          action: 'COUNTER_OFFER',
          offeredAmount: providerOfferAmount,
          offeredDuration: providerOfferDuration,
          comment: `Forwarding Counter-Offer: ${providerOfferAmount}% (Requested: ${request.requiredAmount}%).`,
          timestamp: Date.now(),
        });

        turns.push({
          round: round++,
          sender: requester.name,
          receiver: 'Central Controller',
          action: 'REJECT',
          offeredAmount: 0,
          offeredDuration: 0,
          comment: `Counter-Offer Rejected: Offered ${providerOfferAmount}% is below acceptable threshold for task completion.`,
          timestamp: Date.now(),
        });
      }
    } 
    // Case 3: Provider has negligible capacity
    else {
      finalDecision = 'REJECTED';
      turns.push({
        round: round++,
        sender: provider.name,
        receiver: 'Central Controller',
        action: 'REJECT',
        offeredAmount: 0,
        offeredDuration: 0,
        comment: `Cannot provide resource: Provider capacity exhausted (${providerSpare}% spare).`,
        timestamp: Date.now(),
      });

      turns.push({
        round: round++,
        sender: 'Central Controller',
        receiver: requester.name,
        action: 'REJECT',
        offeredAmount: 0,
        offeredDuration: 0,
        comment: `Negotiation Failed: Provider ${provider.name} has no available capacity.`,
        timestamp: Date.now(),
      });
    }

    const session: NegotiationSession = {
      id: sessionId,
      requestId: request.id,
      requesterId: requester.id,
      providerId: provider.id,
      resourceType: request.resourceType,
      requestedAmount: request.requiredAmount,
      requestedDuration: request.duration,
      currentAmount: agreedAmount,
      currentDuration: agreedDuration,
      status: finalDecision === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED',
      turns,
      startedAt: Date.now() - 1000,
      completedAt: Date.now(),
    };

    const summary = finalDecision === 'ACCEPTED'
      ? `Agreement reached: ${provider.name} shares ${agreedAmount}% ${request.resourceType} with ${requester.name} for ${agreedDuration}s.`
      : `Negotiation failed between ${requester.name} and ${provider.name} for ${request.resourceType}.`;

    return {
      session,
      finalDecision,
      agreedAmount,
      agreedDuration,
      turns,
      summary,
    };
  }
}
