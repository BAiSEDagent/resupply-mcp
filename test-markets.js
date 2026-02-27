import { getMarkets } from './dist/lib/resupply.js';

async function test() {
  try {
    console.log('Testing getMarkets() against mainnet...\n');
    const markets = await getMarkets();
    console.log(`✅ Found ${markets.length} markets\n`);
    
    if (markets.length > 0) {
      console.log('Sample market:');
      console.log(JSON.stringify(markets[0], null, 2));
    } else {
      console.log('⚠️  No markets returned (check RPC)');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

test();
