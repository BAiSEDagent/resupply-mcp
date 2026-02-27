/**
 * Check all available Resupply markets + APYs
 * 
 * Queries Resupply Registry and all lending pairs.
 */

import { getMarkets } from '../src/lib/resupply.js';

async function main() {
  console.log('🦛 Fetching Resupply markets...\n');
  
  const markets = await getMarkets();
  
  console.log(`Found ${markets.length} markets:\n`);
  
  for (const market of markets) {
    console.log(`📊 ${market.name}`);
    console.log(`   Lending APY: ${market.lendingAPY.toFixed(2)}%`);
    console.log(`   Borrow APY:  ${market.borrowAPY.toFixed(2)}%`);
    console.log(`   TVL:         $${Number(market.tvl).toLocaleString()}`);
    console.log(`   Address:     ${market.address}`);
    console.log('');
  }
  
  console.log('💡 Tip: Use the market with highest lending APY for maximum returns.');
  console.log('');
  console.log('Try it:');
  console.log('  resupply markets');
}

main().catch(console.error);
