/**
 * Resupply Protocol Integration
 * 
 * Real contract interactions via viem
 */

import { type PublicClient, formatUnits, parseUnits } from 'viem';
import { createRequire } from 'node:module';
import { getPublicClient } from './viem.js';
import { ADDRESSES } from '../contracts/ADDRESSES.js';

const require = createRequire(import.meta.url);
const RegistryABI = require('../contracts/abis/ResupplyRegistry.json');
const PairABI = require('../contracts/abis/ResupplyPair.json');

export interface Market {
  name: string;
  address: string;
  collateral: string;
  asset: string;
  lendingAPY: number;
  borrowAPY: number;
  tvl: string;
  available: boolean;
}

export interface Position {
  address: string;
  market: string;
  collateral: bigint;
  collateralUSD: number;
  debt: bigint;
  debtUSD: number;
  healthFactor: number;
  ltv: number;
  liquidationLTV: number;
}

export interface SimulationResult {
  collateralAmount: number;
  borrowAmount: number;
  market: string;
  reUSDDeployment: string;
  lendingYield: number;
  borrowCost: number;
  reUSDYield: number;
  netYield: number;
  netAPY: number;
}

/**
 * Get all available Resupply markets
 */
export async function getMarkets(client?: PublicClient): Promise<Market[]> {
  const publicClient = client || getPublicClient();
  
  try {
    // Query Registry for all pairs
    const pairAddresses = await publicClient.readContract({
      address: ADDRESSES.REGISTRY as `0x${string}`,
      abi: RegistryABI,
      functionName: 'getAllPairAddresses',
    }) as `0x${string}`[];
    
    // Query each pair for details
    const markets: Market[] = [];
    const failures: string[] = [];
    
    for (const pairAddress of Object.values(ADDRESSES.PAIRS)) {
      try {
        const [name, asset, collateral, rateInfo, accounting] = await Promise.all([
          publicClient.readContract({
            address: pairAddress as `0x${string}`,
            abi: PairABI,
            functionName: 'name',
          }),
          publicClient.readContract({
            address: pairAddress as `0x${string}`,
            abi: PairABI,
            functionName: 'asset',
          }),
          publicClient.readContract({
            address: pairAddress as `0x${string}`,
            abi: PairABI,
            functionName: 'collateral',
          }),
          publicClient.readContract({
            address: pairAddress as `0x${string}`,
            abi: PairABI,
            functionName: 'currentRateInfo',
          }),
          publicClient.readContract({
            address: pairAddress as `0x${string}`,
            abi: PairABI,
            functionName: 'getPairAccounting',
          }),
        ]);
        
        const marketName = (name as string).replace('Resupply ', '');
        const ratePerSec = (rateInfo as any[])[3];
        const totalCollateral = (accounting as any[])[3];
        
        // Convert rate per second to APY
        const borrowAPY = calculateAPYFromRate(Number(ratePerSec));
        const lendingAPY = borrowAPY * 2; // Rough estimate (borrow = 50% of lending)
        
        markets.push({
          name: marketName,
          address: pairAddress,
          collateral: collateral as string,
          asset: asset as string,
          lendingAPY,
          borrowAPY,
          tvl: formatUnits(totalCollateral as bigint, 18),
          available: true,
        });
      } catch (error) {
        failures.push(pairAddress);
        console.warn(`Failed to fetch data for pair ${pairAddress}:`, error);
      }
    }
    
    if (markets.length === 0 && failures.length > 0) {
      throw new Error(`Failed to fetch any markets. ${failures.length} pairs failed. Check RPC connection.`);
    }
    
    return markets;
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    throw new Error('Failed to fetch markets from Resupply Registry');
  }
}

/**
 * Get user position for a specific market
 */
