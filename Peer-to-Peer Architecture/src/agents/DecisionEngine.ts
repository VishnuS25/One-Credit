import type {
  ResourceType,
  StrategyType,
  ResourceRequirement,
  NegotiationOffer,
} from '../types';
import { ResourceManager } from './ResourceManager';

export interface DecisionResult {
  decision: 'ACCEPT' | 'REJECT' | 'OFFER' | 'COUNTER_OFFER';
  offer?: NegotiationOffer;
  reason: string;
}

export class DecisionEngine {
  public agentId: string;
  private strategy: StrategyType;
  private resourceManager: ResourceManager;

  constructor(
    agentId: string,
    strategy: StrategyType,
    resourceManager: ResourceManager
  ) {
    this.agentId = agentId;
    this.strategy = strategy;
    this.resourceManager = resourceManager;
  }

  public setStrategy(strategy: StrategyType): void {
    this.strategy = strategy;
  }

  /**
   * Evaluates an incoming RESOURCE_REQUEST from a peer
   */
  public evaluateRequest(requirement: ResourceRequirement): DecisionResult {
    const available = this.resourceManager.getAvailable(requirement.resourceType);
    const capacity = this.resourceManager.getCapacity(requirement.resourceType);

    // Safety margin thresholds based on strategy
    const safetyMargins: Record<StrategyType, number> = {
      GENEROUS: 10,
      BALANCED: 20,
      CONSERVATIVE: 40,
      GREEDY: 25,
    };

    const minBuffer = safetyMargins[this.strategy];
    const availablePercent = (available / capacity) * 100;

    // Check if priority overrides conservative buffer
    const isCritical = requirement.priority === 'CRITICAL';
    const isHigh = requirement.priority === 'HIGH';

    if (requirement.amount > available) {
      // Cannot fulfill full amount, see if we can offer a partial counter-offer or reject
      if (available > 5 && (isCritical || this.strategy === 'GENEROUS' || this.strategy === 'BALANCED')) {
        const partialAmount = Math.floor(available * 0.8);
        return {
          decision: 'OFFER',
          offer: {
            providedResource: {
              resourceType: requirement.resourceType,
              amount: partialAmount,
              duration: requirement.duration,
            },
            requiredReturn: this.determineRequiredReturn(requirement.resourceType, partialAmount),
            counterRound: 1,
            maxRounds: 3,
            note: `Partial availability (${partialAmount}${this.getUnit(requirement.resourceType)}) offered due to high local load.`,
          },
          reason: `Insufficient capacity for full ${requirement.amount}, offering available partial ${partialAmount}.`,
        };
      }

      return {
        decision: 'REJECT',
        reason: `Insufficient ${requirement.resourceType}: requested ${requirement.amount}, only ${available} available.`,
      };
    }

    if (!isCritical && !isHigh && availablePercent - (requirement.amount / capacity) * 100 < minBuffer) {
      if (this.strategy === 'CONSERVATIVE') {
        return {
          decision: 'REJECT',
          reason: `Violates ${this.strategy} safety reserve threshold (${minBuffer}% reserve required).`,
        };
      }
    }

    // Determine barter / compensation required based on strategy
    const requiredReturn = this.determineRequiredReturn(requirement.resourceType, requirement.amount);

    return {
      decision: 'OFFER',
      offer: {
        providedResource: {
          resourceType: requirement.resourceType,
          amount: requirement.amount,
          duration: requirement.duration,
        },
        requiredReturn,
        counterRound: 1,
        maxRounds: 3,
        note: `Approved under ${this.strategy} policy with ${requirement.priority} priority.`,
      },
      reason: `Capacity available (${available} units). Formulated offer with return requirements.`,
    };
  }

