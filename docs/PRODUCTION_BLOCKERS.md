# Production Release Blockers — 2026-10-15

This document records findings from the current repository review. **Mainnet remains locked.** A successful GitHub smoke-test run is not equivalent to a production security certification.

## P0: Strict evidence validator not implemented
The evidence-first reality gate deliberately sets `productionEvidenceVerified = false`; it cannot certify production. Implement an independently verifiable check per mandatory gate. Evidence must be bound to the tested git commit, environment and on-chain transaction/contract identity. Do not set this boolean to true to make CI pass.

## P0: QBOT rolling-year issuance specification mismatch
`contracts/QBOTToken.sol` advertises a **rolling 365-day 2% ceiling**. However `mintInflation()` resets `mintedInCurrentPeriod` to zero when `block.timestamp >= currentPeriodStart + 365 days`. This is a **fixed resettable interval**, not a continuously rolling 365-day cap. An authorized minter could mint near the end of one period and again immediately after reset, surpassing 2% issuance measured across a sliding one-year window. Choose an explicit policy and implement it accurately; for a true rolling cap use timestamped mint events with an on-chain accounting technique that is gas-bounded, then test boundary-time issuance and rolling sums with a real EVM test runner. Do not deploy the current contract as if a rolling cap were proven.

## P0: Independent smart-contract audit absent
No independent signed security report, full compiler reproducibility record, invariant/fuzz run or verified testnet contract receipt was established during this review. Add reproducible Foundry/Hardhat tests, compiler pinning, Slither/other static analysis, fuzz and property testing; commission a qualified independent review before mainnet.

## P0: x402 settlement not independently verified
Presence of `@x402/*` packages and paywall routes does not establish that a facilitator accepts the BOT Chain network identifier or asset, or that settlement occurred. Require an approved compatible facilitator, verified actual payment receipts, signature/replay/idempotency tests, transaction reconciliation and failure-mode tests.

## P0: PQC and wallet/agent authorizations not certified
Require independent FIPS 204 known-answer vectors, key lifecycle policy and negative test evidence. Verify real user-wallet account/chain binding, EIP-1193 signature login, QR payment safety, live model API calls and per-agent spend controls. Off-chain ML-DSA does not make BOT Chain consensus or EVM transactions post-quantum.

## P1: RSI audit output is experimental only
`scripts/raven_rsi.ts` does not currently mutate code or validate accepted improvements. Each RSI candidate must have a reproducible baseline, reviewed diff, held-out tests, security regression checks, benchmark evidence and rollback. Never auto-merge self-edited security or transaction-signing code.

## Required release acceptance
- Evidence-linked 100-point rubric, with **zero points awarded from simple file existence**.
- Security, settlement and authorization P0s closed by reproducible tests and independent review.
- Testnet contract addresses and transaction hashes independently checked with chain ID 968.
- Separate owner signature and reviewed transaction plan before any chain ID 677 deployment.
- Maintain `MAINNET_LOCKED` and fail closed until all conditions are satisfied.

**No mainnet deployment or expenditure is authorized by this document.**
