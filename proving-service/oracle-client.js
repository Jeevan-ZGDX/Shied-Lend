const { fetchRealPrice } = require('./price-feeds');
const circomlibjs = require('circomlibjs');

let eddsa;
let poseidon;
let oracleParams = null;

async function initOracle() {
    if (oracleParams) return oracleParams;

    poseidon = await circomlibjs.buildPoseidon();
    eddsa = await circomlibjs.buildEddsa();

    // Generate a static key for the oracle
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

async function getPrice(asset_id) {
    if (!oracleParams) await initOracle();

    // ONLY fetch real price. No fallback.
    const price = await fetchRealPrice(asset_id);

    // Sign the price (Hash(price))
    // Note: Circuit expects M = Poseidon(price)
    // We scale price by 100 to handle decimals (e.g. $99.97 -> 9997 cents)
    const priceScaled = Math.round(price * 100);

    try {
        const msgHash = poseidon([BigInt(priceScaled)]);
        const signature = eddsa.signPoseidon(oracleParams.prvKey, msgHash);

        console.log(`Oracle Price for Asset ${asset_id}: $${price} (Source: Real)`);

        return {
            price: price, // Return float for display
            price_usd: price, // Alias for server.js
            price_scaled: priceScaled, // Return scaled integer for circuit
            timestamp: Date.now(),
            signature: {
                R8x: eddsa.F.toString(signature.R8[0]),
                R8y: eddsa.F.toString(signature.R8[1]),
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
