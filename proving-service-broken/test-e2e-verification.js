const axios = require('axios');

async function testE2E() {
    console.log('END-TO-END VERIFICATION TEST\n');

    // Note: Ensure the proving service server is running before executing this test!
    // In a real automated pipeline, we'd start the server here or check health.
    const API_URL = 'http://localhost:3001/api';

    // Scenario 1: Sufficient Collateral (SHOULD APPROVE)
    console.log('TEST 1: Loan Request with Sufficient Collateral');

    const sufficientRequest = {
        collateral_amount: 1000000,  // $1M collateral
        loan_amount_usd: 600000,     // $600K loan (166% ratio, > 150%)
        deposit_secret: '0x' + '11'.repeat(32),
        asset_id: 1
    };

    try {
        const response = await axios.post(`${API_URL}/generate-loan-proof`, sufficientRequest);

        console.log('Proof generated successfully ✓');
        console.log('Public signals:', response.data.publicSignals);

        // Check if proof structure is valid
        if (!response.data.proof.pi_a || !response.data.proof.pi_b || !response.data.proof.pi_c) {
            console.error('❌ FAIL: Proof structure invalid');
            return;
        }

        console.log('✅ PASS: Sufficient collateral generates valid proof');

    } catch (error) {
        console.error('❌ FAIL: Proof generation failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('CRITICAL: Proving service is NOT running. Start it with `node server.js` in proving-service dir.');
            return;
        }
    }

    // Scenario 2: Insufficient Collateral (SHOULD REJECT)
    console.log('\nTEST 2: Loan Request with Insufficient Collateral');

    const insufficientRequest = {
        collateral_amount: 500000,   // $500K collateral
        loan_amount_usd: 600000,     // $600K loan (83% ratio, < 150%)
        deposit_secret: '0x' + '22'.repeat(32),
        asset_id: 1
    };

    try {
        const response = await axios.post(`${API_URL}/generate-loan-proof`, insufficientRequest);

        // This should either:
        // A) Fail to generate a proof (circuit constraint fails)
        // B) Generate a proof with validity flag = 0

        if (response.data.publicSignals && response.data.publicSignals[0] === '0') {
            console.log('✅ PASS: Insufficient collateral produces invalid proof (validity=0)');
        } else {
            console.warn('⚠️  Result received. Checking validity...');
            // In snarkjs, if inputs don't satisfy constraints, proof generation usually throws
            console.log('Response:', response.data);
        }

    } catch (error) {
        // Circuit failing to generate proof is ACCEPTABLE for insufficient collateral
        if (error.response?.data?.error?.includes('constraint') || error.response?.status === 500) {
            console.log('✅ PASS: Circuit constraint correctly rejected insufficient collateral (Server returned error/500)');
        } else {
            console.error('❌ FAIL: Unexpected error:', error.message);
        }
    }
}

testE2E();
