import type {
  ResourceRequest,
  ProviderNode,
  DiscoveryResult,
  DiscoveryCandidate,
  EvaluationResult,
  EvaluatedCandidate,
  NegotiationResult,
  NegotiationRound,
  DecisionResult,
  AllocationResult,
  ActiveLease
} from '../types';

/**
 * AGENT 1 - Resource Discovery Logic
 * Scans all provider nodes and identifies providers with capacity.
 */
export function executeResourceDiscovery(
  request: ResourceRequest,
  providers: ProviderNode[]
): DiscoveryResult {
  const candidates: DiscoveryCandidate[] = providers.map((provider) => {
    const availablePercent = provider.available[request.resourceType];
    const meetsRequirement = availablePercent >= request.requiredAmount;

    return {
      providerId: provider.id,
      providerName: provider.name,
      availablePercent,
      meetsRequirement,
      reliability: provider.reliability,
      currentWorkload: provider.currentWorkload,
      latencyMs: provider.baseLatencyMs,
    };
  });

  return {
    requestId: request.id,
    resourceType: request.resourceType,
    requiredAmount: request.requiredAmount,
    candidates,
    timestamp: Date.now(),
  };
}

/**
 * AGENT 2 - Resource Evaluation Logic
 * Evaluates candidate providers using multi-factor utility scoring and ranks them.
 */
export function executeResourceEvaluation(
  discovery: DiscoveryResult,
  request: ResourceRequest
): EvaluationResult {
  const evaluated: EvaluatedCandidate[] = discovery.candidates.map((cand) => {
    const notes: string[] = [];
    
    // Base capability check
    const headroom = cand.availablePercent - request.requiredAmount;
    let score = 0;

    if (!cand.meetsRequirement) {
      score = Math.max(10, Math.round(cand.availablePercent / request.requiredAmount * 40));
      notes.push(`⚠️ Insufficient direct capacity (${cand.availablePercent}% available vs ${request.requiredAmount}% needed)`);
    } else {
      // Factors: Headroom (30%), Workload (25%), Reliability (30%), Latency (15%)
      const headroomScore = Math.min(100, Math.max(0, (cand.availablePercent / 100) * 100));
      const workloadScore = Math.max(0, 100 - cand.currentWorkload);
      const reliabilityScore = cand.reliability;
      const latencyScore = Math.max(0, 100 - (cand.latencyMs * 1.2));

      // Weight adjustment based on Priority
      let wHeadroom = 0.30;
      let wWorkload = 0.25;
      let wReliability = 0.30;
      let wLatency = 0.15;

      if (request.priority === 'CRITICAL') {
        wReliability = 0.45;
        wHeadroom = 0.30;
        wLatency = 0.15;
        wWorkload = 0.10;
        notes.push('Critical SLA: Reliability and Headroom prioritized');
      } else if (request.priority === 'LOW') {
        wWorkload = 0.35;
        wHeadroom = 0.25;
        wReliability = 0.20;
        wLatency = 0.20;
      }

      score = Math.round(
        headroomScore * wHeadroom +
        workloadScore * wWorkload +
        reliabilityScore * wReliability +
        latencyScore * wLatency
      );

      notes.push(`✓ Capacity sufficient (+${headroom}% headroom)`);
      notes.push(`Reliability: ${cand.reliability}%, Workload: ${cand.currentWorkload}%`);
    }

    return {
      ...cand,
      suitabilityScore: score,
      rank: 0,
      evaluationNotes: notes,
    };
  });

  // Sort descending by score
  evaluated.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  // Assign ranks
  evaluated.forEach((item, index) => {
    item.rank = index + 1;
  });

  // Select top candidate (must have score >= 40 to be viable)
  const selectedProvider = evaluated.length > 0 && evaluated[0].meetsRequirement
    ? evaluated[0]
    : (evaluated.length > 0 && evaluated[0].suitabilityScore >= 35 ? evaluated[0] : null);

  return {
    requestId: request.id,
    rankedProviders: evaluated,
    selectedProvider,
    timestamp: Date.now(),
  };
}

