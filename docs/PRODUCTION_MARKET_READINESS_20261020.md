# Production & Market Readiness — Evidence-Gated Remediation (2026-10-20)

**Status: NOT VERIFIED FOR MAINNET. Mainnet operations remain LOCKED.**

This document is a remediation plan, **not** a deployment attestation or 100/100 score. GitHub Actions showed failures in both "Engineering Automation (No Mainnet)" and "Reality-Based CI/CD & Gate Verification" in the latest inspected run (2026-10-15); preview/smoke had a successful run. Inspect actual failed-job logs and reproduce before fixing.

## Verification commands
```bash
npm ci
npm run build
npm run test:lane1
npm run test:lane2
npm run rea:audit
npm run raven:rsi
npm run mission:verify
```

Record each command's exit status, commit SHA, UTC timestamp, required RPC endpoint, chain ID, transaction hash (if any), and sanitized log/artifact links in `reports/RELEASE_EVIDENCE.md`. Distinguish network-independent tests from genuine testnet interactions. Never turn an unexecuted test into PASS.

## Prioritized P0 blockers
1. **Broken workflow gates** — trace failing steps, correct root causes, rerun on the commit being released. A green preview does not overrule failing security/reality workflows.
2. **Token control** — keep initial 1,000,000,000 QBOT as stated in README; model uncapped maximum supply with a strict annual mint-rate ceiling of 200 basis points, but independently validate the exact contract logic, supply accounting, rounding, carryover, epoch boundaries, governance role separation and upgrade authority. Uncapped does **not** mean unrestricted issuance.
3. **Payments** — verify real x402 HTTP 402 challenge/response, chain-specific asset settlement, receipt signature validation, expiry, replay resistance, idempotency, wrong-chain/wrong-asset rejection, partial-failure reconciliation and duplicate-payment prevention. Do not claim '0.001 QBOT settled' if the facilitator settles a different asset.
4. **Post-quantum cryptography** — prove ML-DSA-65 verification against official FIPS 204 test vectors; reject tampered payloads, wrong keys, malformed signatures, nonce reuse and expired envelopes. Document what is off-chain versus on-chain and do not market PQC as protecting transaction signatures unless verified.
5. **Wallet & chain** — assert chain ID and contract addresses, reject malicious RPC/network mismatches, validate QR/EIP-681 interoperability, and test mobile and disconnected-wallet flows.
6. **Agentic automation** — sandbox agent privileges; budget-limit paid APIs; secure secrets; human-approve treasury actions. Conway simulation is not cryptographic entropy or consensus unless proved by independent security evidence.
7. **Operating security** — threat model, audited dependencies, secret scan, SAST/CodeQL, rate limiting, logs/metrics, backup/rollback, incident response and external contract review.
8. **Hackathon readiness** — working end-to-end demo, reproducible install, architecture diagram, problem/market hypothesis, independent evidence, accurate limitation statement, 3-minute demo video and judges' rubric mapping.

## Gate matrix
| Gate | Required evidence | Status |
| --- | --- | --- |
| Reproducible build | npm ci + build log on exact commit | UNKNOWN |
| Unit and negative tests | Executed results + failure-case coverage | UNKNOWN |
| Live testnet | Explorer transaction, chain/contract/receipt proofs | UNKNOWN |
| Security and cryptography | Test vectors, adversarial tests, independent audit | UNKNOWN |
| Tokenomics | Formal mint invariant + governance enforcement | UNKNOWN |
| CI | All required workflows green on same SHA | **FAILED in latest inspected run** |
| Market launch | Product demo, users, terms, risk disclosure | UNKNOWN |
| Mainnet | Independent audit + explicit human approval | **LOCKED** |

**Release rule:** no mainnet, real funds, paid RPC/API use, contract deployments or automated token minting until all blocking evidence gates are green and explicit sign-off is recorded. Do not report a score without computing it from reproducible artifacts.
