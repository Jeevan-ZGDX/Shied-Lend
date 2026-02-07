const circomlibjs = require('circomlibjs');

let eddsa;
let poseidon;
let oracleParams = null;

async function initOracle() {
    if (oracleParams) return oracleParams;

    poseidon = await circomlibjs.buildPoseidon();
    eddsa = await circomlibjs.buildEddsa();

    // Generate a static key for the mock oracle
    // Private key can be any random bytes. using a deterministic one for consistent testing
    const prvKey = Buffer.from('0001020304050607080900010203040506070809000102030405060708090001', 'hex');
    const pubKey = eddsa.prv2pub(prvKey);

    oracleParams = {
        prvKey,
        pubKey,
        pubKeyUnpacked: {
            x: eddsa.F.toString(pubKey[0]),
            y: eddsa.F.toString(pubKey[1])
        }
    };
    return oracleParams;
}

// Mock prices for assets
const PRICES = {
    '1': 100, // Asset ID 1 = $100
    '2': 50000, // BTC?
    '3': 1 // Stablecoin
};

async function getPrice(asset_id) {
    await initOracle();

    const price = PRICES[asset_id.toString()] || 0;
    if (price === 0) throw new Error('Asset not found');

    // Sign the price (Hash(price))
    // Note: Circuit expects M = Poseidon(price)
    try {
        const msgHash = poseidon([BigInt(price)]);
        const signature = eddsa.signPoseidon(oracleParams.prvKey, msgHash);

        return {
            price_usd: price,
            timestamp: Date.now(),
            signature: {
                R8x: eddsa.F.toString(signature.R8[0]),
                R8y: eddsa.F.toString(signature.R8[1]),
                S: eddsa.F.toString(signature.S)
            },
            pubkey: oracleParams.pubKeyUnpacked
        };
    } catch (e) {
        console.error("Oracle signing error:", e);
        throw e;
    }
}

module.exports = {
    getPrice
};