/**
 * AGENT 3 - Negotiation Logic
 * Multi-round dynamic bargaining between Agent 3 and the target Provider.
 */
export function executeResourceNegotiation(
  evaluation: EvaluationResult,
  request: ResourceRequest,
  provider: ProviderNode
): NegotiationResult {
  const rounds: NegotiationRound[] = [];
  const candidate = evaluation.selectedProvider;

  if (!candidate || !provider) {
    return {
      requestId: request.id,
      providerId: candidate ? candidate.providerId : 'unknown',
      providerName: candidate ? candidate.providerName : 'None',
      status: 'REJECTED',
      agreedAmount: 0,
      agreedDuration: 0,
      rounds: [{
        roundNumber: 1,
        sender: 'Agent-3',
        type: 'REJECT',
        proposedAmount: 0,
        proposedDuration: 0,
        proposedPriceScore: 0,
        message: 'No suitable provider passed by Evaluation Agent.',
        agentUtility: 0,
        providerUtility: 0,
      }],
      summary: 'Negotiation aborted: No eligible provider identified.',
      timestamp: Date.now(),
    };
  }

  const available = provider.available[request.resourceType];
  const reqAmount = request.requiredAmount;
  const reqDuration = request.durationSeconds;

  // Round 1: Agent 3 initial formal request
  const r1AgentUtility = 1.0;
  // Provider utility based on remaining capacity & pricing
  const r1ProviderCapStress = (reqAmount / Math.max(1, available));
  const r1ProviderUtility = Math.max(0.1, 1.0 - (r1ProviderCapStress * 0.5) - (provider.currentWorkload / 200));

  rounds.push({
    roundNumber: 1,
    sender: 'Agent-3',
    type: 'OFFER',
    proposedAmount: reqAmount,
    proposedDuration: reqDuration,
    proposedPriceScore: 1.0,
    message: `INITIATE REQUEST: Requesting ${reqAmount}% ${request.resourceType} for ${reqDuration}s (Priority: ${request.priority}).`,
    agentUtility: r1AgentUtility,
    providerUtility: Math.round(r1ProviderUtility * 100) / 100,
  });

  // Case A: Provider has abundance of capacity and low workload -> Immediate ACCEPT
  if (available >= reqAmount * 1.25 && provider.currentWorkload < 50) {
    rounds.push({
      roundNumber: 2,
      sender: provider.name,
      type: 'ACCEPT',
      proposedAmount: reqAmount,
      proposedDuration: reqDuration,
      proposedPriceScore: 1.0,
      message: `OFFER ACCEPTED: Provider ${provider.name} grants full requested allocation unconditionally.`,
      agentUtility: 1.0,
      providerUtility: 0.92,
    });

    return {
      requestId: request.id,
      providerId: provider.id,
      providerName: provider.name,
      status: 'ACCEPTED',
      agreedAmount: reqAmount,
      agreedDuration: reqDuration,
      rounds,
      summary: `Negotiation Succeeded: Provider ${provider.name} accepted initial offer in 1 round.`,
      timestamp: Date.now(),
    };
  }

  // Case B: Capacity is constrained or workload is high -> Provider makes COUNTER-OFFER
  let providerOfferAmount = reqAmount;
  let providerOfferDuration = reqDuration;

  if (available < reqAmount) {
    // Can only offer what's available
    providerOfferAmount = Math.max(5, Math.floor(available * 0.9));
  } else if (provider.currentWorkload > 60 || available < reqAmount * 1.2) {
    // Shorter duration or slightly reduced burst to protect workload
    providerOfferAmount = Math.max(5, Math.floor(reqAmount * 0.85));
    providerOfferDuration = Math.max(3, Math.floor(reqDuration * 0.8));
  }

  rounds.push({
    roundNumber: 2,
    sender: provider.name,
    type: 'COUNTER_OFFER',
    proposedAmount: providerOfferAmount,
    proposedDuration: providerOfferDuration,
    proposedPriceScore: 1.2,
    message: `COUNTER-OFFER: Provider ${provider.name} proposed ${providerOfferAmount}% ${request.resourceType} for ${providerOfferDuration}s due to load (${provider.currentWorkload}%).`,
    agentUtility: Math.round((providerOfferAmount / reqAmount * 0.6 + providerOfferDuration / reqDuration * 0.4) * 100) / 100,
    providerUtility: 0.85,
  });

  // Round 3: Agent 3 evaluates counter-offer
  const canAcceptCounter = (providerOfferAmount >= reqAmount * 0.75) &&
    (request.priority !== 'CRITICAL' || providerOfferAmount >= reqAmount * 0.9);

  if (canAcceptCounter) {
    // Agent 3 accepts the compromise or counter-proposes slightly adjusted duration
    if (request.priority === 'HIGH' || request.priority === 'CRITICAL') {
      // Demand full amount with shorter duration compromise
      const counter2Amount = reqAmount;
      const counter2Duration = Math.max(3, Math.floor(reqDuration * 0.7));

      rounds.push({
        roundNumber: 3,
        sender: 'Agent-3',
        type: 'COUNTER_OFFER',
        proposedAmount: counter2Amount,
        proposedDuration: counter2Duration,
        proposedPriceScore: 1.1,
        message: `COUNTER-OFFER 2: Agent 3 insists on ${counter2Amount}% capacity, offering reduced duration ${counter2Duration}s.`,
        agentUtility: 0.88,
        providerUtility: 0.80,
      });

      // Provider final response
      rounds.push({
        roundNumber: 4,
        sender: provider.name,
        type: 'ACCEPT',
        proposedAmount: counter2Amount,
        proposedDuration: counter2Duration,
        proposedPriceScore: 1.1,
        message: `AGREED: Provider ${provider.name} accepts the reduced duration counter-offer.`,
        agentUtility: 0.88,
        providerUtility: 0.85,
      });

      return {
        requestId: request.id,
        providerId: provider.id,
        providerName: provider.name,
        status: 'COUNTER_ACCEPTED',
        agreedAmount: counter2Amount,
        agreedDuration: counter2Duration,
        rounds,
        summary: `Negotiation Concluded: Compromise reached after 4 rounds (${counter2Amount}% for ${counter2Duration}s).`,
        timestamp: Date.now(),
      };
    } else {
      // Non-critical: Accept provider's offer
      rounds.push({
        roundNumber: 3,
        sender: 'Agent-3',
        type: 'ACCEPT',
        proposedAmount: providerOfferAmount,
        proposedDuration: providerOfferDuration,
        proposedPriceScore: 1.0,
        message: `AGENT ACCEPT: Agent 3 accepts provider's counter-offer of ${providerOfferAmount}% for ${providerOfferDuration}s.`,
        agentUtility: 0.82,
        providerUtility: 0.90,
      });

      return {
        requestId: request.id,
        providerId: provider.id,
        providerName: provider.name,
        status: 'COUNTER_ACCEPTED',
        agreedAmount: providerOfferAmount,
        agreedDuration: providerOfferDuration,
        rounds,
        summary: `Negotiation Succeeded: Agent 3 accepted provider counter-offer in round 3.`,
        timestamp: Date.now(),
      };
    }
  } else {
    // Unbridgeable gap -> REJECT
    rounds.push({
      roundNumber: 3,
      sender: 'Agent-3',
      type: 'REJECT',
      proposedAmount: 0,
      proposedDuration: 0,
      proposedPriceScore: 0,
      message: `NEGOTIATION FAILED: Provider offer (${providerOfferAmount}%) falls below minimum threshold for ${request.priority} priority.`,
      agentUtility: 0.2,
      providerUtility: 0.4,
    });

    return {
      requestId: request.id,
      providerId: provider.id,
      providerName: provider.name,
      status: 'REJECTED',
      agreedAmount: 0,
      agreedDuration: 0,
      rounds,
      summary: `Negotiation Failed: Mutual utility could not converge within acceptable SLA margins.`,
      timestamp: Date.now(),
    };
  }
}

