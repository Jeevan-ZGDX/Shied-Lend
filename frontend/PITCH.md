# ShieldLend — Judge Pitch

## Problem: Institutional Transparency Trap
Institutions need blockchain auditability, but publishing collateral positions reveals strategy and risk exposure. This deters RWA adoption for private credit.

## Solution: Confidential Credit Layer
ShieldLend enables private RWA-backed borrowing using ZK proofs. Lenders see compliance, not positions.

## Technical Innovation
- Protocol 25 (X-Ray) primitives (BN254 curve, Poseidon hashing)
- Nullifier commitments prevent double-use while hiding amounts
- Soroban-ready transaction routing with Stellar SDK

## Regulatory Compliance
- Selective disclosure with viewing keys for auditors
- Issuer clawback compatibility on RWA assets
- Privacy without Transparency: provable compliance without public amounts

## Use Case
Hedge fund borrows against tokenized treasuries privately, avoiding frontrun transparency risks. Liquidity via USDC; settlement on Stellar testnet.

## Market
Private credit is multi-billion and growing; institutions require confidentiality to deploy at scale.

## Demo Flow
1. Connect Freighter wallet
2. Deposit RWA collateral → generate ZK proof → store nullifier
3. Borrow USDC → collateral proof (private LTV)
4. Manage loans, repay, generate viewing key
5. Simulate liquidation: DEX path payment without revealing collateral amount

## The Winning Statement
ShieldLend delivers institutional-grade privacy on Stellar: borrow against RWAs with provable compliance, without revealing positions.
