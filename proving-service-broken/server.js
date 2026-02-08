const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const proofGenerator = require('./proof-generator');
const oracleClient = require('./oracle-client');

const app = express();
const PORT = 3000;

// Handle BigInt serialization
BigInt.prototype.toJSON = function () { return this.toString() };

app.use(cors());
app.use(bodyParser.json());

// Load circuits and keys on startup
proofGenerator.init().then(() => {
    console.log('Proof generator initialized');
}).catch(err => {
    console.error('Failed to initialize proof generator:', err);
});

// Endpoint 1: Generate Deposit Proof
app.post('/api/generate-deposit-proof', async (req, res) => {
    try {
        const { collateral_amount, asset_id, user_secret } = req.body;
        console.log('Generating deposit proof...', { collateral_amount, asset_id });

        const result = await proofGenerator.generateDepositProof({
            collateral_amount,
            asset_id,
            user_secret
        });

        res.json(result);
    } catch (error) {
        console.error('Error generating deposit proof:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 2: Generate Loan Proof
app.post('/api/generate-loan-proof', async (req, res) => {
    try {
        const { collateral_amount, loan_amount_usd, deposit_secret, asset_id } = req.body;
        console.log('Generating loan proof...', { loan_amount_usd });

        // Fetch oracle price
        const oracleData = await oracleClient.getPrice(asset_id);

        // In a real app, verify signature here (we do it in circuit too)
        // For circuit, we need the signature components

        const input = {
            collateral_amount,
            collateral_price_usd: oracleData.price_usd,
            deposit_secret,
            asset_id,
            loan_amount_usd,
            collateral_commitment: req.body.collateral_commitment, // Expect user to provide their commitment to verify against
            min_collateral_ratio: 150, // Fixed or configurable
            oracle_signature_R8x: oracleData.signature.R8x,
            oracle_signature_R8y: oracleData.signature.R8y,
            oracle_signature_S: oracleData.signature.S,
            oracle_pubkey_x: oracleData.pubkey.x,
            oracle_pubkey_y: oracleData.pubkey.y
        };

        const result = await proofGenerator.generateLoanProof(input);
        res.json(result);
    } catch (error) {
        console.error('Error generating loan proof:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 3: Get Oracle Price
app.post('/api/get-oracle-price', async (req, res) => {
    try {
        const { asset_id } = req.body;
        const data = await oracleClient.getPrice(asset_id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 4: Generate KYC Proof
app.post('/api/generate-kyc-proof', async (req, res) => {
    try {
        const { user_id, merkle_proof } = req.body;
        // merkle_proof expected to have pathElements, pathIndices, root

        const input = {
            user_id,
            pathElements: merkle_proof.pathElements,
            pathIndices: merkle_proof.pathIndices,
            merkle_root: merkle_proof.root
        };

        const result = await proofGenerator.generateKycProof(input);
        res.json(result);
    } catch (error) {
        console.error('Error generating kyc proof:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`ShieldLend Proving Service running on port ${PORT}`);
});
