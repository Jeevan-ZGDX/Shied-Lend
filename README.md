# Shied-Lend
# ShieldLend

> **Privacy-Preserving Lending Protocol on Stellar**  
> Borrow against Real-World Assets without revealing your collateral position

![ShieldLend Banner](https://via.placeholder.com/1200x300/1e3a8a/ffffff?text=ShieldLend+-+Privacy+Without+Transparency)

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-purple)](https://soroban.stellar.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🎯 Overview

**ShieldLend** enables institutions and users to borrow stablecoins (USDC) against Real-World Asset (RWA) collateral—like tokenized US Treasuries—without revealing their exact collateral amounts on-chain. Using zero-knowledge proofs with Soroban's X-Ray feature, ShieldLend maintains cryptographic privacy while ensuring trustless verification.

### Key Features

- 🔐 **Private Collateral**: Deposit amounts hidden via zero-knowledge proofs
- 🏦 **RWA Integration**: Borrow against tokenized treasuries (BENJI, USDY)
- ⚡ **Soroban X-Ray**: Efficient BN254 proof verification on-chain
- 🛡️ **Over-Collateralized**: 150% collateralization ratio with automated liquidations
- 🌐 **Institutional-Grade**: KYC compliance layer with selective disclosure

---

## 🏗️ Architecture

ShieldLend consists of three Soroban smart contracts:

┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Vault       │ ──→ │ Lending Pool │ ──→ │ Liquidator  │
│ (Deposits)  │     │ (Loans)      │     │ (Risk)      │
└─────────────┘     └──────────────┘     └─────────────┘

text

### Contracts (Stellar Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **Vault** | `CBTJ6Q...SL26` | Manages private collateral deposits |
| **Lending Pool** | `CBIDOQ...2S7E` | Issues loans with ZK proof verification |
| **Liquidator** | `CBGKOA...X33U` | Executes liquidations on unhealthy loans |

<details>
<summary>View Full Addresses</summary>

Vault: CBTJ6QUVOJNWPEGDPL4ZILRUZIE5D53OKO3RLIW5CTADGVNT2LXWSL26
Lending Pool: CBIDOQW3L3BL5YOBJY3HFNXLJ4E5U6GDELBCUV7KTTTMAPDUCOGY2S7E
Liquidator: CBGKOAR2W5SQYKKJLKFGO7GFHPVK5S3KRQ7CSSXECDYPDBLUW3XBX33U

text
</details>

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- Rust 1.75+
- Stellar CLI
- Freighter Wallet (Testnet mode)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/shieldlend.git
cd shieldlend

# Install frontend dependencies
cd frontend
npm install

# Install proving service dependencies
cd ../proving-service
npm install

# Build smart contracts (optional)
cd ../contracts
cargo install --locked stellar-cli --features opt
stellar contract build
Run Locally
bash
# Terminal 1: Start proving service
cd proving-service
node server.js
# Runs on http://localhost:3001

# Terminal 2: Start frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
Access the App
Open browser: http://localhost:5173

Connect Freighter wallet (Testnet)

Start depositing and borrowing!

💡 How It Works
1. Deposit Collateral (Private)
text
User deposits 1000 BENJI tokens
         ↓
Generate secret key
         ↓
Compute commitment: Hash(amount, secret)
         ↓
Generate ZK proof
         ↓
Submit to Vault contract
         ↓
✅ Amount hidden, deposit recorded
Privacy: Only the commitment hash is stored on-chain, not the amount.

2. Borrow Against Collateral
text
User requests 500 USDC loan
         ↓
Generate ZK proof: "collateral ≥ loan × 1.5"
         ↓
Submit to Lending Pool contract
         ↓
Contract verifies proof (never sees amount)
         ↓
✅ Loan approved, USDC transferred
Privacy: Borrower proves sufficient collateral without revealing exact amount.

3. Manage & Repay
Monitor loan health factor (150% = healthy, <100% = liquidatable)

Repay anytime to release collateral

Automated liquidations protect protocol

🔐 Privacy Model
Hidden (Zero-Knowledge)
✅ Exact collateral amounts

✅ Deposit secrets/keys

✅ Position sizes

Public (On-Chain)
✅ Commitment hashes

✅ Loan amounts (USDC)

✅ Asset types (BENJI, USDY)

✅ Health factors

✅ Liquidation events

Result: Cryptographically private positions with public risk metrics.

🛠️ Technology Stack
Frontend
React 18 + TypeScript

Vite (build tool)

Stellar SDK (@stellar/stellar-sdk)

Freighter (wallet integration)

Backend (Proving Service)
Node.js + Express

SnarkJS (Groth16 proof generation)

Circom (ZK circuits)

Smart Contracts
Rust (Soroban SDK)

X-Ray (BN254 cryptography)

Groth16 (zero-knowledge proofs)

Blockchain
Stellar Testnet

Soroban smart contracts

Horizon API (balance queries)

📊 Supported Assets
Collateral (RWAs)
BENJI: Franklin Templeton tokenized US Treasury fund ($98.50)

USDY: Ondo Finance tokenized dollar yield ($1.00)

Loan Asset
USDC: USD stablecoin

Collateralization
Minimum ratio: 150% (e.g., $150 collateral for $100 loan)

Liquidation threshold: <100%

Liquidation bonus: 5%

📖 User Guide
Deposit Workflow
Navigate to Deposit page

Select asset (BENJI/USDY)

Enter amount

Click "Generate Secret" → SAVE THIS KEY!

Click "Deposit Privately"

Sign transaction in Freighter

Receive deposit ID

Borrow Workflow
Navigate to Borrow page

Select your deposit

Enter loan amount (max shown)

Click "Request Loan"

Wait for proof generation (~15s)

Sign transaction

Receive USDC

Manage Loans
Navigate to Manage page

View active loans & health factors

Click "Repay" to close loan

Collateral released automatically

🔬 Technical Details
Zero-Knowledge Proof System
Proof Type: Groth16 SNARK
Curve: BN254 (alt_bn128)
Verification: On-chain via Soroban X-Ray

Deposit Circuit:

text
template DepositProof() {
    signal input amount;
    signal input secret;
    signal output commitment;
    
    commitment <== Hash(amount, secret);
}
Loan Circuit:

text
template LoanProof() {
    signal input collateral;
    signal input price;
    signal input loan;
    
    // Verify: collateral * price >= loan * 1.5
    signal collateralValue <== collateral * price;
    signal minRequired <== loan * 150 / 100;
    
    assert(collateralValue >= minRequired);
}
Smart Contract Functions
Vault Contract:

rust
pub fn deposit_collateral(user: Address, proof: BytesN<256>) -> u64;
pub fn withdraw(user: Address, deposit_id: u64, proof: BytesN<256>);
pub fn get_commitment(deposit_id: u64) -> BytesN<32>;
Lending Pool Contract:

rust
pub fn request_loan(borrower: Address, deposit_id: u64, amount: i128, proof: BytesN<256>) -> u64;
pub fn repay_loan(borrower: Address, loan_id: u64);
pub fn get_loan_status(loan_id: u64) -> LoanStatus;
Liquidator Contract:

rust
pub fn liquidate(liquidator: Address, loan_id: u64) -> LiquidationResult;
pub fn get_health_factor(loan_id: u64) -> u32;
🎯 Use Cases
Institutional Lending
Hedge funds borrow without exposing strategies

Market makers access liquidity privately

Family offices leverage holdings discretely

DeFi Privacy
Private collateral management

Hidden position sizes

Competitive privacy in transparent DeFi

RWA Integration
Borrow against tokenized treasuries

Bridge TradFi and DeFi with privacy

Regulatory-compliant private lending

🛡️ Security
Cryptographic Security
✅ Industry-standard Groth16 proofs

✅ BN254 elliptic curve (256-bit security)

✅ SHA-256 commitment schemes

Smart Contract Security
✅ Soroban safety guarantees

✅ Over-collateralization (150% minimum)

✅ Automated liquidations

✅ No admin keys or upgradability

Economic Security
✅ Oracle price feeds (5-min updates)

✅ Liquidation incentives (5% bonus)

✅ Health monitoring

✅ DEX integration for liquidations
