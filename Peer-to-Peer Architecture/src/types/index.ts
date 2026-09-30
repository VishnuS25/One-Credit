export type ResourceType = 'CPU' | 'RAM' | 'Storage' | 'Bandwidth';

export type AgentState = 
  | 'IDLE' 
  | 'REQUESTING' 
  | 'NEGOTIATING' 
  | 'OFFERING' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'SHARING' 
  | 'COMPLETED';

export type StrategyType = 'BALANCED' | 'GENEROUS' | 'GREEDY' | 'CONSERVATIVE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MessageType = 
  | 'RESOURCE_REQUEST'
  | 'OFFER'
  | 'COUNTER_OFFER'
  | 'ACCEPT'
  | 'REJECT'
  | 'RESOURCE_ALLOCATE'
  | 'RESOURCE_RELEASE';

export interface ResourceData {
  capacity: number;
  used: number;
  locked: number;
  unit: string;
}

export interface ResourceRequirement {
  resourceType: ResourceType;
  amount: number;
  duration: number; // in seconds
  priority: Priority;
  returnOffering?: {
    resourceType: ResourceType;
    amount: number;
  };
}

export interface NegotiationOffer {
  providedResource: {
    resourceType: ResourceType;
    amount: number;
    duration: number;
  };
  requiredReturn?: {
    resourceType: ResourceType;
    amount: number;
  };
  counterRound: number;
  maxRounds: number;
  note?: string;
}

export interface NegotiationMessage {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  type: MessageType;
  sessionId: string;
  payload: {
    requirement?: ResourceRequirement;
    offer?: NegotiationOffer;
    reason?: string;
  };
}

export interface ActiveLease {
  id: string;
  sessionId: string;
  requesterId: string;
  providerId: string;
  resourceType: ResourceType;
  amount: number;
  duration: number;
  remainingTime: number;
  startTime: number;
  returnOffering?: {
    resourceType: ResourceType;
    amount: number;
  };
  status: 'ACTIVE' | 'EXPIRED' | 'RELEASED';
}

export interface NegotiationSession {
  id: string;
  requesterId: string;
  providerId: string;
  resourceType: ResourceType;
  amount: number;
  duration: number;
  priority: Priority;
  currentOffer?: NegotiationOffer;
  round: number;
  status: 'INITIATED' | 'OFFERED' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'ACTIVE' | 'FINISHED';
  history: NegotiationMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AgentStats {
  requestsInitiated: number;
  requestsReceived: number;
  successfulDeals: number;
  rejectedDeals: number;
  counterOffersMade: number;
  resourcesSharedUnits: number;
}

export interface AgentModel {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role: string;
  position: { x: number; y: number };
  resources: Record<ResourceType, ResourceData>;
  state: AgentState;
  strategy: StrategyType;
  reliabilityScore: number; // 0 to 100
  currentSessionId?: string;
  activeLeasesBorrowed: ActiveLease[];
  activeLeasesLent: ActiveLease[];
  stats: AgentStats;
}

export interface SimulationEventLog {
  id: string;
  timestamp: number;
  timeString: string;
  from: string;
  to: string;
  type: MessageType;
  summary: string;
  details: string;
  sessionId: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'negotiation';
}

export interface NetworkPacket {
  id: string;
  fromId: string;
  toId: string;
  progress: number; // 0 to 1
  type: MessageType;
  summary: string;
  createdAt: number;
}

export interface GlobalSimulationStats {
  activeAgents: number;
  activeNegotiations: number;
  successfulAgreements: number;
  failedNegotiations: number;
  resourcesShared: number;
  totalMessagesSent: number;
  averageNegotiationTime: number; // in seconds
  networkEfficiency: number; // percentage
}

export interface HistoryRecord {
  id: string;
  sessionId: string;
  requesterId: string;
  providerId: string;
  resource: ResourceType;
  amount: number;
  unit: string;
  returnResource?: ResourceType;
  returnAmount?: number;
  returnUnit?: string;
  status: 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'ACTIVE';
  duration: number;
  rounds: number;
  priority: Priority;
  timestamp: string;
}
