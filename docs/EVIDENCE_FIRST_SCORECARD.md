# QMOOSA BOT CHAIN — Evidence-First 100/100 Scorecard

**Status:** NOT CERTIFIED; mainnet remains LOCKED. **Target:** 100/100; **current strictly verified production score:** 0/100 pending independent evidence and comprehensive execution. This is not a claim that zero features work: it means zero production certification points can currently be awarded under the strict policy.

## Verified repository facts
- Source tree contains Solidity QBOT contract, x402 adapters, Conway engine, ML-DSA module, wallet/QR, AI router, and web UI.
- GitHub Actions workflow on commit `1d16494ce4fd03dba3976656f430d5453674cc0c` concluded success for the existing smoke-test pipeline on 2026-10-14.
- The previous `scripts/reality_gate.ts` awarded whole categories for file presence or a single RPC check. This is not production proof.
- The existing REA script performed string matching, not a security audit. The existing Raven RSI script performed two small experiments, not accepted source-code improvements.

## Points to earn (none may be awarded for file existence alone)

| Category | Max | Production evidence required |
|---|---:|---|
| Architecture & dependencies | 8 | clean reproducible builds, SBOM, pinning, SCA, reproducible artifact |
| Smart contracts & tokenomics | 12 | reproducible compile, Foundry invariants/fuzzing, independent audit, on-chain bytecode |
| x402 Bazaar | 10 | supported facilitator, scheme/network checks, real settlement & receipt reconciliation |
| Conway & workflow automaton | 8 | deterministic properties, coverage, bounded resources, authorization isolation |
| AI agentics & multimodel | 10 | live provider calls, real cost enforcement, prompt injection / tool permission tests |
| PQC & security | 12 | FIPS 204 vectors, negative tests, independent crypto review, key lifecycle |
| Wallets & QR | 8 | real wallet EIP-1193 connection, signature login, testnet QR payment and receipt |
| Web4 frontend & APIs | 8 | browser E2E, API auth, accessibility, live data and security tests |
| Reality/testing | 12 | real testnet receipts, property/fuzz/E2E tests, security scans, evidence digests |
| CI/CD & observability | 7 | strict PR gates, deployed smoke checks, alerting, recovery drill |
| Documentation & governance | 5 | incident runbooks, threat model, independent owner signoff and launch checklist |
| **TOTAL** | **100** | **All mandatory gates must pass** |

## RSI / REA engineering specification
Treat **REA** as evidence-based architecture inspection, not as proof of formal verification. Treat **Raven RSI** as a research-inspired optimization methodology until upstream code has been reviewed for license, supply-chain and compatibility.

For each RSI proposal:
1. Record a measurable, immutable baseline: git SHA, workload, latency, gas, costs, memory, security findings and test suite.
2. Produce a narrow change on a disposable branch and log its exact diff.
3. Run unit, contract invariant, fuzz, adversarial, dependency and live-integration gates as appropriate.
4. Compare against baseline with a reproducible benchmark. Reject regression or data leakage.
5. Require human review of security-sensitive changes; do not auto-merge, auto-deploy or auto-sign.
6. Accept improvement only after CI-green evidence and verified metric benefit. Keep rollback SHA.
7. Stop on spending cap, missing secret, unknown facilitator, missing on-chain receipt or failed security check.

**Release rule:** no source-presence credit, no generic 'optimization converged' claim, no unrestricted minting, no production-ready label based on testnet RPC alone. Mainnet requires a separate explicit owner authorization, verified deployment plan and security review. This corrective branch deliberately blocks the previous unconditional 100/100 claim until independent evidence verifiers are implemented.
