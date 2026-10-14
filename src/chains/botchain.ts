/**
 * QMOOSA BOT CHAIN — Chain Configuration & Reality EVM Client
 * BOT Chain Layer 1 for DePIN and AI Applications
 * Testnet: Chain ID 968 (0x3c8), RPC: https://rpc.bohr.life
 * Mainnet: Chain ID 677 (0x2a5), RPC: https://rpc.botchain.ai
 *
 * POLICY: MAINNET IS LOCKED. Zero mainnet crypto spending without explicit sign-off.
 */

import { createPublicClient, http, defineChain, type PublicClient } from 'viem';

export const BOTCHAIN_TESTNET = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  network: 'botchain-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test BOT Token',
    symbol: 'tBOT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
    public: { http: ['https://rpc.bohr.life'] },
  },
  blockExplorers: {
    default: { name: 'BOT Chain Testnet Explorer', url: 'https://scan.bohr.life' },
  },
  testnet: true,
});

export const BOTCHAIN_MAINNET = defineChain({
  id: 677,
  name: 'BOT Chain Mainnet',
  network: 'botchain-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT Token',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.botchain.ai'] },
    public: { http: ['https://rpc.botchain.ai'] },
  },
  blockExplorers: {
    default: { name: 'BOT Chain Mainnet Explorer', url: 'https://scan.botchain.ai' },
  },
  testnet: false,
});

export const MAINNET_LOCKED = true;

export interface RpcHealthReport {
  endpoint: string;
  expectedChainId: number;
  actualChainId: number;
  blockNumber: bigint;
  blockNumberHex: string;
  isResponsive: boolean;
  timestamp: string;
  latencyMs: number;
}

export function createBotChainPublicClient(rpcUrl = 'https://rpc.bohr.life'): PublicClient {
  return createPublicClient({
    chain: BOTCHAIN_TESTNET,
    transport: http(rpcUrl, { timeout: 15_000, retryCount: 2 }),
  });
}

export function createBotChainMainnetClient(rpcUrl = 'https://rpc.botchain.ai'): PublicClient {
  if (MAINNET_LOCKED) {
    // Read-only inspection is permitted, write/spend is strictly blocked
  }
  return createPublicClient({
    chain: BOTCHAIN_MAINNET,
    transport: http(rpcUrl, { timeout: 15_000, retryCount: 2 }),
  });
}

export async function checkRpcHealth(
  rpcUrl = 'https://rpc.bohr.life',
  expectedChainId = 968
): Promise<RpcHealthReport> {
  const start = Date.now();
  const client = createPublicClient({
    transport: http(rpcUrl, { timeout: 10_000 }),
  });

  const chainId = await client.getChainId();
  if (chainId !== expectedChainId) {
    throw new Error(
      `Chain ID mismatch on ${rpcUrl}: expected ${expectedChainId}, received ${chainId}`
    );
  }

  const blockNumber = await client.getBlockNumber();
  const latencyMs = Date.now() - start;

  return {
    endpoint: rpcUrl,
    expectedChainId,
    actualChainId: chainId,
    blockNumber,
    blockNumberHex: `0x${blockNumber.toString(16)}`,
    isResponsive: true,
    timestamp: new Date().toISOString(),
    latencyMs,
  };
}

export function assertMainnetLock(): void {
  if (MAINNET_LOCKED) {
    throw new Error(
      'SECURITY GATE ACTIVE: MAINNET_LOCKED=true. Zero mainnet funds, gas, or cycles may be spent.'
    );
  }
}
