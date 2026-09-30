import { AgentData, ResourceRequest, ResourceType } from './types';

export interface ProviderEvaluation {
  agentId: string;
  agentName: string;
  availableCapacity: number;
  score: number;
  factors: {
    capacityScore: number;
    reliabilityScore: number;
    loadScore: number;
  };
  decisionRationale: string;
}

export class DecisionEngine {
  /**
   * Evaluates all registered agents to select the optimal resource provider for a request.
   */
  public evaluateProviders(
    request: ResourceRequest,
    agents: Map<string, AgentData>
  ): ProviderEvaluation[] {
    const candidates: ProviderEvaluation[] = [];

    agents.forEach((agent, agentId) => {
      // An agent cannot provide resources to itself
      if (agentId === request.requesterId || agent.status === 'OFFLINE') {
        return;
      }

      const resKey = request.resourceType.toLowerCase() as keyof typeof agent.resources;
      const currentUsage = agent.resources[resKey] || 0;
      const leasedOut = agent.leasedOut[request.resourceType] || 0;
      const committed = currentUsage + leasedOut;
      const availableCapacity = Math.max(0, 100 - committed);

      // Candidate must have at least 5% available resource to consider negotiating
      if (availableCapacity < 5) {
        return;
      }

      // 1. Capacity Score (0-40 pts): Higher is better, bonus if >= required
      let capacityScore = 0;
      if (availableCapacity >= request.requiredAmount) {
        capacityScore = 30 + Math.min(10, (availableCapacity - request.requiredAmount) / 5);
      } else {
        // Can only offer partial (counter-offer candidate)
        capacityScore = (availableCapacity / request.requiredAmount) * 25;
      }

      // 2. Reliability Score (0-30 pts)
      const reliabilityScore = (agent.reliability || 0.8) * 30;

      // 3. Load Balance Score (0-30 pts): Prefers agents with lower average utilization
      const avgUtil =
        (agent.resources.cpu +
          agent.resources.ram +
          agent.resources.storage +
          agent.resources.bandwidth) /
        4;
      const loadScore = Math.max(0, (100 - avgUtil) * 0.3);

      const totalScore = Math.round((capacityScore + reliabilityScore + loadScore) * 10) / 10;

      let rationale = `Available: ${Math.round(availableCapacity)}% ${request.resourceType} (Score: ${totalScore})`;
      if (availableCapacity >= request.requiredAmount) {
        rationale += ` - Full match capable`;
      } else {
        rationale += ` - Partial match (Requires counter-proposal)`;
      }

      candidates.push({
        agentId: agent.id,
        agentName: agent.name,
        availableCapacity: Math.round(availableCapacity),
        score: totalScore,
        factors: {
          capacityScore: Math.round(capacityScore * 10) / 10,
          reliabilityScore: Math.round(reliabilityScore * 10) / 10,
          loadScore: Math.round(loadScore * 10) / 10,
        },
        decisionRationale: rationale,
      });
    });

    // Sort descending by total score
    return candidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Selects the single best candidate.
   */
  public selectBestProvider(
    request: ResourceRequest,
    agents: Map<string, AgentData>
  ): ProviderEvaluation | null {
    const evaluations = this.evaluateProviders(request, agents);
    return evaluations.length > 0 ? evaluations[0] : null;
  }
}
