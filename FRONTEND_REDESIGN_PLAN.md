# ShieldLend Frontend Redesign Plan
**Objective:** Update frontend to authentically demonstrate ZK privacy and impress judges.

## Phase 1: New Components (`src/components/`)
We will create modular components to replace the monolithic page logic.

1.  **`OracleStatus.tsx`**
    -   Fetches and displays live price from backend.
    -   Visualizes: "Oracle ($98.50) → Signed → Circuit".

2.  **`PrivacyIndicator.tsx`**
    -   Tooltip/Badge component: "🔒 Your data is hidden via ZK Proof".

3.  **`DepositForm.tsx`**
    -   Inputs: Asset, Amount.
    -   **New Feature**: "Secret Generator" display box.
    -   Action: Generates proof -> Deposits.

4.  **`BorrowForm.tsx`**
    -   Inputs: Deposit ID, **Original Amount**, **Deposit Secret**, Loan Amount.
    -   **Correction**: Uses these inputs to generate a *valid* proof against the on-chain commitment.
    -   Feedback: "Verifying Collateral Ratio..." (Off-chain check).

## Phase 2: Page Updates (`src/pages/`)
1.  **`Deposit.tsx`**
    -   Replace inputs with `DepositForm`.
    -   Add `OracleStatus` sidebar.

2.  **`Borrow.tsx`**
    -   Replace inputs with `BorrowForm`.
    -   Show "Privacy Walkthrough": Step 1 (Prove) -> Step 2 (Verify) -> Step 3 (Receive).

3.  **`Manage.tsx`**
    -   Improve loan list UI.
    -   Add "Repay" flow.

## Implementation Steps
1.  Create `src/components/` directory.
2.  Implement `OracleStatus.tsx` (using `lib/api.ts`).
3.  Implement `DepositForm.tsx` (fixing secret UX).
4.  Implement `BorrowForm.tsx` (fixing mocked inputs).
5.  Update Pages to compose these components.
6.  Manual Test: Deposit -> Save Secret -> Borrow (using Secret) -> Verify Success.
