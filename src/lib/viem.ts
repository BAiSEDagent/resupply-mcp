/**
 * Viem Public Client
 */

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { getEnv } from './env.js';

let cachedClient: ReturnType<typeof createPublicClient> | null = null;

/**
 * Get configured public client (cached singleton)
 */
export function getPublicClient() {
  if (cachedClient) return cachedClient;
  
  const env = getEnv();
  
  cachedClient = createPublicClient({
    chain: mainnet,
    transport: http(env.RPC_URL),
  });
  
  return cachedClient;
}
