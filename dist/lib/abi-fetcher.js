/**
 * ABI Fetcher — Fetch verified contract ABIs from Etherscan
 *
 * Pattern: PATTERN_TS_ABI_TYPE_SAFETY
 * Rule: NEVER hand-craft ABIs. ALWAYS fetch from Etherscan.
 */
const ETHERSCAN_API_BASE = 'https://api.etherscan.io/v2/api';
/**
 * Fetch verified contract ABI from Etherscan
 *
 * @throws Error if contract not verified or API fails
 */
export async function fetchAbi(options) {
    const { address, apiKey, chainId = 1 } = options; // Default: Ethereum mainnet
    const url = new URL(ETHERSCAN_API_BASE);
    url.searchParams.set('chainid', String(chainId)); // V2 API requirement
    url.searchParams.set('module', 'contract');
    url.searchParams.set('action', 'getabi');
    url.searchParams.set('address', address);
    url.searchParams.set('apikey', apiKey);
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Etherscan API HTTP error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (data.status !== '1') {
        throw new Error(`Etherscan ABI fetch failed for ${address}: ${data.result || data.message}`);
    }
    try {
        return JSON.parse(data.result);
    }
    catch (err) {
        throw new Error(`Failed to parse ABI for ${address}: ${err instanceof Error ? err.message : String(err)}`);
    }
}
/**
 * Fetch multiple ABIs with rate limiting
 */
export async function fetchAbis(addresses, apiKey, delayMs = 350 // Etherscan free tier: 3 calls/sec (conservative)
) {
    const abis = new Map();
    for (const address of addresses) {
        try {
            const abi = await fetchAbi({ address, apiKey });
            abis.set(address.toLowerCase(), abi);
            // Rate limit delay
            if (addresses.indexOf(address) < addresses.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
        catch (err) {
            console.error(`Failed to fetch ABI for ${address}:`, err);
            throw err; // Fail fast on ABI fetch errors
        }
    }
    return abis;
}
//# sourceMappingURL=abi-fetcher.js.map