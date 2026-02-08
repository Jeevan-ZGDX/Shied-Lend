#!/bin/bash
set -e

echo "🚀 SHIELDLEND DEPLOYMENT & TESTING PIPELINE"
echo "==========================================="

# Step 1: Start Oracle (Mocked in Frontend environment for verification)
echo -e "\n[1/6] Starting Oracle Service (Frontend-Hosted)..."
cd frontend
# Start server in background
npm run start-server > ../oracle.log 2>&1 &
ORACLE_PID=$!
sleep 5

# Check if oracle is up (simple health check or curl)
# server.cjs runs on port 3000
curl -f http://localhost:3000/ || echo "⚠️  Oracle root not serving, but might be API only"
echo "✅ Oracle Service started (PID: $ORACLE_PID)"

# Step 2: Deploy Contracts
echo -e "\n[2/6] Deploying Contracts..."
cd ..
# Using existing scripts/deploy.sh
bash scripts/deploy.sh || { echo "❌ Deployment failed"; kill $ORACLE_PID; exit 1; }
echo "✅ Contracts deployed"

# Step 3: Test Proof Generation & Oracle
echo -e "\n[3/6] Testing Proof Generation & Oracle Dynamics..."
cd frontend
# Run the verification scripts we created
echo "Running Oracle Dynamic Test..."
npm run test-oracle || { echo "❌ Oracle test failed"; kill $ORACLE_PID; exit 1; }
echo "Running E2E Proof Verification..."
npm run test-e2e || { echo "❌ E2E test failed"; kill $ORACLE_PID; exit 1; }
echo "✅ Proofs & Oracle Validated"

# Step 4: Start Frontend
echo -e "\n[4/6] Starting Frontend DApp..."
# Already in frontend dir
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 5
echo "✅ Frontend running on http://localhost:5173"

# Step 5: Manual Testing
echo -e "\n[5/6] MANUAL TESTING REQUIRED"
echo "================================"
echo "Open browser to: http://localhost:5173"
echo ""
echo "Test Flow:"
echo "1. Connect Freighter wallet (testnet)"
echo "2. Go to Deposit page"
echo "3. Enter amount: 1000000"
echo "4. Click 'Deposit Privately'"
echo "5. Verify proof generation completes (check logs if needed)"
echo "6. Sign transaction in Freighter"
echo "7. Verify deposit_id returned"
echo "8. Check Stellar Expert - raw amount should NOT be visible"
echo ""
echo "9. Go to Borrow page"
echo "10. Enter deposit_id from step 7"
echo "11. Enter loan amount: 600000"
echo "12. Click 'Request Loan'"
echo "13. Verify loan approved"
echo ""
echo "Press ENTER when testing complete to STOP services..."
read

# Step 6: Verify Privacy
echo -e "\n[6/6] Verifying Privacy Properties..."
echo "Did you confirm collateral amounts are hidden on-chain? (y/n)"
read PRIVACY_OK

if [ "$PRIVACY_OK" != "y" ]; then
  echo "❌ Privacy requirements not met!"
  kill $ORACLE_PID $FRONTEND_PID || true
  exit 1
fi

echo -e "\n✅ ALL TESTS PASSED"
echo "==========================================="
echo "Shutting down services..."
kill $ORACLE_PID $FRONTEND_PID || true
echo "Done."
