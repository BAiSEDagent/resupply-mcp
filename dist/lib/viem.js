/**
 * Viem client setup for Ethereum mainnet
 */
import { createPublicClient, createWalletClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';
dotenv.config();
// Public client (read-only)
export function getPublicClient() {
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
    return createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl),
    });
}
// Wallet client (for transactions)
export function getWalletClient() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.warn('No PRIVATE_KEY found. Wallet client not available.');
        return null;
    }
    const account = privateKeyToAccount(privateKey);
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
    return createWalletClient({
        account,
        chain: mainnet,
        transport: http(rpcUrl),
    });
}
//# sourceMappingURL=viem.js.map