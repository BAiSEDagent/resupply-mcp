/**
 * ABI Fetcher — Fetch verified contract ABIs from Etherscan
 *
 * Pattern: PATTERN_TS_ABI_TYPE_SAFETY
 * Rule: NEVER hand-craft ABIs. ALWAYS fetch from Etherscan.
 */
import type { Abi } from 'viem';
export interface FetchAbiOptions {
    address: string;
    apiKey: string;
    chainId?: number;
}
/**
 * Fetch verified contract ABI from Etherscan
 *
 * @throws Error if contract not verified or API fails
 */
export declare function fetchAbi(options: FetchAbiOptions): Promise<Abi>;
/**
 * Fetch multiple ABIs with rate limiting
 */
export declare function fetchAbis(addresses: string[], apiKey: string, delayMs?: number): Promise<Map<string, Abi>>;
//# sourceMappingURL=abi-fetcher.d.ts.map