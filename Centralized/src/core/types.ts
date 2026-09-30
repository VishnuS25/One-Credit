export type ResourceType = 'CPU' | 'RAM' | 'Storage' | 'Bandwidth';

export type AgentStatus =
  | 'IDLE'
  | 'REQUESTING'
  | 'WAITING'
  | 'NEGOTIATING'
  | 'PROVIDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SHARING'
  | 'COMPLETED'
  | 'OFFLINE';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type NegotiationStrategy = 'BALANCED' | 'GREEDY' | 'COOPERATIVE' | 'CONSERVATIVE';

export interface ResourceMetrics {
  cpu: number;        // Percentage 0-100%
  ram: number;        // Percentage 0-100%
  storage: number;    // Percentage 0-100%
  bandwidth: number;  // Percentage 0-100%
}

export interface ResourceAllocated {
  id: string;
  requesterId: string;
  providerId: string;
  resourceType: ResourceType;
  amount: number;
  duration: number;        // in seconds
  remainingDuration: number;
  startedAt: number;
  status: 'ACTIVE' | 'EXPIRING' | 'RELEASED';
}

export interface AgentData {
  id: string;
  name: string;
  status: AgentStatus;
  currentTask: string;
  resources: ResourceMetrics;        // Current utilization (used %)
  capacities: ResourceMetrics;       // Total theoretical max (100)
  leasedIn: Partial<Record<ResourceType, number>>;   // Received from other agents
  leasedOut: Partial<Record<ResourceType, number>>;  // Lent to other agents
  strategy: NegotiationStrategy;
  reliability: number;               // 0.0 - 1.0 (historical reliability)
  successCount: number;
  totalRequests: number;
  color: string;
  negotiationStatus?: string;
}

export type MessageType =
  | 'RESOURCE_REQUEST'
  | 'PROVIDER_SEARCH'
  | 'PROVIDER_REQUEST'
  | 'OFFER'
  | 'COUNTER_OFFER'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'RESOURCE_ALLOCATED'
  | 'RESOURCE_RELEASED'
  | 'NEGOTIATION_FAILED'
  | 'HEARTBEAT'
  | 'CONTROLLER_FAILURE'
  | 'CONTROLLER_RESTORED';

export interface MessagePacket {
  id: string;
  timestamp: number;
  from: string;               // e.g. "Agent A" or "Central Controller"
  to: string;                 // e.g. "Central Controller" or "Agent B"
  type: MessageType;
  resourceType?: ResourceType;
  amount?: number;
  duration?: number;
  priority?: PriorityLevel;
  details: string;
  requestId?: string;
  round?: number;
  payload?: any;
}

export interface ActiveVisualPacket {
  id: string;
  fromId: string;
  toId: string;
  type: MessageType;
  label: string;
  color: string;
  progress: number;           // 0 to 1
  resourceType?: ResourceType;
  amount?: number;
  timestamp: number;
}

export interface ResourceRequest {
  id: string;
  requesterId: string;
  resourceType: ResourceType;
  requiredAmount: number;
  duration: number;           // in seconds
  priority: PriorityLevel;
  timestamp: number;
  status: 'QUEUED' | 'SEARCHING' | 'NEGOTIATING' | 'ALLOCATED' | 'REJECTED' | 'FAILED' | 'COMPLETED';
  candidateProviders?: string[];
  selectedProvider?: string;
  negotiationRounds?: number;
  agreedAmount?: number;
  agreedDuration?: number;
  reason?: string;
}

export interface NegotiationTurn {
  round: number;
  sender: string;
  receiver: string;
  action: 'OFFER' | 'COUNTER_OFFER' | 'ACCEPT' | 'REJECT';
  offeredAmount: number;
  offeredDuration: number;
  comment: string;
  timestamp: number;
}

export interface NegotiationSession {
  id: string;
  requestId: string;
  requesterId: string;
  providerId: string;
  resourceType: ResourceType;
  requestedAmount: number;
  requestedDuration: number;
  currentAmount: number;
  currentDuration: number;
  status: 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED' | 'FAILED';
  turns: NegotiationTurn[];
  startedAt: number;
  completedAt?: number;
}

export interface ControllerMetrics {
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  activeRequests: number;
  activeNegotiations: number;
  resourcesAllocatedCount: number;
  successfulNegotiations: number;
  failedNegotiations: number;
  totalResourcesShared: number;      // sum of percentage amounts shared
  totalDecisions: number;
  averageNegotiationTimeMs: number;
  uptimeSeconds: number;
  downtimeSeconds: number;
  spofIncidents: number;
  queueLength: number;
}

export interface SystemLogEvent {
  id: string;
  timestamp: string;
  isoTime: number;
  sender: string;
  receiver: string;
  type: MessageType;
  summary: string;
  details: string;
  isFailure?: boolean;
  isSuccess?: boolean;
}
