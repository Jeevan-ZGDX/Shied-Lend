#!/bin/bash
set -e

echo "Compiling circuits..."

# Create output directories
mkdir -p build/deposit
mkdir -p build/loan
mkdir -p build/kyc
mkdir -p ../keys

# Function to compile and setup
compile_and_setup() {
    CIRCUIT_NAME=$1
    echo "Processing $CIRCUIT_NAME..."
    mkdir -p build/${CIRCUIT_NAME}
    
    # Compile
    ./circom ${CIRCUIT_NAME}.circom --r1cs --wasm --sym --c -o build/${CIRCUIT_NAME}
    
    # Setup
    npx snarkjs groth16 setup build/${CIRCUIT_NAME}/${CIRCUIT_NAME}.r1cs ../keys/pot15_final.ptau ../keys/${CIRCUIT_NAME}_0000.zkey
    
    # Contribute to phase 2
    echo "random text" | npx snarkjs zkey contribute ../keys/${CIRCUIT_NAME}_0000.zkey ../keys/${CIRCUIT_NAME}_final.zkey --name="First Contribution" -v
    
    # Export verification key
    npx snarkjs zkey export verificationkey ../keys/${CIRCUIT_NAME}_final.zkey ../keys/${CIRCUIT_NAME}_vkey.json
    
    # Copy wasm/zkey to proving service for easy access
    mkdir -p ../proving-service/circuits/${CIRCUIT_NAME}
    cp build/${CIRCUIT_NAME}/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm ../proving-service/circuits/${CIRCUIT_NAME}/
    cp ../keys/${CIRCUIT_NAME}_final.zkey ../proving-service/circuits/${CIRCUIT_NAME}/
    cp ../keys/${CIRCUIT_NAME}_vkey.json ../proving-service/circuits/${CIRCUIT_NAME}/
}

# Check/Install Circom
if [ ! -f ./circom ]; then
    echo "Downloading Circom binary..."
    wget https://github.com/iden3/circom/releases/latest/download/circom-linux-amd64 -O circom
    chmod +x circom
fi

# Check if PTAU exists, if not generate one
if [ ! -f ../keys/pot15_final.ptau ]; then
    echo "Generating Powers of Tau (Power 15)..."
    mkdir -p ../keys
    
    # 1. Start a new powers of tau ceremony
    npx snarkjs powersoftau new bn128 15 ../keys/pot15_0000.ptau -v
    
    # 2. Contribute to the ceremony
    echo "random text" | npx snarkjs powersoftau contribute ../keys/pot15_0000.ptau ../keys/pot15_0001.ptau --name="First Contribution" -v
    
    # 3. Prepare for phase 2
    npx snarkjs powersoftau prepare phase2 ../keys/pot15_0001.ptau ../keys/pot15_final.ptau -v
    
    # Cleanup intermediate files
    rm ../keys/pot15_0000.ptau ../keys/pot15_0001.ptau
fi

compile_and_setup "deposit_proof"
compile_and_setup "loan_proof"
compile_and_setup "kyc_proof"

echo "All circuits compiled and keys generated."
