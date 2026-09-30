export type ResourceType = 'CPU' | 'RAM' | 'Storage' | 'Bandwidth';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AgentId = 'agent-1' | 'agent-2' | 'agent-3' | 'agent-4' | 'agent-5';

export type AgentStatus = 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'WAITING' | 'FAILED';

export interface ResourceMetrics {
  CPU: number;        // percentage available 0-100
  RAM: number;        // percentage available 0-100
  Storage: number;    // percentage available 0-100
  Bandwidth: number;  // percentage available 0-100
}

export interface ResourceCapacity {
  CPU: number;        // Total cores e.g. 64 cores
  RAM: number;        // Total GB e.g. 256 GB
  Storage: number;    // Total TB e.g. 10 TB
  Bandwidth: number;  // Total Gbps e.g. 10 Gbps
}

export interface ProviderNode {
  id: string;
  name: string;
  avatar: string;
  region: string;
  reliability: number; // 0-100%
  baseLatencyMs: number;
  available: ResourceMetrics;
  totalCapacity: ResourceCapacity;
  currentWorkload: number; // 0-100%
  status: 'IDLE' | 'PROVIDING RESOURCE' | 'CONGESTED' | 'MAINTENANCE';
  pricingRate: number; // cost factor 0.8 - 1.5
  totalAllocationsServed: number;
}

export interface ResourceRequest {
  id: string;
  requester: string;
  resourceType: ResourceType;
  requiredAmount: number; // e.g. 20%
  durationSeconds: number;
  priority: Priority;
  maxBudgetScore?: number;
  timestamp: number;
}

export interface DiscoveryCandidate {
  providerId: string;
  providerName: string;
  availablePercent: number;
  meetsRequirement: boolean;
  reliability: number;
  currentWorkload: number;
  latencyMs: number;
}

export interface DiscoveryResult {
  requestId: string;
  resourceType: ResourceType;
  requiredAmount: number;
  candidates: DiscoveryCandidate[];
  timestamp: number;
}

export interface EvaluatedCandidate extends DiscoveryCandidate {
  suitabilityScore: number; // 0-100
  rank: number;
  evaluationNotes: string[];
}

export interface EvaluationResult {
  requestId: string;
  rankedProviders: EvaluatedCandidate[];
  selectedProvider: EvaluatedCandidate | null;
  timestamp: number;
}

export interface NegotiationRound {
  roundNumber: number;
  sender: 'Agent-3' | string; // Agent-3 or Provider name
  type: 'OFFER' | 'COUNTER_OFFER' | 'ACCEPT' | 'REJECT' | 'TIMEOUT';
  proposedAmount: number;
  proposedDuration: number;
  proposedPriceScore: number;
  message: string;
  agentUtility: number;
  providerUtility: number;
}

export interface NegotiationResult {
  requestId: string;
  providerId: string;
  providerName: string;
  status: 'ACCEPTED' | 'COUNTER_ACCEPTED' | 'REJECTED' | 'TIMEOUT';
  agreedAmount: number;
  agreedDuration: number;
  rounds: NegotiationRound[];
  summary: string;
  timestamp: number;
}

export interface DecisionResult {
  requestId: string;
  decision: 'ACCEPT' | 'REJECT';
  checks: {
    resourceSufficient: boolean;
    durationAcceptable: boolean;
    prioritySatisfied: boolean;
    utilityThresholdMet: boolean;
  };
  reason: string;
  timestamp: number;
}

export interface ActiveLease {
  id: string;
  requestId: string;
  requester: string;
  providerId: string;
  providerName: string;
  resourceType: ResourceType;
  amount: number;
  startTime: number;
  durationSeconds: number;
  remainingSeconds: number;
  status: 'ACTIVE' | 'EXPIRED' | 'RELEASED';
}

export interface AllocationResult {
  requestId: string;
  leaseId: string;
  providerId: string;
  providerName: string;
  status: 'ACTIVE' | 'FAILED';
  allocatedAmount: number;
  durationSeconds: number;
  sessionStartedAt: number;
  expiresAt: number;
  timestamp: number;
}

export interface PipelineDataPacket {
  id: string;
  currentStage: AgentId | 'START' | 'COMPLETED' | 'HALTED';
  request: ResourceRequest;
  discoveryResult?: DiscoveryResult;
  evaluationResult?: EvaluationResult;
  negotiationResult?: NegotiationResult;
  decisionResult?: DecisionResult;
  allocationResult?: AllocationResult;
  history: {
    stage: string;
    enteredAt: number;
    completedAt?: number;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    note: string;
  }[];
  isTerminated: boolean;
  terminationReason?: string;
}

export interface PipelineAgentInfo {
  id: AgentId;
  stageNumber: number;
  name: string;
  title: string;
  description: string;
  role: string;
  color: string;
  iconName: string;
  status: AgentStatus;
  isFailed: boolean;
  requestsProcessed: number;
  successfulOperations: number;
  failedOperations: number;
  avgProcessingTimeMs: number;
  currentTaskDescription: string;
}

export interface EventLogItem {
  id: string;
  timestamp: string;
  source: 'PIPELINE' | 'AGENT_1' | 'AGENT_2' | 'AGENT_3' | 'AGENT_4' | 'AGENT_5' | 'PROVIDER' | 'SYSTEM';
  stage?: AgentId;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'DATA_TRANSFER' | 'NEGOTIATION';
  title: string;
  details: string;
  dataSnippet?: any;
}

export interface PipelineStats {
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  successfulNegotiations: number;
  failedNegotiations: number;
  avgPipelineDurationMs: number;
  avgNegotiationDurationMs: number;
  totalResourcesAllocatedUnits: number;
  activeLeasesCount: number;
}
