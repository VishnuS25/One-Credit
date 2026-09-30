# P2P Multi-Agent Resource Sharing & Negotiation System

An interactive visual simulation of an **Autonomous Multi-Agent System (MAS)** operating over a **Peer-to-Peer (P2P) Mesh Network Architecture** to share and negotiate limited computing resources (CPU, RAM, Storage, Bandwidth) without any central controller.

---

## 🌟 Key Features

1. **Pure Peer-to-Peer (P2P) Architecture**:
   - **Zero Central Controller / Master Server**: No single point of failure.
   - **Autonomous Agents**: 5 independent peers (Agent A, Agent B, Agent C, Agent D, Agent E).
   - **Direct Bilateral Communication**: Agents exchange messages (`RESOURCE_REQUEST`, `OFFER`, `COUNTER_OFFER`, `ACCEPT`, `REJECT`, `RELEASE`) directly.

2. **Intelligent Negotiation Engine & Decision Policies**:
   - **Multi-Round Negotiation Protocols**: Propose, counter-offer compromise amounts, barter trade complementary resources, or reject based on local thresholds.
   - **Dynamic Strategies**: `BALANCED`, `GENEROUS`, `GREEDY`, `CONSERVATIVE` (configurable per agent live).
   - **Lease Lifecycle Management**: Automatically locks capacity during negotiation, converts to active leases on agreement, and auto-releases resources upon expiry.

3. **High-Tech Futuristic Dashboard UI**:
   - **Live HTML5 Canvas Network Visualizer**: Visual mesh topology with glowing nodes, live utilization arcs, active sharing beams with particle animations, and flying packet indicators.
   - **Peer Telemetry Cards**: Real-time meters for CPU, RAM, Storage, and Bandwidth with active lease countdown timers.
   - **Live Negotiation Terminal Feed**: Streaming event log with color-coded message badges and payload inspection.
   - **Manual Request Panel**: Interactive form with presets (Compute Burst, Memory Cache, Data Storage, Bandwidth Surge) and priority controls.
   - **Historical Audit Table**: Filterable and downloadable CSV ledger of all completed agreements and rejections.
   - **Architecture & AI Integration Guide**: Visual diagram explaining distributed consensus and clean abstractions for future LLM integration.
   - **Audio Effects**: Synthesized Web Audio API sound blips with mute/unmute toggle.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will run locally at:
```text
http://localhost:5173
```

### 3. Build for Production
```bash
npm run build
```

---

## 🏗️ Architecture & Module Structure

```text
src/
├── agents/
│   ├── Agent.ts               # Autonomous peer state machine & lifecycle loop
│   ├── DecisionEngine.ts      # Multi-strategy valuation, counter-offer logic, barter
│   ├── NegotiationEngine.ts   # Multi-turn bilateral negotiation protocol
│   └── ResourceManager.ts     # Local capacity, reservation locks, and lease timers
│
├── simulation/
│   └── SimulationEngine.ts    # Discrete event simulation clock, packet animations, auto generator
│
├── components/
│   ├── Header.tsx             # Global controls, simulation speed, audio toggle
│   ├── NetworkGraph.tsx       # HTML5 Canvas visualizer with glowing nodes & packets
│   ├── AgentCard.tsx          # Individual node resource gauges & state badges
│   ├── AgentPanel.tsx         # Responsive grid of all 5 autonomous agents
│   ├── NegotiationConsole.tsx # Live streaming log feed with filter & search
│   ├── ResourceRequestPanel.tsx # Manual dispatch form with preset scenarios
│   ├── Statistics.tsx         # Live telemetry cards (agreements, efficiency, latency)
│   ├── NegotiationHistory.tsx # Audit ledger table with CSV export
│   ├── ArchitectureModal.tsx  # P2P mesh diagram & distributed decision loop
│   └── AgentDetailModal.tsx   # Detailed telemetry & lease inspector modal
│
├── data/
│   └── initialAgents.ts       # Peer node resource profiles and mesh interconnects
│
├── types/
│   └── index.ts               # TypeScript data models and interfaces
│
├── App.tsx                    # Main dashboard container & reactive state binding
└── main.tsx                   # React root mount
```

---

## 🧠 Autonomous Agent Loop

```text
Perception (Detects resource load)
    ↓
Peer Discovery (Finds optimal peer in mesh)
    ↓
Resource Evaluation (Opportunity cost & buffer calculation)
    ↓
Negotiation (Offer / Counter-Offer state machine)
    ↓
Agreement (Bilateral lease activation)
    ↓
Resource Sharing (Streaming allocation)
    ↓
Lease Expiry & Auto-Release
```
