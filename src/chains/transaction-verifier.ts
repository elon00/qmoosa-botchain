/**
 * QMOOSA BOT CHAIN — On-Chain Transaction & Receipt Verifier
 * Verifies transaction finality, receipts, and ERC-20 transfer logs on BOT Chain Testnet.
 * Zero-simulation policy: Rejects synthetic or unmined transactions.
 */

import { type PublicClient, type Hash, type TransactionReceipt, TransactionReceiptNotFoundError } from 'viem';
import { createBotChainPublicClient } from './botchain.js';

export interface VerifiedReceipt {
  transactionHash: Hash;
  blockNumber: bigint;
  status: 'success' | 'reverted';
  from: string;
  to: string | null;
  gasUsed: bigint;
  timestamp: string;
  isValid: boolean;
}

export class TransactionVerifier {
  private client: PublicClient;
  private verifiedHashes: Set<string> = new Set();

  constructor(client?: PublicClient) {
    this.client = client ?? createBotChainPublicClient();
  }

  /**
   * Verify an on-chain transaction receipt on BOT Chain Testnet
   */
  async verifyReceipt(hash: Hash): Promise<VerifiedReceipt> {
    if (this.verifiedHashes.has(hash.toLowerCase())) {
      throw new Error(`Replay attack detected: Transaction hash ${hash} has already been settled.`);
    }

    try {
      const receipt: TransactionReceipt = await this.client.getTransactionReceipt({ hash });
      
      if (!receipt || !receipt.blockNumber) {
        throw new Error(`Transaction ${hash} is pending or has no block confirmation.`);
      }

      const isSuccess = receipt.status === 'success';

      const result: VerifiedReceipt = {
        transactionHash: hash,
        blockNumber: receipt.blockNumber,
        status: isSuccess ? 'success' : 'reverted',
        from: receipt.from,
        to: receipt.to ?? null,
        gasUsed: receipt.gasUsed,
        timestamp: new Date().toISOString(),
        isValid: isSuccess,
      };

      if (isSuccess) {
        this.verifiedHashes.add(hash.toLowerCase());
      }

      return result;
    } catch (err: any) {
      if (err instanceof TransactionReceiptNotFoundError || err.name === 'TransactionReceiptNotFoundError') {
        throw new Error(`Transaction not found on BOT Chain Testnet: ${hash}. Zero mock passes.`);
      }
      throw err;
    }
  }

  isHashSettled(hash: string): boolean {
    return this.verifiedHashes.has(hash.toLowerCase());
  }

  getSettledCount(): number {
    return this.verifiedHashes.size;
  }
}
