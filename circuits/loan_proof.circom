pragma circom 2.1.6;

include "poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/eddsaposeidon.circom";

template LoanProof() {
    // Private inputs
    signal input collateral_amount;
    signal input collateral_price_usd; 
    signal input deposit_secret;
    signal input asset_id; 

    // Oracle signature (EdDSA BabyJubJub)
    signal input oracle_signature_R8x;
    signal input oracle_signature_R8y;
    signal input oracle_signature_S;
    signal input oracle_pubkey_x;
    signal input oracle_pubkey_y;

    // Public inputs
    signal input loan_amount_usd;
    signal input collateral_commitment;
    signal input min_collateral_ratio; 

    // 1. Verify Oracle Signature on `collateral_price_usd`
    component msgHasher = PoseidonHash(1);
    msgHasher.inputs[0] <== collateral_price_usd;

    component sigVerifier = EdDSAPoseidonVerifier();
    sigVerifier.enabled <== 1;
    sigVerifier.Ax <== oracle_pubkey_x;
    sigVerifier.Ay <== oracle_pubkey_y;
    sigVerifier.S <== oracle_signature_S;
    sigVerifier.R8x <== oracle_signature_R8x;
    sigVerifier.R8y <== oracle_signature_R8y;
    sigVerifier.M <== msgHasher.out;

    // 2. Compute collateral_value_usd = collateral_amount * collateral_price_usd
    signal collateral_value_usd;
    collateral_value_usd <== collateral_amount * collateral_price_usd;

    // 3. Verify collateral_value_usd >= loan_amount_usd * min_collateral_ratio / 100
    signal required_value;
    required_value <== loan_amount_usd * min_collateral_ratio;
    
    component ratioCheck = GreaterEqThan(252);
    ratioCheck.in[0] <== collateral_value_usd * 100;
    ratioCheck.in[1] <== required_value;
    ratioCheck.out === 1;

    // 4. Verify deposit_commitment matches Poseidon(collateral_amount, asset_id, deposit_secret)
    component commHasher = PoseidonHash(3);
    commHasher.inputs[0] <== collateral_amount;
    commHasher.inputs[1] <== asset_id;
    commHasher.inputs[2] <== deposit_secret;
    
    commHasher.out === collateral_commitment;
}

component main {public [loan_amount_usd, collateral_commitment, min_collateral_ratio, oracle_pubkey_x, oracle_pubkey_y]} = LoanProof();
