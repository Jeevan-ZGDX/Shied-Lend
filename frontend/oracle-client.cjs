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

    const basePrice = PRICES[asset_id.toString()] || 0;
    if (basePrice === 0) throw new Error('Asset not found');

    // Add random fluctuation for dynamic oracle simulation
    const fluctuation = (Math.random() * 2 - 1) * 0.5; // +/- $0.50
    const price = Math.round((basePrice + fluctuation) * 100) / 100;

    // Sign the price (Hash(price))
    // Note: Circuit expects M = Poseidon(price)
    try {
        const msgHash = poseidon([BigInt(price)]);
        const signature = eddsa.signPoseidon(oracleParams.prvKey, msgHash);

        console.log("Signature obtained. R8:", signature.R8, "S:", signature.S);
        console.log("Types:", {
            R8_0: typeof signature.R8[0],
            R8_1: typeof signature.R8[1],
            S: typeof signature.S
        });

        return {
            price_usd: price,
            timestamp: Date.now(),
            signature: {
                R8x: eddsa.F.toBigInt(signature.R8[0]).toString(),
                R8y: eddsa.F.toBigInt(signature.R8[1]).toString(),
                S: signature.S.toString()
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
