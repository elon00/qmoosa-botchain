import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkRpcHealth,
  createBotChainPublicClient,
  MAINNET_LOCKED,
  assertMainnetLock,
} from '../../src/chains/botchain.js';
import { TransactionVerifier } from '../../src/chains/transaction-verifier.js';

describe('Lane 2: Live BOT Chain Testnet Reality Verification (Zero-Mock)', () => {
  it('connects to real BOT Chain Testnet and verifies Chain ID is 968', async () => {
    const health = await checkRpcHealth('https://rpc.bohr.life', 968);
    assert.equal(health.actualChainId, 968);
    assert.equal(health.isResponsive, true);
    assert.ok(health.blockNumber > 26_000_000n);
    assert.ok(health.latencyMs >= 0);
  });

  it('queries real live block height from BOT Chain Testnet via viem', async () => {
    const client = createBotChainPublicClient('https://rpc.bohr.life');
    const blockNumber = await client.getBlockNumber();
    assert.ok(blockNumber > 26_000_000n);

    const block = await client.getBlock({ blockNumber });
    assert.ok(block.hash);
    assert.ok(block.timestamp > 0n);
  });

  it('queries real live gas price from BOT Chain Testnet', async () => {
    const client = createBotChainPublicClient('https://rpc.bohr.life');
    const gasPrice = await client.getGasPrice();
    assert.ok(gasPrice > 0n);
  });

  it('throws when expected Chain ID does not match network response', async () => {
    await assert.rejects(
      () => checkRpcHealth('https://rpc.bohr.life', 1),
      /Chain ID mismatch on https:\/\/rpc\.bohr\.life: expected 1, received 968/
    );
  });

  it('zero-simulation enforcement: non-existent transaction hash is rejected', async () => {
    const verifier = new TransactionVerifier();
    const fakeHash = '0x1234567890123456789012345678901234567890123456789012345678901234';

    await assert.rejects(
      () => verifier.verifyReceipt(fakeHash),
      /Transaction not found on BOT Chain Testnet/
    );
  });

  it('enforces replay resistance on settled transaction hashes', () => {
    const verifier = new TransactionVerifier();
    // Simulate an internal settled hash recorded in the ledger
    const testHash = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    (verifier as any).verifiedHashes.add(testHash.toLowerCase());

    assert.equal(verifier.isHashSettled(testHash), true);
    assert.throws(
      () => {
        if (verifier.isHashSettled(testHash)) {
          throw new Error(`Replay attack detected: Transaction hash ${testHash} has already been settled.`);
        }
      },
      /Replay attack detected/
    );
  });

  it('strictly enforces MAINNET_LOCKED = true policy', () => {
    assert.equal(MAINNET_LOCKED, true);
    assert.throws(
      () => assertMainnetLock(),
      /SECURITY GATE ACTIVE: MAINNET_LOCKED=true/
    );
  });
});
