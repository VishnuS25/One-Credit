import { CentralController } from './CentralController';
import { ActiveVisualPacket, MessagePacket, ResourceRequest, ResourceType } from './types';

export class SimulationEngine {
  public controller: CentralController;
  public isRunning: boolean = false;
  public isAutoGenerating: boolean = true;
  public simulationSpeed: number = 1.0; // 0.5x, 1x, 2x, 4x
  public activeVisualPackets: ActiveVisualPacket[] = [];

  private timerInterval?: number;
  private animationFrameId?: number;
  private onUpdateCallback?: () => void;
  private lastAutoRequestTime: number = 0;

  constructor(controller: CentralController) {
    this.controller = controller;

    // Connect packet pipeline to visual packet animator
    this.controller.setCallbacks(
      (packet: MessagePacket) => this.handleMessagePacket(packet),
      () => this.notifyUpdate(),
      () => this.notifyUpdate()
    );

    this.startAnimationLoop();
  }

  public setOnUpdate(cb: () => void) {
    this.onUpdateCallback = cb;
  }

  private notifyUpdate() {
    if (this.onUpdateCallback) {
      this.onUpdateCallback();
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const intervalMs = Math.max(250, Math.floor(1000 / this.simulationSpeed));
    this.timerInterval = window.setInterval(() => {
      this.tick();
    }, intervalMs);

    this.notifyUpdate();
  }

  public pause() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    this.notifyUpdate();
  }

  public setSpeed(speed: number) {
    this.simulationSpeed = speed;
    if (this.isRunning) {
      this.pause();
      this.start();
    }
  }

  public toggleAutoGeneration() {
    this.isAutoGenerating = !this.isAutoGenerating;
    this.notifyUpdate();
  }

  public step() {
    this.tick();
  }

  public reset() {
    this.pause();
    this.activeVisualPackets = [];
    this.controller.resetAll();
    this.notifyUpdate();
  }

  private tick() {
    this.controller.tickSecond();

    // Auto-generate requests periodically if enabled
    if (this.isAutoGenerating && this.controller.metrics.status === 'ONLINE') {
      const now = Date.now();
      // Generate request every 3-5 seconds based on speed
      const cooldown = (4000 + Math.random() * 2000) / this.simulationSpeed;
      if (now - this.lastAutoRequestTime > cooldown) {
        this.triggerRandomAgentRequest();
        this.lastAutoRequestTime = now;
      }
    }

    this.notifyUpdate();
  }

  public triggerRandomAgentRequest() {
    if (this.controller.metrics.status === 'OFFLINE') return;

    const agentList = Array.from(this.controller.agents.values());
    const idleAgents = agentList.filter((a) => a.data.status === 'IDLE');
    if (idleAgents.length === 0) return;

    const randomAgent = idleAgents[Math.floor(Math.random() * idleAgents.length)];
    const req = randomAgent.generateAutonomousRequest();
    if (req) {
      this.controller.submitResourceRequest(
        req.requesterId,
        req.resourceType,
        req.requiredAmount,
        req.duration,
        req.priority
      );
    }
  }

  /**
   * Translates semantic message packets into animated visual packets
   * with smooth travel from Node A to Node B.
   */
  private handleMessagePacket(packet: MessagePacket) {
    // Map human-readable names to node IDs ('agent-a', 'agent-b', 'central-controller')
    const resolveNodeId = (name: string): string => {
      if (name.toLowerCase().includes('controller') || name.toLowerCase().includes('system')) {
        return 'central-controller';
      }
      const match = name.match(/Agent\s+([A-Ea-e])/i);
      if (match) {
        return `agent-${match[1].toLowerCase()}`;
      }
      return 'central-controller';
    };

    const fromId = resolveNodeId(packet.from);
    const toId = resolveNodeId(packet.to);

    // Color code packet by type
    let color = '#38bdf8'; // cyan
    if (packet.type === 'RESOURCE_REQUEST') color = '#38bdf8';
    else if (packet.type === 'PROVIDER_REQUEST') color = '#facc15';
    else if (packet.type === 'OFFER' || packet.type === 'COUNTER_OFFER') color = '#c084fc';
    else if (packet.type === 'OFFER_ACCEPTED' || packet.type === 'RESOURCE_ALLOCATED') color = '#4ade80';
    else if (packet.type === 'NEGOTIATION_FAILED' || packet.type === 'CONTROLLER_FAILURE') color = '#ef4444';
    else if (packet.type === 'RESOURCE_RELEASED') color = '#94a3b8';

    const visualPacket: ActiveVisualPacket = {
      id: `vis-${Date.now()}-${Math.random()}`,
      fromId,
      toId,
      type: packet.type,
      label: packet.type.replace(/_/g, ' '),
      color,
      progress: 0,
      resourceType: packet.resourceType,
      amount: packet.amount,
      timestamp: Date.now(),
    };

    this.activeVisualPackets.push(visualPacket);
    this.notifyUpdate();
  }

  private startAnimationLoop() {
    let lastTime = performance.now();

    const frame = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (this.activeVisualPackets.length > 0) {
        const speed = 0.8 * this.simulationSpeed; // packet transit speed
        for (let i = this.activeVisualPackets.length - 1; i >= 0; i--) {
          const pkt = this.activeVisualPackets[i];
          pkt.progress += delta * speed;
          if (pkt.progress >= 1) {
            this.activeVisualPackets.splice(i, 1);
          }
        }
        this.notifyUpdate();
      }

      this.animationFrameId = requestAnimationFrame(frame);
    };

    this.animationFrameId = requestAnimationFrame(frame);
  }

  public destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }
}
