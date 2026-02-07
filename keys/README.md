# Trusted Setup Instructions

## Prerequisites
- Node.js
- SnarkJS
- Circom

## Steps

1. **Powers of Tau**:
   Generate the "Powers of Tau" file. For this hackathon demo, we use power 12 (approx 4k constraints support).
   ```bash
   snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
   snarkjs powersoftau contribute pot12_0000.ptau pot12_final.ptau --name="User" -v
   ```

2. **Phase 2 (Circuit Specific)**:
   For each circuit (deposit, loan, kyc):
   ```bash
   snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey
   snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="User" -v
   snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
   ```

## Note
The `compile.sh` script automates this process for development convenience.
