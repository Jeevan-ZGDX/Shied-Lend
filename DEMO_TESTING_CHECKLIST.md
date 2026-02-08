# ShieldLend Demo Testing Checklist

## 1. Preparation
- [ ] Wallet connected (Freighter).
- [ ] Oracle service running (`./run-oracle.sh`).
- [ ] Frontend running (`npm run dev`).

## 2. Deposit Flow
- [ ] Navigate to **Deposit** page.
- [ ] Verify Oracle price is loading/updating.
- [ ] Enter Amount (e.g., `100`).
- [ ] Click "Generate Secret".
- [ ] Click "Copy" and **PASTE IT SOMEWHERE SAFE** (Notepad).
- [ ] Check "I have saved this secret".
- [ ] Click "Deposit Privately".
- [ ] Sign transaction in Freighter.
- [ ] Verify Success Toast and Deposit ID.
- [ ] **Privacy Check:** Click transaction link, verify Amount is NOT visible in arguments (only Hash).

## 3. Borrow Flow
- [ ] Navigate to **Borrow** page.
- [ ] Enter **Deposit ID** (from previous step).
- [ ] Enter **Original Amount** (must match exactly).
- [ ] Paste **Deposit Secret** (must match exactly).
- [ ] Enter **Loan Amount** (max 66% of deposit).
- [ ] Click "Request Loan".
- [ ] Observe `ProofProgress`:
    - [ ] Fetching oracle price... ✅
    - [ ] Generating collateral proof... ✅ (Should take ~5-10s)
    - [ ] Generating KYC proof... ✅
    - [ ] Submitting to blockchain... ✅
- [ ] Sign transaction in Freighter.
- [ ] Verify "Loan Approved" message.

## 4. Error Handling (Optional but Recommended)
- [ ] Try Borrow with **WRONG Secret** -> Should fail proof or contract check.
- [ ] Try Borrow with **Amount > 66%** -> Should show "Insufficient collateral" error.

## 5. Manage Flow
- [ ] Navigate to **Manage** page.
- [ ] Enter Loan ID.
- [ ] Click "Check Status" -> Should be "Active".
- [ ] Click "Repay Loan".
- [ ] Sign transaction.
- [ ] Verify Status changes to "Repaid".
