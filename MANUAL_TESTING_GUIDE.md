# ShieldLend Manual Testing Guide

This guide provides step-by-step instructions for manually deploying and testing the ShieldLend protocol on the Stellar Testnet.

## 2.1 Prerequisites

**Required Software:**
*   **Node.js v18+**: For running the oracle and frontend services.
*   **Rust + Cargo**: For compiling Soroban contracts.
*   **soroban-cli**: Latest version (supporting Protocol 25/CAP-0074 if available, or compatible release).
*   **Freighter Wallet**: Browser extension installed and configured.
*   **Git**: For version control operations.

**Required Accounts:**
*   **Stellar Testnet Account**: Funded with XLM.
*   **Freighter Wallet**: Connected to "Testnet" with the account imported.

**Initial Setup:**
1.  **Install Stellar CLI:**
    ```bash
    cargo install --locked stellar-cli --features opt
    # Verify
    stellar --version
    ```
2.  **Fund Testnet Account:**
    ```bash
    stellar keys generate test-account --network testnet
    stellar keys address test-account
    # Go to https://laboratory.stellar.org/#account-creator to fund this address
    ```

## 2.2 Step-by-Step Deployment

### Step 1: Compile Contracts
Navigate to the project root and compile the smart contracts using Stellar CLI.

```bash
# Build (and optimize) all contracts
stellar contract build
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/shield_vault.wasm
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/shield_lending_pool.wasm
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/shield_liquidator.wasm
```

### Step 2: Deploy Contracts to Testnet
Deploy the optimized WASM files to the Stellar network.

```bash
# Ensure you have a funded identity
stellar keys generate alice --network testnet
stellar keys fund alice --network testnet

# Deploy Vault
VAULT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/shield_vault.optimized.wasm \
  --source alice \
  --network testnet)
echo "Vault deployed: $VAULT_ID"

# Deploy Lending Pool
LENDING_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/shield_lending_pool.optimized.wasm \
  --source alice \
  --network testnet)
echo "Lending Pool deployed: $LENDING_ID"

# Deploy Liquidator
LIQUIDATOR_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/shield_liquidator.optimized.wasm \
  --source alice \
  --network testnet)
echo "Liquidator deployed: $LIQUIDATOR_ID"

# Save addresses for the frontend
cat > frontend/public/contracts.json <<EOF
{
  "vault": "$VAULT_ID",
  "lending_pool": "$LENDING_ID",
  "liquidator": "$LIQUIDATOR_ID",
  "network": "testnet",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
echo "✅ Contract addresses saved to frontend/public/contracts.json"
```

### Step 3: Initialize Contracts
Invoke the initialization functions to link the contracts.

```bash
# Get your admin address
ADMIN_ADDRESS=$(stellar keys address alice)

# Initialize Vault
stellar contract invoke \
  --id $VAULT_ID \
  --source alice \
  --network testnet \
  -- initialize \
  --admin $ADMIN_ADDRESS

# Initialize Lending Pool
# Note: Using ADMIN_ADDRESS as mocked oracle for initialization
stellar contract invoke \
  --id $LENDING_ID \
  --source alice \
  --network testnet \
  -- initialize \
  --admin $ADMIN_ADDRESS \
  --vault $VAULT_ID \
  --oracle $ADMIN_ADDRESS \
  --min_ratio 150

# Initialize Liquidator
stellar contract invoke \
  --id $LIQUIDATOR_ID \
  --source alice \
  --network testnet \
  -- initialize \
  --admin $ADMIN_ADDRESS \
  --lending_pool $LENDING_ID \
  --vault $VAULT_ID

echo "🎉 All contracts deployed and initialized!"
```

### Step 4: Compile ZK Circuits
Prepare the Zero-Knowledge circuits.

```bash
cd ../circuits

# 1. Deposit Proof
circom deposit_proof.circom --r1cs --wasm --sym -o build/
# Download Powers of Tau if missing
test -f pot12_final.ptau || wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O pot12_final.ptau
# Setup
snarkjs groth16 setup build/deposit_proof.r1cs pot12_final.ptau build/deposit_0000.zkey
snarkjs zkey contribute build/deposit_0000.zkey build/deposit_final.zkey --name="ShieldLend" -v -e="random entropy"
snarkjs zkey export verificationkey build/deposit_final.zkey build/deposit_vk.json

# 2. Loan Proof
circom loan_proof.circom --r1cs --wasm --sym -o build/
snarkjs groth16 setup build/loan_proof.r1cs pot12_final.ptau build/loan_0000.zkey
snarkjs zkey contribute build/loan_0000.zkey build/loan_final.zkey --name="ShieldLend" -v -e="random entropy"
snarkjs zkey export verificationkey build/loan_final.zkey build/loan_vk.json

# 3. KYC Proof
circom kyc_proof.circom --r1cs --wasm --sym -o build/
snarkjs groth16 setup build/kyc_proof.r1cs pot12_final.ptau build/kyc_0000.zkey
snarkjs zkey contribute build/kyc_0000.zkey build/kyc_final.zkey --name="ShieldLend" -v -e="random entropy"
snarkjs zkey export verificationkey build/kyc_final.zkey build/kyc_vk.json

echo "✅ Circuits compiled and keys generated."
```

### Step 5: Start Oracle Service
Run the backend service.

**Important for WSL/Windows Users:**
If you see errors like `UNC paths are not supported`, use the provided helper script:
```bash
# From project root
./run-oracle.sh
```

**Linux/Mac Users:**
```bash
cd proving-service
# Option A: Standard Directory
npm install
node server.js
```

Test the service:
```bash
curl http://localhost:3000/health
```

### Step 6: Start Frontend
Launch the DApp.

```bash
cd ../frontend
npm install

# Configure Environment
cat > .env <<EOF
VITE_API_URL=http://localhost:3001/api 
VITE_STELLAR_NETWORK=testnet
EOF
# Note: Update port to 3000 if using Option B for oracle

npm run dev
```

Open your browser to `http://localhost:5173` (or the port shown) to begin testing!
