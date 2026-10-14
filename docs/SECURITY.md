# QMOOSA BOT CHAIN — Security Model & Threat Assessment

## 1. Zero-Simulation Policy & Fail-Closed Gates

In accordance with strict production engineering standards:
- **No Synthetic Passes:** Mocks, fixtures, or local emulators can never substitute for live-network validation.
- **Fail-Closed Execution:** Missing RPC endpoints or unconfirmed transactions immediately result in a `BLOCKED` or `FAIL` status, never `PASS`.
- **Mainnet Lock:** Mainnet value-bearing spending is disabled via `MAINNET_LOCKED = true`.

---

## 2. Threat Modeling & Mitigations

| Threat Vector | Potential Impact | Implemented Mitigation |
| :--- | :--- | :--- |
| **Replay Attacks** | Duplicate claim of x402 payment receipts | In-memory & on-chain hash registry; nonces embedded in ML-DSA-65 envelopes |
| **Runaway Inflation** | Unauthorized QBOT supply dilution | Invariant rule: `periodStartSupply * 200 / 10000` rolling limit; `MINTER_ROLE` restricted |
| **Prompt Injection** | LLM jailbreaks & unauthorized budget draining | Regex filtering of override patterns, system prompt extraction, and budget limits |
| **Wallet Hijacking** | Malicious payment routing | EIP-681 strict parser verifying Chain ID `968` and canonical contract regex |
| **Quantum Attacks** | Off-chain attestation forgery | NIST FIPS 204 ML-DSA-65 post-quantum digital signatures |
| **Premature Mainnet Spend**| Accidental loss of real crypto funds | Compile-time and runtime `assertMainnetLock()` assertion |

---

## 3. Post-Quantum Cryptography Implementation

The project implements off-chain digital signatures using **ML-DSA-65**, standardized under NIST FIPS 204:
- Key Generation: 32-byte cryptographic entropy expanding via SHA3-512.
- Message Serialization: RFC 8785 JSON canonicalization.
- Hashing: Composite SHA3-512 digest binding payload, monotonic nonce, ISO timestamp, and public key.
