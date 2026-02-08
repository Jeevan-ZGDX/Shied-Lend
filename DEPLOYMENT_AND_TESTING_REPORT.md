# ShieldLend Deployment & Manual Testing Report
Generated: 2026-02-07

## 1. Environment Status
- **Contracts**: ✅ Compiled & Deployed to Testnet
    - Validation: `scripts/deploy.sh` executed successfully with `stellar` CLI.
- **Frontend Config**: ✅ Updated (`frontend/public/contracts.json`)
- **Circuits**: ✅ Compiled & Keys Generated
    - Note: `loan` circuit required manual setup (`pot15`), which is now complete.

## 2. Deployment Summary (Current State)
The contracts are currently deployed at the following addresses on **Stellar Testnet**:

| Contract | Address |
|---|---|
| **Vault** | `CBY7OT6NDFTE6X5OI26TE4OLJK3YOAQK72NNHQLY2GCDXVGOU6VKDVWM` |
| **Lending Pool** | `CBO4LXOFA5NKE3BHS7Z554QJXPTLSBQZ4VW3ASIZZTH6GQPXIWQFFRMW` |
| **Liquidator** | `CB5ZFYVS5EJC5UDSXVUWAKUAQFREEEIGD5QPOSHMOLOJT45IKZ4GFBRQ` |

## 3. How to Run Manual Tests

### Prerequisite: Fix for `proving-service`
You encountered a WSL/Node path error (`UNC paths are not supported`). This happens when `npm` calls a Windows version of Node.
**Solution:** Run `node` directly using the linux binary.

```bash
cd proving-service
# Do not run 'npm start' if it fails
node server.js
```
*Expected Output:* `Oracle Service running on port 3000`

### Step-by-Step Testing Guide

#### A. Start the Backend (Oracle)
1. Open a terminal.
2. `cd proving-service`
3. `node server.js` (Keep this terminal open)

#### B. Start the Frontend
1. Open a new terminal.
2. `cd frontend`
3. `npm run dev`
4. Open your browser to the URL shown (usually `http://localhost:5173`).

#### C. Manual Test Scenarios
1. **Connect Wallet**: Click "Connect Wallet" and approve in Freighter (ensure it's on Testnet).
2. **Deposit**:
    - Go to "Deposit" tab.
    - Enter Amount: `1000` (DAI/USDC).
    - Click "Deposit".
    - Signing: You will be asked to sign a transaction.
    - Verification: Wait for the "Deposit Successful" message.
3. **Borrow**:
    - Go to "Borrow" tab.
    - Select your Deposit ID (should appear in dropdown).
    - Enter Loan Amount (max 60% of deposit).
    - Click "Borrow".
    - Verification: Check your wallet balance for received tokens.
4. **Repay**:
    - Go to "Manage" tab.
    - View your active loan.
    - Click "Repay".

## 4. Useful Commands
- **Check Contract State via CLI**:
  ```bash
  stellar contract read --id [CONTRACT_ID] --network testnet
  ```
- **Generate New Identity (if needed)**:
  ```bash
  stellar keys generate [NAME] --network testnet
  stellar keys fund [NAME] --network testnet
  ```

## 5. Artifacts
- **Detailed Manual Guide**: [MANUAL_TESTING_GUIDE.md](file:///home/deva/stellar-hackathon/MANUAL_TESTING_GUIDE.md)
- **Deployment Script Result**: [scripts/DEPLOY_RESULT.md](file:///home/deva/stellar-hackathon/scripts/DEPLOY_RESULT.md)