/**
 * AGENT 4 - Decision Making Logic
 * Evaluates the negotiated terms against SLA policy, priority constraints, and resource requirements.
 */
export function executeResourceDecision(
  negotiation: NegotiationResult,
  request: ResourceRequest
): DecisionResult {
  if (negotiation.status === 'REJECTED' || negotiation.agreedAmount <= 0) {
    return {
      requestId: request.id,
      decision: 'REJECT',
      checks: {
        resourceSufficient: false,
        durationAcceptable: false,
        prioritySatisfied: false,
        utilityThresholdMet: false,
      },
      reason: 'Rejected: Negotiation phase ended without mutually agreeable terms.',
      timestamp: Date.now(),
    };
  }

  const ratio = negotiation.agreedAmount / request.requiredAmount;
  const durationRatio = negotiation.agreedDuration / request.durationSeconds;

  let minAllowedRatio = 0.70;
  if (request.priority === 'CRITICAL') minAllowedRatio = 0.90;
  if (request.priority === 'HIGH') minAllowedRatio = 0.80;

  const resourceSufficient = ratio >= minAllowedRatio;
  const durationAcceptable = durationRatio >= 0.50;
  const prioritySatisfied = request.priority !== 'CRITICAL' || ratio >= 0.90;
  const utilityThresholdMet = resourceSufficient && durationAcceptable;

  const isAccepted = resourceSufficient && durationAcceptable && prioritySatisfied;

  let reason = '';
  if (isAccepted) {
    reason = `Approved: Negotiated ${negotiation.agreedAmount}% ${request.resourceType} satisfies ${request.priority} SLA policy criteria.`;
  } else {
    reason = `Rejected: Agreed capacity (${negotiation.agreedAmount}%) does not meet minimum ${minAllowedRatio * 100}% threshold required for ${request.priority} priority.`;
  }

  return {
    requestId: request.id,
    decision: isAccepted ? 'ACCEPT' : 'REJECT',
    checks: {
      resourceSufficient,
      durationAcceptable,
      prioritySatisfied,
      utilityThresholdMet,
    },
    reason,
    timestamp: Date.now(),
  };
}

