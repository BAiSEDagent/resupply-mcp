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
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

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
      },
      required: ['address'],
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
        market: {
          type: 'string',
          description: 'Market name (e.g., sDOLA, sUSDe)',
        },
        targetLTV: {
          type: 'number',
          description: 'Target LTV ratio (0.5 = 50%, safe default)',
        },
      },
      required: ['collateralAmount', 'market'],
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
        market: {
          type: 'string',
          description: 'Lending market',
        },
        borrowAmount: {
          type: 'number',
          description: 'Amount to borrow (in reUSD)',
        },
        reUSDDeployment: {
          type: 'string',
          description: 'Where to deploy reUSD (e.g., sfrxUSD, other)',
        },
      },
      required: ['collateralAmount', 'market', 'borrowAmount'],
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
      },
      required: ['address'],
    },
  },
];

// Create server
const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || 'resupply',
    version: process.env.MCP_SERVER_VERSION || '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'resupply_get_markets':
        return await getMarkets();
      
      case 'resupply_get_position':
        return await getPosition(args.address);
      
      case 'resupply_calculate_borrow':
        return await calculateBorrow(
          args.collateralAmount,
          args.market,
          args.targetLTV || 0.5
        );
      
      case 'resupply_simulate_strategy':
        return await simulateStrategy(
          args.collateralAmount,
          args.market,
          args.borrowAmount,
          args.reUSDDeployment
        );
      
      case 'resupply_check_health':
        return await checkHealth(args.address);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
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

// Tool implementations (placeholders for now)
async function getMarkets() {
  // TODO: Query Resupply contracts for available markets
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          markets: [
            { name: 'sDOLA', lendingAPY: 8.5, borrowAPY: 4.25, available: true },
            { name: 'sUSDe', lendingAPY: 12.3, borrowAPY: 6.15, available: true },
            { name: 'sfrxUSD', lendingAPY: 6.8, borrowAPY: 3.4, available: true },
            { name: 'WETH', lendingAPY: 3.2, borrowAPY: 2.0, available: true },
          ],
        }, null, 2),
      },
    ],
  };
}

async function getPosition(address: string) {
  // TODO: Query user position from Resupply contracts
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          address,
          collateral: 10000, // USDC
          debt: 5000, // reUSD
          healthFactor: 2.0, // 200% collateralization
          liquidationPrice: 0.4, // LTV at liquidation
          market: 'sDOLA',
        }, null, 2),
      },
    ],
  };
}

async function calculateBorrow(
  collateralAmount: number,
  market: string,
  targetLTV: number
) {
  const maxBorrow = collateralAmount * 0.8; // 80% max LTV
  const safeBorrow = collateralAmount * targetLTV;
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          collateralAmount,
          market,
          targetLTV,
          recommendedBorrow: safeBorrow,
          maxBorrow,
          healthFactor: 1 / targetLTV,
        }, null, 2),
      },
    ],
  };
}

async function simulateStrategy(
  collateralAmount: number,
  market: string,
  borrowAmount: number,
  reUSDDeployment: string
) {
  // Placeholder APYs
  const lendingAPY = 8.0;
  const borrowAPY = 4.0;
  const reUSDAPY = 6.0;
  
  const lendingYield = collateralAmount * (lendingAPY / 100);
  const borrowCost = borrowAmount * (borrowAPY / 100);
  const reUSDYield = borrowAmount * (reUSDAPY / 100);
  const netYield = lendingYield - borrowCost + reUSDYield;
  const netAPY = (netYield / collateralAmount) * 100;
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          collateralAmount,
          market,
          borrowAmount,
          reUSDDeployment,
          lendingYield,
          borrowCost,
          reUSDYield,
          netYield,
          netAPY: `${netAPY.toFixed(2)}%`,
        }, null, 2),
      },
    ],
  };
}

async function checkHealth(address: string) {
  // TODO: Query position and check health factor
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          address,
          healthFactor: 2.0,
          status: 'SAFE',
          liquidationRisk: 'LOW',
          recommendation: 'Position is healthy. Can borrow more if desired.',
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
