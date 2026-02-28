/**
 * Resupply Protocol Integration
 *
 * Real contract interactions via viem + Etherscan-fetched ABIs
 */
import { type PublicClient } from 'viem';
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
export declare function getMarkets(client?: PublicClient): Promise<Market[]>;
/**
 * Get user position for a specific market
 */
export declare function getPosition(userAddress: string, pairAddress: string, client?: PublicClient): Promise<Position>;
/**
 * Calculate optimal borrow amount for a collateral position
 */
export declare function calculateBorrow(collateralAmount: number, targetLTV?: number): {
    recommendedBorrow: number;
    maxBorrow: number;
    healthFactor: number;
};
/**
 * Simulate a yield farming strategy
 */
export declare function simulateStrategy(collateralAmount: number, borrowAmount: number, lendingAPY?: number, reUSDAPY?: number): SimulationResult;
/**
 * Check health of a position
 */
export declare function checkHealth(position: Position): {
    status: 'SAFE' | 'WARNING' | 'DANGER';
    liquidationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendation: string;
};
//# sourceMappingURL=resupply.d.ts.map