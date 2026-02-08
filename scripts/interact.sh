#!/bin/bash

# ShieldLend Interaction Script
# Usage: ./interact.sh <command> <args>

if [ -z "$1" ]; then
    echo "Usage: ./interact.sh [deposit|loan|repay|liquidate]"
    exit 1
fi

COMMAND=$1

# Load IDs
if [ -f "contracts.json" ]; then
    VAULT_ID=$(grep -o '"vault": "[^"]*' contracts.json | grep -o '[^"]*$')
    POOL_ID=$(grep -o '"lending_pool": "[^"]*' contracts.json | grep -o '[^"]*$')
    LIQUIDATOR_ID=$(grep -o '"liquidator": "[^"]*' contracts.json | grep -o '[^"]*$')
else
    echo "Error: contracts.json not found. Run deploy.sh first."
    exit 1
fi

ALICE=$(stellar keys address alice)

case $COMMAND in
  deposit)
    # Args: token_address, amount, proof...
    stellar contract invoke \
        --id $VAULT_ID \
        --source alice \
        --network testnet \
        -- \
        deposit_collateral \
        --user $ALICE \
        --asset $2 \
        --proof $3 \
        --public_inputs $4
    ;;
  loan)
    stellar contract invoke \
        --id $POOL_ID \
        --source alice \
        --network testnet \
        -- \
        request_loan \
        --borrower $ALICE \
        --deposit_id $2 \
        --loan_amount $3 \
        --loan_asset $4 \
        --proof $5 \
        --public_inputs $6
    ;;
  repay)
    stellar contract invoke \
        --id $POOL_ID \
        --source alice \
        --network testnet \
        -- \
        repay_loan \
        --borrower $ALICE \
        --loan_id $2 \
        --repay_amount $3
    ;;
  liquidate)
    stellar contract invoke \
        --id $LIQUIDATOR_ID \
        --source alice \
        --network testnet \
        -- \
        liquidate_loan \
        --loan_id $2 \
        --liquidator $ALICE
    ;;
  *)
    echo "Unknown command"
    exit 1
    ;;
esac
