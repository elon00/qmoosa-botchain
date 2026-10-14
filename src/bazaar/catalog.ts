/**
 * QMOOSA BOT CHAIN — x402 AI Agentics Bazaar Service Catalog
 * Micro-priced services consumable by autonomous AI agents and human users using QBOT/tBOT on BOT Chain.
 */

export interface BazaarService {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  priceQbot: string;
  priceRaw: string;
  category: 'AI_AGENTICS' | 'CONWAY_COMPUTE' | 'DEPIN_TELEMETRY' | 'PQC_SECURITY';
  status: 'ACTIVE';
}

export const BAZAAR_SERVICES: BazaarService[] = [
  {
    id: 'srv-conway-predict',
    name: 'Conway Neural Pattern Predictor',
    description: 'Deterministic cellular automaton future oscillator computation and glider phase tracking.',
    endpoint: '/api/v1/agent/conway-predict',
    priceQbot: '0.001',
    priceRaw: '1000000000000000', // 0.001 * 10^18
    category: 'CONWAY_COMPUTE',
    status: 'ACTIVE',
  },
  {
    id: 'srv-pqc-attestation',
    name: 'NIST FIPS 204 PQC Attestation Seal',
    description: 'Off-chain ML-DSA-65 post-quantum cryptographic digest generation and tamper verification seal.',
    endpoint: '/api/v1/agent/pqc-seal',
    priceQbot: '0.002',
    priceRaw: '2000000000000000', // 0.002 * 10^18
    category: 'PQC_SECURITY',
    status: 'ACTIVE',
  },
  {
    id: 'srv-depin-telemetry',
    name: 'BOT Chain DePIN Telemetry & Hardware Node Oracle',
    description: 'Real-time telemetry, bandwidth, latency, and proof-of-work/stake audit for BOT Chain DePIN nodes.',
    endpoint: '/api/v1/agent/depin-telemetry',
    priceQbot: '0.003',
    priceRaw: '3000000000000000', // 0.003 * 10^18
    category: 'DEPIN_TELEMETRY',
    status: 'ACTIVE',
  },
  {
    id: 'srv-agentic-reasoning',
    name: 'Multi-Model Autonomous Agent Reasoning Core',
    description: 'High-assurance LLM routing with budget enforcement and prompt injection sanitization.',
    endpoint: '/api/v1/agent/reasoning',
    priceQbot: '0.005',
    priceRaw: '5000000000000000', // 0.005 * 10^18
    category: 'AI_AGENTICS',
    status: 'ACTIVE',
  },
];

export function getServiceById(id: string): BazaarService | undefined {
  return BAZAAR_SERVICES.find((s) => s.id === id);
}

export function getServiceByEndpoint(endpoint: string): BazaarService | undefined {
  return BAZAAR_SERVICES.find((s) => s.endpoint === endpoint);
}