export async function getPosition(
  userAddress: string,
  pairAddress: string,
  client?: PublicClient
): Promise<Position> {
  const publicClient = client || getPublicClient();
  
  try {
    const [snapshot, accounting, name] = await Promise.all([
      publicClient.readContract({
        address: pairAddress as `0x${string}`,
        abi: PairABI,
        functionName: 'getUserSnapshot',
        args: [userAddress],
      }),
      publicClient.readContract({
        address: pairAddress as `0x${string}`,
        abi: PairABI,
        functionName: 'getPairAccounting',
      }),
      publicClient.readContract({
        address: pairAddress as `0x${string}`,
        abi: PairABI,
        functionName: 'name',
      }),
    ]);
    
    const [borrowShares, collateralBalance] = snapshot as [bigint, bigint];
    const [, totalBorrowAmount, totalBorrowShares] = accounting as [bigint, bigint, bigint, bigint];
    
    // Correct debt calculation: shares * totalBorrowAmount / totalBorrowShares
    const debt = totalBorrowShares > 0n
      ? (borrowShares * totalBorrowAmount) / totalBorrowShares
      : 0n;
    
    const collateralUSD = Number(formatUnits(collateralBalance, 18));
    const debtUSD = Number(formatUnits(debt, 18));
    const ltv = collateralUSD > 0 ? debtUSD / collateralUSD : 0;
    const healthFactor = debtUSD > 0 ? collateralUSD / debtUSD : 999;
    
    return {
      address: userAddress,
      market: (name as string).replace('Resupply ', ''),
      collateral: collateralBalance,
      collateralUSD,
      debt,
      debtUSD,
      healthFactor,
      ltv,
      liquidationLTV: 0.8, // 80% max LTV
    };
  } catch (error) {
    console.error('Failed to fetch position:', error);
    throw new Error('Failed to fetch user position');
  }
}

/**
 * Calculate optimal borrow amount for a collateral position
 */
export function calculateBorrow(
  collateralAmount: number,
  targetLTV: number = 0.5
): {
  recommendedBorrow: number;
  maxBorrow: number;
  healthFactor: number;
} {
  const maxLTV = 0.8;
  const maxBorrow = collateralAmount * maxLTV;
  const safeBorrow = collateralAmount * targetLTV;
  const healthFactor = 1 / targetLTV;
  
  return {
    recommendedBorrow: safeBorrow,
    maxBorrow,
    healthFactor,
  };
}

/**
 * Simulate a yield farming strategy
 */
export function simulateStrategy(
  collateralAmount: number,
  borrowAmount: number,
  lendingAPY: number = 8.0,
  reUSDAPY: number = 6.0
): SimulationResult {
  // Borrow rate is 50% of lending rate (or 2% min)
  const borrowAPY = Math.max(lendingAPY / 2, 2.0);
  
  const lendingYield = collateralAmount * (lendingAPY / 100);
  const borrowCost = borrowAmount * (borrowAPY / 100);
  const reUSDYield = borrowAmount * (reUSDAPY / 100);
  const netYield = lendingYield - borrowCost + reUSDYield;
  const netAPY = (netYield / collateralAmount) * 100;
  
  return {
    collateralAmount,
    borrowAmount,
    market: 'sDOLA', // Default
    reUSDDeployment: 'sfrxUSD',
    lendingYield,
    borrowCost,
    reUSDYield,
    netYield,
    netAPY,
  };
}

/**
 * Check health of a position
 */
export function checkHealth(position: Position): {
  status: 'SAFE' | 'WARNING' | 'DANGER';
  liquidationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
} {
  const { healthFactor, ltv } = position;
  
  let status: 'SAFE' | 'WARNING' | 'DANGER';
  let liquidationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  let recommendation: string;
  
  if (healthFactor >= 2.0 && ltv <= 0.5) {
    status = 'SAFE';
    liquidationRisk = 'LOW';
    recommendation = 'Position is healthy. You can borrow more if desired.';
  } else if (healthFactor >= 1.5 && ltv <= 0.65) {
    status = 'WARNING';
    liquidationRisk = 'MEDIUM';
    recommendation = 'Position is moderately leveraged. Consider reducing debt or adding collateral.';
  } else {
    status = 'DANGER';
    liquidationRisk = 'HIGH';
    recommendation = 'Position is at risk! Repay debt or add collateral immediately.';
  }
  
  return {
    status,
    liquidationRisk,
    recommendation,
  };
}

/**
 * Helper: Calculate APY from rate per second
 */
function calculateAPYFromRate(ratePerSec: number): number {
  const secondsPerYear = 365.25 * 24 * 60 * 60;
  const ratePerYear = ratePerSec * secondsPerYear;
  const apy = (ratePerYear / 1e18) * 100; // Assuming 18 decimals
  return apy;
}
