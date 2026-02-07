pragma circom 2.1.6;

include "poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template DepositProof() {
    // Private inputs
    signal input collateral_amount;
    signal input asset_id;
    signal input user_secret;

    // Public outputs
    signal output commitment;
    signal output nullifier;

    // 1. Check collateral_amount > 0
    component gt = GreaterThan(252);
    gt.in[0] <== collateral_amount;
    gt.in[1] <== 0;
    gt.out === 1;

    // 2. Compute commitment = Poseidon(collateral_amount, asset_id, user_secret)
    component commHasher = PoseidonHash(3);
    commHasher.inputs[0] <== collateral_amount;
    commHasher.inputs[1] <== asset_id;
    commHasher.inputs[2] <== user_secret;
    
    commitment <== commHasher.out;

    // 3. Compute nullifier = Poseidon(user_secret, asset_id)
    component nullHasher = PoseidonHash(2);
    nullHasher.inputs[0] <== user_secret;
    nullHasher.inputs[1] <== asset_id;

    nullifier <== nullHasher.out;

    // 4. Asset validity check (range check)
    component rangeCheck = LessThan(64);
    rangeCheck.in[0] <== asset_id;
    rangeCheck.in[1] <== 1000; 
    rangeCheck.out === 1;
}

component main = DepositProof();
