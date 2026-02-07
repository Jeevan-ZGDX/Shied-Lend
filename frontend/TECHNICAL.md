# Technical Overview

## Smart Contracts (3)
1. Vault — accepts private RWA deposits; records nullifier commitments to prevent double-spend.
2. LendingPool — evaluates ZK proofs of collateral sufficiency; issues USDC loans.
3. Liquidator — triggers path payments on undercollateralization; swaps RWA → USDC via DEX.

## ZK Circuits (3)
1. Deposit Circuit — proves asset ownership and amount threshold; outputs nullifierCommitment.
2. Loan Circuit — proves private LTV within bounds; verifies against on-chain parameters.
3. Health Circuit — proves collateral health without revealing values; supports dashboard.

## Proof Verification Flow
1. User selects asset and amount
2. Frontend POSTs to `/api/generate-deposit-proof`
3. Backend returns nullifierCommitment; contract verifies proof and stores commitment
4. Borrow: POST `/api/generate-loan-proof` → verify against LendingPool
5. Transactions signed by Freighter and submitted via Stellar SDK

## Oracle Integration
Primary oracle provides RWA pricing; fallback to mock price if unavailable. Loan LTV is computed privately off-chain, verified by ZK proofs on-chain.

## Security Considerations
- Nullifiers prevent double-use across deposits
- Selective disclosure via viewing keys for auditors
- Clawback-compatible asset flows for regulatory compliance

## Roadmap
- Streaming loans with time-weighted proofs
- Institutional yield aggregation across RWA pools
- Soroban contract migration with native proof verification