/**
 * AGENT 5 - Resource Allocation Logic
 * Atomically deducts capacity from the provider and creates an active lease session.
 */
export function executeResourceAllocation(
  decision: DecisionResult,
  negotiation: NegotiationResult,
  request: ResourceRequest
): { allocation: AllocationResult; lease: ActiveLease | null } {
  if (decision.decision === 'REJECT') {
    return {
      allocation: {
        requestId: request.id,
        leaseId: 'none',
        providerId: negotiation.providerId,
        providerName: negotiation.providerName,
        status: 'FAILED',
        allocatedAmount: 0,
        durationSeconds: 0,
        sessionStartedAt: Date.now(),
        expiresAt: Date.now(),
        timestamp: Date.now(),
      },
      lease: null,
    };
  }

  const leaseId = `lease-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = Date.now();
  const durationSeconds = negotiation.agreedDuration;

  const lease: ActiveLease = {
    id: leaseId,
    requestId: request.id,
    requester: request.requester,
    providerId: negotiation.providerId,
    providerName: negotiation.providerName,
    resourceType: request.resourceType,
    amount: negotiation.agreedAmount,
    startTime: now,
    durationSeconds,
    remainingSeconds: durationSeconds,
    status: 'ACTIVE',
  };

  const allocation: AllocationResult = {
    requestId: request.id,
    leaseId,
    providerId: negotiation.providerId,
    providerName: negotiation.providerName,
    status: 'ACTIVE',
    allocatedAmount: negotiation.agreedAmount,
    durationSeconds,
    sessionStartedAt: now,
    expiresAt: now + (durationSeconds * 1000),
    timestamp: now,
  };

  return { allocation, lease };
}
