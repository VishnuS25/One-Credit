import { AgentData, AgentStatus, NegotiationStrategy, PriorityLevel, ResourceMetrics, ResourceRequest, ResourceType } from './types';

const AGENT_TASKS = [
  'Deep Learning Inference',
  'Real-time Stream Compression',
  'Distributed Graph Traversal',
  'Database Shard Indexing',
  'High-throughput Packet Routing',
  'Monte Carlo Risk Simulation',
  '4K Video Frame Rendering',
  'Cryptographic Hash Verification',
  'Microservice Load Balancing',
  'Sensor Telemetry Aggregation',
];

export class Agent {
  public data: AgentData;

  constructor(
    id: string,
    name: string,
    color: string,
    initialResources: ResourceMetrics,
    strategy: NegotiationStrategy = 'BALANCED'
  ) {
    this.data = {
      id,
      name,
      status: 'IDLE',
      currentTask: AGENT_TASKS[Math.floor(Math.random() * AGENT_TASKS.length)],
      resources: { ...initialResources },
      capacities: { cpu: 100, ram: 100, storage: 100, bandwidth: 100 },
      leasedIn: {},
      leasedOut: {},
      strategy,
      reliability: 0.95,
      successCount: 0,
      totalRequests: 0,
      color,
    };
  }

  public getAvailableResource(type: ResourceType): number {
    const key = type.toLowerCase() as keyof ResourceMetrics;
    const current = this.data.resources[key] || 0;
    const leasedOut = this.data.leasedOut[type] || 0;
    return Math.max(0, 100 - (current + leasedOut));
  }

  public updateInternalLoad(): void {
    if (this.data.status === 'OFFLINE') return;

    // Subtle realistic random fluctuations in baseline consumption (+- 2-4%)
    const fluctuate = (val: number) => {
      const delta = (Math.random() - 0.5) * 6;
      return Math.min(95, Math.max(10, Math.round(val + delta)));
    };

    // Keep resources active and lively
    this.data.resources.cpu = fluctuate(this.data.resources.cpu);
    this.data.resources.ram = fluctuate(this.data.resources.ram);
    this.data.resources.bandwidth = fluctuate(this.data.resources.bandwidth);
    // Storage changes more slowly
    if (Math.random() < 0.2) {
      this.data.resources.storage = fluctuate(this.data.resources.storage);
    }
  }

  public assignTask(taskName?: string): void {
    this.data.currentTask = taskName || AGENT_TASKS[Math.floor(Math.random() * AGENT_TASKS.length)];
  }

  public setStatus(status: AgentStatus, negotiationMsg?: string): void {
    this.data.status = status;
    if (negotiationMsg !== undefined) {
      this.data.negotiationStatus = negotiationMsg;
    }
  }

  public applyLeaseIn(resourceType: ResourceType, amount: number): void {
    const current = this.data.leasedIn[resourceType] || 0;
    this.data.leasedIn[resourceType] = current + amount;
  }

  public removeLeaseIn(resourceType: ResourceType, amount: number): void {
    const current = this.data.leasedIn[resourceType] || 0;
    const next = Math.max(0, current - amount);
    if (next === 0) {
      delete this.data.leasedIn[resourceType];
    } else {
      this.data.leasedIn[resourceType] = next;
    }
  }

  public applyLeaseOut(resourceType: ResourceType, amount: number): void {
    const current = this.data.leasedOut[resourceType] || 0;
    this.data.leasedOut[resourceType] = current + amount;
  }

  public removeLeaseOut(resourceType: ResourceType, amount: number): void {
    const current = this.data.leasedOut[resourceType] || 0;
    const next = Math.max(0, current - amount);
    if (next === 0) {
      delete this.data.leasedOut[resourceType];
    } else {
      this.data.leasedOut[resourceType] = next;
    }
  }

  /**
   * Autonomous check: generates a resource request if utilization is elevated
   */
  public generateAutonomousRequest(): ResourceRequest | null {
    if (this.data.status !== 'IDLE' && this.data.status !== 'COMPLETED') {
      return null;
    }

    const types: ResourceType[] = ['CPU', 'RAM', 'Storage', 'Bandwidth'];
    // Check if any resource is under pressure or pick one needed for current task
    const heavyTypes = types.filter((t) => {
      const k = t.toLowerCase() as keyof ResourceMetrics;
      return this.data.resources[k] >= 55;
    });

    const targetType = heavyTypes.length > 0
      ? heavyTypes[Math.floor(Math.random() * heavyTypes.length)]
      : types[Math.floor(Math.random() * types.length)];

    const amounts = [15, 20, 25, 30, 35, 40];
    const durations = [6, 8, 10, 12, 15];
    const priorities: PriorityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    this.data.totalRequests++;

    return {
      id: `req-${Date.now()}-${this.data.id}-${Math.floor(Math.random() * 1000)}`,
      requesterId: this.data.id,
      resourceType: targetType,
      requiredAmount: amount,
      duration,
      priority,
      timestamp: Date.now(),
      status: 'QUEUED',
    };
  }
}
