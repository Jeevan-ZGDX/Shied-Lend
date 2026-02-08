#!/bin/bash

# Exit on error
set -e

echo "Building contracts..."
stellar contract build

echo "Optimizing contracts..."
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/shield_vault.wasm
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/shield_lending_pool.wasm
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/shield_liquidator.wasm

echo "Deploying contracts to testnet..."
# Generate identity if not exists
if ! stellar keys address alice > /dev/null 2>&1; then
    stellar keys generate alice --network testnet
fi

ALICE=$(stellar keys address alice)
echo "Deployer: $ALICE"

# Deploy Vault
echo "Deploying Vault..."
VAULT_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/shield_vault.optimized.wasm \
    --source alice \
    --network testnet)
echo "Vault ID: $VAULT_ID"

# Deploy Lending Pool
echo "Deploying Lending Pool..."
POOL_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/shield_lending_pool.optimized.wasm \
    --source alice \
    --network testnet)
echo "Lending Pool ID: $POOL_ID"

# Deploy Liquidator
echo "Deploying Liquidator..."
LIQUIDATOR_ID=$(stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/shield_liquidator.optimized.wasm \
    --source alice \
    --network testnet)
echo "Liquidator ID: $LIQUIDATOR_ID"

# Save Contract IDs
echo "{\"vault\": \"$VAULT_ID\", \"lending_pool\": \"$POOL_ID\", \"liquidator\": \"$LIQUIDATOR_ID\"}" > contracts.json

echo "Initializing contracts..."

# Initialize Vault
stellar contract invoke \
    --id $VAULT_ID \
    --source alice \
    --network testnet \
    -- \
    initialize \
    --admin $ALICE

# Initialize Lending Pool
stellar contract invoke \
    --id $POOL_ID \
    --source alice \
    --network testnet \
    -- \
    initialize \
    --admin $ALICE \
    --vault_address $VAULT_ID

# Initialize Liquidator
stellar contract invoke \
    --id $LIQUIDATOR_ID \
    --source alice \
    --network testnet \
    -- \
    initialize \
    --admin $ALICE \
    --lending_pool $POOL_ID \
    --vault $VAULT_ID

echo "Deployment complete!"
