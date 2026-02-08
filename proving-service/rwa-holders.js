const axios = require('axios');

// Fetch real holders of RWA assets from Stellar blockchain
async function getRWAHolders(assetCode, issuer) {
    try {
        console.log(`\n[RWA-HOLDERS] Fetching holders for ${assetCode}...`);

        // Query Stellar Horizon for accounts holding this asset
        const url = `https://horizon.stellar.org/accounts?asset=${assetCode}:${issuer}&limit=200`;
        const response = await axios.get(url, { timeout: 10000 });

        const holders = response.data._embedded.records.map(account => {
            const balance = account.balances.find(
                b => b.asset_code === assetCode && b.asset_issuer === issuer
            );

            return {
                address: account.id,
                balance: parseFloat(balance?.balance || 0),
                balanceUSD: null, // Will be calculated
                lastActivity: account.last_modified_time
            };
        });

        // Filter out zero balances and sort by balance
        const activeHolders = holders
            .filter(h => h.balance > 0)
            .sort((a, b) => b.balance - a.balance);

        console.log(`✓ Found ${activeHolders.length} real holders`);
        if (activeHolders.length > 0) {
            console.log(`Top holder: ${activeHolders[0]?.address} with ${activeHolders[0]?.balance} ${assetCode}`);
        }

        return activeHolders;

    } catch (error) {
        console.error(`Failed to fetch RWA holders: ${error.message}`);
        // Fallback for demo if network fails (empty list, frontend handles "no lenders")
        return [];
    }
}

// Identify institutional wallets (heuristic)
function identifyInstitutions(holders) {
    // Institutions typically have:
    // - Large balances (> $1M or significant amount)
    // - Regular activity
    // - Known addresses from registry

    const KNOWN_INSTITUTIONS = {
        'GABC...': 'Franklin Templeton',
        'GDEF...': 'Ondo Finance',
        // Add more as identified
    };

    return holders.map(holder => ({
        ...holder,
        isInstitution: holder.balance > 10000, // Lower threshold for demo/testnet assets
        name: KNOWN_INSTITUTIONS[holder.address] || 'Unknown Institution',
        type: holder.balance > 10000 ? 'institutional' : 'retail'
    }));
}

async function getInstitutionalLenders(assetId) {
    const ASSET_MAP = {
        1: { code: 'BENJI', issuer: 'GDLD3DFBAPJB5W7EVOQXWZW3YMLQBP3KJ3KVFY6KZJQHUPQNMCFRKP5W' },
        2: { code: 'USDY', issuer: 'G...' }, // Pending real issuer
        3: { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' }
    };

    const asset = ASSET_MAP[assetId];
    if (!asset) throw new Error('Unknown asset');

    const holders = await getRWAHolders(asset.code, asset.issuer);
    const institutions = identifyInstitutions(holders);

    // Return top institutional holders as potential lenders
    return institutions
        .filter(h => h.isInstitution)
        .slice(0, 10);
}

module.exports = { getRWAHolders, getInstitutionalLenders };
