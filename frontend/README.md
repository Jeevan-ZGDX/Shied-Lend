# ShieldLend — The Privacy Layer for Institutional Finance on Stellar

Borrow against RWAs without revealing your position. ZK-powered confidentiality on Stellar testnet.

## Why Stellar?
- Protocol 25 (X-Ray) unlocks ZK-friendly primitives (BN254, Poseidon)
- Mature RWA ecosystem (Franklin Templeton’s Benji tokens, tokenized treasuries)
- Fast, cheap, regulated-friendly rails with clawback and issuer controls

## Architecture
```
+--------------------+     +----------------------+     +----------------------+
| Frontend (React)   | --> | Developer 2 API      | --> | Contracts (Dev 1)    |
| Freighter Wallet   |     | ZK Proof Generation  |     | Vault / LendingPool  |
| Stellar SDK        | <-- | /api/* (localhost)   | <-- | Liquidator            |
+--------------------+     +----------------------+     +----------------------+
```

## Quick Start (demo in ~2 minutes)
1. Install Node 18+ and Freighter extension
2. Fund your testnet wallet via friendbot
3. Copy `.env.example` to `.env` (leave TESTNET)
4. Run:
   - `npm install`
   - `npm run dev`
5. Open `http://localhost:5173`
6. Start Developer 2 service at `http://localhost:3001` responding to:
   - `POST /api/generate-deposit-proof` → `{ nullifierCommitment }`
   - `POST /api/generate-loan-proof` → `{ ok: true }`

## Tech Stack
| Layer | Tools |
|------|-------|
| Frontend | React, TypeScript, Vite, Tailwind |
| Wallet | @stellar/freighter-api |
| On-chain | @stellar/stellar-sdk (testnet) |
| Proof API | Axios to localhost:3001 |
| UX | react-hot-toast |

## Team
- Protocol Engineering — Developer 1 (contracts)
- ZK/Backend — Developer 2 (proof APIs)
- Frontend/Integration — You (this demo)
GitHub: https://github.com/your-team
