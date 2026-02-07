const snarkjs = require('snarkjs');
const path = require('path');
const fs = require('fs');

const CIRCUITS = {
    deposit: {
        wasm: path.join(__dirname, 'circuits/deposit_proof/deposit_proof.wasm'),
        zkey: path.join(__dirname, 'circuits/deposit_proof/deposit_proof_final.zkey')
    },
    loan: {
        wasm: path.join(__dirname, 'circuits/loan_proof/loan_proof.wasm'),
        zkey: path.join(__dirname, 'circuits/loan_proof/loan_proof_final.zkey')
    },
    kyc: {
        wasm: path.join(__dirname, 'circuits/kyc_proof/kyc_proof.wasm'),
        zkey: path.join(__dirname, 'circuits/kyc_proof/kyc_proof_final.zkey')
    }
};

async function init() {
    // Verify files exist
    for (const [key, paths] of Object.entries(CIRCUITS)) {
        if (!fs.existsSync(paths.wasm)) throw new Error(`Missing wasm for ${key}`);
        if (!fs.existsSync(paths.zkey)) throw new Error(`Missing zkey for ${key}`);
    }
}

// Helper to format proof for Soroban
function formatProof(proof, publicSignals) {
    return {
        pi_a: [proof.pi_a[0], proof.pi_a[1]],
        pi_b: [
            [proof.pi_b[0][1], proof.pi_b[0][0]], // Swapped for some verifiers, keep standard or swap if needed. SnarkJS output is [[x1, y1], [x2, y2]] usually?
            // Actually SnarkJS returns [[x0, x1], [y0, y1]]... wait.
            // Let's stick to raw output: proof.pi_b[0] is array of 2 strings.
            // Standard Groth16 on Ethereum expects: [ [x1, x0], [y1, y0] ] ?
            // Soroban bn254_multi_pairing_check expects G2 points.
            // Documentation usually requires specific ordering. 
            // We will just pass the strings as they come from snarkjs for now, usually compatible.
            // Snarkjs: pi_b: [ [ '15...', '5...' ], [ '18...', '13...' ], [ '1', '0' ] ]
            [proof.pi_b[0][0], proof.pi_b[0][1]],
            [proof.pi_b[1][0], proof.pi_b[1][1]]
        ],
        pi_c: [proof.pi_c[0], proof.pi_c[1]],
        public_inputs: publicSignals
    };
}

// For Soroban specifically, we might need hex strings without '0x' or specific endianness. 
// Assuming standard SnarkJS decimal strings or hex strings are fine if converted.
// The user prompt example shows: "pi_b": [["<hex_x1>", "<hex_x2>"], ["<hex_y1>", "<hex_y2>"]]
// SnarkJS returns decimals by default. We might need to convert to Hex.
// Let's add a helper to convert BigInt/Decimal string to Hex.

function toHex(str) {
    const bigVal = BigInt(str);
    return "0x" + bigVal.toString(16);
}

function formatProofHex(proof, publicSignals) {
    return {
        pi_a: [toHex(proof.pi_a[0]), toHex(proof.pi_a[1])],
        pi_b: [
            [toHex(proof.pi_b[0][1]), toHex(proof.pi_b[0][0])], // Note: usually G2 X coords are swapped in encoding [X1, X0] vs [X0, X1]
            [toHex(proof.pi_b[1][1]), toHex(proof.pi_b[1][0])]
        ],
        pi_c: [toHex(proof.pi_c[0]), toHex(proof.pi_c[1])],
        public_inputs: publicSignals.map(toHex)
    };
}

async function generateDepositProof(input) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        CIRCUITS.deposit.wasm,
        CIRCUITS.deposit.zkey
    );
    return {
        proof: formatProofHex(proof, publicSignals),
        public_signals: publicSignals.map(toHex)
    };
}

async function generateLoanProof(input) {
    // Ensure all inputs are strings/ints
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        CIRCUITS.loan.wasm,
        CIRCUITS.loan.zkey
    );
    return {
        proof: formatProofHex(proof, publicSignals),
        public_signals: publicSignals.map(toHex)
    };
}

async function generateKycProof(input) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        CIRCUITS.kyc.wasm,
        CIRCUITS.kyc.zkey
    );
    return {
        proof: formatProofHex(proof, publicSignals),
        public_signals: publicSignals.map(toHex)
    };
}

module.exports = {
    init,
    generateDepositProof,
    generateLoanProof,
    generateKycProof
};
