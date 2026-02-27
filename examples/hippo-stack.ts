/**
 * The "Hippo Stack" Strategy
 * 
 * Safe, compounding yield on Resupply.
 * 
 * Setup:
 * - 10,000 crvUSD collateral
 * - 5,000 reUSD borrow (50% LTV, safe)
 * - Deploy reUSD to sfrxUSD
 * 
 * Expected: ~9% APY with minimal risk
 */

import { simulateStrategy } from '../src/lib/resupply.js';

async function main() {
  console.log('🦛 The Hippo Stack — Safe Yield Strategy\n');
  
  const collateral = 10000; // 10K crvUSD
  const borrow = 5000;      // 5K reUSD (50% LTV)
  
  const result = simulateStrategy(
    collateral,
    borrow,
    8.0,  // Lending APY (sDOLA market)
    6.0   // reUSD deployment APY (sfrxUSD)
  );
  
  console.log('Strategy Breakdown:');
  console.log(`  Collateral:    ${collateral.toLocaleString()} crvUSD`);
  console.log(`  Borrow:        ${borrow.toLocaleString()} reUSD (50% LTV)`);
  console.log(`  Deployment:    sfrxUSD (Savings frxUSD)`);
  console.log('');
  console.log('Annual Yields:');
  console.log(`  Lending:       +${result.lendingYield.toLocaleString()} USDC (8% on collateral)`);
  console.log(`  Borrow cost:   -${result.borrowCost.toLocaleString()} USDC (4% on debt)`);
  console.log(`  reUSD yield:   +${result.reUSDYield.toLocaleString()} USDC (6% on deployed)`);
  console.log(`  ──────────────────────────────────`);
  console.log(`  Net APY:       ${result.netAPY.toFixed(2)}%`);
  console.log('');
  console.log('Risk Assessment:');
  console.log('  ✅ Stablecoin vs stablecoin (no liquidation from volatility)');
  console.log('  ✅ 50% LTV (safe, health factor 2.0x)');
  console.log('  ✅ Protocol audited by yAudit + ChainSecurity');
  console.log('');
  console.log('Try it:');
  console.log('  resupply simulate --collateral 10000 --borrow 5000 --deployment sfrxUSD');
}

main().catch(console.error);