  /**
   * Evaluates an OFFER or COUNTER_OFFER received in an ongoing session
   */
  public evaluateOffer(
    originalRequirement: ResourceRequirement,
    receivedOffer: NegotiationOffer
  ): DecisionResult {
    const { providedResource, requiredReturn, counterRound, maxRounds } = receivedOffer;

    // Check if provided amount is acceptable (at least 70% of requested or exact)
    const amountRatio = providedResource.amount / originalRequirement.amount;
    const isAcceptableAmount = originalRequirement.priority === 'CRITICAL' 
      ? amountRatio >= 0.5 
      : amountRatio >= 0.7;

    if (!isAcceptableAmount) {
      if (counterRound >= maxRounds) {
        return {
          decision: 'REJECT',
          reason: `Offered amount (${providedResource.amount}) is below minimum requirement (${originalRequirement.amount}) and round limit reached.`,
        };
      }
      // Counter with compromise
      const counterAmount = Math.round((originalRequirement.amount + providedResource.amount) / 2);
      return {
        decision: 'COUNTER_OFFER',
        offer: {
          providedResource: {
            resourceType: originalRequirement.resourceType,
            amount: counterAmount,
            duration: originalRequirement.duration,
          },
          requiredReturn: this.determineRequiredReturn(originalRequirement.resourceType, counterAmount),
          counterRound: counterRound + 1,
          maxRounds,
          note: `Proposing compromise amount of ${counterAmount}.`,
        },
        reason: `Offered amount too low; requesting compromise at ${counterAmount}.`,
      };
    }

    // Check if required return is asked and whether we can afford it
    if (requiredReturn && requiredReturn.amount > 0) {
      const myAvailableReturn = this.resourceManager.getAvailable(requiredReturn.resourceType);
      
      if (myAvailableReturn < requiredReturn.amount) {
        if (counterRound >= maxRounds) {
          return {
            decision: 'REJECT',
            reason: `Cannot provide demanded barter return of ${requiredReturn.amount} ${requiredReturn.resourceType}.`,
          };
        }

        // Propose lower barter return
        const affordableReturn = Math.max(2, Math.floor(myAvailableReturn * 0.7));
        return {
          decision: 'COUNTER_OFFER',
          offer: {
            providedResource: {
              resourceType: originalRequirement.resourceType,
              amount: providedResource.amount,
              duration: providedResource.duration,
            },
            requiredReturn: {
              resourceType: requiredReturn.resourceType,
              amount: affordableReturn,
            },
            counterRound: counterRound + 1,
            maxRounds,
            note: `Adjusting return barter to ${affordableReturn} ${requiredReturn.resourceType} based on local budget.`,
          },
          reason: `Barter return demanded exceeds capacity; countered with ${affordableReturn} ${requiredReturn.resourceType}.`,
        };
      }

      // If we are GREEDY strategy and the return demand feels too steep
      if (this.strategy === 'GREEDY' && requiredReturn.amount > providedResource.amount * 0.4 && counterRound < maxRounds) {
        const discountedReturn = Math.max(1, Math.floor(requiredReturn.amount * 0.6));
        return {
          decision: 'COUNTER_OFFER',
          offer: {
            providedResource: {
              resourceType: originalRequirement.resourceType,
              amount: providedResource.amount,
              duration: providedResource.duration,
            },
            requiredReturn: {
              resourceType: requiredReturn.resourceType,
              amount: discountedReturn,
            },
            counterRound: counterRound + 1,
            maxRounds,
            note: `Demanded return is high; offering ${discountedReturn} instead.`,
          },
          reason: `Negotiating lower barter cost from ${requiredReturn.amount} to ${discountedReturn}.`,
        };
      }
    }

    // Everything checks out!
    return {
      decision: 'ACCEPT',
      reason: `Terms accepted: ${providedResource.amount} ${providedResource.resourceType} for ${providedResource.duration}s.`,
    };
  }

  /**
   * Helper to figure out what complementary resource to request in return based on scarcity
   */
  private determineRequiredReturn(
    lendingType: ResourceType,
    lendingAmount: number
  ): { resourceType: ResourceType; amount: number } | undefined {
    if (this.strategy === 'GENEROUS') {
      return undefined; // Generous peers don't demand barter return
    }

    // Find the resource type this agent is lowest on (highest scarcity)
    const resourceTypes: ResourceType[] = ['CPU', 'RAM', 'Storage', 'Bandwidth'];
    let lowestType: ResourceType = lendingType;
    let lowestAvailablePercent = 100;

    for (const type of resourceTypes) {
      if (type === lendingType) continue;
      const cap = this.resourceManager.getCapacity(type);
      const avail = this.resourceManager.getAvailable(type);
      const pct = (avail / cap) * 100;
      if (pct < lowestAvailablePercent) {
        lowestAvailablePercent = pct;
        lowestType = type;
      }
    }

    // Determine barter return amount based on strategy multiplier
    const returnMultiplier: Record<StrategyType, number> = {
      GENEROUS: 0,
      BALANCED: 0.15,
      CONSERVATIVE: 0.25,
      GREEDY: 0.40,
    };

    const multiplier = returnMultiplier[this.strategy];
    if (multiplier === 0) return undefined;

    const returnAmount = Math.max(5, Math.round(lendingAmount * multiplier));

    return {
      resourceType: lowestType,
      amount: returnAmount,
    };
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
