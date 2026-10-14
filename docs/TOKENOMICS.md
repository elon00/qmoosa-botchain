# QMOOSA BOT CHAIN — Strategic Tokenomics (QBOT)

## 1. Overview & Positioning

- **Token Name:** Qmoosa BotChain Utility Token
- **Symbol:** `QBOT`
- **Decimals:** 18
- **Blockchain:** BOT Chain (Layer 1 for DePIN and AI applications)
- **Testnet Chain ID:** `968` (`0x3c8`), RPC: `https://rpc.bohr.life`
- **Mainnet Chain ID:** `677` (`0x2a5`), RPC: `https://rpc.botchain.ai`

> **Note on Native BOT vs QBOT:**
> BOT Chain's native token is `BOT` (fixed 150 Million supply used for L1 gas and validator staking). `QBOT` is an application-layer utility and agentic micropayment token implemented as a security-audited ERC-20 smart contract on BOT Chain.

---

## 2. Supply Architecture & Inflation Math

| Metric | Value | Enforced By |
| :--- | :--- | :--- |
| **Initial Supply** | 1,000,000,000 QBOT (1 Billion) | `INITIAL_SUPPLY` in contract constructor |
| **Max Annual Inflation** | 2.00% (200 Basis Points) | `MAX_ANNUAL_INFLATION_BPS` immutable on-chain ceiling |
| **Rolling Period** | 365 Days (`365 days`) | `INFLATION_PERIOD` timestamp check |
| **Base Supply** | Period Start Supply | `periodStartSupply` preventing compounding runaway mints |
| **Maximum Year 1 Mint** | 20,000,000 QBOT | Hard mathematical constraint |

### Mathematical Invariant

$$\Delta S_{\text{period}} \le \frac{S_{\text{start}} \times 200}{10\,000}$$

Where:
- $S_{\text{start}}$ is the snapshot supply at the beginning of the 365-day issuance cycle.
- $\Delta S_{\text{period}}$ is the total cumulative new tokens minted in that cycle.
- Any transaction attempting to mint beyond this threshold **reverts** on-chain with `QBOT: mint amount exceeds 2% annual inflation ceiling`.

---

## 3. Governance & Roles

1. `DEFAULT_ADMIN_ROLE`: Governance multisig with timelock authority to grant and revoke roles.
2. `MINTER_ROLE`: Restricted to authorized agentic treasury and x402 liquidity pools. Cannot bypass the 2% rolling inflation ceiling.
3. `PAUSER_ROLE`: Emergency circuit breaker in the event of an ecosystem exploit. Stops token transfers without granting seizure or confiscation rights.

---

## 4. Agentic Micropayments & Fee Burn

Every time an autonomous agent consumes a paid service in the x402 Bazaar (e.g. Conway computation, PQC attestation, DePIN hardware telemetry), a fractional fee in QBOT is collected:
- **80%** goes to the DePIN hardware provider / API creator.
- **10%** is permanently **burned** via the on-chain `burn()` function, creating continuous deflationary pressure counterbalancing the 2% annual issuance.
- **10%** is routed to the QMOOSA Autonomous Research Treasury for recursive self-improvement agent tasks.
