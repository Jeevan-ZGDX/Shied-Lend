const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const proofGenerator = require('./proof-generator');
const oracleClient = require('./oracle-client');
const kycRegistry = require('./kyc-registry');

const app = express();
const PORT = 3000;

// Handle BigInt serialization
BigInt.prototype.toJSON = function () { return this.toString() };

app.use(bodyParser.json());

// CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// app.use(cors()); // Using explicit headers instead

const USE_REAL_PRICES = process.env.USE_REAL_PRICES === 'true';

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Load circuits and keys on startup
proofGenerator.init().then(() => {
    console.log('Proof generator initialized');
}).catch(err => {
    console.error('Failed to initialize proof generator:', err);
});

// Initialize KYC Registry
kycRegistry.init().then(() => {
    console.log('KYC Registry initialized');
}).catch(err => {
    console.error('Failed to initialize KYC registry:', err);
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
        const oracleData = await oracleClient.getPrice(asset_id, !USE_REAL_PRICES);

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

        if (!asset_id) {
            return res.status(400).json({ error: 'asset_id required' });
        }

        console.log(`\n=== ORACLE PRICE REQUEST ===`);
        console.log(`Asset ID: ${asset_id}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);

        // ONLY real prices - will throw if unavailable
        const data = await oracleClient.getPrice(asset_id);
        const timestamp = Date.now();
        // data.signature is already computed in getPrice

        const response = {
            asset_id,
            price_usd: data.price_usd || data.price, // Use price_usd if price is missing
            timestamp,
            signature: data.signature,
            source: 'REAL_API', // Always real
            provider: 'stellar' // Simplified for demo
        };

        console.log(`✓ Returning real price: $${data.price}`);
        console.log('Full data object:', JSON.stringify(data, null, 2));

        console.log(`===========================\n`);

        res.json(response);

    } catch (error) {
        console.error(`\n✗ ORACLE ERROR: ${error.message}\n`);
        res.status(503).json({
            error: 'Real price unavailable',
            message: error.message,
            hint: 'Check API endpoints and network connectivity'
        });
    }
});

const { getInstitutionalLenders } = require('./rwa-holders');

app.post('/api/get-lenders', async (req, res) => {
    try {
        const { asset_id } = req.body;

        console.log(`\n[LENDERS] Fetching institutional lenders for asset ${asset_id}...`);

        // Fallback to empty list if fetching fails, to avoid crashing frontend
        let lenders = [];
        try {
            lenders = await getInstitutionalLenders(asset_id);
        } catch (err) {
            console.error("Failed to fetch lenders, returning empty list:", err.message);
        }

        console.log(`✓ Found ${lenders.length} institutional lenders\n`);

        res.json({
            asset_id,
            lenders: lenders.map(l => ({
                address: l.address,
                name: l.name,
                type: l.type,
                availableLiquidity: l.balance,
                estimatedRate: 0.045 + Math.random() * 0.02 // Simulated rate
            })),
            source: 'stellar_blockchain'
        });

    } catch (error) {
        console.error(`Lender fetch error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 4: Get KYC Proof / Check status
app.post('/api/check-kyc', async (req, res) => {
    try {
        const { user_address } = req.body;

        const approved = kycRegistry.isKYCApproved(user_address);

        if (!approved) {
            console.log(`KYC check failed for ${user_address}`);
            return res.status(403).json({
                approved: false,
                message: 'Address not in KYC whitelist'
            });
        }

        const proofData = kycRegistry.getKYCProof(user_address);
        console.log(`KYC check passed for ${user_address}`);

        res.json({
            approved: true,
            root: proofData.root,
            proof: proofData.pathElements, // Simplified for frontend consumption if needed
            pathElements: proofData.pathElements,
            pathIndices: proofData.pathIndices
        });
    } catch (error) {
        console.error('KYC check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 5: Generate KYC Proof (Circuit)
app.post('/api/generate-kyc-proof', async (req, res) => {
    try {
        // Reuse logic from check-kyc to get merkle elements
        const { user_id, merkle_proof } = req.body;

        let paths, indices, root;

        if (merkle_proof) {
            paths = merkle_proof.pathElements;
            indices = merkle_proof.pathIndices;
            root = merkle_proof.root;
        } else {
            // Fetch from registry
            const data = kycRegistry.getKYCProof(user_id);
            paths = data.pathElements;
            indices = data.pathIndices;
            root = data.root;
        }

        const input = {
            user_id,
            pathElements: paths,
            pathIndices: indices,
            merkle_root: root
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
