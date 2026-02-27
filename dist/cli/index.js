#!/usr/bin/env node
/**
 * Resupply CLI
 *
 * Command-line interface for Resupply.fi yield farming.
 *
 * Commands:
 * - markets: List available markets
 * - deposit: Deposit collateral
 * - borrow: Borrow reUSD
 * - repay: Repay debt
 * - withdraw: Withdraw collateral
 * - position: Check your position
 * - simulate: Simulate a strategy
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { getMarkets, getPosition, simulateStrategy, checkHealth, } from '../lib/resupply.js';
dotenv.config();
const program = new Command();
program
    .name('resupply')
    .description('Resupply.fi CLI - Agent-friendly yield farming')
    .version('0.1.0');
// Markets command
program
    .command('markets')
    .description('List available lending markets')
    .action(async () => {
    const spinner = ora('Fetching markets...').start();
    try {
        const markets = await getMarkets();
        spinner.succeed('Markets loaded');
        console.log('\n' + chalk.bold('Available Markets:') + '\n');
        markets.forEach((market) => {
            console.log(chalk.cyan(`  ${market.name}`));
            console.log(`    Lending APY: ${chalk.green(market.lendingAPY.toFixed(2) + '%')}`);
            console.log(`    Borrow APY:  ${chalk.yellow(market.borrowAPY.toFixed(2) + '%')}`);
            console.log(`    TVL:         $${Number(market.tvl).toLocaleString()}`);
            console.log(`    Address:     ${chalk.dim(market.address)}`);
            console.log('');
        });
    }
    catch (error) {
        spinner.fail('Failed to fetch markets');
        console.error(chalk.red('\n✗ Error:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
// Deposit command (placeholder - needs wallet integration)
program
    .command('deposit')
    .description('Deposit collateral to a lending market')
    .requiredOption('--token <token>', 'Token to deposit (crvUSD, frxUSD)')
    .requiredOption('--market <market>', 'Market to lend to (sDOLA, sUSDe, etc.)')
    .requiredOption('--amount <amount>', 'Amount to deposit')
    .action(async (options) => {
    console.log(chalk.yellow('\n⚠️  Deposit functionality requires wallet integration'));
    console.log(chalk.dim('    This feature is coming soon.'));
    console.log('');
    console.log('Planned deposit:');
    console.log(`  Token:  ${options.token}`);
    console.log(`  Market: ${options.market}`);
    console.log(`  Amount: ${options.amount}`);
});
// Borrow command (placeholder - needs wallet integration)
program
    .command('borrow')
    .description('Borrow reUSD against your collateral')
    .requiredOption('--amount <amount>', 'Amount of reUSD to borrow')
    .action(async (options) => {
    console.log(chalk.yellow('\n⚠️  Borrow functionality requires wallet integration'));
    console.log(chalk.dim('    This feature is coming soon.'));
    console.log('');
    console.log('Planned borrow:');
    console.log(`  Amount: ${options.amount} reUSD`);
});
// Position command
program
    .command('position')
    .description('Check your current position')
    .requiredOption('--address <address>', 'Your wallet address')
    .requiredOption('--pair <pairAddress>', 'Pair contract address')
    .action(async (options) => {
    const spinner = ora('Loading position...').start();
    try {
        const position = await getPosition(options.address, options.pair);
        const health = checkHealth(position);
        spinner.succeed('Position loaded');
        console.log('\n' + chalk.bold('Your Position:') + '\n');
        console.log(`  Market:     ${position.market}`);
        console.log(`  Collateral: ${chalk.cyan(position.collateralUSD.toLocaleString() + ' USDC')}`);
        console.log(`  Debt:       ${chalk.yellow(position.debtUSD.toLocaleString() + ' reUSD')}`);
        console.log(`  LTV:        ${chalk.green((position.ltv * 100).toFixed(2) + '%')}`);
        console.log(`  Health:     ${chalk.green(position.healthFactor.toFixed(2))} (${health.status})`);
        console.log('');
        console.log(`  Risk:       ${health.liquidationRisk}`);
        console.log(`  ${chalk.dim(health.recommendation)}`);
    }
    catch (error) {
        spinner.fail('Failed to load position');
        console.error(chalk.red('\n✗ Error:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
// Simulate command
program
    .command('simulate')
    .description('Simulate a yield farming strategy')
    .requiredOption('--collateral <amount>', 'Collateral amount')
    .requiredOption('--borrow <amount>', 'Borrow amount')
    .option('--lending-apy <apy>', 'Lending APY', '8.0')
    .option('--reusd-apy <apy>', 'reUSD deployment APY', '6.0')
    .action(async (options) => {
    const spinner = ora('Simulating strategy...').start();
    try {
        const collateral = parseFloat(options.collateral);
        const borrow = parseFloat(options.borrow);
        const lendingAPY = parseFloat(options.lendingApy);
        const reUSDAPY = parseFloat(options.reusdApy);
        const result = simulateStrategy(collateral, borrow, lendingAPY, reUSDAPY);
        spinner.succeed('Simulation complete');
        console.log('\n' + chalk.bold('Strategy Simulation:') + '\n');
        console.log(`  Collateral:    ${chalk.cyan(collateral.toLocaleString() + ' USDC')}`);
        console.log(`  Borrow:        ${chalk.yellow(borrow.toLocaleString() + ' reUSD')}`);
        console.log(`  Market:        ${result.market}`);
        console.log(`  Deployment:    ${result.reUSDDeployment}`);
        console.log('');
        console.log(`  Lending yield: ${chalk.green('+' + result.lendingYield.toFixed(2) + ' USDC/yr')}`);
        console.log(`  Borrow cost:   ${chalk.red('-' + result.borrowCost.toFixed(2) + ' USDC/yr')}`);
        console.log(`  reUSD yield:   ${chalk.green('+' + result.reUSDYield.toFixed(2) + ' USDC/yr')}`);
        console.log('');
        console.log(`  ${chalk.bold('Net APY:')}       ${chalk.green(result.netAPY.toFixed(2) + '%')}`);
    }
    catch (error) {
        spinner.fail('Simulation failed');
        console.error(chalk.red('\n✗ Error:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=index.js.map