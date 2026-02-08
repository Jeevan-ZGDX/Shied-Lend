const { getPrice } = require('./oracle-client');

(async () => {
    try {
        console.log("Fetching Price 1...");
        const price1 = await getPrice(1); // BENJI
        console.log('Price 1:', price1.price_usd);

        console.log("Waiting 2 seconds...");
        await new Promise(r => setTimeout(r, 2000));

        console.log("Fetching Price 2...");
        const price2 = await getPrice(1);
        console.log('Price 2:', price2.price_usd);

        if (price1.price_usd === price2.price_usd) {
            console.warn('⚠️ Oracle is STATIC - not dynamic');
            process.exit(1);
        } else {
            console.log('✅ Oracle is dynamic');
            process.exit(0);
        }
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
})();
