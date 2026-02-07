pragma circom 2.1.6;

include "poseidon.circom";

// Merkle Tree inclusion proof

template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels]; // 0 for left, 1 for right

    component hashers[levels];
    signal currentLevelHash[levels + 1];
    signal left[levels];
    signal right[levels];

    currentLevelHash[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        hashers[i] = PoseidonHash(2);

        // Logic to swap:
        // if index == 0: left = current, right = pathElement
        // if index == 1: left = pathElement, right = current
        
        left[i] <== (pathElements[i] - currentLevelHash[i]) * pathIndices[i] + currentLevelHash[i];
        right[i] <== (currentLevelHash[i] - pathElements[i]) * pathIndices[i] + pathElements[i];
        
        hashers[i].inputs[0] <== left[i];
        hashers[i].inputs[1] <== right[i];
        
        currentLevelHash[i + 1] <== hashers[i].out;
    }

    root === currentLevelHash[levels];
}

template KycProof(levels) {
    // Private
    signal input user_id;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // Public
    signal input merkle_root;

    // 1. Check membership
    component leafHasher = PoseidonHash(1);
    leafHasher.inputs[0] <== user_id;

    component treeChecker = MerkleTreeChecker(levels);
    treeChecker.leaf <== leafHasher.out;
    treeChecker.root <== merkle_root;
    for (var i = 0; i < levels; i++) {
        treeChecker.pathElements[i] <== pathElements[i];
        treeChecker.pathIndices[i] <== pathIndices[i];
    }
}

component main {public [merkle_root]} = KycProof(20);
