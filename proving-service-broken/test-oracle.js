const { getPrice } = require('./oracle-client');

async function testOracle() {
    console.log('Testing Oracle Integration...\n');

    // Test 1: Price Oracle
    console.log('TEST 1: Fetch RWA Prices');
    try {
        const benjiData = await getPrice(1);
        const treasuryData = await getPrice(2);

        console.log(`BENJI Price: $${benjiData.price_usd}`);
        console.log(`Treasury Price: $${treasuryData.price_usd}`);

        if (benjiData.price_usd === treasuryData.price_usd) {
            console.warn('⚠️  WARNING: Prices are identical - might be hardcoded!');
        }

        // Test 2: Fetch again after 2 seconds
        console.log('\nWaiting 2 seconds...');
        await new Promise(r => setTimeout(r, 2000));

        const benjiData2 = await getPrice(1);
        console.log(`BENJI Price (after 2s): $${benjiData2.price_usd}`);

        if (benjiData.price_usd === benjiData2.price_usd) {
            console.warn('⚠️  WARNING: Price unchanged - oracle might be static!');
        } else {
            console.log('✅ Oracle is dynamic!');
        }

        // Verify Signature Structure
        console.log('\nVerifying Signature Structure:');
        if (benjiData.signature && benjiData.signature.R8x && benjiData.signature.S) {
            console.log('✅ Signature present');
        } else {
            console.error('❌ Signature missing or invalid');
        }

    } catch (e) {
        console.error('❌ Oracle test failed:', e);
    }
}

testOracle();
