/**
 * Environment Variable Validation
 * 
 * Pattern: PATTERN_TS_ENV_VALIDATION
 * Rule: Validate env vars at startup (fail-fast)
 */

import { z } from 'zod';

const envSchema = z.object({
  RPC_URL: z.string().url('RPC_URL must be a valid URL'),
  ETHERSCAN_API_KEY: z.string().min(32, 'ETHERSCAN_API_KEY must be at least 32 characters'),
  MCP_SERVER_NAME: z.string().optional().default('resupply'),
  MCP_SERVER_VERSION: z.string().optional().default('0.2.0'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validate and return environment variables
 * 
 * @throws ZodError if validation fails (fail-fast at startup)
 */
export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  
  try {
    cachedEnv = envSchema.parse(process.env);
    return cachedEnv;
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('Environment validation failed:');
      for (const issue of err.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      }
      throw new Error('Invalid environment configuration. Check .env file.');
    }
    throw err;
  }
}
