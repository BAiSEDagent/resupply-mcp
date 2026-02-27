#!/usr/bin/env node
/**
 * Resupply MCP Server
 *
 * Exposes Resupply.fi operations via Model Context Protocol.
 *
 * Tools:
 * - resupply_get_markets: List available lending markets
 * - resupply_get_position: Check user position (collateral, debt, health)
 * - resupply_calculate_borrow: Calculate optimal borrow amount
 * - resupply_simulate_strategy: Project yields for a strategy
 * - resupply_check_health: Check liquidation risk
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { getMarkets as getMarketsLib, getPosition as getPositionLib, calculateBorrow as calculateBorrowLib, simulateStrategy as simulateStrategyLib, checkHealth as checkHealthLib, } from '../lib/resupply.js';
dotenv.config();
// Tool definitions
const TOOLS = [
    {
        name: 'resupply_get_markets',
        description: 'List all available Resupply lending markets (Curve Lend + Fraxlend)',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'resupply_get_position',
        description: 'Get user position on Resupply (collateral, debt, health factor)',
        inputSchema: {
            type: 'object',
            properties: {
                address: {
                    type: 'string',
                    description: 'User wallet address (0x...)',
                },
                pairAddress: {
                    type: 'string',
                    description: 'Pair contract address (0x...)',
                },
            },
            required: ['address', 'pairAddress'],
        },
    },
    {
        name: 'resupply_calculate_borrow',
        description: 'Calculate optimal borrow amount for a collateral position',
        inputSchema: {
            type: 'object',
            properties: {
                collateralAmount: {
                    type: 'number',
                    description: 'Collateral amount (in USDC)',
                },
                targetLTV: {
                    type: 'number',
                    description: 'Target LTV ratio (0.5 = 50%, safe default)',
                },
            },
            required: ['collateralAmount'],
        },
    },
    {
        name: 'resupply_simulate_strategy',
        description: 'Simulate a yield farming strategy (project returns)',
        inputSchema: {
            type: 'object',
            properties: {
                collateralAmount: {
                    type: 'number',
                    description: 'Initial collateral (in USDC)',
                },
                borrowAmount: {
                    type: 'number',
                    description: 'Amount to borrow (in reUSD)',
                },
                lendingAPY: {
                    type: 'number',
                    description: 'Lending APY (e.g., 8.0 for 8%)',
                },
                reUSDAPY: {
                    type: 'number',
                    description: 'reUSD deployment APY (e.g., 6.0 for 6%)',
                },
            },
            required: ['collateralAmount', 'borrowAmount'],
        },
    },
    {
        name: 'resupply_check_health',
        description: 'Check liquidation risk for a position',
        inputSchema: {
            type: 'object',
            properties: {
                address: {
                    type: 'string',
                    description: 'User wallet address',
                },
                pairAddress: {
                    type: 'string',
                    description: 'Pair contract address',
                },
            },
            required: ['address', 'pairAddress'],
        },
    },
];
// Create server
const server = new Server({
    name: process.env.MCP_SERVER_NAME || 'resupply',
    version: process.env.MCP_SERVER_VERSION || '0.1.0',
}, {
    capabilities: {
        tools: {},
    },
});
// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: TOOLS,
    };
});
// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'Error: Missing arguments',
                },
            ],
        };
    }
    try {
        switch (name) {
            case 'resupply_get_markets':
                return await getMarkets();
            case 'resupply_get_position':
                if (typeof args.address !== 'string' || typeof args.pairAddress !== 'string') {
                    throw new Error('Invalid arguments: address and pairAddress must be strings');
                }
                return await getPosition(args.address, args.pairAddress);
            case 'resupply_calculate_borrow':
                if (typeof args.collateralAmount !== 'number') {
                    throw new Error('Invalid arguments: collateralAmount must be a number');
                }
                return await calculateBorrow(args.collateralAmount, typeof args.targetLTV === 'number' ? args.targetLTV : 0.5);
            case 'resupply_simulate_strategy':
                if (typeof args.collateralAmount !== 'number' || typeof args.borrowAmount !== 'number') {
                    throw new Error('Invalid arguments: collateralAmount and borrowAmount must be numbers');
                }
                return await simulateStrategy(args.collateralAmount, args.borrowAmount, typeof args.lendingAPY === 'number' ? args.lendingAPY : 8.0, typeof args.reUSDAPY === 'number' ? args.reUSDAPY : 6.0);
            case 'resupply_check_health':
                if (typeof args.address !== 'string' || typeof args.pairAddress !== 'string') {
                    throw new Error('Invalid arguments: address and pairAddress must be strings');
                }
                return await checkHealth(args.address, args.pairAddress);
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${message}`,
                },
            ],
        };
    }
});
// Tool implementations
async function getMarkets() {
    const markets = await getMarketsLib();
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(markets, null, 2),
            },
        ],
    };
}
async function getPosition(address, pairAddress) {
    const position = await getPositionLib(address, pairAddress);
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(position, null, 2),
            },
        ],
    };
}
async function calculateBorrow(collateralAmount, targetLTV) {
    const result = calculateBorrowLib(collateralAmount, targetLTV);
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
}
async function simulateStrategy(collateralAmount, borrowAmount, lendingAPY, reUSDAPY) {
    const result = simulateStrategyLib(collateralAmount, borrowAmount, lendingAPY, reUSDAPY);
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
}
async function checkHealth(address, pairAddress) {
    const position = await getPositionLib(address, pairAddress);
    const health = checkHealthLib(position);
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    address,
                    pairAddress,
                    position,
                    health,
                }, null, 2),
            },
        ],
    };
}
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Resupply MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map