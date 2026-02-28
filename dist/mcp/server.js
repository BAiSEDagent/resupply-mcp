#!/usr/bin/env node
/**
 * Resupply MCP Server
 *
 * Exposes Resupply.fi operations via Model Context Protocol.
 *
 * Pattern: PATTERN_TS_MCP_SERVER (canonical SDK usage)
 *
 * Tools:
 * - resupply_get_markets: List available lending markets
 * - resupply_get_position: Check user position (collateral, debt, health)
 * - resupply_calculate_borrow: Calculate optimal borrow amount
 * - resupply_simulate_strategy: Project yields for a strategy
 * - resupply_check_health: Check liquidation risk
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { getMarkets as getMarketsLib, getPosition as getPositionLib, calculateBorrow as calculateBorrowLib, simulateStrategy as simulateStrategyLib, checkHealth as checkHealthLib, } from '../lib/resupply.js';
import { getEnv } from '../lib/env.js';
dotenv.config();
// Validate environment at startup (fail-fast)
const env = getEnv();
// Create server with new McpServer API
const server = new McpServer({
    name: env.MCP_SERVER_NAME,
    version: env.MCP_SERVER_VERSION,
});
// ── Tool 1: Get Markets ───────────────────────────────────────────────────────
server.tool('resupply_get_markets', 'List all available Resupply lending markets (Curve Lend + Fraxlend pools)', {}, // No arguments
async () => {
    try {
        const markets = await getMarketsLib();
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(markets, null, 2),
                }],
        };
    }
    catch (e) {
        return {
            content: [{
                    type: 'text',
                    text: `Error fetching markets: ${e instanceof Error ? e.message : String(e)}`,
                }],
            isError: true,
        };
    }
});
// ── Tool 2: Get Position ──────────────────────────────────────────────────────
server.tool('resupply_get_position', 'Get user position on Resupply (collateral, debt, health factor)', {
    address: z.string()
        .regex(/^0x[0-9a-fA-F]{40}$/, 'Must be valid Ethereum address (0x + 40 hex chars)'),
    pairAddress: z.string()
        .regex(/^0x[0-9a-fA-F]{40}$/, 'Must be valid contract address'),
}, async ({ address, pairAddress }) => {
    try {
        const position = await getPositionLib(address, pairAddress);
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(position, null, 2),
                }],
        };
    }
    catch (e) {
        return {
            content: [{
                    type: 'text',
                    text: `Error fetching position: ${e instanceof Error ? e.message : String(e)}`,
                }],
            isError: true,
        };
    }
});
// ── Tool 3: Calculate Borrow ──────────────────────────────────────────────────
server.tool('resupply_calculate_borrow', 'Calculate optimal borrow amount for a collateral position', {
    collateralAmount: z.number()
        .positive('Collateral amount must be positive')
        .describe('Collateral amount in USD'),
    targetLTV: z.number()
        .min(0.1, 'Target LTV must be at least 0.1 (10%)')
        .max(0.75, 'Target LTV must not exceed 0.75 (75%)')
        .optional()
        .default(0.5)
        .describe('Target LTV ratio (0.5 = 50%, safe default)'),
}, async ({ collateralAmount, targetLTV }) => {
    try {
        const result = calculateBorrowLib(collateralAmount, targetLTV);
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                }],
        };
    }
    catch (e) {
        return {
            content: [{
                    type: 'text',
                    text: `Error calculating borrow: ${e instanceof Error ? e.message : String(e)}`,
                }],
            isError: true,
        };
    }
});
// ── Tool 4: Simulate Strategy ─────────────────────────────────────────────────
server.tool('resupply_simulate_strategy', 'Simulate a yield farming strategy (project returns)', {
    collateralAmount: z.number()
        .positive('Collateral must be positive')
        .describe('Initial collateral in USD'),
    borrowAmount: z.number()
        .positive('Borrow amount must be positive')
        .describe('Amount to borrow in reUSD'),
    lendingAPY: z.number()
        .min(0, 'APY cannot be negative')
        .max(100, 'APY must be realistic (<100%)')
        .optional()
        .default(8.0)
        .describe('Lending APY (e.g., 8.0 for 8%)'),
    reUSDAPY: z.number()
        .min(0, 'APY cannot be negative')
        .max(100, 'APY must be realistic (<100%)')
        .optional()
        .default(6.0)
        .describe('reUSD deployment APY (e.g., 6.0 for 6%)'),
}, async ({ collateralAmount, borrowAmount, lendingAPY, reUSDAPY }) => {
    try {
        const result = simulateStrategyLib(collateralAmount, borrowAmount, lendingAPY, reUSDAPY);
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                }],
        };
    }
    catch (e) {
        return {
            content: [{
                    type: 'text',
                    text: `Error simulating strategy: ${e instanceof Error ? e.message : String(e)}`,
                }],
            isError: true,
        };
    }
});
// ── Tool 5: Check Health ──────────────────────────────────────────────────────
server.tool('resupply_check_health', 'Check liquidation risk for a position', {
    address: z.string()
        .regex(/^0x[0-9a-fA-F]{40}$/, 'Must be valid Ethereum address'),
    pairAddress: z.string()
        .regex(/^0x[0-9a-fA-F]{40}$/, 'Must be valid contract address'),
}, async ({ address, pairAddress }) => {
    try {
        const position = await getPositionLib(address, pairAddress);
        const health = checkHealthLib(position);
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        address,
                        pairAddress,
                        position,
                        health,
                    }, null, 2),
                }],
        };
    }
    catch (e) {
        return {
            content: [{
                    type: 'text',
                    text: `Error checking health: ${e instanceof Error ? e.message : String(e)}`,
                }],
            isError: true,
        };
    }
});
// ── Start Server ──────────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Resupply MCP Server v${env.MCP_SERVER_VERSION} running on stdio`);
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map