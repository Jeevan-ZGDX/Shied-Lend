const axios = require('axios');

// Asset feed configurations
const ASSET_FEEDS = {
    1: { // BENJI
        name: 'Franklin Templeton BENJI',
        // MOCK endpoint (replace with real when available)
        endpoint: 'https://api.franklintemple ton.com/v1/nav/benji',
        fallback: 98.50, // Use if API fails
        transform: (data) => data?.nav_per_share || data?.price
    },
    2: { // USDY
        name: 'Ondo USDY',
        endpoint: 'https://api.ondo.finance/usdy/nav',
        fallback: 1.02,
        transform: (data) => data?.price || data?.nav
    },
    3: { // Mock RWA
        name: 'Mock RWA Token',
        endpoint: null,
        fallback: 100.00,
        transform: null
    }
};

async function fetchRealPrice(assetId) {
    const feed = ASSET_FEEDS[assetId];
    if (!feed) {
        throw new Error(`Unknown asset ID: ${assetId}`);
    }

    // If no endpoint or mock asset, use fallback
    if (!feed.endpoint || assetId === 3) {
        console.log(`Using fallback price for ${feed.name}: $${feed.fallback}`);
        return feed.fallback;
    }

    try {
        console.log(`Fetching price for ${feed.name} from ${feed.endpoint}`);
        const response = await axios.get(feed.endpoint, {
            timeout: 5000,
            headers: { 'User-Agent': 'ShieldLend/1.0' }
        });

        // Safety check for transformation
        let price;
        if (feed.transform) {
            price = feed.transform(response.data);
        }

        if (!price || isNaN(price)) {
            console.warn(`Invalid or missing price from API for ${feed.name}, using fallback: $${feed.fallback}`);
            return feed.fallback;
        }

        console.log(`✓ Real price for ${feed.name}: $${price}`);
        return price;

    } catch (error) {
        console.error(`Failed to fetch ${feed.name} price:`, error.message);
        console.log(`Using fallback: $${feed.fallback}`);
        return feed.fallback;
    }
}

module.exports = { fetchRealPrice, ASSET_FEEDS };
