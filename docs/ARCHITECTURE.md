# QMOOSA BOT CHAIN — System Architecture & Component Design

## 1. High-Level Architecture Overview

```
                      +------------------------------------------+
                      |        Cyberpunk Web 4.0 Interface       |
                      |   Live Conway Canvas • Multi-Model Chat  |
                      |   EIP-681 QR Code • 100/100 Scorecard   |
                      +--------------------+---------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |         Express API Gateway              |
                      |   Official @x402/express Paywall Router  |
                      +--------------------+---------------------+
                                           |
         +-----------------+---------------+-----------------+-----------------+
         |                 |                                 |                 |
         v                 v                                 v                 v
+-----------------+ +-----------------+              +-----------------+ +-----------------+
|   x402 Bazaar   | | Agent Spending  |              | Conway Automaton| | NIST FIPS 204   |
|   4 Micro-      | | Policy & Limits |              | B3/S23 & 10-Tx  | | ML-DSA-65 PQC   |
|   Services      | | Vault & Router  |              | State Machine   | | Signatures      |
+-----------------+ +-----------------+              +-----------------+ +-----------------+
         |                 |                                 |                 |
         +-----------------+---------------+-----------------+-----------------+
                                           |
                                           v
                      +------------------------------------------+
                      |         BOT Chain EVM Layer 1            |
                      |   Chain ID 968 (Testnet) • 677 (Mainnet) |
                      |   RPC: https://rpc.bohr.life             |
                      |   QBOT Token Contract (2% Inflation Cap) |
                      +------------------------------------------+
```

---

## 2. Core Subsystems

### A. BOT Chain Layer 1 EVM Integration (`src/chains/botchain.ts`)
- Target: EVM-compatible Layer 1 for DePIN and AI applications.
- Testnet: Chain ID `968`, CAIP-2 `eip155:968`, RPC `https://rpc.bohr.life`.
- Mainnet: Chain ID `677`, CAIP-2 `eip155:677`, RPC `https://rpc.botchain.ai`.
- Policy: `MAINNET_LOCKED = true`. Zero funds or gas spent on mainnet without multisig governance authorization.

### B. Strategic Tokenomics (`contracts/QBOTToken.sol` & `src/contracts/qbot.ts`)
- 1,000,000,000 QBOT initial treasury supply.
- Strict on-chain rolling 365-day annual inflation limit capped at 2.00% (200 basis points).
- Role-based Access Control (`DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, `PAUSER_ROLE`).

### C. x402 Bazaar Protocol (`src/bazaar/catalog.ts` & `src/server.ts`)
- Official `@x402/express` middleware mounted with `ExactEvmScheme`.
- Returns standard HTTP 402 Payment Required headers with payment options.
- 4 agent-consumable services priced in QBOT.

### D. NIST FIPS 204 PQC Engine (`src/crypto/mldsa.ts`)
- ML-DSA-65 post-quantum signing suite.
- RFC 8785 deterministic canonical JSON envelope serialization.
- Anti-tamper digest calculation with SHA3-512 and cryptographic nonces.

### E. Deterministic Conway Automaton (`src/core/conway.ts`)
- Toroidal 2D grid simulation implementing Conway B3/S23 rules.
- 10-state deterministic transaction automaton.

### F. Upstream Tools (`sandbox/tools/`)
- REA (Reverse Engineering & Architectural Analysis): MIT licensed static analysis in `sandbox/tools/rea`.
- Raven RSI (Recursive Self-Improvement): Apache 2.0 licensed optimization loops in `sandbox/tools/raven`.
