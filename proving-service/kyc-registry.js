const circomlibjs = require('circomlibjs');
const crypto = require('crypto');

// Mock KYC-approved addresses
const KYC_WHITELIST = [
    'GABC123...', // Placeholder
    'GDEF456...',
    'GXYZ789...',
    'CDQHNAXSI55GX2GN5D67GK7BHKF22HAL' // Example user from context
];

let poseidon;
let kycTree;

// Build simple Merkle tree with Poseidon
class PoseidonMerkleTree {
    constructor(leaves, poseidonFunc) {
        this.poseidon = poseidonFunc;


        // Improved approach: Use a simple mapping for demo or hashed values.
        this.leaves = leaves.map(addr => {
            // Hash address to fit in field (approx 254 bits)
            // Use SHA256 and take first 31 bytes (248 bits) to be safe
            const hash = crypto.createHash('sha256').update(addr).digest('hex');
            const truncated = hash.slice(0, 62); // 62 hex chars = 31 bytes
            const bigVal = BigInt("0x" + truncated);
            return this.poseidon([bigVal]);
        });

        this.tree = this.buildTree(this.leaves);
        this.root = this.tree[this.tree.length - 1][0]; // Root is single element array
    }

    buildTree(leaves) {
        const tree = [leaves];
        let level = leaves;

        while (level.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < level.length; i += 2) {
                const left = level[i];
                const right = level[i + 1] || left; // Duplicate if odd
                nextLevel.push(this.poseidon([left, right]));
            }
            tree.push(nextLevel);
            level = nextLevel;
        }

        return tree;
    }

    getProof(leafIndex) {
        const proof = [];
        let index = leafIndex;

        for (let i = 0; i < this.tree.length - 1; i++) {
            const level = this.tree[i];
            const isRight = index % 2 === 1;
            const siblingIndex = isRight ? index - 1 : index + 1;

            let sibling = level[siblingIndex];
            if (sibling === undefined) {
                sibling = level[level.length - 1]; // Duplicate last logic
            }

            proof.push({
                sibling: this.poseidon.F.toString(sibling),
                isRight
            });

            index = Math.floor(index / 2);
        }
        return proof;
    }
}

async function init() {
    if (kycTree) return;
    poseidon = await circomlibjs.buildPoseidon();
    kycTree = new PoseidonMerkleTree(KYC_WHITELIST, poseidon);
    console.log("KYC Merkle Tree Initialized. Root:", kycTree.poseidon.F.toString(kycTree.root));
}

function isKYCApproved(address) {
    return KYC_WHITELIST.includes(address);
}

function getKYCProof(address) {
    if (!kycTree) throw new Error("KYC Registry not initialized");

    const index = KYC_WHITELIST.indexOf(address);
    if (index === -1) {
        throw new Error('Address not KYC approved');
    }

    const proof = kycTree.getProof(index);

    // Format for circuit/response
    return {
        root: kycTree.poseidon.F.toString(kycTree.root),
        proof: proof,
        leafIndex: index,
        // Helper to return pathElements and pathIndices as expected by circuit
        pathElements: proof.map(p => p.sibling),
        pathIndices: proof.map(p => p.isRight ? 1 : 0)
    };
}

module.exports = { init, isKYCApproved, getKYCProof };
