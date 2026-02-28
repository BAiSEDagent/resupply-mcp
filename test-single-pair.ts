#!/usr/bin/env node
/**
 * Test single pair to verify ABI fetch + query works
 */

import dotenv from 'dotenv';
dotenv.config();

import { getEnv } from './src/lib/env.js';
import { fetchAbi } from './src/lib/abi-fetcher.js';
import { getPublicClient } from './src/lib/viem.js';
import { ADDRESSES } from './src/contracts/ADDRESSES.js';

const TEST_PAIR = ADDRESSES.PAIRS.CURVE_SDOLA; // Pick one pair for testing

console.log('🧪 Testing Single Pair ABI Fetch + Query\n');
console.log('═'.repeat(60));

const env = getEnv();
const client = getPublicClient();

// Step 1: Fetch ABI
console.log(`\n1. Fetching ABI for ${TEST_PAIR}...`);
const abi = await fetchAbi({ address: TEST_PAIR, apiKey: env.ETHERSCAN_API_KEY });
console.log(`   ✅ ABI fetched: ${abi.length} entries`);

// Step 2: Check what functions exist
const functions = abi.filter((item: any) => item.type === 'function').map((item: any) => item.name);
console.log(`\n2. Available functions (${functions.length} total):`);
console.log(functions.slice(0, 20).join(', '));
if (functions.length > 20) console.log(`   ...and ${functions.length - 20} more`);

// Step 3: Check if expected functions exist
const requiredFunctions = ['name', 'asset', 'collateral', 'currentRateInfo', 'getPairAccounting'];
console.log(`\n3. Checking required functions:`);
for (const fn of requiredFunctions) {
  const exists = functions.includes(fn);
  console.log(`   ${exists ? '✅' : '❌'} ${fn}`);
}

// Step 4: Try querying if all functions exist
const allExist = requiredFunctions.every(fn => functions.includes(fn));
if (allExist) {
  console.log(`\n4. Querying contract...`);
  
  const name = await client.readContract({
    address: TEST_PAIR as `0x${string}`,
    abi,
    functionName: 'name',
  });
  
  console.log(`   ✅ Contract name: ${name}`);
  console.log('\n✅ SUCCESS: ABI fetch + query working correctly!');
} else {
  console.log(`\n❌ FAIL: Missing required functions - this might not be a ResupplyPair contract`);
  console.log(`   Check Etherscan: https://etherscan.io/address/${TEST_PAIR}#code`);
}

console.log('═'.repeat(60));
